'use strict';

jr.include('css/settings.css');
jr.include('css/verset.css');

angular.module('settings', ['j$', 'server', 'translate', 'extract', 'password', 'modal'])
.factory('settings.deSerialize', ['$filter', 'JsSerilz',
	function($filter, JsSerilz) {
		var sort = $filter('orderBy');
		
		return function(data) {
			data.notify = data.notify || [];

			var currentFarmExists = data.notify.some(function(entry) {
				return entry.domainId === data.vcId;
			});

			if(!currentFarmExists && data.vcId) {
				data.notify.push({
					domainId: data.vcId,
					domainName: data.vcName,
					notifyFarmData: { // I need to set all the properties so that changes can be detected
						isChatMessageAlarm: false,
						isChatMessageAlarmQuiet: false,
						isNotificationAlarm: false,
						isNotificationAlarmQuiet: false,
						isStopAlarm: false,
						isStopAlarmQuiet: false,
						isVcCommunicationProblemNotification: false,
						isVcCommunicationProblemNotificationQuiet: false
					}
				});
			}
			
			data.notify.sort(function(a, b) {
				if(a.domainId === data.vcId) return -1;
				if(b.domainId === data.vcId) return 1;
				return a.domainName.localeCompare(b.domainName);
			});

			if(data.phones) {
				data.phones = sort(data.phones, 'name')
			}

			data.pwd = 0;

			return data;
		}
	}
])
.factory('settings.data', ['sendRequest', 'storage', 'settings.deSerialize', '$q',
	function(sendRequest, storage, deSerialize, $q) {
		return function(id) {
			return sendRequest('SrvUser.getMyUser', id).then(function(data) {
				if(!data) return $q.reject();
				else return deSerialize(data);
			});
		};
	}
])
.factory('settings.save', ['sendRequest', 'parseFormData', 'settings.deSerialize', '$q',
	function(sendRequest, parseFormData, deSerialize, $q) {
		return function(data) {
			return sendRequest('SrvUser.saveUserSettings', angular.toJson(parseFormData(data)))
			.then(function(data) {
				if(!data) return $q.reject();
				else return deSerialize(data);
			});
		}
	}
])
.controller('settingsController', ['$scope', 'data', 'translate.userLanguage', 'translate.changeLanguage', 'settings.save', '$timeout',
	function($scope, data, userLanguage, changeLanguage, save, $timeout) {
		var originalForm, originalFormData;
		$scope.reset = function(data) {
			if(data) originalForm = data;
			$scope.form = angular.copy(originalForm);
			$scope.$broadcast('settings.reset');
			$scope.saveState = '';
		};
		$scope.reset(data);

		$scope.save = function() {
			save($scope.getFormData())
			.then(function(data) {
				$scope.reset(data);
				$timeout(function() {
					originalFormData = $scope.getFormData();
				});
				$scope.showSaveState('success');
			}, function() {
				$scope.showSaveState('error');
			});
		};

		$scope.isFormSame = function() {
			return angular.equals($scope.form, originalForm);
		};

		$scope.isFormDataSame = function() {
			if($scope.getFormData) {
				var formData = $scope.getFormData();
				originalFormData = $.extend({}, formData, originalFormData); // Extend because originalFormData may not be complete with all the inputs
				return angular.equals(formData, originalFormData);
			}
		};

		$scope.language = userLanguage.get(data.languages);
		$scope.changeLanguage = function() {
			changeLanguage($scope.language);
		};

		$scope.showSaveState = function(state) {
			$scope.saveState = state;
			$timeout(function() {
				$scope.saveState = '';
			}, 3000);
		}
	}
])
.controller('settings.passwordController', ['$scope', 'password.verifyPassword', 'util.simpleHash',
	function($scope, verifyPassword, hash) {
		$scope.change = function() {
			var verification = verifyPassword(
				$scope.oldPassword,
				$scope.newPassword,
				$scope.verifyPassword,
				$scope.form.id
			);

			$scope.form.pwd = verification.password;
			$scope.verification = verification;

			if(!$scope.newPassword) $scope.verifyPassword = '';

			var dirty = $scope.oldPassword || $scope.newPassword;
			$scope.showChecks = dirty;
			$scope.form.passwordFields = dirty ? true : undefined; //So that the system will know whether or not the form can reset
		};
		$scope.$on('settings.reset', function() {
			$scope.oldPassword = $scope.newPassword = '';
			$scope.change();
		})
	}
])
.controller('settings.deviceController', ['$scope', 'sendRequest', 'alert',
	function($scope, sendRequest, alert) {
		$scope.toggleDelete = function() {
			$scope.phone.delete = !$scope.phone.delete;
		};
		$scope.test = function() {
			sendRequest('SrvUser.testSend', $scope.phone.id).then(function(success) {
				if(success) alert('Test send was successful!');
				else alert('Test send failed!');
			});
		}
	}
]);