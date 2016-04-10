if(typeof JsSerilz == 'undefined') {
	function JsSerilz(delimiter, data) {
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
			return parseInt(this.getString(), 10)
		};
		this.getRest = function () {
			return data.substring(index, data.length)
		};
		this.reset = function () {
			index = 0
		};
		this.hasMore = function () {
			if(data == null) return null;
			return index < data.length
		};
		this.getData = function () {
			return this.d
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
	}

	function toa(cmd) {
		if(typeof toat == 'undefined') toat = urlParams()['t'];
		if(toat != null) {
			if(typeof toaq == 'undefined') toaq = [];
			if(cmd != null) {
				toaq.push(cmd);
				if(toaq.length == 1) window.location = 'toa:;' + cmd;
			}
		}
	}

	function gotit() {
		toaq.shift();
		if(toaq.length > 0) window.location = 'toa:;' + toaq[0];
	}

	function urlParams() {
		var rVal = {};
		try {
			var url = document.location.href,
				i = url.indexOf('?');
			if(i > 0) {
				url = url.substr(i + 1).split('&');
				i = -1;
				while(++i < url.length) {
					var ss = url[i].split('=');
					rVal[ss[0]] = ss[1];
				}
			}
		} catch(err) {
			rVal = {};
		}
		return rVal;
	}

	function navigateTo(url) {
		if(typeof toat == 'undefined') toat = null;
		window.location = url + (toat == null ? '' : (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + toat)
	}

	function getBodyContent(container) {
		var rv = [];
		while(container.firstChild) {
			rv.push(container.firstChild);
			container.removeChild(container.firstChild);
		}
		return rv;
	}

	function hr(n) {
		var t = Math.floor(n / 60);
		return t > 1440 ? t > 7200 ? "" : (Math.floor(t / 1440) + 'd ' + nt(Math.floor(t) % 1440)) : nt(t)
	}

	function n0(n) {
		return n < 10 ? '0' + n : n
	}

	function n3(n) {
		return n < 100 ? '0' + n0(n) : n
	}

	function nt(n) {
		return n0(Math.floor(n / 60)) + ':' + n0(Math.floor(n % 60))
	}

	function replaceInner(ctrl, content) {
		if(document.all) ctrl.innerHTML = content;
		else if(document.getElementById) {
			var rng = document.createRange();
			rng.setStartBefore(ctrl);
			var htmlFrag = rng.createContextualFragment(content);
			while(ctrl.hasChildNodes()) ctrl.removeChild(ctrl.lastChild);
			ctrl.appendChild(htmlFrag);
		}
	}
}
if(typeof xmlhttp == 'undefined') {
	var xmlhttp = false;
	var ajaxfkn;

	function ajax(param, fkn) {
		ajaxfkn = fkn;
		if(!xmlhttp) try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(E) {
				xmlhttp = false;
			}
		}
		if(!xmlhttp && typeof XMLHttpRequest != 'undefined') xmlhttp = new XMLHttpRequest();
		if(xmlhttp) {
			var deli = document.URL.indexOf('?') >= 0 ? '&' : '?';
			xmlhttp.open("GET", document.URL + deli + param, true);
			xmlhttp.onreadystatechange = ajaxCallback;
			xmlhttp.send(null);
		}
		return typeof (xmlhttp) == 'object';
	}

	function ajaxCallback() {
		if((xmlhttp.readyState == 4) && (xmlhttp.status == 200))
			if(typeof (ajaxfkn) == 'string') {
				var a = ajaxfkn + "('" + xmlhttp.responseText.replace(/\u0027/g, "&#39;").replace(/\u0022/g, "&#34;") + "');";
				eval(a);
			} else ajaxfkn(xmlhttp.responseText);
	}
	Date.prototype.tmf = "d/m/y H:M";
	Date.prototype.print = function () {
		var o = "",
			i = -1,
			tmf = this.tmf;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.dbgf = "H:M:S:T";
	Date.prototype.printd = function () {
		var o = "",
			i = -1,
			tmf = this.dbgf;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.iso = "y-m-d H:M:S";
	Date.prototype.printiso = function () {
		var o = "",
			i = -1,
			tmf = this.iso;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.isom = "y-m-d H:M";
	Date.prototype.printisom = function () {
		var o = "",
			i = -1,
			tmf = this.isom;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.hms = "H:M:S";
	Date.prototype.printhms = function () {
		var o = "",
			i = -1,
			tmf = this.hms;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.datum = "y-m-d";
	Date.prototype.printdate = function () {
		var o = "",
			i = -1,
			tmf = this.datum;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	Date.prototype.tmhm = "H:M";
	Date.prototype.printhm = function () {
		var o = "",
			i = -1,
			tmf = this.tmhm;
		while(++i < tmf.length) switch(tmf[i]) {
		case 'y':
			o += this.getFullYear();
			break;
		case 'm':
			o += n0(this.getMonth() + 1);
			break;
		case 'd':
			o += n0(this.getDate());
			break;
		case 'H':
			o += n0(this.getHours());
			break;
		case 'M':
			o += n0(this.getMinutes());
			break;
		case 'S':
			o += n0(this.getSeconds());
			break;
		case 'T':
			o += n3(this.getMilliseconds());
			break;
		default:
			o += tmf[i];
		}
		return o;
	}
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	}

	function getCookie(cn) {
		var i = -1,
			cc = document.cookie,
			d = null;
		if(cc != null) {
			cc = cc.split(";");
			while(++i < cc.length)
				if(cc[i].substr(0, cc[i].indexOf("=")).replace(/^\s+|\s+$/g, "") == cn) {
					return unescape(cc[i].substr(cc[i].indexOf("=") + 1));
				}
		}
		return null
	}
	var cookieName = '__VcAppSession';

	function getSessCookie() {
		var d = new JsSerilz('$', getCookie(cookieName));
		return d.hasMore() ? {
			session: d.getString(),
			lcid: d.getString(),
			email: d.getString(),
			pwd: d.getString(),
			isApp: d.getInt(),
			farm: d.getString(),
			profile: d.getString()
		} : {
			email: ''
		}
	}

	function setCookie(c_name, value, exdays, doNotEsc) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = (doNotEsc ? value : escape(value)) + ((exdays == null) ? "" : ";path=/;expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	};

	function setSessCookie(cookie) {
		var d = new JsSerilz('$');
		d.serialize(cookie.session, cookie.lcid, cookie.email, cookie.pwd, cookie.isApp, cookie.farm, cookie.profile ? escape(cookie.profile) : '');
		setCookie(cookieName, d.getData(), 120, true)
	}

	function logoutSessCookie() {
		var c = getSessCookie();
		setSessCookie({
			lcid: c.lcid,
			isApp: c.isApp
		})
	}

	function sortObject(obj, labelKey, labelValue) {
		if(typeof obj !== 'object')
			return obj;
		var array = [];
		for(var key in obj) {
			var o = {};
			o[labelKey] = key;
			o[labelValue] = sortObject(obj[key], labelKey, labelValue);
			array.push(o);
		}
		return array.sort(function (a, b) {
			return a[labelKey].localeCompare(b[labelKey]);
		});
	};

	function initDialog(div, heading, buttons, content) {
		var btns = [];
		if(heading) btns.push(heading);
		var i = -1;
		while(++i < buttons.length) {
			btns.push({
				span: {
					children: [{
						'input': {
							assignments: {
								id: i >> 1,
								onclick: buttons[i + 1],
								type: 'button',
								className: 'button',
								value: buttons[i++]
							}
						}
					}, {
						'div': {
							className: 'betweenSpace',
							innerHTML: ' '
						}
					}]
				}
			});
		}
		var background,
			dlg = jr.ec('div', {
				parentNode: div,
				children: [{
					div: {
						children: {
							'div': {
								parentNode: div,
								className: 'styleBackground',
								children: function (ip) {
									background = jr.ec('div', {
										parentNode: ip,
										className: 'background'
									})
								}
							}
						}
					}
				}]
			});
		jr.ec('div', {
			parentNode: background,
			className: 'top',
			children: btns
		});
		if(content) jr.ec('div', {
			className: 'styleDialog',
			parentNode: background,
			children: {
				div: {
					className: 'dialogTable',
					children: content
				}
			}
		});
		return dlg;
	};

	function optionButton(label, className) {
		return jr.ec('table', {
			'width': '100%',
			'height': '100%',
			style: {
				'background-color': 'red'
			},
			children: [{
					'tr': {
						'height': '100%',
						children: {
							'td': {
								'height': '100%',
								children: {
									'table': {
										'border': '1',
										'height': '100%',
										'width': '100%',
										'cellpadding': '4%',
										children: {
											'tr': {
												'height': '100%',
												children: [{
													'td': {
														'height': '100%',
														innerHTML: label
													}
												}, {
													'td': {
														'height': '100%',
														style: {
															'text-align': 'right'
														},
														innerHTML: 'pilar'
													}
												}, ]
											}
										}
									}
								}
							}
						}
					}
				},

			]
		});
	}

	function checkPassword(password) {
		var problems = [];

		if(password.length < 6) problems.push(jr.translate('at least 6 char'));

		var types = 0;

		types += /[A-Z]/.test(password) ? 1 : 0;
		types += /[a-z]/.test(password) ? 1 : 0;
		types += /\d/.test(password) ? 1 : 0;
		types += /[^A-Za-z\d\s]/.test(password) ? 1 : 0;

		if(types < 2) problems.push(jr.translate('use upper/lower/numbers/others'));

		if(/\s+/.test(password)) problems.push(jr.translate('must not contain spaces'));
	
		return problems;
	}
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
	var sessionCookie = getSessCookie();
	if(!isChrome && !isSafari && !sessionCookie.isApp && window.location.pathname.match("login") && jr.getUrlVar("app") != 1) {
		$(window).ready(function () {
			setTimeout(function () {
				if($('.browser_warning').length < 1) {
					var div;
					try {
						div = document.childNodes[1].childNodes[1].childNodes[0];
					} catch(err) {}
					if(div) {
						var text = 'This is not a supported browser, <br> please use Chrome or Safari!';
						try {
							text = jr.translate('This is not a supported browser, $br please use Chrome or Safari!', {
								br: '<br>'
							});
						} catch(err) {}
						$("<div class=\"browser_warning\">" + text + "</div>").insertBefore(div)
						$('.browser_warning').css({
								position: 'fixed',
								left: '30%',
								right: '30%',
								background: 'rgb(255,255,224)',
								'background-image': '-webkit-gradient(linear,0 0,0 100%,from(rgba(255,255,224,.6)),to(rgba(168,168,50,.6)))',
								'z-index': 100,
								padding: '7px',
								width: '40%',
								'text-align': 'center',
								'border-radius': '6px',
								border: '1px solid rgba(0,0,0,.6)',
								'font-weight': 'bold',
								'font-family': 'Verdana',
								'font-size': '30px',
								color: 'rgb(255,0,0)'
							})
							.on('click', function () {
								$('.browser_warning').hide()
							});
					}
				}
			}, 1000);
		});
	}
}