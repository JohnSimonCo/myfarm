'use strict';

(function() {

window.jr = {};

jr.storage = localStorage && localStorage.myFarm && JSON.parse(localStorage.myFarm) || {};

jr.version = jr.storage.version || Math.random();

jr.loginPage = '/jr-myfarm/login/index.html';		//'/Delaval/mvc/Pages/Show/login';

function versionUrl(url) {
	return url + '?ver=' + (jr.version||window.thisVer);
}

var allIncluded;
(function() {
	var head = $('head')[0],
		cache = {},
		requested = 0,
		included = 0,
		includeDeferred = $.Deferred(),
		response = {},
		loaded = function(name, value) {
			if(name) response[name] = value;
			if(++included === requested) {
				includeDeferred.resolve(response);
			}
		},
		includeJs = function(url) {
			++requested;
			var script = document.createElement('script');
			script.onload = function() {
				loaded();
			};
			script.onreadystatechange = function() {
				if(this.readyState === 'complete' || this.readyState === 'loaded') {
					loaded();
				}
			};
			script.type = "text/javascript";
			script.src = url;
			head.appendChild(script);
		},
		includeCss = function(url) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;
			head.appendChild(link);
		},
		includeImage = function(url) {
			++requested;
			var image = new Image();
			image.onload = function() {
				loaded(url.match(/\/(\w+\.\w+)(\?.*)?$/)[1], image); // Match the file name and remove path and search (ex /some/path/resource.png?search=true becomes resource.png)
			};
			image.src = url;
		};

	allIncluded = includeDeferred.promise();

	jr.include = function(url) {
		if(cache[url]) return;

		var method;
		if(/\.js$/i.test(url)) method = includeJs;
		else if(/\.css$/i.test(url)) method = includeCss;
		else if(/\.(jpg|jpeg|png|gif)$/i.test(url)) method = includeImage;

		cache[url] = method(versionUrl(url));
	};
})();

var initialDataLoaded;
(function() {
	var broadcastMap = {},
		initialDeferred = $.Deferred(),
		broadcastId = 0,
		callbackForLatest = 0,
		connectionError = 0,
		broadcastErrorCallback = 0,
		broadcastThread = null;

	initialDataLoaded = initialDeferred.promise();

	var ajaxCallback = function( controller, method, parameters, callback, context, errorMethod, dataType ) {
	  return new AjaxCallback().invoke( controller, method, parameters, callback, context, !!errorMethod, errorMethod, dataType );
	};
	var AjaxCallback = function () {
		this.invoke = function( controller, method, parameters, callback, context, hideError, errorMethod, dataType ) {
			var ajaxCall = {
				type: 'post',
				contentType: "application/json; charset=utf-8",
				url: '/Delaval/mvc/'+controller+'/'+method,
				data: parameters == null ? JSON.stringify({ }) : JSON.stringify(parameters),
				dataType: dataType ? dataType : "json",
				cache: false,
				success: function(data) {
				  if( callback )
					callback.call( context ? context : this, data );
				},
				error: function(XMLHttpRequest, txtStatus, data) {
					if ( errorMethod )
						errorMethod.call( context ? context : this, data );
					// else if(!hideError && ( method !== 'waitEvent' ) )
					// 	alert('ERROR CALLBACK!\nController: ' + controller + "\nMethod:" + method + '\nParameters: ' + parameters + '\nMessage:\n');
				}
			};
			return jQuery.ajax(ajaxCall);
		};
	};
	var broadcastError = function(){
		var bm=broadcastMap;
//		jr.broadcastMap={};
		broadcastId=0;
		broadcastThread!==null&&clearTimeout(broadcastThread);
		broadcastThread=null;
		broadcastErrorCallback && broadcastErrorCallback();
		if (!connectionError)
			for(var obj in bm)
				for(var id in bm[obj])
					bm[obj][id].error&&bm[obj][id].error();
		connectionError = true;
		broadcastThread=setTimeout(broadcastTryAgain,5000);
//console.log('Try again to setup broadcast again in 5 sec...');
	};
	var broadcastTryAgain = function() {
//console.log('Try again...');
		broadcastThread=null;
		var bm=broadcastMap;
		broadcastMap={};
		for(var obj in bm)
			for(var id in bm[obj])
				jr.onBroadcast(id,obj,bm[obj][id].callback,bm[obj][id].error);
	};
	var broadcastLoop = function(){
//console.log('Send poll to server...');
		ajaxCallback('SrvLongPoll','poll',broadcastId,function(data){
			broadcastThread=null;
			if(data){
				if (connectionError) {
					var bm=broadcastMap;
					for(var obj in bm)
						for(var id in bm[obj])
							bm[obj][id].error&&bm[obj][id].callback();
					connectionError = false;
				}
				var sd=new jr.JsSerilz('$',data);
				while (sd.hasMore()) {
					var vcId=sd.getString(),func=sd.getString();
					if (isNaN(func)) {
						var msgLen=sd.getInt(),pos=sd.getPos(),msg=data.substr(pos,msgLen);
						sd.setPos(pos+msgLen);
						if(broadcastMap[func]){
							var cb=broadcastMap[func][vcId];
							if(cb){
								try{
									cb.callback(JSON.parse(msg));
								}
								catch(e){
									console.log('Failed to callback from event. vcId '+vcId+" Function "+func);
								}
							}
						}
					}
					else if (callbackForLatest)
						callbackForLatest(vcId, func);
				}
			}
			broadcastThread=setTimeout(broadcastLoop,1000);
		},null,broadcastError);
	};
	jr.onBroadcastCancel = function() {
		ajaxCallback('SrvLongPoll','broadcastCancel',broadcastId);
	};
	jr.onLatest = function(callbackLatest) {
		callbackForLatest = callbackLatest;
	},
	jr.onBroadcastError = function(callbackFkn) {
		broadcastErrorCallback = callbackFkn;
	},
	jr.onBroadcast = function(vcId, functionType, callback, errorCallback ) {
		if(!broadcastId)
			broadcastId=Math.floor(Math.random()*0x1000000).toString()+new Date().getTime();
		if(!broadcastMap[functionType])
			broadcastMap[functionType]={};
		broadcastMap[functionType][vcId]={callback:callback,error:errorCallback};
		ajaxCallback('SrvLongPoll','broadcast',broadcastId+','+vcId+','+functionType,null,null,function(){});
		if(!broadcastThread)
			broadcastThread=setTimeout(broadcastLoop,1000);
	};
	jr.JsSerilz = function(delimiter, data){
		var escapeChar = '\\',
			index = 0,
			nextEscape;
		if(data) {
			if((nextEscape = data.indexOf(escapeChar)) < 0) nextEscape = data.length + 1;
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
		this.getFloat = function () {
			return parseFloat(this.getString());
		};
		this.getDateHex = function () {
			var d = this.getString();
			return d === null ? null : parseInt(d, 16) * 1000;
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

	jr.sendRequest = function(javaClassMethod,request,confirmMethod,errorMethod,dataType) {
		var controller = javaClassMethod.split('.');
		ajaxCallback(controller[0],controller[1],request,confirmMethod, null, errorMethod, dataType);
	};
	jr.sendRequest('SrvLanguage.initPageData', window.location.pathname, function(message){
		initialDeferred.resolve(message);
	});
})();

initialDataLoaded.done(function(data) {
	if(data){
console.log('*** initialDataLoaded:',data);
		jr.translations = data.pageText;
		if(jr.version !== data.version) {
			jr.storage.version = data.version;
			localStorage.myFarm = JSON.stringify(jr.storage);
			location.reload();
		}
	}
	else{
console.log('*** When initialDataLoaded!!');
		location.href = jr.loginPage + '#/?redirect=' + encodeURIComponent(location.href);
	}
});

allIncluded.done(function(data) {
	jr.resources = data;
});

jr.bootstrap = function(url, modules) {
	return $.get(versionUrl(url)).then(function(html) {
		$.when(initialDataLoaded, allIncluded).then(function() {
			$('body').html(html);
			angular.bootstrap(document, modules);
			typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
		});
	});
};

})();