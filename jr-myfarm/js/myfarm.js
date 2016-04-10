'use strict';

angular.module('myfarm', ['j$', 'server', 'chat', 'alarms', 'cowq'])
.constant('updateInterval', 20000)
.factory('myfarm', ['$rootScope', 'farmId', 'myfarm.socket', 'storage',
	function($rootScope, getId, getDataFromSocket, storage) {
		var myfarm = {};

		$rootScope.$on('$locationChangeSuccess', function() {
			var id = getId(),
				isFirstVisit = !angular.isDefined(id), //Is this the first visit (no id is found)
				isFarmSame = id === myfarm.id, //Is the current farm the same as the previous one?
				wasPreviousFarm = !!myfarm.id; // Was there a previous farm?

			if(!isFarmSame || isFirstVisit) {
				var data = getDataFromSocket(id, wasPreviousFarm)
				myfarm.data = data;

				$rootScope.$broadcast('myfarm.dataUpdated', myfarm.data, myfarm.id);

				data.then(function(data) {
					if (data != 'No farm') {
						id = data.cows.vcId;
						myfarm.id = id;
						storage.set('farm', id);
					}
				});

				if(wasPreviousFarm) {
					$rootScope.$broadcast('myfarm.farmChanged', myfarm.data);
				}
			}
		});

		return myfarm;
	}
])
.run(['myfarm', angular.noop]) //Make sure myfarm gets instatiated so that it can listen for event
.factory('myfarm.cacheByFarm', ['$cacheFactory', '$rootScope',
	function($cacheFactory, $rootScope) {
		var cache = $cacheFactory('myfarm.cacheByFarm');
		$rootScope.$on('myfarm.farmChanged', function() {
			cache.removeAll();
		});

		return function(cacheId, factory) {
			return function(/* arguments... */) {
				var cached = cache.get(cacheId);
				if(cached) return cached;
				else return cache.put(cacheId, factory.apply(this, arguments));
			}
		}
	}
])
.factory('myfarm.data', ['sendRequest', '$q',
	function(sendRequest, $q) {
		return function(id) {
			return sendRequest('SrvMyFarm.getAllData', id).then(function(data) {
				function convertToImperial(d) {
						var cc = 2.204622621;
						d.lastSeven *= cc;
						d.lastLastSeven *= cc;
						d.perAnimalLastSeven *= cc;
						d.perAnimalLastLastSeven *= cc;
						d.perMilkingsLastSeven *= cc;
						d.perMilkingsLastLastSeven *= cc;
						d.last24h *= cc;
						d.lastLast24h *= cc;
						d.perAnimalLast24h *= cc;
						d.perAnimalLastLast24h *= cc;
						d.perMilkingsLast24h *= cc;
						d.perMilkingslLastLast24h *= cc;
				}
				if(data) {
					if(data.useImperialUnits) {
							data.sevenDays.pounds = 1;
							data.sevenDays.jsVcMilkData && convertToImperial(data.sevenDays.jsVcMilkData);
							data.sevenDays.jsRobots && data.sevenDays.jsRobots.forEach(convertToImperial);
							data.sevenDays.jsGroup && data.sevenDays.jsGroup.forEach(convertToImperial);
					}
					return data;
				}
				else return $q.reject();
			})
		};
	}
])
.factory('myfarm.socket', ['myfarm.data', 'chat.socket', 'alarms.socket', 'cowq.socket', 'robotState.socket', 'onBroadcastCancel', 'util.vcTimeDiff',
	function(getData, chatSocket, alarmsSocket, cowqSocket, robotStateSocket, onBroadcastCancel, timeDiff) {
		return function(id, cancelBroadCast) {
			if(cancelBroadCast) {
				onBroadcastCancel();
			}

			chatSocket.listen(id);
			alarmsSocket.listen(id);
			cowqSocket.listen(id);
			robotStateSocket.listen(id);

			return getData(id).then(function(data) {
				timeDiff.set(10);

				if (data == 'No farm') {
					return data;
				}

				chatSocket.run(id, data);
				alarmsSocket.run(id, data);
				cowqSocket.run(id, data);
				robotStateSocket.run(id, data);

				return data;
			});
		};
	}
])
// .factory('myfarm.createSocket', ['onBroadcast', '$rootScope',
// 	function(onBroadcast, $rootScope) {

// 		return function(functionType, updateEvent, extractData, updateData) {
// 			var updates = [], data, currentId;

// 			return {
// 				listen: function(id) {
// 					onBroadcast(id, functionType, function(update) {
// 						if(id !== currentId) return; //Ignore updates from previous farms

// 						if(data) {
// 							updateData(data, update);
// 							$rootScope.$broadcast(updateEvent, data);
// 						} else {
// 							updates.push(update);
// 						}
// 					});
// 				},
// 				run: function(id, rawData) {
// 					currentId = id;
// 					data = extractData(rawData);
// 					while(updates.length > 0) {
// 						updateData(data, updates.pop());
// 					}
// 				}
// 			}
// 		};
// 	}
// ])
.value('unit', {current: 'kg'})
.run(['$rootScope', 'unit', function($scope, unit) {
	$scope.$on('myfarm.dataUpdated', function(event, data, id) {
		$scope.loaded = false;
		data.then(function(data) {
			$scope.loaded = true;

			$scope.data = data;
			$scope.id = id;

			if (data == 'No farm') { return; }

			$scope.farmName = data.cows.vcName;
			$scope.isAdmin = isAdmin(data.cows.perm);

			$scope.useImperialUnits = data.useImperialUnits;
			$scope.unit = $scope.useImperialUnits ? 'lb' : 'kg';
			unit.current = $scope.unit;
		});
	});

	function isAdmin(permissionMask) {
		var adminBitmask = 0x40;
		return (permissionMask | adminBitmask) === permissionMask;
	}
}])
.value('farmConnectionThresholdRed',    60*3) //Three min
.value('farmConnectionThresholdYellow', 60) //One min
.factory('farmConnectionStatus', ['farmConnectionThresholdRed', 'farmConnectionThresholdYellow', function(redThreshold, yellowThreshold) {
	return function(timeSinceLastContact) {
		var farmConnection = 'ok';
		if(timeSinceLastContact > redThreshold) {
			farmConnection = 'red';
		} else if(timeSinceLastContact > yellowThreshold) {
			farmConnection = 'yellow';
		}
		return farmConnection;
	}
}])
.run(['$rootScope', 'myfarm', 'onPollUpdate', 'farmConnectionStatus',
	function($scope, myfarm, onPollUpdate, farmConnectionStatus) {
		onPollUpdate(function(farmId, timeSinceLastContact) {
			if(farmId === myfarm.id) {
				$scope.$broadcast('myfarm.farmConnectionUpdate', farmConnectionStatus(timeSinceLastContact));
			}
		});

		$scope.$on('myfarm.dataUpdated', function(event, data) {
			data.then(function(data) {
				$scope.$broadcast('myfarm.farmConnectionUpdate', farmConnectionStatus(data.lastAccessedByVC));
			});
		});
	}
]);
