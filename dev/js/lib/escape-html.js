'use strict';

//Escape html chars (inspired by handlebars)
angular.module('escapeHtml', [])
.factory('escapeHtml', function() {
	var escape = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"`": "&#x60;"
	};

	function escapeChar(chr) {
		return escape[chr] || "&amp;";
	}

	var bad = /[&<>"'`]/,
		badChars =  /[&<>"'`]/g;

	return function(html) {
		return bad.test(html) ? html.replace(badChars, escapeChar) : html;
	}
});