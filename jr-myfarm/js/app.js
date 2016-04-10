'use strict';

jr.include('css/delaval.css');
jr.include('css/app.css');

jr.include('js/lib/j$.js');
jr.include('js/lib/server.js');
jr.include('js/lib/util.js');
jr.include('js/lib/emoji.js');
jr.include('js/lib/translate.js');
jr.include('js/lib/modal.js');
jr.include('js/lib/escape-html.js');
jr.include('js/lib/extract.js');
jr.include('js/lib/password.js');
jr.include('js/lib/cowq-extras.js');
jr.include('js/lib/cow-extras.js');
jr.include('js/lib/jrgraph.js');
jr.include('js/lib/stat.js');
jr.include('js/lib/page-visible.js');
jr.include('js/lib/ngSilent.js');
jr.include('js/lib/milkdata.js');

jr.include('js/myfarm.js');
jr.include('js/overview.js');
jr.include('js/overview-cowq.js');
jr.include('js/overview-alarms.js');
jr.include('js/overview-chat.js');
jr.include('js/production.js');
jr.include('js/robot-state.js');
jr.include('js/settings.js');
jr.include('js/version.js');
jr.include('js/alarms.js');
jr.include('js/chat.js');
jr.include('js/cowq.js');
jr.include('js/cow.js');
jr.include('js/farms.js');
jr.include('js/users.js');
jr.include('js/edit-user.js');

jr.include('js/lib/polyfill.js');

angular.module('app', [
	'overview',
	'production',
	'robotState',
	'settings',
	'version',
	'alarms',
	'chat',
	'cowq',
	'cow',
	'farms',
	'users',
	'editUser',

	'ngSilent',
	'ngRoute',
	'ngAnimate',
	//'ngTouch',

	'server',

	'polyfill'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/overview.html',
		controller: 'overviewController',
		resolve: {
			data: ['myfarm', function(myfarm) {
				//Make sure data is loaded before rendering page
				return myfarm.data;
			}]
		}
	})
	.when('/settings', {
		templateUrl: 'templates/settings.html',
		controller: 'settingsController',
		resolve: {
			data: ['settings.data', 'myfarm', function(getData, myfarm) {
				return myfarm.data.then(function() {
					return getData(myfarm.id);
				});
			}]
		}
	})
	.when('/version', {
		templateUrl: 'templates/version.html',
		controller: 'versionController',
		resolve: {
			data: ['version.data', 'myfarm', function(getData, myfarm) {
				return myfarm.data.then(function() {
					return getData(myfarm.id);
				});
			}]
		}
	})
	.when('/users', {
		templateUrl: 'templates/users.html',
		controller: 'usersController',
		resolve: {
			data: ['users.data', 'myfarm', function(getData, myfarm) {
				return myfarm.data.then(function() {
					return getData(myfarm.id);
				});
			}]
		}
	})
	.when('/alarms', {
		templateUrl: 'templates/alarms.html',
		controller: 'alarmsController',
		resolve: {
			data: ['myfarm', 'alarms.extractData', function(myfarm, extractData) {
				return myfarm.data.then(extractData);
			}]
		}
	})
	.when('/chat', {
		templateUrl: 'templates/chat.html',
		controller: 'chatController',
		resolve: {
			data: ['myfarm', 'chat.extractData', function(myfarm, extractData) {
				return myfarm.data.then(extractData);
			}]
		}
	})
	.when('/cowq', {
		templateUrl: 'templates/cowq.html',
		controller: 'cowqController',
		resolve: {
			data: ['myfarm', 'cowq.extractData', function(myfarm, extractData) {
				return myfarm.data.then(extractData);
			}]
		}
	})
.when('/cowq/cow/:nr/graph', {
		//Use resolve instead of redirectTo because we need DI
		resolve: {
			load: ['$q', '$route', '$location', function($q, $route, $location) {
				var path = ['/cowq/cow', $route.current.params.nr, 'graph', 0];

				$location.path(path.join('/')).replace();
				
				return $q.reject();
			}]
		}
	})
	.when('/cowq/cow/:nr/graph/:milkingIndex', {
		templateUrl: 'templates/cow.html',
		controller: 'cowController',
		resolve: {
			data: ['myfarm', 'cowq.extractData', 'cow.extractData', '$route',
				function(myfarm, extractCowqData, extractCowData, $route) {
					$route.current.params.view = 'graph';
					return myfarm.data.then(extractCowqData).then(function(data) {
						return extractCowData(data, myfarm.id, +$route.current.params.nr);
					});
				}
			]	
		}
		// ,reloadOnSearch: false
	})	.when('/cowq/cow/:nr/:view', {
		templateUrl: 'templates/cow.html',
		controller: 'cowController',
		resolve: {
			data: ['myfarm', 'cowq.extractData', 'cow.extractData', '$route',
				function(myfarm, extractCowqData, extractCowData, $route) {
					return myfarm.data.then(extractCowqData).then(function(data) {
						return extractCowData(data, myfarm.id, +$route.current.params.nr);
					});
				}
			]	
		}
		// ,reloadOnSearch: false
	})
	.when('/cowq/cow/:nr', {
		//Use resolve instead of redirectTo because we need DI
		resolve: {
			load: ['$q', '$route', '$location', 'myfarm', 'getUserViewIndex', 'cow.views', function($q, $route, $location, myfarm, getUserViewIndex, views) {
				var userViewIndex = getUserViewIndex(myfarm.id);
				var path = ['/cowq/cow', $route.current.params.nr, views[userViewIndex]];

				$location.path(path.join('/')).replace();
				
				return $q.reject();
			}]
		}
	})
	.when('/user/:id/edit', {
		templateUrl: 'templates/edit-user.html',
		controller: 'editUserController',
		resolve: {
			data: ['editUser.data', 'myfarm', '$route',
				function(getData, myfarm, $route) {
					return myfarm.data.then(function() {
						return getData(myfarm.id, $route.current.params.id);
					});
				}
			]	
		}
		// ,reloadOnSearch: false
	})
	.when('/user/new', {
		templateUrl: 'templates/edit-user.html',
		controller: 'editUserController',
		resolve: {
			data: ['editUser.data', 'myfarm',
				function(getData, myfarm) {
					return myfarm.data.then(function() {
						return getData(myfarm.id);
					});
				}
			]	
		}
		// ,reloadOnSearch: false
	})
	.when('/production', {
		templateUrl: 'templates/production.html',
		controller: 'productionController',
		resolve: {
			data: ['myfarm', 'production.extractData', function(myfarm, extractData) {
				return myfarm.data.then(extractData);
			}]	
		}
	})
	.when('/robots', {
		templateUrl: 'templates/robot-state.html',
		controller: 'robotStateController',
		resolve: {
			data: ['myfarm', 'production.extractData', function(myfarm, extractData) {
				return myfarm.data.then(extractData);
			}]	
		}
	})
	.when('/farms', {
		templateUrl: 'templates/farms.html',
		controller: 'farmsController',
		resolve: {
			data: ['farms.data', function(getData) {
				return getData();
			}]
		}
	})
	// .when('/changefarm/:id', {
	// 	//Use resolve instead of redirectTo because we need DI
	// 	resolve: {
	// 		load: ['$q', '$route', 'storage', '$location', function($q, $route, storage, $location) {
	// 			var id = $route.current.params.id;
	// 			var path = $route.previousPath || '/';

	// 			storage.set('farm', id);
	// 			$location.search('id', id);
	// 			$location.path(path);
	// 			$location.replace();

	// 			console.log($route);
	// 			var defer = $q.defer();
	// 			return defer.reject(), defer.promise;
	// 		}]
	// 	}
	// })
	.otherwise({
		redirectTo: '/'
	});
}])

.controller('actionbarController', ['$scope', '$window', '$location', 'storage', 'logout', 'reload', function($scope, $window, $location, storage, logout, reload) {
	$scope.$on('myfarm.dataUpdated', function(event, data, id) {
		data.then(function(data) {
			if (data != 'No farm') {
				$scope.farmList = data.cows.myFarms;
			}
		});
	});

	$scope.farmConnection = 'ok';
	$scope.$on('myfarm.farmConnectionUpdate', function(e, farmConnection) {
		$scope.farmConnection = farmConnection;
	});
	$scope.connected = true;
	$scope.$on('connectionError', function(e) {
		$scope.connected = false;
	});
	$scope.reload = reload;

	$scope.navigateBack = function() {
		$window.history.back();
	};
	$scope.navigateForward = function() {
		$window.history.forward();
	};

	$scope.changeFarm = function(id) {
		storage.set('farm', id);
		$location.search('id', id);
	};

	$scope.logout = logout;
}])
.factory('getServers', ['sendRequest', '$q', function(sendRequest, $q) {
	return function() {
		return sendRequest('SrvUser.getServers');
	};
}])
.controller('changeServerController', ['$scope', '$modal', 'getServers', 'convertServerUrlToAppUrl', 'validateServerUrl', 'setServer', 'changeServer', '$window',
	function($scope, $modal, getServers, convertToAppUrl, validateServerUrl, setServer, changeServer, $window) {
		$scope.changeServer = function() {
			getServers().then(function(servers) {
				var currentUrl = $window.location.origin;
				var currentServer = servers.filter(function(server) {
					return server.url === currentUrl;
				});
				var customUrl;
				if(currentServer.length > 0) {
					currentServer[0].selected = true;
				} else {
					customUrl = currentUrl;
				}
				var modal = $modal('set-farm-modal.html', {
					servers: servers,
					customUrl: customUrl
				});
				modal.result.then(convertToAppUrl).then(validateServerUrl).then(function(url) {
					changeServer(url);
				});
			});
		};
	}
])
.controller('dropdownController', ['$scope', function($scope) {
	$scope.isExpanded = false;
	$scope.toggle = function() {
		if($scope.isExpanded) {
			$scope.collapse();
		} else {
			$scope.expand();
		}
	};
	$scope.expand = function() {
		$scope.isExpanded = true;
	};
	$scope.collapse = function() {
		$scope.isExpanded = false;
	}
}])
.controller('noFarmController', ['$scope', '$window', function($scope, $window) {
	$scope.retry = function() {
		$window.location.reload();
	}
}])
.run(['sendRequest', function(sendRequest) {
	//var response = JSON.parse('');
	//sendRequest.when('SrvMyFarm.getAllData', 'bd8c3446-90a1-4e54-b39e-95ef5623c64a').respond(response);
}])
.run(['$templateCache', function($templateCache) {
	$templateCache.put('set-farm-modal.html',
		'<modal class="set-server">' +
			'<pre class="title" translate="Change server"></pre>' +
			'<div ng-repeat="server in servers">' +
				'<button class="big-button black-button change-server" ng-class="{\'success\': server.selected}" translate-bind="server.name" ng-click="confirm(server.url)"></button>' +
			'</div>' +
			'<form ng-submit="confirm(customUrl)">' +
				'<div translate="Custom server"></div>' +
				'<input ng-model="customUrl" type="text"/>' +
				'<button class="big-button black-button" ng-click="confirm(customUrl)" translate="Ok"/>' +
			'</form>' +
			'<button class="big-button black-button cancel" ng-click="close()" translate="Close"></button>' +
		'</modal>');
}]);

// (function(id) {
// 	var hash = location.hash, newHash;

// 	var hasSearch = hash.indexOf('?') !== -1;

// 	if(hasSearch) {
// 		newHash = hash.replace(/([?&]id=)([^\w-]*)/, '$0' + id);
// 	} else {
// 		newHash = hash + '?id=' + id;
// 	}

// 	location.hash = newHash;
// })('11d8fe85-ca57-4bd8-926d-e33cd72c4151');