'use strict';

angular.module('polyfill', [
	'server', 'util', 'password', 'translate', 'j$',
])
.factory('getCookie', [function() {
	return function(cn) {
		//Copied from old code
		var i = -1,
			cc = document.cookie,
			d = null;
		if (cc != null) {
			cc = cc.split(";");
			while (++i < cc.length) {
				if (cc[i].substr(0, cc[i].indexOf("=")).replace(/^\s+|\s+$/g, "") == cn) {
					return unescape(cc[i].substr(cc[i].indexOf("=") + 1));
				}
			}
		}
		return null;
	}
}])
.factory('setCookie', [function() {
	return function setCookie(c_name, value, exdays, doNotEsc) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = (doNotEsc ? value : escape(value)) + ((exdays == null) ? "" : ";path=/;expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	}
}])
.value('cookieName', '__VcAppSession')
.factory('getSessionCookie', ['getCookie', 'cookieName', 'JsSerilz', function(getCookie, cookieName, JsSerilz) {
	return function() {
		var d = new JsSerilz('$', getCookie(cookieName));
		return d.hasMore() ? {
			session: d.getString(),
			lcid: d.getString(),
			email: d.getString(),
			pwd: d.getString(),
			isApp: d.getInt(),
			farm: d.getString(),
			profile: d.getString()
		} : {
			email: ''
		}
	}
}])
.factory('setSessionCookie', ['setCookie', 'cookieName', 'JsSerilz', function(setCookie, cookieName, JsSerilz) {
	return function(cookie) {
		var d = new JsSerilz('$');
		d.serialize(cookie.session, cookie.lcid, cookie.email, cookie.pwd, cookie.isApp, cookie.farm, cookie.profile ? encodeURI(cookie.profile) : '');
		setCookie(cookieName, d.getData(), 120, true);
	}
}])
.factory('changeSessionCookie', ['getSessionCookie', 'setSessionCookie', function(getSessionCookie, setSessionCookie) {
	return function(extension) {
		setSessionCookie($.extend(getSessionCookie(), extension));
	}
}])
.factory('logoutResponseInterceptor', ['userLoginDefer', function(userLoginDefer) {
	return {
		response: function(response) {
			if(response.config._javaClassMethod === 'SrvMyFarm.getAllData') {
				if(response.data != null) {
					userLoginDefer.resolve();
				} else {
					userLoginDefer.reject();
				}
			}
			return response;
		}
	}
}])
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('logoutResponseInterceptor');
	// $httpProvider.interceptors.push('errorInterceptor');
}])
.config(['$provide', function($provide) {
	// $provide.decorator('sendRequest', ['$delegate', 'userLoginDefer', function(sendRequest, userLoginDefer) {
	// 	function override(javaClassMethod, request) {
	// 		return sendRequest(javaClassMethod, request).then(function(data) {

	// 			if(javaClassMethod === 'SrvMyFarm.getAllData') {
	// 				//Logged in
	// 				if(data /*!= null*/) {
	// 					userLoginDefer.resolve();
	// 				} else {
	// 					userLoginDefer.reject();
	// 				}
	// 			}

	// 			return data;
	// 		});
	// 	}

	// 	angular.extend(override, sendRequest);

	// 	return override;
	// }]);

	$provide.decorator('setLoginInfo', ['changeSessionCookie', function(changeSessionCookie) {
		return function(email, hash) {
			changeSessionCookie({
				email: email,
				pwd: hash,
				session: '' 
			});
		}
	}]);
	$provide.decorator('getLoginInfo', ['$delegate', function($delegate) {
		if($delegate.__dontOverwrite) {
			return $delegate;
		} else {
			return angular.noop;
		}
	}]);
	$provide.decorator('clearLoginInfo', ['getSessionCookie', 'setSessionCookie',
		function(getSessionCookie, setSessionCookie) {
			return function() {
				var cookie = getSessionCookie();
				setSessionCookie({
					lcid: cookie.lcid,
					isApp: cookie.isApp
				});
			}
		}
	]);
	$provide.decorator('translate.userLanguage', ['getSessionCookie', 'changeSessionCookie', 'translate.defaultUserLanguage', '$log',
		function(getSessionCookie, changeSessionCookie, getDefaultLanguage, $log) {
			return {
				get: function(languages) {
					// $log.debug("*** getSessionCookie().lcid = " + getSessionCookie().lcid)
					// $log.debug("*** getDefaultLanguage(languages) = " + getDefaultLanguage(languages))
					// $log.debug("*** (getSessionCookie().lcid || getDefaultLanguage(languages)).toLowerCase() = " + (getSessionCookie().lcid || getDefaultLanguage(languages)).toLowerCase())
					return (getSessionCookie().lcid || getDefaultLanguage(languages)).toLowerCase();
				},
				set: function(lcid) {
					changeSessionCookie({
						lcid: lcid
					});
				}
			}
		}
	]);
	$provide.decorator('getUserEmail', ['getSessionCookie', function(getSessionCookie) {
		return function() {
			return getSessionCookie().email;
		};
	}])
}]);