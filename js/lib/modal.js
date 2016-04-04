'use strict';

jr.include('/jr-myfarm/css/modal.css');

angular.module('modal', ['translate'])
.constant('MODAL_STACK_MAX_LENGTH', 5)
.factory('$modalStack', ['MODAL_STACK_MAX_LENGTH', function(MAX_LENGTH) {
	var stack = [], zIndex = 100; //start at 100
	return {
		put: function(deferred) {
			if(stack.length >= MAX_LENGTH) {
				stack.shift().reject();
			}
			stack.push(deferred);
		},
		pop: function() {
			return stack.pop();
		},
		top: function() {
			return stack[stack.length - 1];
		},
		empty: function() {
			return stack.length <= 0;
		}
	}
}])
.factory('$modal', ['$modalStack', 'modalTemplates', '$templateCache', '$compile', '$rootScope', '$q',
	function($modalStack, templates, $templateCache, $compile, $rootScope, $q) {
		var $body = $('body'), $modalContainer = $($templateCache.get('modal/modal-container.html'));

		function closeModal(element, scope) {
			element.remove();
			scope.$destroy();

			$modalStack.pop();
			if($modalStack.empty()) {
				$modalContainer.remove();
			}
		}
		return function(template, options) {
			var element = angular.element($templateCache.get(template)),
				scope = $rootScope.$new(true),
				deferred = $q.defer(),
				promise = deferred.promise;
			
			scope.template = template;
			$.extend(scope, options);

			if($modalStack.empty()) {
				$modalContainer.appendTo($body);
			}

			$modalStack.put(deferred);

			element = $compile(element)(scope);
			element.appendTo($modalContainer);

			promise = promise.finally(function() {
				closeModal(element, scope);
			});

			return {
				confirm: deferred.resolve,
				close: deferred.reject,
				result: promise,
				element: element,
				scope: scope
			}
		}
	}
])
.factory('alert', ['$modal', '$timeout', 'translate', function($modal, $timeout, translate) {
	return function(title, duration) {
		var modal = $modal('modal/alert.html', {title: title});

		if(duration) {
			$timeout(modal.close, duration, false);
		}
		return {
			then: function(fn) {
				return modal.result.finally(fn);
			},
			close: modal.close
		}
	}
}])
.factory('confirm', ['$modal', 'translate', function($modal, translate) {
	var defaults = {
		positive: translate('Yes'),
		negative: translate('No')
	};
	return function(title, positive, negative) {
		var modal = $modal('modal/confirm.html', $.extend(defaults, {
			title: title,
			positive: positive,
			negative: negative
		}));
		return $.extend({}, modal.result, { close: modal.close })
	}
}])
.factory('prompt', ['$modal', 'translate', function($modal, translate) {
	var defaults = {
		positive: translate('Ok'),
		negative: translate('Close')
	};
	return function(title, defaultText, positive, negative) {
		var modal = $modal('modal/prompt.html', $.extend(defaults, {
			title: title,
			text: defaultText,
			positive: positive,
			negative: negative
		}));
		return modal.result;
	}
}])
.factory('prompt3', ['$modal', 'translate', function($modal, translate) {
	var defaults = {
		positive: translate('Ok'),
		negative: translate('Close'),
		neutral: translate('Save')
	};
	return function(title, defaultText, positive, negative, neutral) {
		var modal = $modal('modal/prompt3.html', $.extend(defaults, {
			title: title,
			text: defaultText,
			positive: positive,
			negative: negative,
			neutral: neutral
		}));
		return modal.result;
	}
}])
.directive('modal', [function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		templateUrl: 'modal/modal.html',
		// templateUrl: '/jr-myfarm/templates/modal.html',
		controller: ['$scope', '$modalStack', function($scope, $modalStack) {
			$scope.modal = $modalStack.top();
			$scope.confirm = $scope.modal.resolve;
			$scope.close = $scope.modal.reject;
		}]
	}
}])
.factory('modalTemplates', ['$templateCache', 'j$.version', function($templateCache, version) {
	$templateCache.put('modal/modal.html?ver=' + version,
		'<div class="modal">' +
			'<div class="fill overlay" ng-click="close()"></div>' +
			'<div class="fill container">' +
				'<div class="inner" ng-transclude></div>' +
			'</div>' +
		'</div>');
	$templateCache.put('modal/modal-container.html',
		'<div id="modal">' +
			'<div class="fill overlay"></div>' +
		'</div>');
	$templateCache.put('modal/alert.html',
		'<modal class="alert">' +
			'<form ng-submit="confirm()">' +
				'<pre class="title" ng-bind="title"></pre>' +
				'<button class="big-button black-button" translate="Ok"></button>' +
			'</form>' +
		'</modal>');
	$templateCache.put('modal/confirm.html',
		'<modal class="confirm">' +
			'<pre class="title" ng-bind="title"></pre>' +
			'<button class="big-button black-button" ng-click="close()" ng-bind="negative"></button>' +
			'<button class="big-button black-button" ng-click="confirm()" translate-bind="positive"></button>' +
		'</modal>');
	$templateCache.put('modal/prompt.html',
		'<modal class="prompt">' +
			'<pre class="title" ng-bind="title"></pre>' +
			'<div><input ng-model="text" j$-autofocus j$-select j$-onsend="confirm(text)"></div>' +
			'<button class="big-button black-button" ng-click="close()" ng-bind="negative"></button>' +
			'<button class="big-button black-button" ng-click="confirm(text)" ng-bind="positive"></button>' +
		'</modal>');
	$templateCache.put('modal/prompt3.html',
		'<modal class="prompt">' +
			'<pre class="title" ng-bind="title"></pre>' +
			'<div><input ng-model="text" j$-autofocus j$-select j$-onsend="confirm(text)"></div>' +
			'<button class="big-button black-button" ng-click="close()" ng-bind="negative"></button>' +
			'<button class="big-button black-button" ng-click="confirm({\'text\': text, \'action\': \'positive\'})" ng-bind="positive"></button>' +
			'<button class="big-button black-button" ng-click="confirm({\'text\': text, \'action\': \'neutral\'})" ng-bind="neutral"></button>' +
		'</modal>');

	return {};
}]);