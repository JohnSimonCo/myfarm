(function() {
	var j$ = window.j$ = {}, version = jr.version;

	function versionUrl(url) {
		return url + '?ver=' + version;
	}

	var templateCache = {};

	j$.getTemplate = function(url) {
		if(templateCache[url]) {
			return templateCache[url];
		} else {
			var promise = $.get(versionUrl('/templates/' + url)).then(function(html) {
				return Handlebars.compile(html);
			});
			templateCache[url] = promise;
			return promise;
		}
	};

	var partialsCache = {};
	j$.getPartial = function(name, url) {
		if(partialsCache[url]) {
			return partialsCache[url];
		} else {
			var promise = j$.getTemplate(url).then(function(template) {
				Handlebars.registerPartial(name, template);
			});
			partialsCache[url] = promise;
			return promise;
		}
	};

	j$.include = function() {
		var head = document.getElementsByTagName("head")[0],
			cache = {},
			resolved = (new $.Deferred()).resolve().promise(),
			endsWith = function(str, test) {
				return str.match(test + '$') == test;
			},
			includeJs = function(url) {
				var deferred = new $.Deferred(), script = document.createElement('script');
				script.onload = deferred.resolve;
				script.onreadystatechange = function() {
					if(this.readyState == 'complete') deferred.resolve();
				}
	        	script.type = "text/javascript";
	        	script.src = url;
	        	head.appendChild(script);
	        	return deferred.promise();
			},
			includeCss = function(url) {
				var link = document.createElement('link');
	        	link.rel = 'stylesheet';
	        	link.type = 'text/css';
	        	link.href = url;
	        	head.appendChild(link);
	        	return resolved;
			},
			includeImage = function(url) {
				var deferred = new $.Deferred(), image = new Image();
				image.onload = deferred.resolve;
				image.src = url;
				return deferred.promise();
			};

		return function(url) {
			if(cache[url]) return cache[url];

			var method;
			if(endsWith(url, '.js')) method = includeJs;
			else if(endsWith(url, '.css')) method = includeCss;
			else method = includeImage; //Since js, css and images are the only types i assume it's an image

			var result = method(versionUrl('/' + url));
			cache[url] = result;
			return result;	
		}
	}();

	var requestCache = {};

	j$.sendRequest = function(javaClassMethod, request, cache) {
		if(cache) {
			var hash = javaClassMethod + '|' + request;
			if(requestCache[hash]) {
				return requestCache[hash];
			} else {
				var promise = sendRequest(javaClassMethod, request);
				requestCache[hash] = promise;
				return promise;
			}

		} else {
			return sendRequest(javaClassMethod, request);
		}
	};

	function sendRequest(javaClassMethod, request) {
		var deferred = new $.Deferred(), promise = deferred.promise();
		jr.sendRequest(javaClassMethod, request, deferred.resolve, deferred.reject);
		return promise;
	}

	j$.format = function(format) {
		return function() {
			var args = arguments;
			return format.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] != 'undefined'
					? args[number]
					: match
				;
			});
		}
	};

	j$.alphabeticalSort = function(a, b) {
		return a.localeCompare(b);
	};
	j$.numericalSort = function(a, b) {
		return a - b;
	};
	j$.sort = function(array, sort, get, inverse) {
		return array.sort(function(a, b) {
			a = get && get(a) || a, b = get && get(b) || b;
			return sort(inverse ? b : a, inverse ? a : b);
		});
	}

	j$.getFromStartQuery = function(object, start) {
		var ret = {}, regexp = new RegExp('^' + start);
		for(var key in object) {
			if(regexp.test(key)) ret[key.substring(start.length)] = object[key];
		}
		return ret;
	}

	j$.isNumber = function(test) {
		return typeof test === 'number';
	}

	j$.wait = function(millisec) {
		var deferred = new $.Deferred();
		setTimeout(deferred.resolve, millisec)
		return deferred.promise();
	} 


	j$.finished = $.when(
		j$.include('js/router.js'),
		j$.include('js/util.js'),
		j$.include('js/handlebars.js')

	).then(function() {
		var router = j$.router = new Router();

		j$.route = function(path, callback) {
			router.addRoute(path, callback);
			return this;
		}

		j$.run = function() {
			router.run();
		}

		function insert(container, index, insert) {
			return container.substr(0, index) + insert + container.substr(index);
		}
		
		Handlebars.registerHelper('translate', function(string) {
			//return '{' + jr.translate(string) + '}';
			return jr.translate(string);
		});
		
		// Handlebars.registerHelper('$translate', function() {
		// 	var format = j$.format(' class="translated{0}" data-translation="{1}"');

		// 	return function(string, options) {
		// 		var translation = jr.translate(string),
		// 		html = options.fn(this);

		// 		html = insert(html, html.indexOf('>'), format(
		// 			options.hash && options.hash.class ? ' ' + options.hash.class : '',
		// 			string
		// 		));

		// 		html = insert(html, html.indexOf('>') + 1, translation);

		// 		return html;
		// 	}
		// }());

		Handlebars.registerHelper('checkbox', function() {
			var makeId = 0, checkBoxformat = j$.format('<input type="checkbox" id="cb-{0}" class="checkbox{1}" {2} {3}>' +
											 '<label for="cb-{0}"></label>');

			return function(options) {
				var attrs = [], name;
				for(name in options.hash) {
					if(name !== 'class' && name !== 'checked')
						attrs.push(name + '="' + options.hash[name] + '"');
				}

				return new Handlebars.SafeString(checkBoxformat(
					makeId++,
					options.hash['class'] ? options.hash['class'] : '',
					options.hash['checked'] ? ' checked="checked"' : '',
					attrs.length > 0 ? attrs.join(' ') : ''
				));
			};
		}());

		Handlebars.registerHelper('join', function() {
			return Array.prototype.slice.call(arguments, 0, arguments.length - 1).join('');
		});

		// Handlebars.registerHelper('select', function() {
		// 	var optionFormat = '<option {0}>{1}</option>'
		// 	return function(list, defaultValue) {
		// 		var html = '<select>', i, l, val;
		// 		for(i = 0, l = list.length; i < l; i++) {
		// 			val = list[i];
		// 			html += j$.format(optionFormat,
		// 				val === defaultValue ? 'selected="selected"' : '',
		// 				val
		// 			);
		// 		}

		// 		return new Handlebars.SafeString(html + '</select>');
		// 	};
		// }());

		Handlebars.registerHelper('$if', function(condition, output) {
			if(condition) return output;
		});
		Handlebars.registerHelper('$unless', function(condition, output) {
			if(!condition) return output;
		});

		Handlebars.registerHelper('show', function(condition, output) {
			return condition ? '' : 'hidden';
		});
		Handlebars.registerHelper('hide', function(condition, output) {
			return condition ? 'hidden' : '';
		});

		Handlebars.registerHelper('toString', function(value) {
			return value.toString();
		});

		Handlebars.registerHelper('option', function() {
			var format = j$.format('<option{1}>{0}</option>');
			return function(current, options) {
				return new Handlebars.SafeString(format(
					current,
					options.hash.selected === current ? ' selected="selected"' : ''
				));
			}
		}());

		Handlebars.registerHelper('repeat', function(n, options) {
			var html = '', step = +options.hash.step || 1;
			for(var i = 0; i < n; i += step) {
				html += options.fn(i);
			}
			return html;
		});

		// Handlebars.registerHelper('timepicker', function() {
		// 	var optionFormat = j$.format('<option value="{1}" {2}>{0}</option>'),
		// 		selectFormat = j$.format('<select class="timepicker hours {2}">{0}</select><select class="timepicker minutes {2}">{1}</select>');
		// 	return function(millisecSelected, options) {
		// 		if(millisecSelected <= 0)
		// 			millisecSelected = options.hash['default'] || 0;

		// 		var mins = millisecSelected / 1000 / 60,
		// 			hours = Math.floor(mins / 60),
		// 			minHtml = '', hourHtml = '',
		// 			i;

		// 		mins = Math.floor(mins - hours * 60);

		// 		for(i = 0; i < 60; i += 5) {
		// 			minHtml += optionFormat(
		// 				ensure2digits(i),
		// 				i * 60000, // 1000 * 60
		// 				i == mins ? 'selected="selected"' : ''
		// 			);
		// 		}

		// 		for(i = 0; i < 24; i++) {
		// 			hourHtml += optionFormat(
		// 				ensure2digits(i),
		// 				i * 360000, // 1000 * 60 * 60
		// 				i == hours ? 'selected="selected"' : ''
		// 			);
		// 		}

		// 		return new Handlebars.SafeString(selectFormat(
		// 			hourHtml, 
		// 			minHtml,
		// 			options.hash['class'] || ''
		// 		));
		// 	}
		// }());

		Handlebars.registerHelper('timepicker', function() {
			var optionFormat = j$.format('<option value="{1}">{0}</option>'),
				selectFormat = j$.format('<select class="timepicker hours {2}">{0}</select><select class="timepicker minutes {2}">{1}</select>');
			return function(options) {
				var minHtml = '', hourHtml = '';

				for(i = 0; i < 60; i += 5) {
					minHtml += optionFormat(ensure2digits(i), i);
				}

				for(i = 0; i < 24; i++) {
					hourHtml += optionFormat(ensure2digits(i), i);
				}

				return new Handlebars.SafeString(selectFormat(
					hourHtml, 
					minHtml,
					options.hash['class'] || ''
				));
			}
		}());

		function ensure2digits(n) {
			return n < 10 || n.length < 2 ? '0' + n : n;
		}

		Handlebars.registerHelper('compare', function() {
			var operators = {
		        '==': function (l, r) { return l == r; },
		        '===': function (l, r) { return l === r; },
		        '!=': function (l, r) { return l != r; },
		        '!==': function (l, r) { return l !== r; },
		        '<': function (l, r) { return l < r; },
		        '>': function (l, r) { return l > r; },
		        '<=': function (l, r) { return l <= r; },
		        '>=': function (l, r) { return l >= r; },
		        'typeof': function (l, r) { return typeof l == r; }
		    };

			return function (lvalue, operator, rvalue, options) {
			    if (arguments.length < 3) {
			        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
			    }
			    
			    if (!options) {
			        options = rvalue;
			        rvalue = operator;
			        operator = "===";
			    }
			    
			    if (!operators[operator]) {
			        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
			    }
			    
			    return operators[operator](lvalue, rvalue) ? options.fn(this) : options.inverse(this);
			}
		}());
	});

	$.fn.controller = function(fn) {
		fn.call(this, this);
		return this;	
	};
})();