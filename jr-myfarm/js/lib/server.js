'use strict';

jr.include('/jr-myfarm/js/lib/modal.js');

angular.module('server', ['modal'])
	.service('sendRequest', ['$http', 'generateRequestUrl', '$q', '$log', function($http, generateRequestUrl, $q, $log) {
		function sendRequest(javaClassMethod, postData) {
			$log.debug('*** Request ' + javaClassMethod, typeof postData == 'string' && postData.charAt(0) == '{' ? JSON.parse(postData) : postData);

			var mockedResponse = this.mock(javaClassMethod, postData);
			if(mockedResponse) {
				$log.debug('*** Mocked response ' + javaClassMethod, mockedResponse);
				return $q.when(mockedResponse);
			}

			return $http({
				method: 'POST',
				data: JSON.stringify(postData || {}),
				url: generateRequestUrl(javaClassMethod),
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				responseType: 'json',
				cache: false,
				timeout: 20000, //20 sec
				_sendRequest: true,
				_javaClassMethod: javaClassMethod,
				transformResponse: function(value) {
					if(typeof value === 'string') {
						try {
							value = JSON.parse(value);
						}
						catch(e) {}
					}
					return value;
				}
			}).then(function(response) {
				return response.data;
			});
		}
		function self() {
			return sendRequest.apply(self, arguments);
		}

		self.mock = angular.noop;
		return self;
	}])
	.factory('generateRequestUrl', [function() {
		return function(javaClassMethod) {
			var split = javaClassMethod.split('.');
			var controller = split[0];
			var method = split[1];
			return '/Delaval/mvc/' + controller + '/' + method;
		};
	}])
	.factory('responseLogInterceptor', ['$log', function($log) {
		return {
			response: function(response) {
				//Only intercept sendRequest
				if(response.config._sendRequest) {
					$log.debug('*** Response ', response.data, response);
				}
				return response;
			}
		};
	}])
	.factory('errorInterceptor', ['$rootScope', '$q', '$log', function($rootScope, $q, $log) {
		return {
			responseError: function(rejection) {
				if(rejection.config._sendRequest && rejection.status === 0) {
					$log.debug('*** Error', rejection);
					$rootScope.$broadcast('connectionError');
				}
				return rejection;
			}
		}
	}])
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push('responseLogInterceptor');
		$httpProvider.interceptors.push('errorInterceptor');
	}])
	.value('onBroadcast', jr.onBroadcast)
	.value('onBroadcastCancel', jr.onBroadcastCancel)
	.value('onBroadcastError', jr.onBroadcastError)
	.value('onPollUpdate', jr.onLatest)
	// .factory('onPollUpdate', [function() {
	// 	var callbacks;
	// 	function latestListener(farmId, timeSinceLastContact) {
	// 		callbacks.fire(farmId, timeSinceLastContact);
	// 	}
	// 	return function(callback) {
	// 		if(!callbacks) {
	// 			callbacks = $.Callbacks();
	// 			jr.onLatest(latestListener);
	// 		}
	// 		callbacks.add(callback);
	// 	}
	// }])
	.factory('farmId', ['$location', 'storage',
		function($location, storage) {
			return function() {
				return $location.search().id || storage.get('farm');
			};
		}
	])
	.config(['$provide', function($provide) {
		$provide.decorator('sendRequest', ['$delegate', function(sendRequest) {
			var whens = {};

			function hash(javaClassMethod, request) {
				return javaClassMethod + (request ? request.toString() : '');
			}

			sendRequest.when = function(javaClassMethod, request) {
				return {
					respond: function(data) {
						var hashKey = hash(javaClassMethod, request);
						whens[hashKey] = data;
					}
				}
			};

			sendRequest.mock = function(javaClassMethod, request) {
				var hashKey = hash(javaClassMethod, request);
				if(whens[hashKey]) {
					return whens[hashKey];
				}
			};

			return sendRequest;
		}])
	}])
	.run(['$rootScope', 'keepTranslated', 'confirm', 'reload', '$timeout', function($rootScope, keepTranslated, confirm, reload, $timeout) {
		var title = keepTranslated('The server could not be reached, do you wish to reload?');
		var positive = keepTranslated('Reload');
		var negative = keepTranslated('Dismiss');

		var displayingError = false;
		$rootScope.$on('connectionError', function() {
			if(displayingError) { return; }

			displayingError = true;
			
			//Timeout to prevent $modal error
			$timeout(function() {
				confirm(title.translation(), positive.translation(), negative.translation()).then(reload).finally(function() {
					displayingError = false;
				});
			});
		})
	}])
	.run(['$rootScope', 'onBroadcastError', function($rootScope, onBroadcastError) {
		var hasDisplayedError = false;
		onBroadcastError(function() {
			if(!hasDisplayedError) {
				hasDisplayedError = true;
				$rootScope.$broadcast('connectionError');
			}
		});
	}]);