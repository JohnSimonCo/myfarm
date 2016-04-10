'use strict';

jr.include('css/overview.css');

angular.module('overview', ['j$', 'myfarm', 'overviewCowq', 'overviewChat', 'overviewAlarms', 'production'])
.controller('overviewController', ['$scope', 'util.getTime', '$timeout', 'updateInterval',
	function($scope, getTime, $timeout, updateInterval) {
		function updateTime() {
			$scope.time = getTime();
			$timeout(updateTime, updateInterval);
		}

		updateTime();
	}
]);