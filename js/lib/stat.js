'use strict';

angular.module('stat', [])
.factory('sum', [function() {
	return function(data, get) {
		return data.reduce(function(prev, curr) {
			return prev + get(curr);
		}, 0);
	}
}]);