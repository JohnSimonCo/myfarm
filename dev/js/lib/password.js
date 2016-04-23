'use strict';

angular.module('password', ['j$'])
.factory('password.errorFailed', ['$q', 'translate', function($q, translate) {
	return $q.reject(translate('Login failed'));
}])
.factory('password.errorWrongCredentials', ['$q', 'translate', function($q, translate) {
	return $q.reject(translate('Wrong credentials'));
}])
.factory('attemptLogin', ['sendRequest', '$http', '$q', 'password.getHashCode', 'login', 'loginToServer', 'password.errorWrongCredentials', 'password.errorFailed', 'stringStartsWith', 'setServer', 'convertServerUrlToAppUrl',
	function(sendRequest, $http, $q, hash, login, loginToServer, wrongCredentials, failed, stringStartsWith, setServer, convertServerUrlToAppUrl) {
		return function(email, password, servers) {

			if(servers == null) {
				return sendRequest('SrvUser.seed', email).then(function(seed) {
					console.log(seed)
					if(seed && seed.length > 1) {
						return login(email, hash(seed + password));
					} else {
						if(seed === 0) {
							return wrongCredentials;
						} else {
							return failed;
						}
					}
				});
			}

			return $q.all(servers.map(function(server) {
				return $q(function(resolve, reject) {
					$http({
						method: 'POST',
						url: server.url + '/seed.vcx',
						data: {
							usr: email
						},
						headers: {
							'Content-Type': 'text/plain'
						}
					}).then(function(response) {
						//If there was a server error
						if(response.status != 200) {
							return resolve(null);
						}
						//Already logged in on server
						if(response.data == 'ok') {
							server.loggedIn = true;
							resolve(server);
						//No account on server
						} else if(response.data == 'not existent') {
							resolve(null);
						//Account on server, but not logged in
						} else {
							var seed = response.data;
							var pwd = hash(seed + password);

							//Save on server object so that we can reach later
							server.pwd = pwd;
							
							$http({
								method: 'POST',
								url: server.url + '/seed.vcx',
								data: {
									usr: email,
									id: pwd
								},
								headers: {
									'Content-Type': 'text/plain'
								}
							}).then(function(response) {
								//Successfully logged in
								if(response.data == 'ok') {
									resolve(server);
								//Login failed
								} else {
									resolve(null);
								}

							}, function(error) {
								resolve(null);
							});
						}
					}, function(error) {
						resolve(null);
					});
				});
			})).then(function(servers) {
				var successful = servers.filter(function(server) {
					return server != null;
				});
				switch (successful.length) {
					case 0:
						//Make promise fail
						throw 'Wrong credentials';
						break;
					case 1:
						//login
						return loginToServer(successful[0], email);
						break;
					default:
						return successful;
						//show dialog
				}
			});
		};
	}
])
.factory('loginToServer', ['loginNewNew', 'redirectToApplication', function(loginNewNew, redirectToApplication) {
	return function(server, email) {
		if(server.loggedIn) {
			redirectToApplication(server.url);
		} else {
			return loginNewNew(server.url, email, server.pwd);
		}
	}
}])
.factory('loginNewNew', ['$http', 'setLoginInfo', 'getLoginInfo', 'handleLoginResponse',
	function($http, setLoginInfo, getLoginInfo, handleLoginResponse) {
		return function(serverUrl, email, hash) {
			$http({
				method: 'POST',
				url: serverUrl + '/seed.vcx',
				withCredentials: true,
				data: {
					usr: email,
					id: hash,
					//url = true means that we want to log in
					url: true,
					phoneRegisterData: getLoginInfo()
				},
				headers: {
					'Content-Type': 'text/plain'
				}
			}).then(function(response) {
				handleLoginResponse(response.data, serverUrl);
			}, function(error) {
				// resolve(null);
			});

			// return sendRequest('SrvUser.loginNew', getLoginInfo()).then(handleLoginResponse);
		};
	}
])
.factory('login', ['sendRequest', 'setLoginInfo', 'getLoginInfo', 'handleLoginResponse',
	function(sendRequest, setLoginInfo, getLoginInfo, handleLoginResponse) {
		return function(email, hash) {
			setLoginInfo(email, hash);

			return sendRequest('SrvUser.loginNew', getLoginInfo()).then(handleLoginResponse);
		};
	}
])
.factory('setLoginInfo', ['storage', function(storage) {
	return function(email, hash) {
		storage.edit
			.set('email', email)
			.set('pwd', hash)
			.save();
	};
}])
.factory('getLoginInfo', ['storage', function(storage) {
	return storage.toJson;
}])
.factory('clearLoginInfo', ['storage', function(storage) {
	return function() {
		storage.deleteMultiple('email', 'pwd');
	};
}])
.factory('userLoginDefer', ['$q', function($q) {
	return $q.defer();
}])
.factory('userLoginPromise', ['userLoginDefer', function(defer) {
	return defer.promise;
}])
.factory('logout', ['clearLoginInfo', 'redirectToLogin', function(clearLoginInfo, redirectToLogin) {
	return function() {
		clearLoginInfo();

		redirectToLogin();
	};
}])
.factory('handleLoginResponse', ['redirectToApplication', 'handleLoginError',
	function(redirectToApplication, handleLoginError) {
		return function(response, serverUrl) {
			if(response.success) {
				redirectToApplication(serverUrl);
			} else {
				return handleLoginError(response, serverUrl);
			}
		};
	}
])
.factory('handleLoginError', ['stringStartsWith', 'redirectToEula', '$q', 'translate', 'password.errorWrongCredentials', 'filterUndefinedValues',
	function(stringStartsWith, redirectToEula, $q, translate, wrongCredentials, filterUndefinedValues) {
		return function(response, serverUrl) {
			var reason = response.reason;
			if(reason != null) {
				if(reason === 'app') {
					return $q.reject(translate('First login must take place via app'));
				} else if(stringStartsWith(reason, 'eula_')) {
					redirectToEula(reason.replace('eula_', ''), filterUndefinedValues({
						userId: response.userId,
						userName: response.userName,
						farmId: response.farmId,
						farmName: response.farmName

					}), serverUrl);
				}
			} else {
				return wrongCredentials;
			}
		};
	}
])
.factory('appendMobileSuffix', ['$window', 'appendBuildPath', function($window, appendBuildPath) {
	return function(url) {
		var locationIsMobile = $window.location.pathname.indexOf('-mobile.html') !== -1;
		var urlIsMobile = url.indexOf('-mobile.html') !== -1;
		var result = (locationIsMobile && !urlIsMobile) ? url.replace('.html', '-mobile.html') : url;
		return appendBuildPath(result);
	}
}])
.factory('removeMobileSuffix', ['removeBuildPath', function(removeBuildPath) {
	return function(url) {
		var isMobile = url.indexOf('-mobile.html') !== -1;
		var result = isMobile ? url.replace('-mobile.html', '.html') : url;
		return removeBuildPath(result);
	}
}])
.factory('appendBuildPath', ['$window', function($window) {
	return function(url) {
		var locationIsBuild = $window.location.pathname.indexOf('/dev') !== -1;
		var urlIsBuild = url.indexOf('/dev') !== -1;
		return (locationIsBuild && !urlIsBuild) ? url.replace('/jr-myfarm', '/jr-myfarm/dev') : url;
	}
}])
.factory('removeBuildPath', [function() {
	return function(url) {
		var isBuild = url.indexOf('/dev') !== -1;
		return isBuild ? url.replace('/dev', '') : url;
	}
}])
.factory('appUrl', ['appendMobileSuffix', function(appendMobileSuffix) {
	return appendMobileSuffix('/jr-myfarm/index.html');
}])
.factory('redirectToApplication', ['$window', 'appUrl',
	function($window, appUrl) {
		return function(serverUrl) {
			var url = appUrl + '#/';
			if(serverUrl) {
				url = serverUrl + url;
			}
			$window.location.replace(url);
		};
	}
])
.factory('loginUrl', ['appendMobileSuffix', function(appendMobileSuffix) {
	return appendMobileSuffix('/jr-myfarm/login/index.html');
}])
.factory('redirectToLogin', ['$window', 'loginUrl', 'defaultServer', function($window, loginUrl, defaultServer) {
	return function() {
		var host = $window.location.host;
		var isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
		var isLocalhost = host === 'localhost';
		if(isIP || isLocalhost) {
			$window.location.replace(loginUrl + '#/');
		} else {
			$window.location.replace(defaultServer + loginUrl + '#/');
		}
	}
}])
.factory('eulaUrl', ['appendMobileSuffix', function(appendMobileSuffix) {
	return appendMobileSuffix('/jr-myfarm/eula/index.html');
}])
.factory('redirectToEula', ['$window', 'eulaUrl', 'buildUrl', 'setServer', 'getLoginInfo', 'appUrl',
	function($window, eulaUrl, buildUrl, setServer, getLoginInfo, appUrl) {
		return function(eula, data, serverUrl) {
			$window.location.replace(buildUrl({
				base: !serverUrl ? eulaUrl : serverUrl + eulaUrl,
				path: eula,
				search: data
			}));
		}
	}
])
.factory('convertServerUrlToAppUrl', ['removeMobileSuffix', 'appendMobileSuffix', 'stringStartsWith', 'stringEndsWith', 'appUrl',
	function(removeMobileSuffix, appendMobileSuffix, stringStartsWith, stringEndsWith, appUrl) {
		return function(serverUrl) {
			if(!stringStartsWith(serverUrl, 'http')) {
				serverUrl = 'https://' + serverUrl;
			}
			if(!stringEndsWith(serverUrl, removeMobileSuffix(appUrl))) {
				serverUrl += appUrl;
			}
			return appendMobileSuffix(serverUrl);
		}
	}
])
.factory('validateServerUrl', ['$q', function($q) {
	//From http://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
	var urlValidator = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
	return function(serverUrl) {
		return urlValidator.test(serverUrl) ? serverUrl : $q.reject();
	}
}])
// .constant('defaultServer', 'http://localhost')
.constant('defaultServer', 'https://myfarm2.delaval.com')
// .constant('defaultServer', 'https://myfarm.delaval.com')
.factory('setServer', [function() {
	return function() {
		//Do nothing, will get overriden by native.js
	}
}])
.factory('changeServer', ['redirectToApplication', function(redirectToApplication) {
	return function(server) {
		redirectToApplication(server);
	};
}])
.factory('reload', ['$window', function($window) {
	return function() {
		$window.location.reload();
	}
}])
.run(['userLoginPromise', 'logout', function(userLoginPromise, logout) {
	userLoginPromise.catch(function() {
		logout();
	});
}])
.factory('password.checkPasswordTexts', ['translatedTexts', function(createTexts) {
	return createTexts({
		'too short': 'at least 6 char',
		'more types': 'use upper/lower/numbers/others',
		'whitespace': 'must not contain spaces'
	});
}])
.factory('password.passwordProblem', ['password.checkPasswordTexts',
	function(getText) {
		return function(password) {
			if(!password) return [];

			var problems = [];

			if(password.length < 6) problems.push(getText('too short'));

			var types = 0;

			//true == 1, false == 0
			//Uppercase characters
			types += /[A-Z]/.test(password);
			//Lowercase characters
			types += /[a-z]/.test(password);
			//Digits
			types += /\d/.test(password);
			//Symbols
			types += /[^A-Za-z\d\s]/.test(password);
			if(types < 2) problems.push(getText('more types'));

			if(/\s/.test(password)) problems.push(getText('whitespace'));

			return problems;
		}
	}
])
.factory('password.verifyPassword', ['password.passwordProblem', 'storage', 'password.getHashCode',
	function(getProblem, storage, getHashCode) {
		return function(oldPassword, newPassword, verifyPassword, id) {
			var problem = getProblem(newPassword),
				oldCorrect = storage.get('pwd') == getHashCode(id + oldPassword),
				newCorrect = newPassword && problem.length < 1 && newPassword !== oldPassword,
				verifyCorrect = newCorrect && verifyPassword === newPassword,
				correct = oldCorrect && newCorrect && verifyCorrect;

			return {
				oldCorrect: oldCorrect,
				newCorrect: newCorrect,
				verifyCorrect: verifyCorrect,
				problem: problem,
				password: correct ? getHashCode(id + newPassword) : 0
			}
		}
	}
])
.factory('password.getHashCode', function() {
	return function getHashCode(s){var h=0,i=-1;while(++i<s.length){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return h;};
});