'use strict';

angular.module('util', [])
.factory('JsSerilz', function() {
	return function JsSerilz(delimiter, data) {
		var escapeChar = '\\',
			index = 0,
			nextEscape;
		if(data) {
			if((nextEscape = data.indexOf(escapeChar)) < 0) nextEscape = data.length + 1
		} else this.d = "";
		this.serialize = function () {
			var i = -1,
				o;
			while(++i < arguments.length) {
				o = arguments[i];
				if(o != null) this.d += o.toString().replace(/\u005c/g, "\\\\").replace(delimiter, escapeChar + delimiter) + delimiter;
				else this.d += delimiter;
			}
		};
		this.getString = function () {
			var rVal, i, ifrom = index;
			if(ifrom >= data.length) return null;
			i = data.indexOf(delimiter, ifrom);
			if(i > nextEscape) {
				rVal = data.substring(ifrom, nextEscape) + data.charAt(nextEscape + 1);
				index = nextEscape + 2;
				if((nextEscape = data.indexOf(escapeChar, nextEscape + 2)) < 0)
					nextEscape = data.length + 1;
				if(data.charAt(index) == delimiter)
					index++;
				else rVal += this.getString();
			} else {
				rVal = data.substring(ifrom, i);
				index = i + 1;
			}
			return(rVal.length == 0) ? null : rVal;
		};
		this.getInt = function () {
			return parseInt(this.getString(), 10);
		};
		this.getHex = function () {
			return parseInt(this.getString(), 16);
		};
		this.getDateHex = function () {
			var d = this.getString();
			return d === null ? null : parseInt(d, 16) * 1000;
		};
		this.getFloat = function () {
			return parseFloat(this.getString());
		};
		this.getRest = function () {
			return data.substring(index, data.length);
		};
		this.reset = function () {
			index = 0;
		};
		this.hasMore = function () {
			if(data == null) return null;
			return index < data.length;
		};
		this.getData = function () {
			return this.d;
		};
		this.getInputString = function () {
			return data;
		};
		this.getPos = function() {
			return index;
		};
		this.setPos = function(pos) {
			index = pos;
		};
		this.peek = function () {
			var ii = index,
				rv = this.getString();
			index = ii;
			return rv;
		};
	};
})
.factory('j$SerilzFormat', ['JsSerilz', function(JsSerilz) {
	var types = {
		'string': function(sd) {
			return sd.getString();
		},
		'int': function(sd) {
			return sd.getInt();
		},
		'hex': function(sd) {
			return sd.getHex();
		},
		'dateHex': function(sd) {
			return sd.getDateHex();
		},
		'float': function(sd) {
			return sd.getFloat();
		},
		'rest': function(sd) {
			return sd.getRest();
		}
	};

	var iterators = {
		'length': function(sd) {
			var length = sd.getInt();
			return function(index) {
				return index < length;
			};
		},
		'hasMore': function(sd) {
			return function(index) {
				return sd.hasMore();
			};
		}
	};

	function getFn(arg) {
		return angular.isString(arg) ? types[arg] //Get from types
			: angular.isFunction(arg) ? arg //Arg is already a function
				: function() { // Just return arg
					return arg;
				}; 
	}
	function getIterator(arg) {
		return angular.isDefined(arg)
			? angular.isString(arg) ? iterators[arg] : arg
			: iterators['length']; //Default iterator
	}
	return function(format) {
		return function J$Serilz(sd) {
			var ret = {}, i, f, key, value;
			for(i = 0; i < format.length; i++) {
				f = format[i];
				key = Object.keys(f)[0]; //Get the first key
				value = f[key];

				if(angular.isArray(value)) {
					var fn = getFn(value[0]), iterator = getIterator(value[1])(sd), index = -1, val;
					value = [];

					while(iterator(++index)) {
						val = fn(sd);
						if(val) value.push(val);
					}
				} else {
					value = getFn(value)(sd);
				}

				ret[key] = value;
			}
			return ret;
		};
	};
}])
.factory('util.formatDate', ['$filter', function($filter) {
	var $date = $filter('date'), defaultFormat = 'yyyy-MM-dd HH:mm:ss';
	return function(date, format) {
		return $date(date, format || defaultFormat);
	};
}])
.filter('formatDate', ['util.formatDate', function(formatDate) {
	return formatDate;
}])
.factory('stringStartsWith', [function() {
	return function(string, pattern) {
		return string.indexOf(pattern) === 0;
	};
}])
.factory('stringEndsWith', [function() {
	return function(string, pattern) {
		return string.length > pattern.length && string.indexOf(pattern) === string.length - pattern.length;
	};
}])
.factory('filterUndefinedValues', [function() {
	return function(object) {
		var copy = {};
		for(var key in object) {
			if(object.hasOwnProperty(key)) {
				copy[key] = object[key];
			}
		}
		return copy;
	};
}])
.factory('buildUrl', [function() {
	return function(options) {
		/*
			options {
				base: String,
				path: String,
				search: {},
				hash: String
			}
		 */
		var url = options.base + '#/';
		if(options.path) {
			url += options.path;
		}
		if(options.search) {
			var pairs = $.map(options.search, function(value, key) {
				return key + '=' + value;
			});
			url += '?' + pairs.join('&');
		}
		if(options.hash) {
			url += '#' + options.hash;
		}

		return url;
	}
}])
.factory('util.format', [function() {
	return function(format) {
		function render(/*arg1, ... , argN*/) {
			var args = arguments;
			return format.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] !== 'undefined'
					? args[number]
					: match
				;
			});
		}
		render.render = render;
		return render;
	};
}])
.factory('util.findIndex', function() {
	return function(array, test, skip) {
		if(!skip) {
			for(var i = 0, l = array.length; i < l; i++) {
				if(test(array[i])) return i;
			}
		}
		return array.length;
	};
})
.factory('util.arrayFind', function() {
	return function(array, test) {
		for(var i = 0, l = array.length; i < l; i++) {
			if(test(array[i], i)) return array[i];
		}
		return null;
	};
})
.factory('util.getItem', function() {
	return function(array, test) {
		var i = 0, value;
		for(var l = array.length; i < l; i++) {
			value = array[i];
			if(test(value)) return value;
		}
	};
})
.factory('util.setIncompleteImage', ['resources', function(resources) {
	var image = resources.get('info8.png');
	var maskUrlCache = {};

	function render(ctx, mask, width, height) {
		var pos=-1;
		//Incomplete
		if(mask & 0x9999) {
			mask = mask&0x9999;
			ctx.drawImage(image,70,0,width,height,0,0,width,height);
			while(++pos<4){
				if((mask&0xf)!=4&&(mask&0xf)){
					var x = pos <= 1 ? 0 : 34;
					var y = pos == 0 || pos==2 ? 17 : 45;
					ctx.drawImage(image,x-2,y,34,28,x,y,34,28);
				}
				mask>>=4;
			}
		}
		//Kickoff
		else if(mask & 0x2222) {
			ctx.drawImage(image,72,280,width-2,17,0,0,width,17);
			while(++pos<4){
				var x=pos<=1?0:34,y=pos==0||pos==2?17:45,z=mask&0x2?140:280;
				ctx.drawImage(image,72+x,z+y,32,28,x,y,34,28);
				mask>>=4;
			}
		}

	}
	return function($img, mask,width,height) {
		var dataUrl = maskUrlCache[mask];
		if(!dataUrl) {
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			render(canvas.getContext('2d'), mask, width, height);
			dataUrl = canvas.toDataURL();
			maskUrlCache[mask] = dataUrl;
		}
		$img.prop('src', dataUrl);
	};
}])
.factory('util.escapeRegex', function() {
	return function(string) {
		return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	};
})
.factory('util.simpleHash', function() {
	return function(/*arg1, argN*/) {
		var ret = '', i = 0;
		for(; i < arguments.length; i++) {
			ret += '|' + arguments[i];
		}
		return ret;
	};
})
.factory('util.cowNr', function() {
	return function(data, cow, element) {
		var cowNr=cow.nr;
		if(cow.fetchCow)
			element.append($('<span></span>').text('#'));
		if(data.openGate[cowNr])
			element.append($('<span></span>').text('*'));
		element.append($('<span class="cow-nr"></span>').text(cowNr));
	};
})
.factory('util.hour', function() {
	return function(sec) {
		var t = Math.floor(sec / 60),
			n0=function(n) {return n < 10 ? '0' + n : n},
			nt=function(n){return n0(Math.floor(n / 60)) + ':' + n0(Math.floor(n % 60));};
		return t > 1440 ? t > 7200 ? "" : (Math.floor(t / 1440) + 'd ' + nt(Math.floor(t) % 1440)) : nt(t);
	};
})
.factory('util.timeDiff', ['util.hour',
	function(hour) {
		return function(now, millisec) {
			if (millisec) {
				var df = Math.round((now-millisec) / 1000);
				return df < 0 ? '-'+hour(-df) : hour(df);
			}
			return null;
		};
}])
.factory('util.convertToArray', function() {
	return function(object) {
		return $.map(object, function(value, key) {
			return {key: key, value: value};
		});
	};
})
.factory('drawSprite', ['resources', function(resources) {
	var image = resources.get('info8.png');
	var urlCache = {};
	return function($img, x, y, width, height, sx, sy, sw, sh) {
		var cacheKey = [x, y, width, height, sx, sy, sw, sh].join(',');
		var dataUrl = urlCache[cacheKey];
		if(!dataUrl) {
			var offscreenCanvas = document.createElement('canvas');
			offscreenCanvas.width = width;
			offscreenCanvas.height = height;
			offscreenCanvas.getContext('2d').drawImage(image, x, y, width, height, sx, sy, sw, sh);
			dataUrl = offscreenCanvas.toDataURL();
			urlCache[cacheKey] = dataUrl;

		}

		$img.prop('src', dataUrl);
	};
}])
.factory('util.renderHelth', ['cowq.getText', 'drawSprite',
	function(getText, drawSprite) {
		var blood = getText('blood_');
		var mdi = getText('mdi_');
		var cells = getText('cells_');
		function renderBMCarrow(element,v,pos){
			v=v>>pos;
			var gl=v&3;
			var lv=(v>>2)&3;
			if(lv) {
				var img = $('<img class="icon">').appendTo(element);
				drawSprite(img,38*(lv-1),445+38*gl,38,38,0,0,38,38)
			} else {
				$('<span class="icon"></span>').appendTo(element);
			}
		}
		return function(element, mask) {
			if(mask>>10){
				$('<span></span>').text(blood).appendTo(element);
				renderBMCarrow(element, mask, 10);
				$('<span></span>').text(mdi).appendTo(element);
				renderBMCarrow(element, mask, 14);
				$('<span></span>').text(cells).appendTo(element);
				renderBMCarrow(element, mask, 18);
			}
		};
}])
.factory('util.vcTimeDiff', [function() {
	var diff = 0;
	function get() {
		return diff;
	}
	get.set = function(newDiff) {
		diff = newDiff;
	}
	
	return get;
}])
.factory('util.getTime', ['util.vcTimeDiff', function(timeDiff) {
	return function() {
		//It's not certain that timeDiff will be initialized since the promise may not have loaded
		return Date.now() - timeDiff();
	};
}])
//http://stackoverflow.com/questions/10730362/get-cookie-by-name
.factory('getCookieByName', function() {
	return function(name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2) return parts.pop().split(";").shift();
	}
});
