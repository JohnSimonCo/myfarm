'use strict';

angular.module('app', ['j$', 'server', 'translate', 'password', 'modal'])
.controller('formController', [	'$scope', 'storage', 'sendRequest', 'getUserEmail',
								'translate.userLanguage', 'translate.changeLanguage',
								'attemptLogin', 'alert', 'translate', 'selectServerList', 'loginToServer', '$timeout',
	function($scope, storage, sendRequest, getUserEmail, userLanguage, changeLanguage, attemptLogin, alert, translate, selectServerList, loginToServer, $timeout) {
		$scope.email = getUserEmail();

		sendRequest('SrvLanguage.getLanguages', null).then(function(response) {
			$scope.languages = response.langs;

			$scope.language = userLanguage.get(response.langs);

			// response.servers = 'localhost;https://localhost';
			// response.servers = 'test;https://myfarm2.delaval.com';
			// response.servers = 'localhost;http://192.168.168.223,test;https://myfarm2.delaval.com';
			// response.servers = 'localhost;https://localhost,test;https://myfarm2.delaval.com';
			// response.servers = 'localhost;https://localhosts'; //Error
			if(response.servers == null || response.servers == '') {
				$scope.servers = null;
			} else {
				$scope.servers = response.servers.split(',').map(function(string) {
					var parts = string.split(';');
					return {
						name: parts[0],
						url: parts[1]
					};
				});
			}
		});

		$scope.changeLanguage = function() {
			changeLanguage($scope.language);
		};

		//In case of autofill
		$scope.autofill = false;
		$timeout(function() {
			if($scope.email) {
				$scope.form.$setDirty();
				$scope.form.$setValidity();
				$scope.autofill = true;
			}
		}, 50);

		$scope.attemptLogin = function() {
			$scope.submitted = true;

			$scope.validAutoFill = $scope.autofill && $scope.email && $scope.password;
			if($scope.form.$valid || $scope.validAutoFill) {
				attemptLogin($scope.email, $scope.password, $scope.servers)
				.then(function(servers) {
					if(servers == null) { return; }

					selectServerList(servers).then(function(server) {
						loginToServer(server, $scope.email);
					});
				})
				.catch(function(error) {
					alert(translate(error));
				});
			}
		};
	}
])
.factory('getServers', ['sendRequest', '$q', function(sendRequest, $q) {
	return function() {
		return sendRequest('SrvUser.getServers');
	};
}])
.factory('selectServerList', ['$modal', 'getServers', 'convertServerUrlToAppUrl', 'validateServerUrl', 'setServer', '$window',
	function($modal, getServers, convertToAppUrl, validateServerUrl, setServer, $window) {
		return function(servers) {
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
			var modal = $modal('login/set-farm-modal.html', {
				servers: servers,
				customUrl: customUrl
			});
			return modal.result;
		};
	}
])
.run(['$templateCache', function($templateCache) {
	$templateCache.put('login/set-farm-modal.html',
		'<modal class="set-server">' +
			'<pre class="title" translate="Select server"></pre>' +
			'<div ng-repeat="server in servers">' +
				'<button class="big-button black-button" translate-bind="server.name" ng-click="confirm(server)"></button>' +
			'</div>' +
			'<button class="big-button black-button cancel" ng-click="close()" translate="Cancel"></button>' +
		'</modal>');
}])
.run(['sendRequest', function(sendRequest) {
	 /*sendRequest.when('SrvUser.loginNew').respond({
		 success: false,
		 reason: 'eula_farm',
		 userName: 'John Rapp',
		 farmId: 'MOCK ID',
		 farmName: 'Bredsjö'
	 });*/
 }]);
