'use strict';

angular.module('cowqProfile', ['util'])
.factory('getUserProfileName', ['storage', function(storage) {
	return function(profiles) {
		return storage.get('profile') || Object.keys(profiles.profiles)[0];
	}
}])
.factory('setUserProfileName', ['storage', function(storage) {
	return function(name) {
		storage.set('profile', name);
	}
}])
.factory('deSerializeProfiles', ['util.convertToArray', '$filter', function(convertToArray, $filter) {
	var sort = $filter('orderBy');

	return function(data) {
		var profiles = $.extend({}, data.deLaval.profiles);
		if(data.myProfile) $.extend(profiles, data.myProfile.profiles);

		var sortedProfiles = (data.myProfile ? sort(convertToArray(data.myProfile.profiles), 'key') : [])
			.concat(sort(convertToArray(data.deLaval.profiles), 'key'));

		return {
			fieldNames: data.fieldNames,
			profiles: profiles,
			sortedProfiles: sortedProfiles
		}
	}
}]);