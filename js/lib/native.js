/* global angular */

//'use strict';
//TODO reintroduce strict mode here and in angular

angular.module('native', ['password', 'server'])
	.factory('appInfo', ['$location', 'storage', function($location, storage) {
		var appInfo;
		var search = $location.search();
		var nativeProtocol = search.nativeProtocol;
		if(nativeProtocol) {
			//Assume appInfo is in search
			appInfo = {
				nativeProtocol: nativeProtocol,
				deviceId: search.deviceId,
				deviceToken: search.deviceToken,
				appVersion: search.appVersion,
				osVersion: search.osVersion,
				phoneModel: search.phoneModel,
				phoneName: search.phoneName
			};
			storage.set('appInfo', appInfo);
		} else {
			appInfo = storage.get('appInfo');
		}

		if(!appInfo) {
			appInfo = {
				nativeProtocol: 'Unknown'
			}
		}

		return appInfo;
	}])
	.factory('nativeProtocol', ['appInfo', function(appInfo) {
		return appInfo.nativeProtocol || 'Unknown';
	}])
	.factory('deviceToken', ['appInfo', '$q', 'nativeInterface', 'storage', function(appInfo, $q, nativeInterface, storage) {
		if(appInfo.deviceToken) {
			console.log('** INSTANT DEVICE TOKEN ** ' + appInfo.deviceToken);
			return $q.when(appInfo.deviceToken);
		} else {
			return $q(function(resolve, reject) {
				nativeInterface.registerCallback('setDeviceToken', function(deviceToken) {
					appInfo.deviceToken = deviceToken;
					console.log('** GOT DEVICE TOKEN LATER ** ' + appInfo.deviceToken);
					storage.set('appInfo', appInfo);

					resolve(deviceToken);
				});
			});
		}
	}])

	.factory('deviceId', ['appInfo', '$q', 'nativeInterface', 'storage', function(appInfo, $q, nativeInterface, storage) {
		if(appInfo.deviceId) {
			console.log('** INSTANT DEVICE ID ** ' + appInfo.deviceId);
			return $q.when(appInfo.deviceId);
		} else {
			return $q(function(resolve, reject) {
				nativeInterface.registerCallback('setDeviceId', function(deviceId) {
					appInfo.deviceId = deviceId;
					console.log('** GOT DEVICE ID LATER ** ' + appInfo.deviceId);
					storage.set('appInfo', appInfo);

					resolve(deviceId);
				});
			});
		}
	}])
	.factory('appType', ['nativeProtocol', function(nativeProtocol) {
		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0': return 'IOS';
			case 'Android 1.0': case 'Android 2.0': return 'Android';
			default: return "Unknown";
		}
	}])
	.factory('getRegisterInfo', ['appType', 'appInfo', function(appType, appInfo) {
		//Return getter since deviceToken may change during runtime
		return function() {
			return {
				appType: appType,
				deviceToken: appInfo.deviceToken,
				deviceId: appInfo.deviceId,
				appVersion: appInfo.appVersion,
				osVersion: appInfo.osVersion,
				phoneModel: appInfo.phoneModel,
				phoneName: appInfo.phoneName,
			};
		};
	}])
	.factory('nativeInterface', ['nativeProtocol', '$window', function(nativeProtocol, $window) {
		var callMethod, registerCallback, forceUpdate;

		switch (nativeProtocol) {
			case 'test':
				callMethod = function(name, argument) {
					console.log('callMethod', name, argument);
				};
				break;
			case 'IOS 1.0': case 'IOS 2.0':
				callMethod = function(name, argument) {
					$window.webkit.messageHandlers.app.postMessage({
						method: name,
						argument: argument
					});
				};
				break;
			case 'Android 1.0': case 'Android 2.0':
				callMethod = function(name, argument) {
					if(angular.isArray(argument)) {
						if(argument.$isArguments) {
							$window.android[name].apply($window.android, argument);
							return;
						}
					}
					if(typeof argument === 'object') {
						argument = JSON.stringify(argument);
					}
					if(typeof argument === 'undefined') {
						$window.android[name]();
					} else {
						$window.android[name](argument);
					}
				};
				break;
			case 'Unknown':
				callMethod = function(name, argument) {
					console.log('callMethod', name, argument);
				};
		}

		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0': //Fallthrough
			case 'Android 1.0': case 'Android 2.0': //Fallthrough
			case 'Unknown':
				var nativeCallbacks = [];
				$window.__nativeCallback = function(number, argument) {
					nativeCallbacks[number](argument);
				};

				var invoke = function() {
					__nativeCallback('{{number}}', '{{argument}}');
				};

				var invokeString = invoke.toString().replace(/\s*/g, '');

				registerCallback = function(method, callback) {
					var length = nativeCallbacks.push(function(argument) {
						console.log('Native callback', method, argument);
						callback(argument);
					});
					var number = length - 1;
					callMethod('registerCallback', {
						method: method,
						invoke: '(' + invokeString.replace("'{{number}}'", number) + ')()'
					});
				};
				break;
		}

		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0':
				forceUpdate = function() {
					$window.webkit.messageHandlers.app.postMessage('forceUpdate');
				};
				break;
			case 'Android 1.0': case 'Android 2.0':
				forceUpdate = function() {
					$window.android.forceUpdate();
				};
				break;
		}

		return {
			callMethod: function(name, argument) { callMethod(name, argument) },
			registerCallback: function(method, callback) { registerCallback(method, callback) },
			forceUpdate: function() { forceUpdate() }
		};
	}])
	.factory('registerDevice', ['nativeProtocol', 'sendRequest', 'getRegisterInfo', '$q', 'nativeLog', function(nativeProtocol, sendRequest, getRegisterInfo, $q, nativeLog) {
		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0': //Fallthrough
			case 'Android 1.0': case 'Android 2.0':
				return function() {
					return sendRequest('SrvUser.registerPhone', getRegisterInfo());
				};
			default:
				return function() {
					nativeLog.debug('registerDevice')
					return $q.resolve();
				};
		}
	}])
	.factory('unregisterDevice', ['nativeProtocol', 'sendRequest', 'appInfo', '$q', 'nativeLog', function(nativeProtocol, sendRequest, appInfo, $q, nativeLog) {
		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0': //Fallthrough
			case 'Android 1.0': case 'Android 2.0':
				return function() {
					nativeLog.debug('unregisterDevice');
					return sendRequest('SrvUser.unregisterPhone', appInfo.deviceId);
				};
			default:
				return function() {
					return $q.resolve();
				};
		}
	}])
	.factory('tryUnregisterDevice', ['$q', 'unregisterDevice', 'j$PromiseRace', '$timeout', function($q, unregisterDevice, j$PromiseRace, $timeout) {
		return function() {
			return $q(function(resolve) {
				j$PromiseRace(unregisterDevice(), $timeout(800)).finally(resolve);
			});
		}
	}])
	.config(['$provide', function($provide) {
		$provide.decorator('attemptLogin', ['$delegate', 'nativeProtocol', function(attemptLogin, nativeProtocol) {
			return function(email, password, servers) {

				switch (nativeProtocol) {
					case 'IOS 1.0': //Fallthrough
					case 'Android 1.0': //Fallthrough
						//Disable other server login
						//No break is needed because we return
						return attemptLogin(email, password, null);
					case 'test':
					case 'IOS 2.0':
					case 'Android 2.0':
						return attemptLogin.apply(this, arguments);
				}
			};
		}]);

		$provide.decorator('logout', ['$delegate', 'tryUnregisterDevice', function(logout, tryUnregisterDevice) {
			return function() {
				var args = arguments;
				tryUnregisterDevice().then(function() {
					logout.apply(this, args);
				});
			};
		}]);

		$provide.decorator('redirectToEula', ['$delegate', 'nativeProtocol', 'setServer', function(redirectToEula, nativeProtocol, setServer) {
			return function(eula, data, serverUrl) {
				switch (nativeProtocol) {
					case 'IOS 1.0': //Fallthrough
					case 'Android 1.0': //Fallthrough
						//Do nothing
						break;
					case 'test':
					case 'IOS 2.0':
					case 'Android 2.0':
						if(serverUrl) {
							setServer(serverUrl + appUrl);
						}
					break;
				}
				redirectToEula.apply(this, arguments);
			};
		}]);

		$provide.decorator('redirectToLogin', ['nativeProtocol', 'nativeInterface', '$window', 'loginUrl', function(nativeProtocol, nativeInterface, $window, loginUrl) {
			return function() {
				switch (nativeProtocol) {
					case 'IOS 1.0': //Fallthrough
					case 'Android 1.0': //Fallthrough
						//loadLoginPage is not implemented in this version and the server will always be the same
						$window.location.replace(loginUrl + '#/');
						break;
					case 'test':
					case 'IOS 2.0':
					case 'Android 2.0':
						nativeInterface.callMethod('loadLoginPage');
						break;
				}
			};
		}]);

		$provide.decorator('redirectToApplication', ['nativeInterface', 'setServer', 'appUrl', function(nativeInterface, setServer, appUrl) {
			return function(serverUrl) {
				if(serverUrl) {
					setServer(serverUrl + appUrl);
				}
				nativeInterface.callMethod('reload');
			};
		}]);

		$provide.decorator('getLoginInfo', ['getRegisterInfo', 'nativeLog',
			function(getRegisterInfo, nativeLog) {
				function returnRegisterInfo() {
					nativeLog.debug('Logged in with registerInfo', getRegisterInfo());
					return getRegisterInfo();
				}
				//Dirty solution, preventing polyfill.js from overriding
				//FIXME Solve another way
				returnRegisterInfo.__dontOverwrite = true;

				return returnRegisterInfo;
			}
		]);

		$provide.decorator('setServer', ['nativeInterface',
			function(nativeInterface) {
				return function(server) {
					nativeInterface.callMethod('setServer', server);
				};
			}
		]);

		$provide.decorator('changeServer', ['setServer', 'tryUnregisterDevice',
			function(setServer, tryUnregisterDevice) {
				return function(server) {
					tryUnregisterDevice().then(function() {
						setServer(server);
					});
				};
			}
		]);

		$provide.decorator('reload', ['nativeInterface', function(nativeInterface) {
			return function() {
				nativeInterface.callMethod('reload');
			};
		}]);

		/*
		$provide.decorator('$log', ['$delegate', 'nativeProtocol', 'nativeInterface',
			function($log, nativeProtocol, nativeInterface) {
				switch (nativeProtocol) {
					case 'IOS 1.0':
						 return Object.keys($log).reduce(function(key, obj) {
							obj[key] = function() {
								var args = [].slice.call(arguments);
								nativeInterface.callMethod('log:' + key, args.join(', '));
							};
							return obj;
						}, {});
					case 'Android 1.0':
						 return Object.keys($log).reduce(function(key, obj) {
							obj[key] = function() {
								var args = [].slice.call(arguments);
								$log[key](args.join(', '));
							};
							return obj;
						}, {});
					default:
						return $log;
				}
			}
		]);*/
		/*
		$provide.decorator('$log', ['$delegate', 'nativeProtocol',
			function($log, nativeProtocol) {
				switch (nativeProtocol) {
					case 'Android 1.0':
						Object.keys($log).reduce(function(key, obj) {
							obj[key] = function() {
								var args = [].slice.call(arguments);
								$log[key](args.join(', '));
							};
							return obj;
						}, {});
						break;
					default:
						return $log;
				}
			}
		]);*/
	}])
	//TODO remove native logs
	.factory('nativeLog', ['nativeProtocol', 'nativeInterface', function(nativeProtocol, nativeInterface) {
		var keys = ["debug", "error", "info", "log", "warn"];
		switch (nativeProtocol) {
			case 'IOS 1.0': case 'IOS 2.0':
				return keys.reduce(function(obj, key) {
					obj[key] = function() {
						var args = [].slice.call(arguments);
						args.map(function(arg) {
							return typeof arg === 'string' ? arg : typeof arg === 'object' ? JSON.stringify(arg) : arg.toString();
						});
						nativeInterface.callMethod('log:' + key, args.join(', '));
					};
					return obj;
				}, {});
			case 'Android 1.0': case 'Android 2.0':
				return keys.reduce(function(obj, key) {
					obj[key] = function() {
						var args = [].slice.call(arguments);
						console[key](args.join(', '));
					};
					return obj;
				}, {});
			default:
				return console;
		}
	}])
	.factory('sendTranslationsToApp', ['nativeProtocol', 'nativeInterface', 'translate', function(nativeProtocol, nativeInterface, translate) {
		return function() {
			var translations = {
				connectionError: translate('AppConnectionErrorText'),
				retry: translate('AppConnectionErrorButton'),
				resetServer: translate('Reset server'),
				// loading: translate('AppStartupText')
			};

			function asArguments(array) {
				array.$isArguments = true;
				return array;
			}

			switch (nativeProtocol) {
				case 'Android 1.0': case 'Android 2.0':
					var translationArray = [translations.connectionError, translations.retry, translations.resetServer];
					nativeInterface.callMethod('setTranslations', asArguments(translationArray));
					break;
				default:
					nativeInterface.callMethod('setTranslations', translations);
					break;
			}
		}
	}])
	.run(['$rootScope', '$q', 'registerDevice', 'userLoginPromise', 'sendTranslationsToApp', 'deviceToken', 'deviceId',
		function($rootScope, $q, registerDevice, userLoginPromise, sendTranslationsToApp, deviceToken, deviceId) {
			// if(!isAppCompatible()) {
			// 	console.log('Device not compatible, force update!');
			// 	nativeInterface.forceUpdate();
			// }

			$q.all([userLoginPromise, deviceToken, deviceId]).then(function() {
				registerDevice();
			});

			sendTranslationsToApp();
			$rootScope.$on('translate.translationsChanged', sendTranslationsToApp);
		}
	]);
