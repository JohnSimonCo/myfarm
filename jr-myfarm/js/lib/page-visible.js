'use strict';

angular.module('pageVisible', [])
.factory('isPageVisible', [function() {
	return function() {

	}
}])
.factory('pageVisible', ['$window', function(window) {
	var isVisible = true,
		queue = new $.Callbacks();

	return {
		listen: function() {
			var evtMap = { 
				focus: true, focusin: true, pageshow: true, blur: false, focusout: false, pagehide: false 
			};
		    var hidden = "hidden";

		    // Standards:
			if (hidden in document)
			    document.addEventListener("visibilitychange", onchange);
			else if ((hidden = "mozHidden") in document)
			    document.addEventListener("mozvisibilitychange", onchange);
			else if ((hidden = "webkitHidden") in document)
			    document.addEventListener("webkitvisibilitychange", onchange);
			else if ((hidden = "msHidden") in document)
			    document.addEventListener("msvisibilitychange", onchange);
			// IE 9 and lower:
			else if ('onfocusin' in document)
			    document.onfocusin = document.onfocusout = onchange;
			// All others:
			else window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

			function onchange (evt) {
				var evt = evt || window.event;
				isVisible = evt.type in evtMap ? evtMap[evt.type] : !this[hidden];

				if(isVisible) {
					queue.fire();
					queue.empty();
				}
			}
		},
		then: function(callback) {
			if(isVisible) callback();
			else queue.add(callback);
		}

	};
}])
.run(['pageVisible', function(pageVisible) {
	pageVisible.listen();
}]);