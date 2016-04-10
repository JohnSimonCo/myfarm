'use strict';

jr.include('css/cowq.css');
jr.include('css/cow.css');

angular.module('cow', ['myfarm', 'cowq', 'cowExtras', 'server', 'jrGraph', 'modal', 'milkdata', 'farms'])
.factory('cowqSnapshot', ['cowq.selectCows', 'cowq.sort', 'getUserProfileName', 'getUserSort', 'getUserGroup',
	function(selectCows, sortCows, getUserProfileName, getUserSort, getUserGroup) {
		return function(data, id, time) {
			var profileName = getUserProfileName(data.profiles),
				profile = data.profiles.profiles[profileName],
				group = getUserGroup(id),
				sort = getUserSort(profileName, profile),
				cows;

			cows = selectCows(data, profile, time, null, group);
			return sortCows(cows, data.areas, time, sort, data.codeSets);
		};
	}
])
.factory('cow.extractData', ['util.getTime', 'cowqSnapshot', 'util.findIndex', 'util.getItem',
	function(getTime, getSnapshot, findIndex, getItem) {
		return function(data, id, nr) {
			var	time = getTime(); 
			var cows = getSnapshot(data, id, time);
			var index = findIndex(cows, function(test) {
				return test.nr === nr;
			});
			var cow = cows[index];

			if(index === cows.length) { //If not in array
				//Add as first index from data.cows
				index = 0;
				cow = getItem(data.cows, function(test) {
					return test.nr === nr;
				});
				if(cow) cows.splice(index, 0, cow);
				else cow = cows[index]; //If cow has been deleted in update, take the first cow in cows
			}

			return {
				id: id,
				nr: nr,
				time: time,
				data: data,
				
				cows: cows,
				cow: cow,
				index: index
			};
		};
	}
])
.directive('infoNotification', ['$parse', 'cowq.renderCell', 'cowq.getText', function($parse, renderCell, getText) {
	return {
		restrict: 'E',
		template: '<div class="cow-cell"></div>',
		replace: true,
		link: function(scope, element) {
			scope.$watchGroup(['data', 'time', 'cow'], function(values) {
				var text = '';
				if (values[2].notify)
					text = values[2].notify;
				if (values[2].markByUser)
					text += ' ('+ getText('by') + ' ' + values[2].markByUser + ')';
				element.text(text);
			});
		}
	};
}])
.directive('infoCell', ['$parse', 'cowq.renderCell', 'cowq.getText', function($parse, renderCell, getText) {
	return {
		restrict: 'E',
		template: '<div class="cow-cell"></div>',
		replace: true,
		link: function(scope, element, attr) {
			scope.$watchGroup(['data', attr.index, 'time', 'cow'], function(values) {
				if (values[1] === 16) {
					var text = '';
					if (values[3].notify)
						text = values[3].notify + ' ';
					if (values[3].markByUser)
						text += '('+ getText('by') + ' ' + values[3].markByUser + ')';
					element.text(text);
				} else {
					renderCell(values[0], values[1], values[2], values[3], element);
				}
			});
		}
	};
}])
.directive('milkingCell', ['cow.renderCell', function(renderCell) {
	return {
		restrict: 'E',
		template: '<div class="cow-cell"></div>',
		replace: true,
		link: function(scope, element, attr) {
			render();
			scope.$on('j$Repeat.render', render);
			function render() {
				renderCell(scope.data, +attr.index, scope.time, scope.milking, element);
			}
		}
	};
}])
.controller('cowController', ['$scope', 'data', '$location', 'cow.extractData', 'extractCowData', '$timeout', 'util.getTime', 'getCowClass', 'scrollTo', '$ngSilentLocation',
	function($scope, data, $location, extractData, extractCowData, $timeout, getTime, getCowClass, scrollTo, $ngSilentLocation) {
		$.extend($scope, data);
		scrollTo.set('scrollToCowNr', $scope.nr);
		
		$scope.$on('cowq.update', function(event, data) {
			$scope.$apply(function() {
				$scope.data = data;
				$.extend($scope, extractData(data, $scope.id, $scope.nr, $scope.time));
				$scope.updateUrl(); //if cow has changed in update, update URL search
			});
		});

		$scope.updateTime = function() {
			$scope.time = getTime();
			$scope.timeout = $timeout($scope.updateTime, 5000);
		};
		$scope.updateTime();

		$scope.$on('$destroy', function() {
			$timeout.cancel($scope.timeout);
		});
		
		$scope.setCow = function(index) {
			$scope.index = index;
			$scope.cow = $scope.cows[index];
			$scope.nr = $scope.cow.nr;
			$scope.cowData = null;
			$scope.milkingIndex = 0;
			$scope.updateUrl();
			
			scrollTo.set('scrollToCowNr', $scope.nr);
		};
		$scope.setCowData = function(data) {
			$scope.cowData = data;
			// $scope.cowData = extractCowData($scope.cow, data, $scope.data);
		};
		$scope.setAllData = function(data) {
			$scope.allData = data;
		};

		$scope.updateUrl = function() {
			var baseUrl = '/cowq/cow/' + $scope.nr + '/' + $scope.view;
			switch ($scope.view) {
				case 'graph':
					if($scope.milkingIndex != null) {
						$ngSilentLocation.silent(baseUrl + '/' + $scope.milkingIndex, true);
					}
					break;
				case 'info':
					if($scope.infoView) {
						$ngSilentLocation.silent(baseUrl + '/' + $scope.infoView, true);
						break;	
					}
					//else fall through
				default:
					$ngSilentLocation.silent(baseUrl, true);
					break;
			}
		};

		$scope.setView = function(view) {
			$scope.view = view;
			$scope.updateUrl();
		};

		$scope.setInfoView = function(view) {
			$scope.infoView = view;
		};

		$scope.setMilkingIndex = function(milkingIndex) {
			$scope.milkingIndex = milkingIndex;
		}

		$scope.getCowClass = function(cow) {
			return getCowClass(cow, $scope.time);
		};

		$scope.$on('myfarm.farmChanged', function() {
			$location.path('/');
		});
	}
])
.constant('cow.views', ['info', 'milkings', 'graph']) //update to add more views
.controller('cow.windowMessageController', ['$scope', 'cow.views', 'util.findIndex', 'cow.infoViews',
	function($scope, views, findIndex, infoViews) {
		$scope.$on('window.message', function(e, data) {
			console.log('recieved message', data);
			switch (data.method) {
				case 'setCowNumber':
					var cowNumber = data.args[0];
					var index = findIndex($scope.cows, function(cow) {
						return cow.nr == cowNumber;
					});
					//findIndex will return length if not found
					if(index !== $scope.cows.length) {
						$scope.$apply(function() {
							$scope.setCow(index);
						});
					}
					break;
				case 'setCowView':
					var view = data.args[0];

					if(/^info-/.test(view)) {
						var infoView = view.split('-')[1];
						if(infoViews.indexOf(infoView) !== -1) {
							$scope.setInfoView(infoView);
						}
						view = 'info';
					}

					if(views.indexOf(view) !== -1) {
						$scope.$apply(function() {
							$scope.setView(view);
						});
					}
					break;
			}
		});
	}
])
.controller('cow.navigationController', ['$scope', '$routeParams', 'setUserViewIndex', 'cow.views',
	function($scope, $routeParams, setUserViewIndex, views) {

		$scope.navigate = function(direction) {
			if(direction > 0) {
				$scope.setCow($scope.index + 1);
			} else if(direction < 0) {
				$scope.setCow($scope.index - 1);
			}
		};
		$scope.changeView = function() {
			$scope.viewIndex = $scope.nextViewIndex;
			$scope.setView(views[$scope.viewIndex]);
			setUserViewIndex($scope.id, $scope.viewIndex);

			$scope.nextViewIndex = $scope.getNextViewIndex();
			$scope.nextView = views[$scope.nextViewIndex];
		};
		$scope.getNextViewIndex = function() {
			return ($scope.viewIndex + 1) % views.length;
		};

		var viewIndex = views.indexOf($routeParams.view);
		var view = $routeParams.view;
		if(viewIndex === -1) {
			viewIndex = 0;
			view = views[viewIndex];
		}

		$scope.viewIndex = viewIndex;
		$scope.setView(view);
		// $scope.view = view;
		$scope.nextViewIndex = $scope.getNextViewIndex();
		$scope.nextView = views[$scope.nextViewIndex];

		$scope.firstIndex = function() {
			return $scope.index <= 0;
		};
		$scope.lastIndex = function() {
			return $scope.index >= $scope.cows.length - 1;
		};
	}
])
.factory('fetchCow', ['sendRequest', function(sendRequest) {
    return function(vcId, animalNr, isFetch) {
        return sendRequest('SrvAnimal.setFetch', {vcId:vcId, animalNr:animalNr, isFetch:isFetch});
    }
}])
.constant('cow.infoIndices', [11,8,9,12,24,3,5,6,27,10,14,17,22,23,26])
.constant('cow.infoViews', ['notes', 'fields'])
//.constant('cow.infoIndicesExtended', [36,3,5,6,12,8,9,11,24,42,40,31,34,28,32,33,30,39,29,27,10,14,35,38,23,37,41,17,22,26,43,44,45,46,47,48,49])
.constant('cow.infoIndicesExtended', [36,3,5,6,12,8,9,11,24,42,40,31,34,28,32,33,30,39,29,27,10,14,35,38,23,37,41,17,22,26])
.controller('cow.infoController', ['$scope', 'myfarm', 'cow.infoIndices', 'cow.infoIndicesExtended', 'fetchCow', 'markAnimal', 'util.arrayFind', 'editNotification', '$routeParams',
	function($scope, myfarm, indexes, infoIndicesExtended, fetchCow, markAnimal, arrayFind, editNotification, $routeParams) {
		var indices = isNaN($scope.cow.toBeCulled) ? indexes : infoIndicesExtended;
		$scope.fields = indices.map(function(index) {
			return {index: index, name: $scope.data.profiles.fieldNames[index]};
		});

		$scope.$watch('cow', function(value) {
			$scope.fetchCow = value.fetchCow;
		});

		$scope.onNotification = function() {
			markAnimal($scope.data.vcId, $scope.cow);
		};

		$scope.hasEditPermission = function() {
			return $scope.data.perm & 0x100; //Bitmask
		};

		$scope.editNotification = function(note) {
			if (!$scope.hasEditPermission())
				return;
			editNotification($scope.data.email, $scope.cow, note);
		};

		$scope.toggleFetch = function() {
			fetchCow(myfarm.id, $scope.cow.nr, $scope.fetchCow).then(function(fetchCow){
				if (fetchCow !== null)
					$scope.cow.fetchCow = $scope.fetchCow = fetchCow;
				else
					$scope.fetchCow = $scope.cow.fetchCow;
			});
		};

		$scope.setInfoView($routeParams.infoView);

		$scope.$watch('cow', function() {
            if ($scope.data.users) 
				if ($scope.hasEditPermission()) {
					$scope.notes = $.map($scope.data.noteTypes, function(typeName, type) {
						var note = $scope.cow.notes && $scope.cow.notes[type];
						var mappedNote = {
							type: typeName
						};
						if(note) {
							$.extend(mappedNote, {
								comment: note.comment,
								date: note.time,
								user: $scope.data.users[note.user].UserName.trim(),
								old: note.time < $scope.cow.lactS,
								objectGUID: note.objectGUID
							});
						}
						return mappedNote;
					});
				}
				else
					$scope.notes = $scope.cow.notes && $.map($scope.cow.notes, function(note, type) {
						return {
							comment: note.comment,
							date: note.time,
							user: $scope.data.users[note.user].UserName.trim(),
							type: $scope.data.noteTypes[type],
							old: note.time < $scope.cow.lactS,
							objectGUID: note.objectGUID
						};
					});
		});
	}
])

// SrvAnimalNote.setNote
// {
// 	vcGUID,
// 	animalId,
// 	comment,
// 	noteType,
// 	objectGUID om den är ny ? null : id som jag vill ändra
// }
.factory('saveNotification', ['sendRequest', 'myfarm', 'JsSerilz', function(sendRequest, myfarm, JsSerilz) {
	return function(animalNr, comment, noteType, objectGUID) {
		var sd = new JsSerilz('$');
		sd.serialize(myfarm.id, animalNr, comment, noteType, objectGUID);
		return sendRequest('SrvAnimalNote.setNote', sd.d);
	};
}])
.factory('editNotification', ['getSessionCookie', 'alert', 'prompt', 'prompt3', 'translate', 'translate.translationParams', 'saveNotification',
	function(getSessionCookie, alert, prompt, prompt3, translate, translationParams, saveNotification) {
		return function(emails, cow, note) {
			var email = getSessionCookie().email;
			if(emails[email]) {
				if(note.user) {
					prompt3(translate('Notification'), note.comment, translate('New'), translate('Close'), translate('Change')).then(function(result) {
						var comment = result.text;
						//New
						if(result.action == 'positive') {
							saveNotification(cow.nr, comment, note.type, null);
						}
						//Modify
						else if(result.action == 'neutral' && comment != note.comment) {
							saveNotification(cow.nr, comment, note.type, note.objectGUID);
						}
					});
				} else {
					prompt(translate('Notification'), note.comment, translate('Save'), translate('Close')).then(function(comment) {
						saveNotification(cow.nr, comment, note.type, null);
					});
				}
			} else {
				alert(translationParams(translate('Missing DelPro user $email'), {
					email: email
				}));
			}
		};
	}
])
.controller('cow.incompleteIndicatorInfoController', ['$scope',
	function($scope) {

		$scope.$watch('cow.mask', function(mask) {
			$scope.colors = ['white', 'white', 'white', 'white'];
			var pos = -1;

			if(mask & 0x9999) {
				mask = mask & 0x9999;
				while(++pos < 4){
					if((mask&0xf)!=4&&(mask&0xf)){

						/*

						 Bitmask uses fig 1. Implementation uses fig 2.

						 Fig 1:
						 0 2
						 1 3

						 Fig 2:
						 0 1
						 2 3

						 */

						switch (pos) {
							case 1:
								$scope.colors[2] = 'red';
								break;
							case 2:
								$scope.colors[1] = 'red';
								break;
							default:
								$scope.colors[pos] = 'red';
						}
					}
					mask>>=4;
				}
			};
		})

	}
])
.factory('cow.cowData', ['sendRequest', function(sendRequest) {
	return function(vcId, cowNr) {
		return sendRequest('SrvAnimal.getAnimalData', vcId + ',' + cowNr);
	}
}])
.factory('sortMilkings', [function() {
	var sortCol, sd, smsk=[-1,0,5,9,-1,0,1,2,5,4,5,7,10,8,10,14];
	function sort(o1, o2) {
		switch(sortCol){
			case 6:
				var v1=o1.bmcMask,v2=o2.bmcMask;
				v1=smsk[v1>>10&15]+smsk[v1>>14&15]+smsk[v1>>18&15];
				v2=smsk[v2>>10&15]+smsk[v2>>14&15]+smsk[v2>>18&15];
				if(v1!=v2)
					return sd*(v2-v1);
			case 1:
				return sd*(o2.endOfMilkingTime-o1.endOfMilkingTime);
			case 2:
				return sd*(o2.flow-o1.flow);
			case 3:
				return sd*(o2.totalYield-o1.totalYield);
			case 4:
				return sd*(o1.robot==o2.robot?o2.endOfMilkingTime-o1.endOfMilkingTime:o1.robot==null?-1:o2.robot==null?1:o1.robot.localeCompare(o2.robot));
			case 5:
				return sd*(o1.milkDestination==o2.milkDestination?o2.endOfMilkingTime-o1.endOfMilkingTime:o1.milkDestination==null?-1:o2.milkDestination==null?1:o1.milkDestination.localeCompare(o2.milkDestination));
			case 7:
				if(o1.flags&0x9999)
					if(o2.flags&0x9999)
						return sd*(o2.endOfMilkingTime-o1.endOfMilkingTime);
					else
						return -1;
				else if(o2.flags&0x9999)
					return 1;
				return sd*(o2.endOfMilkingTime-o1.endOfMilkingTime);
			case 7:
				if(o1.flags&0x2222)
					if(o2.flags&0x2222)
						return sd*(o2.endOfMilkingTime-o1.endOfMilkingTime);
					else
						return -1;
				else if(o2.flags&0x2222)
					return 1;
				return sd*(o2.endOfMilkingTime-o1.endOfMilkingTime);
		}
		return 0;
	}

	return function(milkings, options) {
		sortCol = options.sortCol;
		sd = options.reverse ? -1 : 1;
		return milkings.sort(sort);
	};

}])
.factory('extractCowData', [function() {
	return function(cow, cowData, data) {
		function bitMake(val,prev,warn,alarm,bitPos){
			if(val!=null&&val>0){
				var s=0,df;
				s=val>warn?val>alarm?12:8:4;
				if(prev!=null&&prev!=0){
					df=(val-prev)/prev;
					s+=Math.abs(df)>0.02?df>0?3:1:2;
				}
				return s<<bitPos;
			}
			return 0;
		};
		function calc7days(endTime){
			this.endTime=(this.beTime=endTime)+86400000;
			this.firstTime=this.ft=endTime-604800000;
			this.dayYield=
			this.dayTime=
			this.sumYield=
			this.sumTime=0;
			this.date=new Date(endTime).toString();
			this.event=function(time,yieldd,deltaTime){
				if(yieldd>3&&deltaTime<=86400000){
					var dd;
					if(time>this.firstTime&&time<this.endTime){
						this.sumYield+=yieldd;
						this.sumTime+=deltaTime;
					}
					if(time<this.endTime){
						if(time-deltaTime>this.beTime){
							this.dayYield+=yieldd;
							this.dayTime+=deltaTime;
						}
						else if(time>this.beTime){
							dd=time-this.beTime;
							this.dayYield+=yieldd*dd/deltaTime;
							this.dayTime+=dd;
						}
					}
					else if(time-deltaTime<this.endTime){
						dd=this.endTime-(time-deltaTime);
						this.dayYield+=yieldd*dd/deltaTime;
						this.dayTime+=dd;
					}
				}
			};
			this.get7Days=function(){	
				return this.sumTime>172800000?this.sumYield/this.sumTime*86400000:0;
			};
			this.getDayYield=function(){
				return this.dayTime>10800000?this.dayYield/(this.dayTime/86400000):0;
			};
		};
		var i=-1,o,ot,b,m=null,c,df,y24cmp=cow.sevenDays==null?null:cow.sevenDays/10,dt,lastTime,sum7=[],
		cw=data.cellsWarning,
		ca=data.cellsAlarm,
		bw=data.bloodWarning,
		ba=data.bloodAlarm,
		mw=data.mdiWarning,
		ma=data.mdiAlarm;
		if(cowData.milkings.length>1){
			o=new Date(parseInt(cowData.milkings[0].milkingTimeHex,16));
			o=new Date(o.getFullYear(),o.getMonth(),o.getDate(),0,0,0,0).getTime();
			ot=new Date(parseInt(cowData.milkings[cowData.milkings.length-1].milkingTimeHex,16));
			ot=new Date(ot.getFullYear(),ot.getMonth(),ot.getDate(),0,0,0,0).getTime();
			while(o<=ot){
				sum7.push(new calc7days(o));
				o+=86400000;
			}
		}
		cowData.sum7=sum7;
		while(++i<cowData.milkings.length){
			o=cowData.milkings[i];
			o.time=parseInt(o.milkingTimeHex,16);
			if(!i)lastTime=o.time;
			else{
				var ii=-1,delta=o.time-lastTime;
				while(++ii<sum7.length)
					sum7[ii].event(o.time,o.yield,delta);
			}
			lastTime=o.time;
			o.averageFlow=o.yield/o.secMilkingTime*60;
			o.hour24=i==0?null:Math.floor(o.yield/(dt=((o.time-ot)/3600000))*240+0.5)/10;
			o.mask=parseInt(o.sumMaskHex,16);
			ot=o.time;
			o.bmcMask=bitMake(o.blood,b,bw,ba,10)+bitMake(o.mdi,m,mw,ma,14)+bitMake(o.occ,c,cw,ca,18);
			if(y24cmp!=null&&i>0&&dt>5){
				df=(o.hour24-y24cmp)/y24cmp;
				o.bmcMask|=Math.abs(df)>0.02?df>0?3:1:2;
			}
			b=o.blood;
			m=o.mdi;
			c=o.occ;
		}
		return cowData;
	}
}])
.factory('getMilkingCellNames', ['unit', function(unit) {
	return function() {
		return ['Milking time','Duration mm:ss','Blo MDi Cel','Yield ' + unit.current + ' (~/24h)','Flow ' + unit.current + '/m','Milk dest'];
	};
}])
.controller('cow.milkingsController', ['$scope', 'cow.cowData', 'getMilkingCellNames',
			'sortMilkings', 'cow.getUserCollapsed', 'cow.setUserCollapsed',
			'cow.getUserSort', 'cow.setUserSort', 'getCowDataNew', 'extractCowData',
	function($scope, getCowData, getCellNames, sortMilkings, getUserCollapsed, setUserCollapsed, getUserSort, setUserSort, getCowDataNew, extractCowData) {
		$scope.$watchGroup(['cowData', 'nr'], function(values) {
			var nr = values[1];
			if(!values[0]) {
				getCowDataNew($scope.id, $scope.useImperialUnits).then(function(data) {
					$scope.setAllData(data);
					$scope.setCowData(data.getAnimal(nr));
				});
			}
		});

		$scope.$watchGroup(['cowData', 'sort'], function(values) {
			if(values[0]) {
				$scope.milkings = sortMilkings(values[0].milkings, values[1]);
				$scope.$broadcast('renderMilkings', $scope.milkings);
			}
		});

		$scope.cellNames = getCellNames();

		$scope.sort = getUserSort();
		$scope.sortCol = $scope.sort.sortCol;
		$scope.reverse = $scope.sort.reverse;

		$scope.setSortCol = function(col, event) {
			if($scope.isSelectedSortCol(col)) {
				$scope.reverse = !$scope.reverse;
			} else {
				$scope.sortCol = col;
				$scope.reverse = false;
			}
			$scope.sort = {
				sortCol: $scope.sortCol,
				reverse: $scope.reverse
			};

			setUserSort($scope.sort);

			event.stopPropagation();
		};

		$scope.isSelectedSortCol = function(col) {
			return $scope.sortCol === col;
		};

		$scope.collapsed = getUserCollapsed($scope.id);
		$scope.toggleCollapse = function() {
			var collapsed = !$scope.collapsed;
			setUserCollapsed($scope.id, collapsed);
			$scope.collapsed = collapsed;
		};
	}
])
.directive('cowIcon', ['cowq.renderIcon', function(renderIcon) {
	return {
		restrict: 'E',
		replace: true,
		template: '<img width="70" height="70">',
		link: function(scope, element, attr) {
			scope.$watch(attr.cow, function(cow) {
				renderIcon(scope.data, attr.index, cow, element);
			});
		}
	};
}])
.directive('milkingIcon', ['cow.renderIcon',
	function(renderIcon) { return {
		restrict: 'E',
		template: '<img>',
		replace: true,
		link: function(scope, element, attr) {
			render();
			scope.$on('j$Repeat.render', render);
			function render() {
				renderIcon(scope.data, +attr.index, scope.milking, element);
			}
		}
	};
}])
.factory('cow.renderIcon', ['util.setIncompleteImage',
	function(setIncompleteImage) {
		return function(data, index, milking, element) {
			setIncompleteImage(element, milking.flags & (index ? 0x9999 : 0x2222), 70, 70);
		};
	}
])
.factory('cow.renderCell', ['cowq.getText', 'util.renderHelth', 'drawSprite',
	function(getText, renderHelth, drawSprite) {
		var today=getText('today'),
			minmin=getText('minmin'),
			minsec=getText('minsec'),
			yesterday=getText('yesterday');
		function renderUpDown(element,v,i){
			if(v=(v>>=i)&3) {
				var img = $('<img class="icon">').appendTo(element);
				drawSprite(img,0,559+38*v,38,38,0,0,38,38);
			} else {
				$('<span></span>').text(' - ').appendTo(element);
			}
		}
		var getYield=function(element, milking){
			element.text(Math.round(milking.totalYield * 10) / 10);
			var v=milking.bmcMask&3;
			if(v>0) {
				var img = $('<img class="icon">').appendTo(element);
				drawSprite(img,0,559+38*v,38,38,0,0,38,38);
			}
			$('<span></span>').text((milking.hour24==null?'':' ('+Math.round(milking.hour24 * 10) / 10+')')).appendTo(element);
		};
		return function(data, profileIndex, time, milking, element) {
//			element.empty();
			switch(profileIndex) {
				case 1:
					var lastMidnight = new Date(), milkingStartTime = milking.endOfMilkingTime-milking.secMilkingTime*1000;
					lastMidnight.setHours(0,0,0,0); // last midnight
//					var dayDiff = Math.floor((lastMidnight - milkingStartTime) / 86400000) + 1;
					var tm=new Date(milking.endOfMilkingTime), m=tm.getMinutes(), h=tm.getHours(),
//							day=dayDiff<=0?today:dayDiff===1?yesterday:tm.getDate()+'/'+(tm.getMonth()+1);
							day=tm.getDate()+'/'+(tm.getMonth()+1);
					element.text(day + ' - ' + (h<10?'0'+h:h)+':'+(m<10?'0'+m:m));
					return;
				case 2:
					var mm=Math.floor(milking.secMilkingTime/60), ss=milking.secMilkingTime%60;
					element.text((mm<10?'0'+mm:mm)+':'+(ss<10?'0'+ss:ss));
					return;
				case 3:
					element.empty();
					renderHelth(element, milking.bmcMask);
					return;
				case 4:
					element.empty();
					getYield(element, milking);
					return;
				case 5:
					element.text(Math.round(milking.averageFlow/100)/10);
					return;
				case 6:
					element.text(milking.milkDestination);
					return;
			}
		};
	}
])
.controller('cow.graphController', ['$scope', 'getCowDataNew', 'getMilkingMetadata', '$routeParams',
	function($scope, getCowDataNew, getMilkingMetadata, $routeParams) {
		var milkings = $scope.milkings;
		if($scope.milkingIndex == null) {
			if($routeParams.milkingIndex) {
				$scope.setMilkingIndex(+$routeParams.milkingIndex);
			} else {
				$scope.setMilkingIndex(0);
				$scope.updateUrl();
			}	
		}
		$scope.$watchGroup(['cowData', 'nr'], function(values) {
			var nr = values[1];
			if(!values[0]) {
				getCowDataNew($scope.id, $scope.useImperialUnits).then(function(data) {
					$scope.setAllData(data);
					$scope.setCowData(data.getAnimal(nr));
				});
			}
		});
		$scope.$watchGroup(['milkingIndex', 'milkingsEntries'], function(values) {
			var index = values[0], entries = values[1];
			if(index != null && entries != null ) {
				if(!(index  in entries)) {
					index = 0;
					$scope.setMilkingIndex(index);
					$scope.updateUrl();
				}
				$scope.milkingMeta = entries[index];
			}
		});

		$scope.prevMilking = function() {
			var index = $scope.milkingIndex - 1;
			if(index < 0) {
				index = $scope.milkingsEntries.length - 1;
			}
			$scope.setMilkingIndex(index);
			$scope.updateUrl();
		};
		$scope.nextMilking = function() {
			$scope.setMilkingIndex(($scope.milkingIndex + 1) % $scope.milkingsEntries.length);
			$scope.updateUrl();
		};
	}
])
.directive('cowGraph', ['cow.renderGraphNew', function(renderGraph) {
	return {
		restrict: 'AC',
		link: function(scope, element) {
			scope.$watchGroup(['cowData'], function(values) {
				if(values[0]) {
					renderGraph(scope.allData, scope.time, values[0], element);
				}
			});
		}
	};
}])
.controller('cow.incompleteIndicatorCellController', ['$scope', function($scope) {

	$scope.$watch('milking', function(milking) {
		milking.incompleteMask = (milking.flags & 0x9999);

		var mask = $scope.milking.flags;
		$scope.colors = ['white', 'white', 'white', 'white'];
		var pos = -1;

		if(mask & 0x9999) {
			mask = mask & 0x9999;
			while(++pos < 4){
				if((mask & 0xf) != 4 && (mask & 0xf)){

					/*

					 Bitmask uses fig 1. Implementation uses fig 2.

					 Fig 1:
					 0 2
					 1 3

					 Fig 2:
					 0 1
					 2 3

					 */

					switch (pos) {
						case 1:
							$scope.colors[2] = 'red';
							break;
						case 2:
							$scope.colors[1] = 'red';
							break;
						default:
							$scope.colors[pos] = 'red';
					}
				}
				mask>>=4;
			}
		}
	});
}])

.directive('simpleHoverTemplate', ['$compile', function($compile) {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			// var createElement = $compile(element.clone().contents());
			var visible = false;
			scope.displayHover = function(event) {
				element.show();

				var el = element[0];
				var y = 5 + event.layerY + element[0].clientHeight/2;
				var x = event.layerX - element[0].clientWidth/2;
				if(y + el.clientHeight > window.innerHeight) {
					y = event.layerY - el.clientHeight - 10 + element[0].clientHeight/2;;
					if(y < 0){
						y = 0;
						x = event.layerX;
						if(y + el.clientHeight > event.layerY) {
							x = event.layerX - el.clientWidth-10;
							y = event.layerY - el.clientHeight/2;
							if(y < 0) y = 0;
						}
					}
				}
				if(x + el.clientWidth > window.innerWidth - 3) {
					x = window.innerWidth - el.clientWidth - 3;
				}
				if(x < 0) x = 0;

				element.css({
					left: x,
					top: y
				});
			}
			scope.hideHover = function() {
				element.hide();
			};
		}
	};
}])
.factory('getMilkingMetadata', ['unit', function(unit) {
	function addEntry(entries, label, value) {
		entries.push({
			label: label,
			value: value
		});
	}
	function addYield(entries, label, yld, expected) {
		addEntry(entries, 'Yield ' + label, yld + unit.current + (expected ? ' (' + Math.round(yld / expected * 100) + '% of expected)' : ''));
	}

	var teats = ["LF", "LR", "RF", "RR"];

	var analyzeFlags = function(f) {
		var i = -1, str=null;
		while (++i < 4) {
			if (f&1) {
				if (str)
					str += ' ';
				else
					str = '';
				str += teats[i];
			}
			f >>= 4;
		}
		return str;
	};

	function chYl(yld, expected) {
		return expected > 0 && ((yld / expected) > 1.3);
	}
	return function(mo) {
		var entries = [];
		
		var milking = mo.o;
		var date = new Date(milking.endOfMilkingTime);

		addEntry(entries, 'Prod / 24h', Math.round(mo.prodPerDay * 10) / 10  + unit.current);
		addEntry(entries, 'Total yield', Math.round(milking.totalYield * 10) / 10 + unit.current);
		var prodH = Math.floor(mo.prodTime);
		var prodMinu = Math.floor((mo.prodTime - prodH) * 60);
		addEntry(entries, 'Prod time', prodH + 'h' + ' ' + prodMinu + 'min');
		addEntry(entries, 'Percent of expected', Math.round(100 + milking.expectedYieldPercentDiff));
		addEntry(entries, 'mdi', milking.mdi);
		addEntry(entries, 'Conductivity', milking.averageConductivity);
		if (milking.blood) {
			addEntry(entries, 'Blood', milking.blood);
		}
		addEntry(entries, 'Robot', milking.robot);
		var milkTime = milking.secMilkingTime;
		var mmin = Math.floor(milkTime / 60);
		var msec = milkTime - mmin * 60;
		addEntry(entries, 'Milking time', mmin + 'min' + ' ' + msec + 'sec');
		addEntry(entries, 'Milk dest', milking.milkDestination);
		if (milking.occ !== -1) {
			addEntry(entries, 'occ', milking.occ);
		}
		if (milking.flags & 0x1111) {
			addEntry(entries, 'Incomplete', analyzeFlags(milking.flags & 0x1111));
		}
		if (milking.flags & 0x2222) {
			addEntry(entries, 'Kick off', analyzeFlags((milking.flags >> 1) & 0x1111));
		}
		if (milking.totalYieldLF !== -1) {
			addYield(entries, "LF", milking.totalYieldLF, milking.expectedYieldLF);
			addYield(entries, "LR", milking.totalYieldLR, milking.expectedYieldLR);
			addYield(entries, "RF", milking.totalYieldRF, milking.expectedYieldRF);
			addYield(entries, "RR", milking.totalYieldRR, milking.expectedYieldRR);
		}

		return {
			date: milking.endOfMilkingTime,
			entries: entries	
		};	

		scope.displayHover(event);
	};
}])
.filter('firstHalf', function() {
	return function(array) {
		if (!array) {
			return [];
		}
		var n = Math.ceil(array.length / 2);
		return array.slice(0, n);
	};
})
.filter('secondHalf', function() {
	return function(array) {
		if (!array) {
			return [];
		}
		var start = Math.ceil(array.length / 2);
		return array.slice(start, array.length);
	};
})
.factory('cow.renderGraphNew', [ 'jrGraph', 'translate', 'getMilkingMetadata',
	function(jrGraph, translate, getMilkingMetadata) {
		var milkings = {};
		var scope, pScope;

		function onMouseStop() {
			scope.hideHover();
		}
		function onMouseOver(id, event) {
			console.log(event);
			var entries = [];
			
			var mo = milkings[id];
			var milking = mo.o;

			var data = getMilkingMetadata(milking);

			pScope.$apply(function() {
				pScope.data = data;	
			});

			scope.displayHover(event);
		}

		function chYl(yld, expected) {
			return expected > 0 && ((yld / expected) > 1.3);
		}

		return function(allData, time, animal, element) {
			element.empty();

			var parent = $(element.parent());

			scope = element.scope();
			pScope = parent.scope();

			var mainGraph = new jrGraph.instance(function onMouseStop(){}, translate('January February March April May June July August September October November December')), data = animal.production;

			var viewElement = $('<canvas>')
				.prop('width', parent.width())
				.prop('height', parent.height())
				.appendTo(element);

			viewElement
				.on('mouseover', mainGraph.mouseTargetStart)
				.on('mouseout', mainGraph.mouseTargetStop)
				.on('mousemove', mainGraph.mouseTargetMove);

			var view = viewElement[0];
			// showDynamic(false);

			
			mainGraph.setCanvas(view);
			mainGraph.clear('#848484','#f4f4f4','d','#575757', '#E5E5E5', '#DBDBDB');
			mainGraph.setFont('18px sans-serif', 20);
			if(data.prod7d){
				mainGraph.addLine("#111111", 4);
				mainGraph.addPoint(data.startDate, data.prod7d);
				mainGraph.addPoint(data.endDate, data.prod7d);
			}
			mainGraph.addLine("#099FF4",5);
			var time = data.startDate + 43200000, dt = 0;;
			i = -1;
			while (++i < data.days.length) {
				if (data.days[i])
					mainGraph.addPoint(time, data.days[i].prodPerDay);
				time += 86400000;
			}
			i = -1;
			mainGraph.addLine("#ff00ff",1,"#bbbbbb");
			while (++i < animal.milkings.length) {
				var mm = animal.milkings[i], delta = mm.endOfMilkingTime - dt;
				if (delta > 86400000)
					delta = 86400000;
				delta = mm.endOfMilkingTime - delta;
				if (delta < allData.minTime)
					delta = allData.minTime;
				mainGraph.addStaple(delta, mm.totalYield, mm.endOfMilkingTime);
				dt = mm.endOfMilkingTime;
			}
			mainGraph.addLine('#2D518D', 1);
			var i = -1, lastTime = 0;
			while (++i < data.days.length) {
				var dd = data.days[i] ? data.days[i].mlk : null;
				if (dd) {
					var ii = -1;
					while (++ii < dd.length) {
						var mm = dd[ii].o, incomp = (mm.flags & 0x1111) !== 0, kickoff = (mm.flags & 0x2222) !== 0, normal = !incomp && !kickoff;
						var prod = dd[ii].prodPerDay > allData.maxProd ? allData.maxProd : dd[ii].prodPerDay;
						var color =  normal ? "#0000FF" : incomp ? kickoff ? "#9C0000" : "#FF2020" : "#F6CA07";
						if (incomp && (mm.expectedYieldPercentDiff > 5 || (mm.expectedYieldPercentDiff > -10 && mm.expectedYieldLF !== -1
							&& (chYl(mm.totalYieldLF, mm.expectedYieldLF) || chYl(mm.totalYieldLR, mm.expectedYieldLR) || chYl(mm.totalYieldRF, mm.expectedYieldRF) || chYl(mm.totalYieldRR, mm.expectedYieldRR)))))
								color = "#00FF62";
//						if (lastTime)
//							mainGraph.addPoint(lastTime, prod);
						milkings[mm.guidHash] = dd[ii];
						if (prod > data.prod7d * 2)
							prod = data.prod7d * 2;
						mainGraph.addPoint(lastTime=mm.endOfMilkingTime, prod);
					}
				}
			}
			mainGraph.setLimits(allData.maxProd, allData.minTime, allData.maxTime);
			var info = [];
			info.push({color: "#bbbbbb", id:3,	isOn: true,	text:translate('Milking yield')});
			info.push({color: "#099FF4", id:0,	isOn: true,	text:translate('Daily milk production (24h)')});
			info.push({color: "#2D518D", id:1,	isOn: true,	text:translate('Milking production compared to 24h')});
			info.push({color: "#111111", id:2,	isOn: true,	text:translate('Last seven days')});
			mainGraph.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"});
			mainGraph.paint();

			pScope.milkingsEntries = $.map(milkings, function(value, key) {
				return value;
			})
			.map(getMilkingMetadata)
			.sort(function(a, b) {
				return a.date - b.date;
			});

			// pScope.milkingMeta = pScope.milkingsEntries[0];
		};
	}
]);