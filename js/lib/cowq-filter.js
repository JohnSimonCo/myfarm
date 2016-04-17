'use strict';

angular.module('cowqFilter', ['util'])
.factory('getUserSort', ['storage', function(storage) {
	return function(profileName, profile) {
		return (storage.get('sort') || {})[profileName] || {
			profileIndex: profile.profileIndex[0],
			reverse: false
		};
	}
}])
.factory('setUserSort', ['storage', function(storage) {
	return function(profileName, sort) {
		var userSort = storage.get('sort') || {};
		userSort[profileName] = sort;
		storage.set('sort', userSort);
	}
}])
.factory('getUserGroup', ['storage', function(storage) {
	return function(id) {
		return (storage.get('group') || {})[id] || null;
	}
}])
.factory('setUserGroup', ['storage', function(storage) {
	return function(id, group) {
		var userGroup = storage.get('group') || {};
		userGroup[id] = group;
		storage.set('group', userGroup);
	}
}]);