'use strict';

jr.include('css/alarms.css');

angular.module('alarms', ['j$', 'util', 'myfarm', 'translate', 'chat'])
.factory('alarms.texts', ['translatedTexts', function(createTexts) {
	return createTexts({
		'No permission': 'Sorry, you have no permission for this...',
		'Confirm': 'Do you want to confirm this alarm?'
	});
}])
.factory('alarms.sortAlarms', [function() {
	return function(alarms) {
		return alarms.sort(function(o2, o1) {
			if(o1.dismissDate && o2.dismissDate || !o1.dismissDate && !o2.dismissDate) {
				return o1.time>o2.time?1:-1;
			} else {
				return o1.dismissDate?-2:2;
			}
		});
	};
}])
.factory('alarms.getAlarmIndex', ['util.findIndex', function(findIndex) {
	return function(alarms, guid) {
		return findIndex(alarms, function(test) {
			if(test.guid === guid) return true;
		}, !guid);
	};
}])
.factory('alarms.extractAlarm', ['getAlarmType', 'formatAlarmDate', 'translate', function(getAlarmType, formatAlarmDate, translate) {
	return function(alarm, isLocal) {
		//TODO should be a map, as in return a new object instead of mutating the old one
		alarm.date = formatAlarmDate(alarm.time);
		alarm.msg = alarm.message + (isLocal ? ' - (' + translate('codes') + ':' + alarm.majorCode + ',' + alarm.minorCode + ')' : '');
		alarm.type = getAlarmType(alarm);
		alarm.icon = alarm.icon.toLowerCase();
		alarm.dismissDateFormatted = formatAlarmDate(alarm.dismissDate);

		return alarm;
	};
}])
.factory('alarms.extractData', ['myfarm.cacheByFarm', 'alarms.sortAlarms', 'alarms.extractAlarm',
	function(cacheByFarm, sortAlarms, extractAlarm) {
		return cacheByFarm('alarms.extractData', function(data) {
			if(data == 'No farm') { return; }

			var alarmData = data.alarms;
			if(alarmData) {
				alarmData.alarms.list = sortAlarms(alarmData.alarms.list.map(function(alarm) {
					return extractAlarm(alarm, data.isLocal);
				}));
				return alarmData;
			} else {
				return { alarms: { list: [] } };
			}
		});
	}
])
.factory('alarms.socket', ['onBroadcast', 'alarms.extractData', 'alarms.getAlarmIndex', 'alarms.sortAlarms', '$rootScope', 'alarms.extractAlarm',
	function(onBroadcast, extractData, getAlarmIndex, sortAlarms, $rootScope, extractAlarm) {
		var updates = [], data, currentId, alarms;

		function updateData(update) {
			if(update && update.length) {
				update.forEach(function(alarm) {
					alarms[getAlarmIndex(alarms, alarm.guid)] = extractAlarm(alarm, data.isLocal);
				});
				sortAlarms(alarms);
			}
		}

		return {
			listen: function(id) {
				onBroadcast(id, 'alarm', function(update) {
					if(id !== currentId) return; //Ignore updates from previous farms
			
					if(data) {
						updateData(update);
						$rootScope.$broadcast('alarms.update', data);
					} else {
						updates.push(update);
					}
				});
			},
			run: function(id, serializedData) {
				currentId = id;
				data = extractData(serializedData);
				alarms = data && data.alarms.list;
				while(updates.length > 0) {
					updateData(updates.pop());
				}
			}
		};
	}
])
.factory('alarms.confirmAlarm', ['sendRequest', 'util.format', 'alert',
	function(sendRequest, createFormat, alert) {
		var errorFormat = createFormat('Internal application error:\n\r{0}');
		return function(id, alarm) {
			sendRequest('SrvAlarms.confirm', {
				id: id,
				guid: alarm.guid
			})
			.then(function(data) {
				if (data !== null && data.length > 0)
					alert(errorFormat.render(data));
			});
		};
	}
])
.controller('alarmsController', ['$scope', 'data', '$location', 
	function($scope, data, $location) {
		var removeNotValidIp=function(ipList) {
			var dm=$scope.data.ipDeviceMap, alList=$scope.data.alarms.list;
			if (dm && ipList && ipList.length && alList && alList.length) {
				ipList = ipList.split(',');
				var notIncluded=[], newList=[];
				for(var ip in dm)
					if (ipList.indexOf(ip)<0)
						notIncluded[dm[ip]] = 1;
				var i=-1;
				while(++i<alList.length) {
					var o = alList[i];
					if (!notIncluded[o.deviceId])
						newList.push(o);
				}
				$scope.data.alarms.list=newList;
			};
		};
		$scope.data = data;
		removeNotValidIp($location.search().alarmIp);

		$scope.$on('alarms.update', function(event, data) {
			$scope.$apply(function() {
				$scope.data = data;
			});
		});
	}
])
.factory('getAlarmType', function() {
	return function(alarm) {
		return alarm.dismissDate ? 'standard' : alarm.severity >= 5 ? 'fatal' : 'notification';
	}
})
.factory('formatAlarmDate', ['util.formatDate', function(formatDate) {
	return function(date) {
		var now = new Date(), confirmTime = new Date(date);
		var dateFormat = now.getDate() !== confirmTime.getDate() || now.getMonth() !== confirmTime.getMonth() ? 'yyyy-MM-dd HH:mm' : 'HH:mm';
		return formatDate(date, dateFormat);
	};
}])
.directive('cowify', ['cowify', function(cowify) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			scope.$watch(attr.cowify, function(value) {
				element.html(cowify(value));
			});
		}
	};
}])
.controller('alarms.alarmController', ['$scope', 'alarms.texts', 'util.format', 'util.formatDate', 'alert', 'confirm', 'alarms.confirmAlarm',
	function($scope, getText, createFormat, formatDate, alert, confirm, confirmAlarm) {

		var confirmFormat = createFormat('{0}\n{1}\n{2}\n{3}'), hasConfirmPermission = $scope.data.alarms.perm & 2; //bitmask
		$scope.confirm = function(alarm) {
			if(!alarm.dismissDate && alarm.type !== 'standard') {
				if(!hasConfirmPermission) {
					alert(getText('No permission'), 5000);
				} else {
					confirm(confirmFormat.render(
						getText('Confirm'),
						alarm.sourceDevice,
						formatDate(alarm.time),
						alarm.message
					)).then(function() {
						confirmAlarm($scope.data.farmId, alarm);
					});
				}
			}
		};
	}
]);