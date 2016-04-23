'use strict';

jr.include('css/overview-production.css');
jr.include('css/production.css');

angular.module('production', ['j$', 'myfarm', 'robotState'])
.filter('trend', function() {
	function addThousandSeperatorSpaces(n){
	    var rx=  /(\d+)(\d{3})/;
	    return String(n).replace(/^\d+/, function(w){
	        while(rx.test(w)){
	            w = w.replace(rx, '$1 $2');
	        }
	        return w;
	    });
	}

	return function(value, includeSign) {
		var sign = Math.sign(value);
		if (Math.abs(value) < 100) {
			value = Math.round(value * 10) / 10;
		} else {
			value = Math.round(value);
			value = addThousandSeperatorSpaces(Math.abs(value));
			if (sign == -1) {
				value = '-' + value;
			}
		}
		return (includeSign && sign == 1 ? '+' : '')  + value;
	};


})
.factory('production.extractData', ['myfarm.cacheByFarm', 'cowq.getText', 'extractAlarms', 'alarms.extractData', 'setRobotHasAlarm',
	function(cacheByFarm, getText, extractAlarms, extractAlarmData, setHasAlarm) {
		function trend(now,before){
			var v=before>0?(now-before)/before*100:now>0?1:now===0?0:-1;
			return v>1?1:v<-1?-1:0;
		}
		return cacheByFarm('production.extractData', function(data) {
			if(data == 'No farm') { return; }

			var out=[];
			var milkData=data.sevenDays;
			var textGroup=getText('group');
			if(milkData.jsRobots)
				milkData.jsRobots.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
			else
				milkData.jsRobots=[];
			if(milkData.jsGroups){
				milkData.jsGroups.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
				milkData.jsGroups.forEach(function(g){g.name=textGroup+' '+g.name;});
			}
			else
				milkData.jsGroups=[];
			out.push(milkData.jsVcMilkData);
			if(milkData.jsRobots.length>1) {
				milkData.jsRobots.forEach(function(d){d.isRobot=1;out.push(d);});
			} else if(milkData.jsRobots.length===1) {
				milkData.jsRobots[0].isRobot=1;
			}

			if(milkData.jsGroups.length>1) {
				milkData.jsGroups.forEach(function(d){d.isGroup=1;out.push(d);});
			}
			if (out && out[0]) {
				out.forEach(function(d){
					d.animalLast24h =		d.perAnimalLast24h;
					d.animalLastLast24h =	d.perAnimalLastLast24h;
					d.animalLastSeven =		d.perAnimalLastSeven;
					d.animalLastLastSeven =	d.perAnimalLastLastSeven;

					d.trend24h =			trend(d.last24h, d.lastLast24h);
					d.trend7d =				trend(d.lastSeven, d.lastLastSeven);
					d.trendAnimal24h =		trend(d.animalLast24h, d.animalLastLast24h);
					d.trendAnimal7d =		trend(d.animalLastSeven, d.animalLastLastSeven);
				});
				out.robotData=milkData.jsRobots;

				var alarms = extractAlarms(extractAlarmData(data));

				out.robotData.forEach(setHasAlarm.bind(null, alarms));

				out.robotData.forEach(function(robot) {
					robot.cowName = ['Åsa Bäst', 'Rosa kosa', 'Jöran Ko'][Math.floor(Math.random()*3)];
					robot.action = 1;
					robot.note = 'Här finns det plats för fritext';
				});
			}

			return out;
		});
	}
])
.directive('trendArrow', ['drawSprite', function(drawSprite) {
	return {
		restrict: 'E',
		replace: true,
		template: '<img class="trend-arrow">',
		link: function(scope, element, attr) {
			scope.$watch(attr.trend, function(trend) {
				var x = trend < 0 ? 76 : trend > 0 ? 0 : 38,
					y = 483 + (trend < 0 ? 0 : trend > 0 ? 76 : 38);
				drawSprite(element, x, y, 38, 38, 0, 0, 38, 38);
			});
		}
	};
}])
.controller('productionController', ['$scope', 'data',
	function($scope, data) {
		$scope.data = data;
		$scope.selected = data[0];
	}
])
.controller('overviewProductionController', ['$scope', 'myfarm', 'production.extractData',
	function($scope, myfarm, extractData) {
		myfarm.data.then(extractData).then(function(data) {
			$scope.selected = data[0];
		});
	}
]);