'use strict';

jr.include('css/farms.css');

angular.module('farms', ['j$', 'server', 'translate'])
.factory('farms.deSerialize', ['analyzeCleanings', 'hr2', 'getFarmStyle',
	function(analyzeCleanings, hr2, getFarmStyle) {
		return function(data) {

			var farms = data.farms;
			for(var i = 0, l = farms.length; i < l; i++) {
				var farm = farms[i];

				if (farm.status < 3) {
					farm.name = (farms.length>1?(farm.vcPreName.length?(farm.vcPreName.length>3?farm.vcPreName.substring(0,3):farm.vcPreName)+'.':''):'')+farm.vcName;

					farm.state = farm.offLineTimeSec == null || farm.offLineTimeSec > 120 ? 1 : 0;
					farm.nrCows = farm.nrCows ? parseInt(farm.nrCows) : 0;
					farm.nrRedCows = farm.nrRedCows ? parseInt(farm.nrRedCows) : 0;
					farm.nrYellowCows = farm.nrYellowCows ? parseInt(farm.nrYellowCows) : 0;
					farm.nrWhiteCows = farm.nrWhiteCows ? parseInt(farm.nrWhiteCows) : 0;
					farm.vcVersion = farm.vcVersion ? farm.vcVersion.substr(7) : 0;
					farm.milkingCows = farm.nrRedCows
						? farm.nrRedCows + farm.nrYellowCows + farm.nrWhiteCows
						: 0;
					farm.cleaning = farm.nrCleaingsLast24 && analyzeCleanings(farm.nrCleaingsLast24);
					farm.active = farm.status==1;

					farm.lastCallText = farm.offLineTimeSec == null
						? '' : hr2(farm.offLineTimeSec);

					if(farm.nrCleaingsLast24) {
						farm.nrCleaingsLast24.sort(function(o1, o2) {
							return o1.vmsName.localeCompare(o2.vmsName);
						});
					}

					if(farm.nrFatalAlarms + farm.nrUserNotAlarms > 0) {
						farm.alarms = farm.nrFatalAlarms > 0 && farm.nrUserNotAlarms > 0
							? farm.nrFatalAlarms + '+' + farm.nrUserNotAlarms
							: farm.nrFatalAlarms + farm.nrUserNotAlarms;
					}

					farm.cleaningStyle = farm.cleaning == 2 ? 'styleYellow'
									   : farm.cleaning <= 1 ? 'styleRed'
									   : '';

					farm.alarmStyle = farm.nrFatalAlarms    > 0 ? 'styleRed'
									 : farm.nrUserNotAlarms > 0 ? 'styleLightBlue'
									 : '';						   
				} else {
					farm.name = farm.ipAddress;
				}
				farm.style = getFarmStyle(farm);
			}

			return data;
		}
	}
])
.factory('farms.data', ['sendRequest', 'farms.deSerialize', '$q',
	function(sendRequest, deSerialize, $q) {
		return function() {
			return sendRequest('FarmAdmin.getFarmsOnline').then(function(data) {
				if(!data) return $q.reject();
				else return deSerialize(data);
			});
		};
	}
])
.factory('analyzeCleanings', [function() {
	return function(cleanings) {
		return cleanings.reduce(function(prev, curr) {
			return curr.latest24Count < prev || prev === null ? curr.latest24Count : prev;
		}, null);
	};
}])
.factory('getFarmStyle', [function() {
	return function(farm) {
		var style;
		//Copied from old myfarm
		if(new Date(farm.offlineUntil) > new Date()) {
			// should be offline
			style = 'styleGrey';
		} else {
			if(farm.state === 1) {
				// has been offline for more then 2 minutes
				style = 'styleOrange';
			}
			if(farm.status!==1) {
				// not activated
				style = 'styleLightBlue';
			}
			if (farm.status===3) {
				style = farm.vcGUID!==null && farm.vcGUID.length === 0 ? 'styleRed' : 'styleYellow';
			}
			else if(!farm.hasLicense) {
				style = 'styleRed';
			}
		}
		return style;
	}
}])
.filter('sortFarms', [function() {
	return function(farms, sortCol, sortDir) {
		return farms.slice().sort(function(o1, o2) {
			if(sortCol===1){
				if(o2.state===o1.state&&o1.offLineTimeSec!=null&&o2.offLineTimeSec!=null)
					return sortDir*(o2.offLineTimeSec-o1.offLineTimeSec);
				else if((o1.state<3)^(o2.state<3))
					return o1.state<3 ? -1 : 1;
				else if ((o1.offLineTimeSec!=null)^(o2.offLineTimeSec!=null))
					return o1.offLineTimeSec!=null ? -1 : 1;
				else
					return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
			}
			if(o1.state<3&&o2.state<3) {
				switch(sortCol){
					case  0:return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
					case  2:return o1.state===o2.state?sortDir*(o2.nrCows-o1.nrCows):o2.state?-1000:1000;
					case  3:return o1.state===o2.state?sortDir*(o2.nrRedCows-o1.nrRedCows):o2.state?-1000:1000;
					case  4:return o1.state===o2.state?sortDir*(o2.nrYellowCows-o1.nrYellowCows):o2.state?-1000:1000;
					case  5:return o1.state===o2.state?sortDir*(o2.nrWhiteCows-o1.nrWhiteCows):o2.state?-1000:1000;
					case  6:return o1.state===o2.state?sortDir*(o2.nrRedCows/o2.milkingCows-o1.nrRedCows/o1.milkingCows):o2.state?-1000:1000;
					case  7:return sortDir*(o1.nrFatalAlarms===o2.nrFatalAlarms?(o1.nrUserNotAlarms===o2.nrUserNotAlarms?o1.vcName.toLowerCase().localeCompare(o2.vcName.toLowerCase()):o2.nrUserNotAlarms-o1.nrUserNotAlarms):o2.nrFatalAlarms-o1.nrFatalAlarms);
					case  8:return sortDir*(o1.cleaning-o2.cleaning);
					case  9:return sortDir*(o1.vcVersion&&o2.vcVersion?(o2.vcVersion.localeCompare(o1.vcVersion)>0?1:-1):o1.vcVersion?-1000:1000);
					case 10:return sortDir*(o2.nrCharReceived-o1.nrCharReceived);
					case 11:return sortDir*(o2.nrRobotNotAuto===o1.nrRobotNotAuto?o2.nrCows-o1.nrCows:o2.nrRobotNotAuto-o1.nrRobotNotAuto);
				}
				return sortDir*(o1.state===2||o2.state===2?o1.state-o2.state:o1.state-o2.state);
			}
			else if (o1.status===3&&o2.status===3)
				if (sortCol === 0)
					return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
				else if (sortCol === 8){
					var v1=o1.ipGeo&&o1.ipGeo.country?o1.ipGeo.country:'',v2=o2.ipGeo&&o2.ipGeo.country?o2.ipGeo.country:'';
					return sortDir*(v1.toLowerCase().localeCompare(v2.toLowerCase()));
				}
				else
					return sortDir*(o1.ipAddress.localeCompare(o2.ipAddress));
			else
				return o1.status===3 ? 1 : -1;
		});
	};
}])
.factory('hr2', ['translate', function(translate) {
	var labNow = translate('-Now-');

	//Copied from old myfarm
	function n0(n) {
		return n < 10 ? '0' + n : n;
	}

	function n3(n) {
		return n < 100 ? '0' + n0(n) : n;
	}

	function nt(n) {
		return n0(Math.floor(n / 60)) + ':' + n0(Math.floor(n % 60));
	}

	return function hr2(n) {
		if (n < 120) return !n ? labNow : (n < 60 ? n : '1m ' + ((n - 60) + 's'));
		var t = Math.floor(n / 60);
		return t > 1440 ? t > 7200 ? "" : (Math.floor(t / 1440) + 'd ' + nt(Math.floor(t) % 1440)) : nt(t);
	}
}])
.directive('percentGraph', ['util.format', function(createFormat) {
	return {
		restrict: 'E',
		scope: {farm: '='},
		template: '<div class="percent-graph"></div>',
		replace: true,
		link: function(scope, element, attr) {
			scope.$watch('farm', function(farm) {
				element.empty();

				if(farm.nrCows === 0) return;

				var red = farm.nrRedCows / farm.nrCows,
					yellow = farm.nrYellowCows / farm.nrCows,
					white = farm.nrWhiteCows / farm.nrCows,
					green = 1 - red - yellow - white; // The rest

				[
					{
						percent: red,
						color: 'red'
					},
					{
						percent: yellow,
						color: 'yellow'
					},
					{
						percent: white,
						color: 'white'
					},
					{
						percent: green,
						color: 'green'	
					}
				].forEach(function(fill, index, array) {
					if(fill.percent > 0) {
						$('<div>')
							.css('background', fill.color)
							.width((fill.percent * 100) + '%')
							.appendTo(element);
						}
				});
			});
		}
	};
}])
.directive('hoverDisplay', function() {
	return {
		restrict: 'A',
		controller: ['$element', '$timeout', '$window', function($element, $timeout, $window) {
			var $display = $element.find('.hover-display'),
				display = $display[0],
				width, height;

			var visible = false;

			var yMargin = 20;
			$element.mousemove(function(e) {
				if(visible) {
					var x = Math.min(Math.max(e.pageX - width / 2, 0), $window.innerWidth - width),
						y = e.pageY - 60;

					x -= Math.max(($window.innerWidth - 800) / 2, 0);
					x = Math.max(x, 10);

					if(y + yMargin + height < $window.innerHeight) {
						y += yMargin;
					} else {
						y -= height + yMargin;
					}

					display.style.left = x + 'px';
					display.style.top = y + 'px';
				}
			});

			this.display = function(element) {
				visible = true;

				$display.append(element);
				$display.show();
				
				$timeout(function() {
					width = $display.outerWidth();
					height = $display.outerHeight();
				});
			};
			this.hide = function() {
				visible = false;

				$display.hide();
				$display.empty();
			};
		}],
		compile: function(tElement, tAttrs) {
			$('<div>').addClass('hover-display').hide().appendTo(tElement);
		}
	};
})
.directive('hoverTarget', ['$compile', function($compile) {
	return {
		restrict: 'AC',
		scope: {},
		controller: ['$scope', function($scope) {
			this.setTemplate = function(template) {
				$scope.createElement = $compile(template);
			}
		}],
		require: '^hoverDisplay',
		link: function(scope, element, attr, hoverDisplay) {
			element.hover(function() {
				scope.$apply(function() {
					hoverDisplay.display(scope.createElement(scope.$parent));
				}); 
			}, function() {
				hoverDisplay.hide();
			});
		}
	};
}])
.directive('hoverTemplate', [function() {
	return {
		restrict: 'E',
		priority: 1001, //Higher than ng-repeat
		terminal: true,
		require: '^hoverTarget',
		link: function(scope, element, attr, hoverTarget) {
			hoverTarget.setTemplate(element.contents());
		}
	};
}])
.controller('farmsController', ['$scope', 'data', 'farms.data',
	function($scope, data, getData) {
		$scope.data = data;
		$scope.farms = data.farms;

		$scope.sortCol = 0;
		$scope.sortDir = 1;

		$scope.setSortCol = function(col) {
			if($scope.sortCol === col) {
				$scope.sortDir = -$scope.sortDir;
			} else {
				$scope.sortCol = col;
				$scope.sortDir = 1;
			}
		};

		$scope.refresh = function(event) {
			event.stopPropagation();
			getData().then(function(data) {
				$scope.data = data;
				$scope.farms = data.farms;
			});
		}
	}

]);