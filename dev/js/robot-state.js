'use strict';

jr.include('css/robot-state.css');

angular.module('robotState', ['translate', 'production'])
.factory('robotState.socket', ['onBroadcast', 'production.extractData', 'alarms.extractData', 'extractAlarms', 'util.findIndex', 'setRobotHasAlarm', '$rootScope',
	function(onBroadcast, extractData, extractAlarmData, extractAlarms, findIndex, setRobotHasAlarm, $rootScope) {
		var updates = [], data, alarms, currentId, robots;

		function updateData(update) {
			var index = findIndex(robots, function(item) {
				return item.guid === update.robotId;
			});

			data.robotData[index].mode = update.status;

			setRobotHasAlarm(alarms.list, data.robotData[index]);
		}

		return {
			listen: function(id) {
				onBroadcast(id, 'robotState', function(update) {
					if(id !== currentId) return; //Ignore updates from previous farms

					if(data) {
						updateData(update);
						$rootScope.$broadcast('robotState.update', data);
					} else {
						updates.push(update);
					}
				});
			},
			run: function(id, serializedData) {
				currentId = id;
				data = extractData(serializedData);
				alarms = extractAlarms(extractAlarmData(serializedData));
				robots = data.robotData;
				while(updates.length > 0) {
					updateData(updates.pop());
				}
			}
		}
	}
])
.factory('extractAlarms', ['getAlarmType', function(getAlarmType) {
	return function(alarmData) {
		return alarmData && alarmData.alarms.list.map(function(alarm) {
			return {
				guid: alarm.deviceId,
				type: getAlarmType(alarm)
			};
		});
	}
}])
.factory('setRobotHasAlarm', [function() {
	return function(alarms, robot) {
		if(!alarms) return;

		for(var i = 0, l = alarms.length; i < l; i++) {
			var alarm = alarms[i];
			if(alarm.type === 'fatal' && alarm.guid === robot.guid) {
				robot.hasAlarm = true;
				return;
			}
		}
		robot.hasAlarm = false;
	}
}])
.factory('getRobotClass', [function() {
	var map = {
		0: 'undefined',
		1: 'error',
		2: 'auto',
		3: 'manual',
		4: 'test'
	}

	return function(vms) {
		return map[vms.mode] || 'unknown';
	};
}])
.factory('robotRows', [function() {
	return function(input) {
		input = input.filter(function(item) {
			return item.status !== 0;
		});

		var output = [];

		for(var i = 0; i < input.length; i++) {
			var row = [input[i]];
			if(input[++i]) {
				row.push(input[i]);
			}
			output.push(row);
		}

		return output;
	};
}])
.controller('robotStateController', ['data', '$scope', 'robotRows', 'getRobotClass', 'extractAlarms', 'setRobotHasAlarm',
	function(data, $scope, createRobotRows, getRobotClass, extractAlarms, setHasAlarm) {
		setData(data);

		$scope.$on('robotState.update', function(event, data) {
			$scope.$apply(function() {
				setData(data);
			});
		});

		$scope.$on('alarms.update', function(event, alarmData) {
			$scope.$apply(function() {
				$scope.data.robotData.forEach(setHasAlarm.bind(null, extractAlarms(alarmData)));
			});
		});

		function setData(data) {
			$scope.robotRows = createRobotRows(data.robotData);
		}

		$scope.getRobotClass = getRobotClass;

		$scope.hasAlarm = function(alarm) {
			return alarm.hasAlarm ? 'has-alarm' : '';
		}
	}
]);