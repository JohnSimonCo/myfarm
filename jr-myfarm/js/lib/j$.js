'use strict';

jr.include('/jr-myfarm/js/lib/util.js');
jr.include('/jr-myfarm/js/lib/server.js');
jr.include('/jr-myfarm/js/lib/emoji.js');

jr.include('/jr-myfarm/css/j$.css');

angular.module('j$', ['server', 'util', 'emoji'])
.constant('j$.version', jr.version)
.factory('versionInterceptor', ['j$.version', function(version) {
	var params = {ver: version}, regexp = /\..+$/; //match anything that ends with .* (such as .html or .js)
	return {
		request: function(config) {
			if(regexp.test(config.url)) {
				config.params = $.extend(config.params || {}, params);
			}
			return config;
		}
	};
}])
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('versionInterceptor');
}])
.factory('j$.cachedAction', ['$cacheFactory', function($cacheFactory) {
	return function(cacheId, factory) {
		var cache = $cacheFactory(cacheId);
		return function(arg) {
			var cached = cache.get(arg);
			if(cached) return cached;
			else {
				return cache.put(arg, factory.apply(this, arguments));
			}
		}
	}
}])
.factory('storage', function() {
	var storage = jr.storage;

	function save() {
		localStorage.myFarm = JSON.stringify(storage);
	}

	// storage.edit
	// 	.set('hej', 'hopp')
	// 	.set('foo', 'bar')
	// 	.delete('baz')
	// 	.save()
	var editMode =  {
		set: function(prop, value) {
			storage[prop] = value;
			return this;
		},
		'delete': function(prop) {
			delete storage[prop];
			return this;
		},
		save: save
	};

	return {
		edit: editMode,
		has: function(prop) {
			return !!storage[prop];
		},
		get: function(prop) {
			return prop ? storage[prop] : storage;
		},
		set: function(prop, value) {
			storage[prop] = value;
			save();
		},
		'delete': function(prop) {
			delete storage[prop];
			save();
		},
		deleteMultiple: function(/* arguments... */) {
			for(var i = 0; i < arguments.length; i++) {
				delete storage[arguments[i]];
			}
			save();
		},
		toJson: function() {
			return localStorage.myFarm;
		}
	};
})
.factory('resources', function() {
	var resources = jr.resources;

	return {
		get: function(name) {
			return resources[name];
		}
	};
})
.factory('getUserEmail', ['storage', function(storage) {
	return function() {
		return storage.get('email');
	};
}])
.factory('hasTextInput', ['getCookieByName', function(getCookieByName) {
	var name = 'has-text-input';
	var getCookieValue = getCookieByName.bind(null, name);

	return function() {
		return getCookieValue() !== 'false';
	};
}])
.factory('j$PromiseRace', ['$q', function($q) {
	return function(/*arguments...*/) {
		var defer = $q.defer();
		[].forEach.call(arguments, function(promise) {
			promise.then(defer.resolve);
			promise.catch(defer.reject);
		});
		return defer.promise;
	}
}])
.directive('j$Insert', [function() {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			function insert(string) {
				var startPos = element.prop('selectionStart'),
					endPos = element.prop('selectionEnd'),
					val = element.val();

				element.focus();

				return angular.isDefined(startPos)
					? val.substring(0, startPos) + string + val.substring(endPos, val.length)
					: val + string;
			}
			scope[attr.j$Insert] = insert;
		}
	}
}])
.directive('j$Autofocus', [function() {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			element.focus();
		}
	}
}])
.directive('j$Onsend', [function() {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			element.keypress(function(event) {
				if(event.which === 13 && !event.shiftKey) {
					scope.$apply(attr.j$Onsend);
				}
			})
		}
	}
}])
.directive('j$Checkbox', [function() {
	var generateId = 0;
	return {
		restrict: 'E',
		template: '<input type="checkbox" class="checkbox"><label></label>',
		scope: {
			useId: '@',
			j$Disabled: '='
		},
		require: '?ngModel',
		link: function(scope, element, attr, ngModel) {
			var id = scope.useId || 'jDOLLAR-checkbox-' + generateId++;
			var input = element.find('input').attr('id', id);
			var label = element.find('label').attr('for', id);

			if(attr.j$Disabled) {
				scope.$watch('j$Disabled', function(disabled) {
					input.attr('disabled', disabled);
				});
			}

			if(!ngModel) return;

			ngModel.$render = function() {
				input.prop('checked', ngModel.$viewValue);
			};

			input.on('change', function() {
				scope.$apply(function() {
					ngModel.$setViewValue(input.prop('checked'));
				});
			});
		}
	}
}])
.directive('j$RadioButton', ['$compile', function($compile) {
	var generateId = 0;
	return {
		restrict: 'E',
		template: '<span><input type="radio" class="radio-button"><label></label></span>',
		replace: true,
		compile: function(tElement, tAttrs) {
			if(tAttrs.ngModel && tAttrs.ngValue) {
				tElement.removeAttr('ng-model');
				tElement.removeAttr('ng-value');

				var tInput = tElement.find('input');
				tInput.attr('ng-model', tAttrs.ngModel);
				tInput.attr('ng-value', tAttrs.ngValue);
			}

			return function link(scope, element, attr, ngModel) {
				var id = scope.useId || 'jDOLLAR-radio-button-' + generateId++;
				var input = element.find('input').attr('id', id);
				var label = element.find('label').attr('for', id);

				$compile(input)(scope);
			};
        }
	}
}])
.filter('ensure2digits', function() {
	return function(n) {
		return n < 10 || n.length < 2 ? '0' + n : n;
	}
})
.factory('j$TimePicker.hours', function() {
	var hours = [];
	for(var i = 0; i < 24; i++) {
		hours.push(i);
	}
	return hours;
})
.factory('j$TimePicker.minutes', function() {
	var minutes = [];
	for(var i = 0; i < 60; i++) {
		minutes.push(i);
	}
	return minutes;
})
.directive('j$Dblclick', [function() {
	var clickInterval = 300;

	var firstClickTime;
	var waitingForSecondClick = false;

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.bind('click', function(e) {

				if (!waitingForSecondClick) {
					firstClickTime = Date.now();
					waitingForSecondClick = true;

					setTimeout(function () {
						waitingForSecondClick = false;
					}, clickInterval);
				}
				else {
					waitingForSecondClick = false;

					var time = Date.now();
					if (time - firstClickTime < clickInterval) {
						scope.$apply(attrs.j$Dblclick);
					}
				}
			});
		}
	};
}])
.directive('j$Timepicker', ['j$TimePicker.hours', 'j$TimePicker.minutes', 'util.format', '$filter',
	function(hours, minutes, createFormat, $filter) {
		var optionFormat = createFormat('<option value="{0}">{1}</option>'),
			ensure2digits = $filter('ensure2digits');

		return {
			restrict: 'E',
			replace: true,
			template: '<span class="timepicker"><select class="hours"></select><select class="minutes"></select></span>',
			require: '?ngModel',
			link: function(scope, element, attr, ngModel) {
				var selects = element.find('select'),
					hourSelect = element.find('select.hours'),
					minuteSelect = element.find('select.minutes');

				hours.forEach(function(hour) {
					hourSelect.append(optionFormat.render(hour, ensure2digits(hour)));
				});
				minutes.forEach(function(minute) {
					minuteSelect.append(optionFormat.render(minute, ensure2digits(minute)));
				});

				if(!ngModel) return;

				ngModel.$render = function() {
					var m = ngModel.$viewValue / 1000 / 60, h = Math.floor(m / 60);

					hourSelect.val(h);
					minuteSelect.val(m - h * 60);
				};

				selects.on('change', function() {
					scope.$apply(function() {
						ngModel.$setViewValue(hourSelect.val() * 3600000 + minuteSelect.val() * 60000);
					});
				});
			}
		}
	}
])
.directive('j$BindValue', [function() {
	return {
		restrict: 'AC',
		scope: true,
		link: function(scope, element, attr) {
			scope.$watch(attr.j$BindValue, function(value) {
				scope.value = value;
			});
		}
	}
}])
//You can use this instead of ng-init when you wan't to be sure all child directives are loaded (not used)
.directive('j$Init', ['$compile', function($compile) {
	return {
		restrict: 'AC',
		link: function(scope, element, attr) {
			//Eval expression in j$-init in postlink
			scope.$eval(attr.j$Init);
		}
	}
}])
.directive('j$Repeat', ['$timeout', function($timeout) {
	return {
		restrict: 'AC',
		transclude: 'element',
			priority: 1000,
			terminal: true,
			link: function(scope, element, attr, ctrl, transclude) {
				var ADD_AMOUNT	  	= 20,
					RENDER_AMOUNT	= 20,
					REMOVE_AMOUNT 	= 60;

				// Syntax: "as scopeProperty when event"
				// Example: "as cow when renderCows"
				// Will render every item in array supplied when "renderCows" event is fired,
				// and add it as a property in the scope with the name "cow"

				var matches = attr.j$Repeat.match(/as\s+(\w+)\s+when\s+(\w+)/),
					as = matches[1], when = matches[2],
					collection, state = [], iteration = 0, time;

				scope.$on(when, function(event, data) {
				if(!data) return;

				time = Date.now();	
					collection = data;

					var stateLength = state.length,
						collectionLength = collection.length,
						validation = createValidation(++iteration);

				async(0, Math.min(stateLength, collectionLength), RENDER_AMOUNT, render, validation);

					if(collectionLength > stateLength) {
						async(stateLength, collectionLength, ADD_AMOUNT, add, validation);
					} else if(collectionLength < stateLength) {
						action(collectionLength, stateLength, hide);
						async(collectionLength, stateLength, REMOVE_AMOUNT, remove, validation);
					}
				
				});

				function createValidation(iteration) {
					return function(test) {
						return test === iteration;
					}
				}

				function add(index) {
					transclude(function(clone, scope) {
						state[index] = {
							element: clone,
							scope: scope
						};
						scope[as] = collection[index];
						clone.insertBefore(element);
					});
				}
				function hide(index) {
					state[index].element.addClass('ng-hide');
				}
				function remove() {
					var item = state.pop();
					item.element.remove();
					item.scope.$destroy();
				}

				function render(index) {
					var scope = state[index].scope;
				scope[as] = collection[index];
				scope.$broadcast('j$Repeat.render');
				}

				function async(index, max, step, fn, validate) {
					$timeout(function() {
						if(validate(iteration)) {
							asyncAction(index, max, step, fn, validate);
						}
					});
				}

				function asyncAction(index, max, step, fn, validate) {
					// console.log(fn.name + ' index ' + index + ' time ' + (Date.now() - time));
					var end = Math.min(index + step, max);
					for(;index < end; index++) {
						fn(index);
					}
					if(end < max) {
						async(index, max, step, fn, validate);
					}
			// 		else {
					// console.log(fn.name + ' took ' + (Date.now() - time));
			// 		}
				}

				function action(index, max, fn) {
					for(;index < max; index++) {
						fn(index);
					}
				}
			}
	}
}])
.factory('scrollTo', [function() {
	var scrollTo = {};
	return {
		set: function(key, value) {
			scrollTo[key] = value;
		},
		get: function(key) {
			return scrollTo[key];
		},
		remove: function(key) {
			scrollTo[key] = undefined;
		}
	}
}])
.directive('scrollToIf', ['$parse', '$timeout', 'scrollTo', function($parse, $timeout, scrollTo) {
	var DELAY = 50;
	return {
		restrict: 'AC',
			link: function(scope, element, attr) {
				var matches = attr.scrollToIf.split(' matches ');
				var value = $parse(matches[0])(scope);
				var key = matches[1];
				var scrollToValue = scrollTo.get(key);

				if(scrollToValue != null && value === scrollToValue) {
					$timeout(function() {
						element[0].scrollIntoView();
					}, DELAY);
					scrollTo.remove(key);
				}
			}
	}
}])
//<div j$-select>
	//<button class="big-button" j$-select-option>Label</button>
	//<select ng-model="model" ng-options="option in options"></select>
//</div>
.directive('j$Select', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		compile: function(tElement, tAttr) {
			tElement.addClass('jDOLLAR-select');

			// return function(scope, element, attr) {
			// 	var select = element.find('select'),
			// 		selectText = element.find('.jDOLLAR-select-text');

			// 	function render() {
			// 		selectText.text(select.find('option:selected').text());
			// 	}

			// 	$timeout(render);
			// 	select.on('change', render);
			// 	var selectText = element.find('.jDOLLAR-select-text');
			// 	scope.$watch(attr.j$Select, function(val) {
			// 		selectText.text(val);
			// 	});
			// }
		}
	}	
}])
.directive('j$SelectLabel', [function() {
	return {
		restrict: 'A',
		compile: function(tElement, tAttr) {
			tElement.addClass('jDOLLAR-select-export');
			return function(scope, element, attr) {
				var prop = attr.j$SelectLabel;
				scope.$watch(attr.ngModel, function() {
					scope[prop] = element.find('option:selected').text();
				});
			}
		}
	}	
}])
// .directive('j$Preselect', ['$timeout', function($timeout) {
// 	return {
// 		restrict: 'AC',
// 		compile: function(tElement, tAttr) {
// 			tElement.addClass('jDOLLAR-preselect');

// 			return function(scope, element, attr) {
// 				scope.$watch(attr.j$Preselect, function(value) {
// 					//Timeout to make sure all options are properly initialized 
// 					$timeout(function() {
// 						element.val(value);
// 					});
// 				})
// 			}
// 		}
// 	}
// }])
// .directive('j$EvalSelected', ['$parse', function($parse) {
// 	return {
// 		restrict: 'AC',
// 		compile: function(tElement, tAttr) {
// 			tElement.addClass('jDOLLAR-eval-selected');

// 			return function(scope, element, attr) {
// 				element.on('change', function() {
// 					scope.$apply(function() {
// 						var selected = element.find('option:selected');
// 						$parse(selected.attr('j$-eval'))(selected.scope());
// 					});
// 				});
// 			}
// 		}
// 	}
// }])
// .directive('j$FarmList', ['$parse', function($parse) {
// 	return {
// 		restrict: 'AC',
// 		link: function(scope, element, attr) {
// 			var $farmList = element.find('optgroup.farm-list');
// 			scope.$watch('farmList', function(farmList) {
// 				if(!farmList) return;

// 				$farmList.empty();
// 				farmList.forEach(function(farm) {
// 					var option = $('<option>')
// 								 .text(farm.name)
// 								 .data('farmId', farm.id)
// 								 .attr('on-select', 'changeFarm("' + farm.id + '")');

// 					if(farm.id === scope.id) {
// 						option.prop('selected', true);
// 					}
// 					$farmList.append(option);
// 				});
// 			});
// 			element.on('change', function() {
// 				scope.$apply(function() {
// 					var selected = element.find('option:selected');
// 					$parse(selected.attr('on-select'))(selected.scope());
// 				});

// 				$farmList.find('option').each(function(option) {
// 					var $option = $(this);
// 					if($option.data('farmId') === scope.id) {
// 						$option.prop('selected', true);
// 					}
// 				});
// 			});
// 		}
// 	}
// }])
.directive('j$AddClass', [function() {
	var regex = /(\w)+ on (\w)+/;
	return {
		compile: function(tElement, tAttr) {
			tElement.addClass('jDOLLAR-animate');

			return function(scope, element, attr) {
				var matches = attr.j$Animation.match(regex),
					className = matches[0],
					event = matches[1];

				scope.$on(event, function() {
					element.addClass(className);
				});

			};
		}
	};
}])
//Inspired by http://stackoverflow.com/questions/687998/auto-size-dynamic-text-to-fill-fixed-size-container
.directive('j$FitParent', ['$window', '$timeout', function(window, $timeout) {
	var $window = $(window);
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			var parent = element.parent();
			var maxFontSize = attr.maxFontSize || Infinity;
			var minFontSize = attr.minFontSize || 0;

			function fit() {
				var maxWidth = parent.width();
				var fontSize = parseInt(element.css("fontSize"), 10);
				var multiplier = maxWidth/element.width();
				var newSize = fontSize * multiplier;
				newSize = Math.max(Math.min(newSize, maxFontSize), minFontSize);

				if(newSize !== fontSize) {
					element.css("fontSize", newSize);
				}
			}
			$window.on('resize', fit);
			scope.$on('$destroy', function() {
				$window.off('resize', fit);
			});
		}
	};
}])
//From https://gist.github.com/BobNisco/9885852
.directive('j$LongPress', function($timeout) {
	return {
		restrict: 'A',
		link: function($scope, $elm, $attrs) {
			$elm.bind('touchstart', function(evt) {
				// Locally scoped variable that will keep track of the long press
				$scope.longPress = true;

				// We'll set a timeout for 600 ms for a long press
				$timeout(function() {
					if ($scope.longPress) {
						// If the touchend event hasn't fired,
						// apply the function given in on the element's on-long-press attribute
						$scope.$apply(function() {
							$scope.$eval($attrs.j$LongPress)
						});
					}
				}, 600);
			});

			$elm.bind('touchend', function(evt) {
				// Prevent the onLongPress event from firing
				$scope.longPress = false;
				// If there is an on-touch-end function attached to this element, apply it
				if ($attrs.j$TouchEnd) {
					$scope.$apply(function() {
						$scope.$eval($attrs.j$TouchEnd)
					});
				}
			});
		}
	};
});
