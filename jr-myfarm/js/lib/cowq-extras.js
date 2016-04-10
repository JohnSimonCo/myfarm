'use strict';

angular.module('cowqExtras', ['util'])
.factory('getUserSort', ['storage', function(storage) {
	return function(profileName, profile) {
		return (storage.get('cowq.sort') || {})[profileName] || {
			profileIndex: profile.profileIndex[0],
			reverse: false
		};
	}
}])
.factory('setUserSort', ['storage', function(storage) {
	return function(profileName, sort) {
		var userSort = storage.get('cowq.sort') || {};
		userSort[profileName] = sort;
		storage.set('cowq.sort', userSort);
	}
}])
.factory('getUserGroup', ['storage', function(storage) {
	return function(id) {
		return (storage.get('cowq.group') || {})[id] || null;
	}
}])
.factory('setUserGroup', ['storage', function(storage) {
	return function(id, group) {
		var userGroup = storage.get('cowq.group') || {};
		userGroup[id] = group;
		storage.set('cowq.group', userGroup);
	}
}])
.factory('getUserProfileName', ['storage', function(storage) {
	return function(profiles) {
		var userProfileName = storage.get('cowq.profile');
		if (profiles.profiles[userProfileName])
			return userProfileName;
		for (var name in profiles.profiles) {
			var p = profiles.profiles[name], milkingQueue = [1,2,16,6,8,20,11], i = -1;
			while(++i < p.profileIndex.length && p.profileIndex[i]===milkingQueue[i]){}
			if (i === p.profileIndex.length)
				return name;
		}
		return  Object.keys(profiles.profiles)[0];
	}
}])
.factory('setUserProfileName', ['storage', function(storage) {
	return function(name) {
		storage.set('cowq.profile', name);
	}
}])
.factory('deSerializeProfiles', ['util.convertToArray', '$filter', function(convertToArray, $filter) {
	var sort = $filter('orderBy');

	return function(data) {
		var profiles = $.extend({}, data.deLaval.profiles);
		if(data.myProfile) $.extend(profiles, data.myProfile.profiles);
        for(var p in profiles){
            var pp = p.split('\n');
            if(pp.length > 1){
                var pd = profiles[p];
                profiles[pp[0]] = pd;
                delete profiles[p];
                pd.commonName = pp[1];
            }
        }

		var sortedProfiles = sort(convertToArray(profiles), 'key');

		return {
			fieldNames: data.fieldNames,
			profiles: profiles,
			sortedProfiles: sortedProfiles
		}
	}
}])
.factory('getUserCollapsed', ['storage', function(storage) {
	return function(id) {
		return (storage.get('cowq.collapsed') || {})[id] || false;
	}
}])
.factory('setUserCollapsed', ['storage', function(storage) {
	return function(id, collapsed) {
		var userCollapsed = storage.get('cowq.collapsed') || {};
		userCollapsed[id] = collapsed;
		storage.set('cowq.collapsed', userCollapsed);
	}
}]);