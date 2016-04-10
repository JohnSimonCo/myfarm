'use strict';

angular.module('cowExtras', ['j$'])
.factory('getUserViewIndex', ['storage', function(storage) {
	return function(id) {
		//0 default value
		return (storage.get('cow.view') || {})[id] || 0;
	}
}])
.factory('setUserViewIndex', ['storage', function(storage) {
	return function(id, view) {
		var userView = storage.get('cow.view') || {};
		userView[id] = view;
		storage.set('cow.view', userView);
	}
}])
.factory('cow.getUserCollapsed', ['storage', function(storage) {
	return function(id) {
		return (storage.get('cow.collapsed') || {})[id] || false;
	}
}])
.factory('cow.setUserCollapsed', ['storage', function(storage) {
	return function(id, collapsed) {
		var userCollapsed = storage.get('cow.collapsed') || {};
		userCollapsed[id] = collapsed;
		storage.set('cow.collapsed', userCollapsed);
	}
}])
.factory('cow.getUserSort', ['storage', function(storage) {
	return function() {
		return storage.get('cow.sort') || {
			sortCol: 0,
			reverse: false
		};
	}
}])
.factory('cow.setUserSort', ['storage', function(storage) {
	return function(sort) {
		storage.set('cow.sort', sort);
	}
}]);