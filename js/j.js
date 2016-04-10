jr.include('js/jquery.js');
jr.include('js/router.js');
jr.include('js/handlebars.js');

window.j$ = {};

j$.init = function() {

	var router = j$.router = new Router();

	j$.route = function(path, callbackFn) {
		router.addRoute(path, callbackFn());
		return this;
	}
	// var router = this.router = new Router.Router();

	// j$.map = router.map.bind(router);

	// var handlers = {};

	// j$.handler = function(name, handler) {
	// 	if(isString(name)) {
	// 		handlers[name] = handler;
	// 	} else if(isObject(name)) {
	// 		$.extend(handlers, name)
	// 	}
	// }
	// router.getHandler = function(name) {
	// 	return handlers[name];
	// }

	var templateCache = {};

	j$.getTemplate = function(url) {
		if(templateCache[url]) {
			return templateCache[url];
		} else {
			var promise = $.get(j$.versionUrl('templates/' + url))
			.then(function(html) {
				return Handlebars.compile(html);
			});
			templateCache[url] = promise;
			return promise;
		}
	}

	j$.start = function() {
		router.run();
	}


	j$.versionUrl = function(url) {
		return url + jr.internal.timeStamp();
	}
	function isString(a) {
		return typeof a === 'string';
	}
	function isObject(a) {
		return typeof a === 'object';
	}
};