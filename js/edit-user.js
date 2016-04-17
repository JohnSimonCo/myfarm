'use strict';

jr.include('css/edit-user.css');
jr.include('css/verset.css');

angular.module('editUser', ['server', 'translate', 'util', 'users', 'modal', 'extract'])
.factory('editUser.newUserId', ['sendRequest', function(sendRequest) {
	return function() {
		return sendRequest('Users.newUserId');
	}
}])
.factory('editUser.deSerialize', ['$q', 'editUser.newUserId', 'util.getItem', '$location', '$ngSilentLocation', function($q, getNewUserId, getItem, $location, $ngSilentLocation) {
	return function(data, userId) {
		if(!data) { return $q.reject(); }

		function accessible(myPermissions, rolePermissions) {
			return (myPermissions | rolePermissions) === myPermissions;
		}

		var add, userPromise;

		if(userId) {
			var user = getItem(data.users, function(user) {
				return user.id === userId;
			});
			if(user) {
				//Resolve instantly with user
				var defer = $q.defer();
				userPromise = defer.promise;
				defer.resolve({
					id: user.id,
					status: user.status,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					roles: getItem(user.roles, function(role) {
						return role.domainId == data.target;
					}).roles
				});
			} else {
				$ngSilentLocation.silent('/user/new', true);
				// $location.path('/user/add').replace();
			}
		}
		add = !user;

		if(add) {
			userPromise = getNewUserId().then(function(id) {
				return {
					id: id,
					status: 0,
					firstName: '',
					lastName: '',
					email: '',
					roles: []
				}
			});
		}

		return userPromise.then(function(user) {
			return {
				target: data.target,
				add: add,
				user: user,
				roles: $.map(data.allRoles, function(value, key) {
					return value;
				})
				.filter(function(role) {
					//Remove Nothing option when editing
					return add || role.accessRightMask !== 0;
				}).map(function(role) {
					return {
						id: role.id,
						name: role.roleName,
						accessible: accessible(data.perm, role.accessRightMask),
						checked: user.roles.some(function(userRole) {
							return userRole === role.id;
						})
					};
				}).filter(function(role) {
					return role.accessible || role.checked;
				}).sort(function(a, b) {
					//Put non-accessible roles last
					if(a.accessible && !b.accessible) { return -1; }

					return a.name.localeCompare(b.name);
				})
			};
		})
		
	};
}])
.factory('editUser.data', ['sendRequest', 'editUser.deSerialize', function(sendRequest, deSerialize) {
	return function(id, userId) {
		return sendRequest('Users.getUsersAtVc', id).then(function(data) {
			return deSerialize(data, userId);
		});
	};
}])
.factory('editUser.requestNewPassword', ['sendRequest', function(sendRequest) {
	return function(targetId, userId) {
		return sendRequest('Users.newPassword', {target: targetId, user: userId});
	}
}])
.factory('editUser.saveUser', ['sendRequest', function(sendRequest) {
	return function(user) {
		return sendRequest('Users.saveUser', user);
	}
}])
.controller('editUserController', ['data', '$scope', 'translate', 'confirm', 'alert', 'editUser.requestNewPassword', '$window', 'editUser.saveUser', 'scrollTo',
	function(data, $scope, translate, confirm, alert, requestNewPassword, $window, saveUser, scrollTo) {
		$scope.add = data.add;
		$scope.roles = data.roles;
		$scope.data = data;

		scrollTo.set('scrollToUserId', data.user.id);

		$scope.reset = function() {
			$scope.user = angular.copy(data.user);
			$scope.roles = angular.copy(data.roles);
		}

		$scope.isFormSame = function() {
			return angular.equals($scope.user, data.user);
		}

		$scope.isFormValid = function() {
			return $scope.user.roles.length > 0;
		}

		$scope.requestNewPassword = function() {
			var title = translate('Are you sure you want to send a new automatically generated password to user by e-mail?');
			confirm(title).then(requestNewPassword.bind(null, data.target, data.user.id)).then(function(data) {
				if(data) {
					if(data == 'true') {
						alert(translate('E-mail with new password is sent!'));
					} else {
						alert(translate('Got problem sending e-mail with new password!'));
					}
				} else {
					alert(translate('Got problem creating new password!'));
				}
			});
		};
		
		$scope.submit = function() {
			saveUser($scope.getFormData()).then(function() {
				$window.history.back();
			});
		};

		function extractRoles() {
			return $scope.roles.filter(function(role) {
				return role.checked;
			})
			.map(function(role) {
				return role.id;
			});
		}

		$scope.extractRoles = function() {
			$scope.user.roles = extractRoles();
		};

		data.user.roles = extractRoles();
		$scope.reset();
	}
]);

// USERS
// Inte kunna ta bort användare med fler rättigheter än vad jag har
// dvs om (min | hans !== min)

// Ha rätt user markerad


// ADD/EDIT USER
// edit:

// add: