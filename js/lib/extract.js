'use strict';

angular.module('extract', [])
.factory('parseFormData', ['$parse', function($parse) {
	return function(formData) {
		var ret = {}, key, prevNode, lastIndex, path, i, prop, node;

		for(key in formData) {
			prevNode = ret, path = key.split(/\.|\[|\]\.?/g); lastIndex = path.length - 1;
			for(i = 0; i < path.length; i++) {
				prop = path[i]

				if(prevNode[prop]) {
					prevNode = prevNode[prop];
					continue;
				}

				node = i < lastIndex
					? $.isNumeric(path[i + 1]) ? [] : {}
					: formData[key];

				prevNode[prop] = node;

				prevNode = node;
			}
		}

		return ret;
	}
}])
.directive('extractWith', ['$parse', 'util.findIndex',
	function($parse, findIndex) {
		return {
			restrict: 'AC',
			controller: ['$scope', '$attrs', function($scope, $attr) {
				var includes = [], from;
				$scope.$watch($attr.extractFrom, function(value) {
					from = value;
				});

				this.add = function(extractAs) {
					includes.push(extractAs);
				}

				this.remove = function(extractAs) {
					var index = findIndex(includes, function(test) {
						return test === extractAs;
					});
					includes.splice(index, 1);
				}

				$scope[$attr.extractWith] = extract;

				function extract() {
					var data = {};

					includes.forEach(function(extractAs) {
						data[extractAs.as] = extractAs.get(from);
					});

					return data;
				}
			}]
		}
	}
])
.directive('extractAs', ['$parse',
	function($parse) {
		return {
			restrict: 'AC',
			require: ['^extractWith', '?ngModel'],
			link: function(scope, element, attr, controllers) {
				var extractWith = controllers[0], ngModel = controllers[1];

				var extractAs = {
					as: attr.extractAs,
					get: function(from) {
						if(ngModel) {
							return ngModel.$modelValue === ngModel.$modelValue // Check if not NaN
								? ngModel.$modelValue
								: undefined
						} else if(attr.extractValue) {
							return $parse(attr.extractValue)(scope);
						} else {
							return $parse(this.as)(from);
						}
					}
				};

				attr.$observe('extractAs', function(value) {
					extractAs.as = value;
				})

				extractWith.add(extractAs);

				element.on('$destroy', function() {
					extractWith.remove(extractAs);
				})
			}
		}
	}
]);