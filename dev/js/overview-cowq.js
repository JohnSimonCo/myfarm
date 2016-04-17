'use strict';

jr.include('css/overview-cowq.css');
angular.module('overviewCowq', ['cowq', 'stat'])
.factory('getCowColorCode', [function() {
	var map = {
		'red': '#ff3200',
		'yellow': '#f7b320',
		'white': '#ffffff',
		'green': '#85b430',
	}

	return function(cowColor) {
		return map[cowColor];
	}
}])
.factory('getCowColor', ['getCowClass', function(getCowClass) {
	return function(cow, time) {
		switch(getCowClass(cow, time)) {
			case 'overdue':
				return 'red';
			case 'nevermilked': //Fall through
			case 'permission':
				return 'yellow'
			case 'nopermission':
				return 'white';
			case 'passthrough': //Fall through
			case 'feedonly':
				return 'green';
		}	

	}
}])
.constant('cowDataColorPriority', [
	'red',
	'yellow',
	'white',
	'green'
])
.factory('overview-cowq.extractCowData', ['getCowColor', 'getCowColorCode', 'cowDataColorPriority',
	function(getColor, getColorCode, priority) {

		return function(cows, time) {
			var cowData = {
				cowGroups: {},
				totalNumberOfCows: cows.length
			};

			//Fill cowData with the possible colors
			priority.forEach(function(color) {
				cowData.cowGroups[color] = {
					colorCode: getColorCode(color),
					color: color,
					amount: 0
				}
			});

			//Count the amount of cows with each color
			cows.forEach(function(cow) {
				cowData.cowGroups[getColor(cow, time)].amount++;
			});


			//Convert to array filled with values via map
			cowData.cowGroups = $.map(cowData.cowGroups, function(value) {
				return value;
			})
			//Sort according to priority order
			.sort(function(o1, o2) {
				return priority.indexOf(o1.color) - priority.indexOf(o2.color);
			});

			return cowData;
		}
	}
])
.controller('overview.cowqController', ['$scope', 'myfarm', 'cowq.extractData', 'overview-cowq.extractCowData',
	function($scope, myfarm, extractData, extractCowData) {
		myfarm.data.then(extractData).then(function(data) {
			$scope.data = data;

			$scope.$watchGroup(['data', 'time'], function(values) {
				if(values[0] && values[1]) {
					updateCowData();
				}
			});

			$scope.$on('cowq.update', function(event, data) {
				$scope.$apply(function() {
					$scope.data = data;
					updateCowData();
				});
			});

			function updateCowData() {
				var newCowData = extractCowData($scope.data.cows, $scope.time);

				if(!$scope.cowData || $scope.cowData && !angular.equals(newCowData, $scope.cowData)) {
					$scope.cowData = newCowData;
				}
			}
		});
	}
])
.directive('circularGraph', ['sum', function(sum) {
	var TAU = Math.PI * 2;
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<canvas class="circular-graph" ng-transclude></canvas>',
		link: function(scope, element, attr) {
			var canvas = element[0],
				centerX = canvas.width / 2,
				centerY = canvas.height / 2,
				radius = Math.min(centerX, centerY),
				lineWidth = radius / 3,
				shadowBlur = 5,
				ctx = canvas.getContext('2d');

			radius -= lineWidth / 2 + shadowBlur / 2;

			scope.$watch(attr.graphData, function(data) {
				if(!data) return;

				ctx.clearRect(0, 0, canvas.width, canvas.height);

				var total = sum(data, function(item) {
					return item.amount;
				});

				ctx.lineWidth = lineWidth;

				ctx.shadowBlur = shadowBlur;

				ctx.shadowOffsetX = 1;
				ctx.shadowOffsetY = 1;
				ctx.shadowColor = "#000";
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(255,255,255,0.5)';
				ctx.arc(centerX, centerY, radius, 0, TAU);
				ctx.stroke();

				ctx.shadowBlur = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

				var currentAngle = -TAU / 4, startAngle;
				data.forEach(function(item) {
					startAngle = currentAngle;
					currentAngle += item.amount / total * TAU;

					ctx.beginPath();
					ctx.strokeStyle = item.colorCode;
					ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
					ctx.stroke();
				});
			});
		}
	};
}])
.directive('cowqOverview', [function() {
	return {
		restrict: 'E',
		scope: {
			data: '='
		},
		templateUrl: 'directives/cowq-overview.html',
		replace: true
	};
}])
.directive('sizeCircularGraph', [function() {
	return {
		restrict: 'A',
		compile: function($element, attr) {
			//Not the best solution, but it works fine
			var $container = $('#container')
			var size = Math.max($container.width() / 2, $container.height() / 2);

			var element = $element[0];
			element.width = size;
			element.height = size;
		}
	};
}]);