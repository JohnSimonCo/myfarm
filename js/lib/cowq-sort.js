'use strict';

angular.module('cowqSort', ['util'])
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
}]);