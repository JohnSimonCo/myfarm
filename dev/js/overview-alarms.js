'use strict';

jr.include('css/overview-alarms.css');
angular.module('overviewAlarms', ['alarms'])
.controller('overview.alarmsController', ['$scope', 'myfarm', 'alarms.extractData',
	function($scope, myfarm, extractData, getType) {
		myfarm.data.then(extractData).then(function(data) {
			$scope.data = data;
		});

		$scope.$on('alarms.update', function(event, data) {
			$scope.$apply(function() {
				$scope.data = data;
			});
		});
	}
]);