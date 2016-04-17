'use strict';

jr.include('css/users.css');
jr.include('css/verset.css');

angular.module('users', ['server', 'modal', 'translate', 'util'])
.factory('users.deSerialize', ['$q', 'translate', 'util.getItem', function($q, translate, getItem) {
	return function(data) {
		if(!data) { return $q.reject(); }

		var statuses = [
			translate('New user'),
			null, null,
			translate('Active'),
			translate('Inactive'),
			null
		];

		var activeStatus = 3;

		return {
			users: data.users.map(function(user) {
				return {
					id: user.id,
					fullName: (user.firstName + ' ' + user.lastName).trim(),
					email: user.email,
					lastAccessed: user.lastAccessed,
					status: statuses[user.status],
					active: user.status === activeStatus,
					roles: getItem(user.roles, function(role) {
						return role.domainId == data.target;
					}).roles.map(function(role) {
						return data.allRoles[role].roleName;
					}).sort(function(a, b) {
						return a.localeCompare(b);
					}),
				}
			}).sort(function(a, b) {
				//Penalize non active users so that they will appear last
				//If a.active and b.active are different
				if(a.active ^ b.active) {
					return a.active ? -1 : 1;
				}

				return a.fullName.localeCompare(b.fullName);
			})
		};
	};
}])
.factory('users.data', ['sendRequest', 'users.deSerialize', function(sendRequest, deSerialize) {
	return function(id) {
		return sendRequest('Users.getUsersAtVc', id).then(deSerialize);
	};
}])
.factory('users.deleteUser', ['myfarm', 'sendRequest', 'users.deSerialize', function(myfarm, sendRequest, deSerialize) {
	return function(user) {
		return sendRequest('Users.delete', [myfarm.id, user.id].join(',')).then(deSerialize);
	};
}])
.controller('usersController', ['data', '$scope', 'translate', 'confirm', 'users.deleteUser', 'scrollTo', function(data, $scope, translate, confirm, deleteUser, scrollTo) {

	exposeData(data);

	$scope.scrollToUserId = scrollTo.get('scrollToUserId');

	$scope.deleteUser = function(user) {
		var title = translate('Are you sure you want to delete user: ') + '\n' + user.fullName;
		confirm(title).then(deleteUser.bind(null, user)).then(exposeData);
	};

	function exposeData(data) {
		$scope.users = data.users;
	}
}]);