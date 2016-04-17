/* global profileName */

'use strict';

jr.include('js/cowq-pappa.js');
jr.include('css/cowq.css');

angular.module('cowq', ['cowq-pappa', 'myfarm', 'cowqExtras', 'modal'])

.factory('cowq.extractData', ['myfarm.cacheByFarm', 'cowq.deSerializeData', 'deSerializeProfiles',
	function(cacheByFarm, deSerializeData, deSerializeProfiles) {
		return cacheByFarm('cowq.extractData', function(data) {
			if(data == 'No farm') { return; }
			return $.extend(deSerializeData(data.cows, data.codeSetsSerialized, data.writeMessagePermission), {
				profiles: deSerializeProfiles(data.profiles)
			});
		});
	}
])
.factory('cowq.socket', ['onBroadcast', 'cowq.extractData', '$rootScope', 'cowq.deSerializeCow', 'util.getTime', 'JsSerilz', 'cowq.setCowsToGroups', 'util.findIndex',
	function(onBroadcast, extractData, $rootScope, deSerializeCow, getTime, JsSerilz, setCowsToGroups, findIndex) {
		var updates = [], data, currentId;

		function updateData(update, time) {
			var sd = new JsSerilz('$', update), hasCow=0;
			while (sd.hasMore()) {
				switch(parseInt(sd.getInt())){
					case 1:
						var cow = deSerializeCow(sd, time), len = data.cows.length;
						data.cows[findIndex(data.cows, function(test) {return test.nr === cow.nr;})]=cow;
						hasCow |= data.cows.length !== len;
						break;
					case 2:
						var sec=sd.getInt(), cows=sd.getString();
						data.render = cows !== data.oldOpenGate;
						data.oldOpenGate = cows;
						data.waitAreaStateTime=sec ? time + sec * 1000 : null;
						if(cows&&cows.length)
							cows.split(',').forEach(function(cowNr){data.openGate[+cowNr]=1;});
						break;
				}
			}
			if(hasCow)
				setCowsToGroups(data);
			data.time = time;
		}

		return {
			listen: function(id) {
				onBroadcast(id, 'queue', function(update) {
					if(id !== currentId) return; //Ignore updates from previous farms
				
					if(data) {
						updateData(update, getTime());
						$rootScope.$broadcast('cowq.update', data);
					} else {
						updates.push(update);
					}
				});
			},
			run: function(id, serializedData) {
				currentId = id;
				data = extractData(serializedData);
				var time = getTime();
				while(updates.length > 0) {
					updateData(updates.pop(), time);
				}
			}
		};
	}
])
.directive('cowqIcon', ['cowq.renderIcon',
	function(renderIcon) { return {
		restrict: 'E',
		template: '<img>',
		replace: true,
		link: function(scope, element, attr) {
			render();
			scope.$on('j$Repeat.render', render);
			function render() {
				renderIcon(scope.data, parseInt(attr.index), scope.cow, element);
			}
		}
	};
}])
.directive('cowqCell', ['cowq.renderCell', '$timeout', function(renderCell, $timeout) {
	return {
		restrict: 'E',
		template: '<div class="cow-cell"></div>',
		replace: true,
		link: function(scope, element, attr) {
			render();
			scope.$on('j$Repeat.render', render);
			function render() {
				renderCell(scope.data, scope.profile.profileIndex[attr.index], scope.time, scope.cow, element);
			}
		}
	};
}])
.factory('getCowClass', [function() {
	return function(cow, time) {
		return cow.action===1?'passthrough':cow.action===2?'feedonly':!cow.prev?'nevermilked':
				cow.next ? (time>=cow.next ? (time-cow.prev>=cow.over&&cow.over>=0 ? 'overdue':'permission'): 'nopermission'): 'nevermilked';

	}
}])
.controller('cowqController', ['$scope', 'data', 'util.getTime', 'cowq.selectCows', 'cowq.sort', 'getCowClass', '$timeout', 'updateInterval', 'hasTextInput',
	function($scope, data, getTime, selectCows, sortCows, getCowClass, $timeout, timeoutDuration, getHasTextInput) {
		$scope.data = data;
		$scope.id = $scope.data.vcId;

		$scope.readyToRender = function() {
			return angular.isDefined($scope.profile)
				&& angular.isDefined($scope.group)
				&& angular.isDefined($scope.sort);
		};

		$scope.renderCows = function() {
			//Don't render unless profile, group and sort is set
			if($scope.readyToRender()) {
				//Update time
				$scope.time = getTime();


				//First select, then sort.
				$scope.selectCows();
				$scope.sortCows();

				//Render
				$scope.render();

				//Clear old timeout and set new one
				$scope.setTimeout();
			}
		};

		$scope.selectCows = function() {
			$scope.cows = selectCows($scope.data, $scope.profile, $scope.time, $scope.searchPattern, $scope.group, $scope.selectedGroups);
		};

		$scope.sortCows = function() {
			$scope.cows = sortCows($scope.cows, $scope.data.areas, $scope.time, $scope.sort, $scope.data.codeSets);
		};
		
		$scope.render = function() {
			$scope.$broadcast('renderCows', $scope.cows);
		};

		$scope.setTimeout = function() {
			if(timeoutDuration){
				if($scope.timeout) $timeout.cancel($scope.timeout);
				$scope.timeout = $timeout(function() {
					$scope.renderCows();
				}, timeoutDuration);
			}
		};

		$scope.$on('cowq.update', function(event, data) {
			$scope.$apply(function() {
				$scope.data = data;
				$scope.renderCows();
			});
		});

		$scope.$on('$destroy', function() {
			if($scope.timeout) $timeout.cancel($scope.timeout);
		});

		$scope.setProfile = function(profileName, profile) {
			$scope.profileName = profileName;
			$scope.profile = profile;
		};

		$scope.setSearch = function(searchPattern) {
			if($scope.searchPattern !== searchPattern) {
				$scope.searchPattern = searchPattern;
				$scope.renderCows();
			}
		};

		$scope.setSort = function(sort) {
			$scope.sort = sort;

			$scope.renderCows();
		};
		$scope.setGroup = function(group) {
			$scope.group = group;

			$scope.renderCows();
		};
		
		$scope.setSelectedGroups = function(groups) {
			$scope.selectedGroups = groups;
		};

		$scope.getCowClass = function(cow) {
			return getCowClass(cow, $scope.time);
		};

		$scope.hasTextInput = getHasTextInput();
	}
])
.controller('cowq.searchController', ['$scope', 'cowq.getText', 'prompt',
	function($scope, getText, prompt) {
		$scope.searchClick = function() {
			var nr, old = $scope.searchPattern;
			prompt(getText('search'), $scope.searchPattern).then(function(nr) {
				nr = nr.replace(/[^\d]/g, '');
				if(nr && nr !== old)
					$scope.setSearch(nr);
			})
		};
	}
])
.factory('getInitialProfileName', ['getUserProfileName', '$location', function(getUserProfileName, $location) {
	return function(profiles) {
		var searchProfileName = $location.search().profile;
        
        var useSearchProfileName = false; 
        if(searchProfileName) {
            if(profiles.profiles[searchProfileName]) {
                useSearchProfileName = true;
            } else {
                for(var profileName in profiles.profiles) {
                    var profile = profiles.profiles[profileName];
                    if(profile.commonName === searchProfileName) {
                        useSearchProfileName = true;
                        searchProfileName = profileName;
                        break;
                    }
                }
            }
        }
		return useSearchProfileName ? searchProfileName : getUserProfileName(profiles);
	};
}])
.controller('cowq.profileController', ['$scope', 'getInitialProfileName', 'setUserProfileName',
	function($scope, getInitialProfileName, setUserProfileName) {
		$scope.profiles = $scope.data.profiles;

		$scope.profileName = getInitialProfileName($scope.profiles);

		$scope.change = function() {
			$scope.setProfile($scope.profileName, $scope.getProfile($scope.profileName));
			setUserProfileName($scope.profileName);
		};

		$scope.getProfile = function(profileName) {
			return $scope.profiles.profiles[profileName];
		};

		$scope.setProfile($scope.profileName, $scope.getProfile($scope.profileName));
	}
])
.factory('getSelectedGroups', ['$location', function($location) {
	return function(groups) {
		var selectedGroupKeys = $location.search().groupKeys;
		if(!selectedGroupKeys) { return []; }

		selectedGroupKeys = selectedGroupKeys.split(',');

		selectedGroupKeys = selectedGroupKeys.map(function(key) {
			return parseInt(key);
		});

		return groups.filter(function(group) {
			return selectedGroupKeys.indexOf(group.key) !== -1;
		});
	}
}])
.controller('cowq.filterController', ['$scope', 'getUserSort', 'setUserSort', 'getUserGroup', 'setUserGroup', 'getUserCollapsed', 'setUserCollapsed', 'translate', 'getSelectedGroups',
	function($scope, getUserSort, setUserSort, getUserGroup, setUserGroup, getUserCollapsed, setUserCollapsed, translate, getSelectedGroups) {
		$scope.$watchGroup(['profileName', 'profile'], function(values) {
			$scope.sort = getUserSort(values[0], values[1]);
			$scope.profileIndex = $scope.sort.profileIndex;
			$scope.reverse = $scope.sort.reverse;

			$scope.setSort($scope.sort);
		});
		
		$scope.$watch('data.groupsArray', function(groups) {
			$scope.setSelectedGroups(getSelectedGroups(groups));
			$scope.groups = !$scope.selectedGroups.length ? groups : [];
		});

		$scope.$watch('groups', function(groups) {
			if(groups.length) {
				var userGroup = getUserGroup($scope.id);

				var userGroupExists = groups.filter(function(group) {
					return group.key === userGroup;

				}).length > 0;

				$scope.group = userGroupExists ? userGroup : (groups.length < 2 ? groups[0].key : 0);

				$scope.setGroup($scope.group);
			} else {
				$scope.setGroup(0);
			}
		});

		$scope.$watchGroup(['groups', 'searchPattern'], function(values) {
			$scope.showGroups = values[0].length > 1 || values[1];
		});

		$scope.getProfileIndex = function(index) {
			return $scope.profile.profileIndex[index];
		};
		$scope.isSelectedProfileIndex = function(profileIndex) {
			return $scope.profileIndex === profileIndex;
		};
		$scope.selectProfileIndex = function(profileIndex, event) {
			if($scope.isSelectedProfileIndex(profileIndex)) {
				$scope.reverse = !$scope.reverse;
			} else {
				$scope.profileIndex = profileIndex;
				$scope.reverse = false;
			}
			
			$scope.sort = {
				profileIndex: $scope.profileIndex,
				reverse: $scope.reverse
			};

			$scope.setSort($scope.sort);

			setUserSort($scope.profileName, $scope.sort);

			event.stopPropagation();
		};
		$scope.getFieldName = function(index) {
			return $scope.data.profiles.fieldNames[$scope.profile.profileIndex[index]];
		};
		
		$scope.cancelSearch = function(event) {
			$scope.setSearch(null);
			event.stopPropagation();
		};
		$scope.selectGroup = function() {
			$scope.setGroup($scope.group);

			setUserGroup($scope.id, $scope.group);
		};
		$scope.getGroupName = function() {
			var group = $scope.data.groups[$scope.group];
			return group ? group.name : translate('All groups');
		};

		$scope.collapsed = getUserCollapsed($scope.id);
		$scope.toggleCollapse = function() {
			if($scope.searchPattern) return;
			
			var collapsed = !$scope.collapsed;
			setUserCollapsed($scope.id, collapsed);
			$scope.collapsed = collapsed;
		};
	}
])
.controller('cowq.notifyController', ['$scope', 'markAnimal',
	function($scope, markAnimal) {
		$scope.addNotify = function(cow) {
			markAnimal($scope.data.vcId, cow);
		};
	}
])
.factory('markAnimal', ['sendRequest', 'cowq.getText', 'prompt', 'prompt3', 'confirm', 'hasTextInput', 'util.format', function(sendRequest, getText, prompt, prompt3, confirm, getHasTextInput, createFormat) {
	var prompt3TitleFormat = createFormat(getText('djur') + ' {0} ' + getText('markComment') + '(' + getText('by') + ' {1})');

	return function(vcId, cow) {
		if(cow.markBySign)
			if (getHasTextInput())
				prompt3(prompt3TitleFormat.render(cow.nr, cow.markByUser), cow.notify, getText('remove')).then(function(result) {
					var comment = result.text;
					//Remove
					if(result.action == 'positive') {
						sendRequest('SrvAnimal.deleteNotification', {targetId:vcId, animalNr:cow.nr.toString()});
					}
					//Save
					else if(result.action == 'neutral' && comment !== cow.notify) {
						sendRequest('SrvAnimal.makeNotification', {targetId:vcId, animalNr:cow.nr.toString(), notification:comment});
					}
				});
			else
				confirm(getText('confirmDelete') + ' ' + cow.nr + getText('questionMark'), getText('yes'), getText('no')).then(function(){
					sendRequest('SrvAnimal.deleteNotification', {targetId:vcId, animalNr:cow.nr.toString()});
				});
		else if (getHasTextInput())
			prompt(getText('markComment'), '').then(function(comment) {
				sendRequest('SrvAnimal.makeNotification', {targetId:vcId, animalNr:cow.nr.toString(), notification:comment});
			});
		else
			confirm(getText('markAnimal')).then(function() {
				sendRequest('SrvAnimal.makeNotification', {targetId:vcId, animalNr:cow.nr.toString(), notification:''});
			});
	}
}])
.factory('cowq.openWaitArea', ['sendRequest', function(sendRequest) {
	return function(id, cows) {
		return sendRequest('SrvAnimal.setOpenWaitingArea', id+' '+cows.map(function(cow){return cow.nr;}).join());
	};
}])
.factory('cowq.closeWaitArea', ['sendRequest', function(sendRequest) {
	return function(id) {
		return sendRequest('SrvAnimal.closeOpenWaitingArea', id);
	};
}])
.controller('cowq.waitAreaController', ['$scope', 'cowq.openWaitArea', 'cowq.closeWaitArea', 'cowq.getText', 'confirm',
	function($scope, openWaitArea, closeWaitArea, getText, confirm) {
		$scope.$watchGroup(['data.waitAreas', 'data.waitAreaStateTime'], function(values) {
			$scope.waitAreaStateTime = values[1] || null;	// null == inactive, 0 == try to open, < 0 = try to close, > 0 == time left to automatic close
			if($scope.waitAreaStateTime === null)
				$scope.data.openGate={};
			if ($scope.data.render) {
				$scope.data.render = false;
				$scope.render();
			}
		});

		$scope.shouldShow = function() {
			return $scope.waitAreaStateTime !== null || ($scope.data.perm & 0x100 && $scope.profile.activityAndAreaMask & 0x40); //Bitmask
		};
		$scope.getClass = function(state) {
			if ([0,2].indexOf(state) >= 0)
				return 'error';
			else if (state === 1)
				return 'success';
			return '';
			// return $scope.data.perm & 0x100 && $scope.profile.activityAndAreaMask & 0x40; //Bitmask
		};
		$scope.openWaitArea = function() {
			if ($scope.waitAreaStateTime === null){
				confirm(getText('SureOpenWait'), getText('OpenWaitWrea'), getText('cancel')).then(function() {
					$scope.waitAreaStateTime = 0;
					openWaitArea($scope.id, $scope.cows).then(function(result){
						if(!result){
							// TODO: Write error message
							$scope.waitAreaStateTime = null;
						}
					});
				});
			}
			else if($scope.waitAreaStateTime >= 0){
				$scope.waitAreaStateTime = Math.min(-$scope.waitAreaStateTime,-1);
				closeWaitArea($scope.id);
			}
		};
		$scope.getDuration = function() {
			return Math.ceil(Math.abs($scope.waitAreaStateTime - $scope.time) / 60000);
		};
		$scope.waitAreaClosed = function() {
			$scope.waitAreaStateTime = null;
			$scope.data.openGate={};
			$scope.data.render = false;
			$scope.render();
			return 3;
		};
		$scope.getState = function() {
			if($scope.waitAreaStateTime === 0)
				return 0;	// Try to open
			else if ($scope.waitAreaStateTime > 0)
				if ($scope.waitAreaStateTime < $scope.time)
					return $scope.waitAreaClosed();
				else
					return 1;	// Open for some time
			else if ($scope.waitAreaStateTime < 0)
				return 2;	// Try to close
			else
				return 3;	// Inactive
		};
	}
])
.controller('cowq.incompleteIndicatorCellController', ['$scope', function($scope) {
	var mask = $scope.cow.mask;
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

				/*$scope.colors[pos] = 'red';*/
			}
			mask>>=4;
		}
	}
}]);