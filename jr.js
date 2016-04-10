window.jr = {
	version: 0,
	rainbowColor: function(value,maxValue){
		var kvot;
		colVal=function(colCode){
			var pos=Math.floor(5*kvot),val=5*(kvot-pos/5);
			switch((colCode>>(10-(pos<<1)))&3){
				case 0:	return 0;
				case 1: return 255;
				case 2: return Math.floor(val*255);
				case 3: return Math.floor(255-val*255);
			}
		};
		kvot=value/maxValue;
		var r=colVal(1801),g=colVal(2416),b=colVal(151);
		return '#'+(r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16);
	},
	userSelectorInd:0,
	userSelector: function(myDiv,selectorDataArray,onCheck,onSelect,onHoover,onSelectDouble){
		var last,i=-1,arr=[],rVal,
			renderCheckbox=function(me,label,ind,isChecked){
				return {'div': {style:{cursor:'default', 'float':'left','white-space':'nowrap','font':'normal 12px Arial'}, children: [
					{'input':{id:'userSelector_'+me.myId+'_'+ind, __index:ind, __me:me, onchange:onChange, assignments:{type:'checkbox', checked:isChecked}}},
					{'span':{__index:ind, __me:me, onclick:onHelpChange, innerHTML:label+'&nbsp;'}}
				]}};
			},
			renderSelector=function(me,label,ind){
				return {'div': {__index:ind, __me:me, onmouseover:onToolTip, onmouseout:onToolTipOut, onclick:onSelectClick,style:{'float':'left','white-space':'nowrap','font':'normal 12px Arial','height':'12px'},children: [
					{'canvas':{id:'userSelector_'+me.myId+'_'+ind,width:12,height:12}},
					{'span':{style:{cursor:'default'}, innerHTML:label+'&nbsp;'}}
				]}};
			},
			onToolTip=function(){
				onHoover&&onHoover(parseInt(this.__index),1);
			},
			onToolTipOut=function(){
				onHoover&&onHoover(parseInt(this.__index),0);
			},
			onSelectClick=function(){
				var ind=parseInt(this.__index),me=this.__me,data=me.data[ind];
				if(me.timer){
					clearTimeout(me.timer);
					me.timer=0;
					onSelectDouble&&onSelectDouble(data.isChecked);
				}
				else{
					me.timer=setTimeout(function(){me.timer=0;}, 200);
					data.isChecked=!data.isChecked;
					onSelect&onSelect(ind,data.isChecked);
				}
				updateCanvas(data,ind,me.myId);
			},
			getNode=function(ind,myId){return document.getElementById('userSelector_'+myId+'_'+ind);},
			onHelpChange=function(){
				var ind=parseInt(this.__index),node=getNode(ind,this.__me.myId);
				node.checked=!node.checked;
				onChange(ind,this.__me);
			},
			onChange=function(ind,me){
				if(!me){
					me=this.__me;
					ind=parseInt(this.__index);
				}
				var data=me.data[ind];
				data.isChecked=getNode(ind,me.myId).checked;
				onCheck&&onCheck(ind,data.isChecked);
			},
			updateCanvas=function(o,ind,myId){
				var canvas=document.getElementById('userSelector_'+myId+'_'+ind),context=canvas.getContext('2d');
				context.clearRect(0,0,12,12);
				context.beginPath();
				context.arc(6,6,5,0,2*Math.PI,false);
				if(o.isChecked){
					context.fillStyle=o.color;
					context.fill();
				}
				context.lineWidth=2;
				context.strokeStyle=o.color;
				context.stroke();
			};
		while (last=myDiv.lastChild)
			myDiv.removeChild(last);
		this.data=selectorDataArray;
		this.timer=0;
		this.myId=++jr.userSelectorInd;
		i=-1;
		while(++i<selectorDataArray.length){
			var o=selectorDataArray[i];
			arr.push(o.color?renderSelector(this,o.label,i):renderCheckbox(this,o.label,i,o.isChecked));
		}
		rVal=jr.ec('table',{parentNode:myDiv,children:{'tr':{align:'center',children:[{'td':{width:'100px'}},{'td':{'align':'right',children:arr}}]}}});
		i=-1;
		while(++i<selectorDataArray.length){
			var o=selectorDataArray[i];
			if(o.color)
				updateCanvas(o,i,this.myId);
		};
		return rVal;
	},
	internal: {
		displaySystemMessages: false,
		methodQueue: new Array(),
		unincluded: 0,
		includeQueue: new Array(),
		includedFiles: new Array(),
		timeStamp: function() {
console.log('ver='+jr.version);
			return '?ver=' + jr.version },
		includeJs: function(url) {
			jr.internal.unincluded++;
			jr.displaySystemMessage('-&gt;&nbsp;including: ' + url + '...');
			jr.ec('script', {parentNode: document.getElementsByTagName("head")[0], assignments: {type: 'text/javascript', src: url + jr.internal.timeStamp(),
				onload: function () {if (!this.loaded) this.onLoad(this);this.loaded = true;},
				onreadystatechange: function () {if (this.readyState == 'complete' || this.readyState == 'loaded') this.onload();},
				onLoad: function () {
					jr.displaySystemMessage('&lt;-&nbsp;included: ' + this.src);
					jr.internal.unincluded--;
					jr.internal.includeComplete();
				}}} );
		},
		includeCss: function(url) {
			jr.displaySystemMessage('+&nbsp;&nbsp;including: ' + url);
			jr.ec('link', {parentNode: document.getElementsByTagName("head")[0], assignments: {type: 'text/css', rel: 'stylesheet', href: url + jr.internal.timeStamp()}});
		},
		includeComplete: function() {
			if( window.loaded && ( jr.internal.unincluded == 0 ) )
				while( jr.internal.methodQueue.length > 0 )
					jr.internal.methodQueue.shift()();
		},
		windowOnload: function() {
			window.loaded = true;
			window.onload = null;
			jr.foreach( jr.internal.includeQueue, function( url ) {jr.include( url );} );
			jr.internal.includeComplete();
		},
		translate: function( text, context ) {
			context.element[ context.property ] = text;
			jr.translations[ context.id ] = text;
		}
	},
	getResource: function(name) { return "/Delaval/Resources/" + name + jr.internal.timeStamp() },
	include: function (url) {
		if( window.loaded ) {
			if( !jr.internal.includedFiles[ url ] ) {
				jr.internal.includedFiles[url] = true;
				if( url.indexOf( '.css' ) > 0 ) {
					jr.internal.includeCss( url );
				} 
				else if( url.indexOf( '.js' ) > 0 ) {
					jr.internal.includeJs( url );
				}
			}
		} else {
			window.onload = jr.internal.windowOnload;
			jr.internal.includeQueue.push(url);
		}
	},
	init: function( func ) {
		jr.internal.methodQueue.push( func );
		if( window.loaded ) {
			jr.internal.includeComplete();
		}
		else {
			window.onload = jr.internal.windowOnload;
		}
	},
	getUrlVar: function( key ) {
		var result = new RegExp( '[&|\?]' + key + '=([^&]*)', 'i' ).exec( window.location.search ); 
		return result && unescape( result[1] ) || null; 
	},
	touch: {
		isTouchPrivate: null,
		isTouchDevice: function() {
			if( jr.touch.isTouchPrivate === null ) {
				try { document.createEvent( 'TouchEvent' );
					jr.touch.isTouchPrivate = true;
				} catch( e ) { 
					jr.touch.isTouchPrivate = false;
				}
			}
			return jr.touch.isTouchPrivate;
		},
		attachTouchScroll: function( element ) {
			if( jr.touch.isTouchDevice() ) {
				var scrollStartPos = 0;
				element.addEventListener( 'touchstart', function( event ) {
					scrollStartPos = this.scrollTop + event.touches[ 0 ].pageY;
					// event.preventDefault();
				}, false );
				element.addEventListener( 'touchmove', function( event ) {
					this.scrollTop = scrollStartPos - event.touches[ 0 ].pageY;
					// event.preventDefault();
				}, false);
			}
		}
	},
	CycledAction: function (instance, properties, cycles, wait, oncycle, oncomplete) {
		this.instance = instance;
		this.properties = properties;
		this.cycles = cycles ? cycles : 100;
		this.wait = wait ? wait : 10;
		this.oncycle = oncycle;
		this.oncomplete = oncomplete;
		this.steps = {};
		this.running = true;
		for (var prop in properties)
			if (typeof properties[prop] != 'function')
				this.steps[prop] = (this.instance[prop] - this.properties[prop]) / this.cycles;
			else
				this.steps[prop] = (this.properties[prop](this.instance[prop])) / this.cycles;
		this.recursive = function () {
			setTimeout(function (delayedAction) {
				return function () {
					delayedAction.cycles--;
					for (var prop in delayedAction.properties)
						if (typeof delayedAction.properties[prop] != 'function')
							delayedAction.instance[prop] -= delayedAction.steps[prop];
						else
							delayedAction.instance[prop] = delayedAction.properties[prop](delayedAction.instance[prop], delayedAction.steps[prop]);
					if (delayedAction.oncycle)
						delayedAction.oncycle(delayedAction.instance, cycles);
					if (delayedAction.cycles > 0 && delayedAction.running)
						delayedAction.recursive();
					else if (delayedAction.oncomplete)
						delayedAction.oncomplete(delayedAction.instance, delayedAction.properties);
				};
			} (this), this.wait);
		};
		this.recursive();
	},
	cycleAction: function (params) {
		return new jr.CycledAction(params.instance, params.properties, params.cycles, params.wait, params.oncycle, params.oncomplete);
	},
	SystemMessage: function (message) {
		if (jr.internal.displaySystemMessages && document.body) {
			if (!document.body.systemInfo)
				document.body.systemInfo = jr.ec('div', {parentNode: document.body, style: {fontFamily: 'monospace', fontSize: '12px', position: 'fixed', bottom: '10px', right: '10px', zIndex: 200000}});
			this.element = jr.ec('div', {parentNode: document.body.systemInfo, innerHTML: message, style: {marginTop: '2px', color: 'white', textAlign: 'left'}});
			this.value = 200;
			this.recursive = function() {
				setTimeout(function(fader) {
					return function() {
						fader.value -= 1;
						var fadeValue = Math.min(100, fader.value);
						jr.ec(fader.element, {style: {opacity: fadeValue / 100, filter: 'alpha(opacity=' + fadeValue + ')'}});
						if (fader.value > 0)
							fader.recursive();
						else
							jr.remove(fader.element);
					};
				}(this), 10);
			};
			this.recursive();
		}
	},
	displaySystemMessage: function (message) {
		return new jr.SystemMessage(message);	
	},
	css: {
		addClassName: function (element, className) {
			if (element.className.indexOf(className) < 0)
				element.className += (' ' + className);
		},
		removeClassName: function (element, className) {
			while (element.className.indexOf(' ' + className) >= 0)
				element.className = element.className.replace(' ' + className, '');
			while (element.className.indexOf(className) >= 0)
				element.className = element.className.replace(className, '');
		},
		setClass: function(selector, style) {
			if (!document.styleSheets) return;
			if (document.getElementsByTagName("head").length == 0) return;
			var styleSheet;
			var mediaType;
			if (document.styleSheets.length > 0) {
				for (i = 0; i < document.styleSheets.length; i++) {
					if (document.styleSheets[i].disabled) {
						continue;
					}
					var media = document.styleSheets[i].media;
					mediaType = typeof media;

					if (mediaType == "string") {
						if (media == "" || (media.indexOf("screen") != -1)) {
							styleSheet = document.styleSheets[i];
						}
					} else if (mediaType == "object") {
						if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
							styleSheet = document.styleSheets[i];
						}
					}

					if (typeof styleSheet != "undefined") {
						break;
					}
				}
			}

			if (typeof styleSheet == "undefined") {
				var styleSheetElement = document.createElement("style");
				styleSheetElement.type = "text/css";

				document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

				for (i = 0; i < document.styleSheets.length; i++) {
					if (document.styleSheets[i].disabled) {
						continue;
					}
					styleSheet = document.styleSheets[i];
				}

				var media = styleSheet.media;
				mediaType = typeof media;
			}

			if (mediaType == "string") {
				for (i = 0; i < styleSheet.rules.length; i++) {
					if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
						styleSheet.rules[i].style.cssText = style;
						return;
					}
				}

				styleSheet.addRule(selector, style);
			} else if (mediaType == "object") {
				for (i = 0; i < styleSheet.cssRules.length; i++) {
					if (styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
						styleSheet.cssRules[i].style.cssText = style;
						return;
					}
				}

				styleSheet.insertRule(selector + "{" + style + "}", 0);
			}
		}
	},
	foreach: function (array, action) {
		if (array && (array.length > 0))
			for (var i = 0; i < array.length; i++)
				action(array[i]);
	},
	remove: function (element) {
		var parentNode = element.parentNode;
		if (parentNode)
			parentNode.removeChild(element);
		return parentNode;
	},
	clearHTML: function (element) {
		element.innerHTML = '';
		return element;
	},
	clearContextElements: function (containersHolder) {
		for (var container in containersHolder)
			if (containersHolder[container].parentNode) {
				jr.remove(containersHolder[container]);
				containersHolder[container] = null;
			}
	},
	translate: function( text, params ) {
		if (jr.translations)
			if( jr.translations[ text ] )
				return jr.insertTranslationParams(jr.translations[ text ], params);
			else {
				jr.ajax('Translator', 'getTranslation', { id: text, pageName: jr.pageName });
				return jr.insertTranslationParams(text, params);
			}
		else
			return text;
	},
	insertTranslationParams: function( text, params ) {
		var notUsed = [];
		if(typeof params == 'object') {
			$.each(params, function(key,value) {
				if(text.indexOf(key) != -1) {
					text = text.replace('$'+key, value);
				} else {
					notUsed.push(key);
				}
			})
		}
		if(notUsed.length) {
			jr.ajax('Logger', 'log', { level: 'Info', module: 'Xlat', title: "Parameter not used in text: "+notUsed.join(),text: text},null,null,true);
		}
		var missing;
		if(missing = text.match(/\$([0-9a-zA-Z-_])+/g)) {
			jr.ajax('Logger', 'log', { level: 'Alarm', module: 'Xlat', title: "Parameter missing: "+missing.join(),text: text},null,null,true);
		}
		return text;
	},
	setNewTranslations: function(d){jr.translations=d;},
	ecActions: {
		add: function (actionIdentifier, action) {
			jr.ecActions[actionIdentifier] = action;
		},
		translate: function( context, parameters ) {
			for( var prop in parameters ) {
				if( jr.translations[ parameters[ prop ] ] )
					context.element[ prop ] = jr.translations[ parameters[ prop ] ];
				else {
					var request = {
						id: parameters[ prop ],
						pageName: jr.pageName
					};
					var contextData = {
						element: context.element,
						property: prop,
						id: parameters[ prop ]
					};
					jr.ajax('Translator', 'getTranslation', request, 'getTranslation', contextData)
				}
			}
		},
		attachContextElements: function (context, attach) {
			if (attach)
				context.element.contextElements = context.elements;
		},
		clearParent: function (context, clear) {
			if (clear)
				context.clearParent = true;
		},
		addListener: function (context, parameters) {
			if( parameters.length )
				for (var index in parameters)
					jr.ecActions.addListener(context, parameters[index]);
			else {
				if (parameters.eventManager)
					parameters.eventManager.addListener(parameters.typeName, context.element, parameters.method);
				else
					jr.eventManager.addListener(parameters.typeName, context.element, parameters.method);
			}
		}
	},
	ec: function (tagName, props, contextElements) {
		var element;
		if (typeof tagName == 'string') {
			if (props.parentNode && tagName.toLowerCase() == 'thead' && props.parentNode.createTHead)
				element = props.parentNode.createTHead();
			else if (props.parentNode && tagName.toLowerCase() == 'tfoot' && props.parentNode.createTFoot)
				element = props.parentNode.createTFoot();
			else if (props.parentNode && tagName.toLowerCase() == 'tbody' && props.parentNode.createTHead) {
				element = document.createElement('tbody');
				props.parentNode.appendChild(element);
			}
			else if (props.parentNode && tagName.toLowerCase() == 'col' && props.parentNode.createTHead) {
				element = document.createElement('col');
				props.parentNode.appendChild(element);
			}
			else if (props.parentNode && tagName.toLowerCase() == 'tr' && props.parentNode.insertRow)
				element = props.parentNode.insertRow(props.rowIndex > -1 ? props.rowIndex : -1);
			else if (props.parentNode && tagName.toLowerCase() == 'td' && props.parentNode.insertCell)
				element = props.parentNode.insertCell(props.cellIndex > -1 ? props.cellIndex : -1);
			else
				element = document.createElement(tagName);
		} else {
			element = tagName;
		}
		if (!contextElements)
			contextElements = {};
		var context = {element: element, parentElement: null, clearParent: false, elements: contextElements};
		var parentNode = null;
		var clearParent = false;
		if (props) {
			for (var prop in props) {
				switch (prop) {
					case 'contextIdentity':
						context.elements[props[prop]] = element;
						break;
					case 'assignments':
						for (var assignment in props[prop])
							element[assignment] = props[prop][assignment];
						break;
					case 'actions':
						for (var action in props[prop])
							jr.ecActions[action](context, props[prop][action]);
						break;
					case 'addToArray':
						props[prop].push(element);
						break;
					case 'children':
						var children = props[prop];
						if (typeof children == 'function') {
							children(element);
							continue;
						}
						if (typeof children == 'object' && !children.length) {
							children = [children];
						}
						children = children || [];
						for (var index in children) {
							var child = children[index];
							if (typeof child == 'function') {
								var elements = child(element);
								if (elements) {
									if (typeof elements == 'object' && !elements.length)
										elements = [elements];
									for (var i = 0; i < elements.length; i++)
										arguments.callee(elements[i], {parentNode: element}, context.elements);
								}
							} else {
								if( ( child.parentNode ) === null && child.tagName)
									element.appendChild( child );
								else {
									for (var childTag in child) {
										child[childTag].parentNode = element;
										arguments.callee(childTag, child[childTag], context.elements);
									}
								}
							}
						}
						break;
					case 'parentNode':
						context.parentNode = props[prop];
						break;
					default:
						if (props[prop] && typeof props[prop] == 'object' && !props[prop].tagName) {
							if (typeof element[prop] == 'undefined') {
								element[prop] = {};
							}
							arguments.callee(element[prop], props[prop], context.elements);
						} else {
							element[prop] = props[prop];
						}
						break;
				}
			}
		}
		if (context.parentNode && !(props.parentNode.insertRow || props.parentNode.insertCell)) {
			if (context.clearParent)
				jr.clearHTML(context.parentNode);
			context.parentNode.appendChild(element);
		}
		return element;
	},
	EventManager: function () {
		this.eventTypes = {};
		this.eventManagers = new Array();
		this.addListener = function (typeName, instance, method) {
			if (!this.eventTypes[typeName])
				this.eventTypes[typeName] = new Array();
			this.eventTypes[typeName].push({instance: instance, method: (typeof method == 'function') ? method : instance[method]});
		};
		this.removeListener = function (typeName, instance) {
			var listeners = this.eventTypes[typeName];
			this.eventTypes[typeName] = new Array();
			for (var i = 0; i < listeners.length; i++)
				if (listeners[i].instance != instance)
					this.eventTypes[typeName].push(listeners[i]);
		};
		this.raiseEvent = function (typeName, data, parameters) {
			if (this.eventTypes[typeName])
				for (var property in this.eventTypes[typeName])
					if (this.eventTypes[typeName][property])
						this.eventTypes[typeName][property].method.call(this.eventTypes[typeName][property].instance, data, parameters);
			for (var i = 0; i < this.eventManagers.length; i++)
				this.eventManagers[i].raiseEvent(typeName, data, parameters);
		};
		this.getEventManager = function () {
			var eventManager = new jr.EventManager();
			this.eventManagers.push(eventManager)
			return eventManager;
		};
		this.removeEventManager = function(eventManager) {
			var eventManagers = this.eventManagers;
			this.eventManagers = new Array();
			for (var i = 0; i < eventManagers.length; i++)
				if (eventManagers[i] != eventManager)
					this.eventManagers.push(eventManagers[i]);
		};
	},
	ajax: function (controller, method, parameters, eventType, eventParameters, hideError, errorFunc) {
		new jr.AjaxCaller().invoke(controller, method, parameters, eventType, eventParameters, hideError, errorFunc);
	},
	AjaxCaller: function () {
		this.invoke = function(controller, method, parameters, eventType, eventParameters, hideError, errorFunc) {
			var ajaxCall = {
				type: 'post',
				contentType: "application/json; charset=utf-8",
				url: '/Delaval/mvc/'+controller+'/'+method+'?i=' + new Date().getTime(),
				data: parameters == null ? JSON.stringify({ }) : JSON.stringify(parameters),
				dataType: "json",
				cache: false,
				success: function(data) {
					jr.eventManager.raiseEvent(eventType ? eventType : ( controller + '/' + method ), data, eventParameters);
				},
				error: function(XMLHttpRequest, txtStatus, errorThrown) {
					if(typeof errorFunc == 'function') {
						errorFunc(errorThrown);
					} else if(!hideError && ( method != 'waitEvent' ))
						alert('ERROR!\nController: ' + controller + "\nMethod:" + method + '\nParameters: ' + parameters + '\nMessage:\n' + errorThrown);
				}
			};
			jQuery.ajax(ajaxCall);
		};
	},	
	ajaxCallback: function( controller, method, parameters, callback, context, errorMethod, dataType ) {
	  return new jr.AjaxCallback().invoke( controller, method, parameters, callback, context, errorMethod, dataType );
	},
	AjaxCallback: function () {
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
				error: function(XMLHttpRequest, txtStatus, errorThrown) {
					if ( errorMethod )
						errorMethod.call( context ? context : this, data );
					else if(!hideError && ( method != 'waitEvent' ) )
						alert('ERROR CALLBACK!\nController: ' + controller + "\nMethod:" + method + '\nParameters: ' + parameters + '\nMessage:\n' + errorThrown);
				}
			};
			jQuery.ajax(ajaxCall);
		};
	},
	sendRequest: function(javaClassMethod,request,confirmMethod,errorMethod,dataType) {
		var controller = javaClassMethod.split('.');
		jr.ajaxCallback(controller[0],controller[1],request,confirmMethod, null, errorMethod, dataType);
	}
};
if( typeof $ == 'undefined' ) jr.include( '/jquery-1.12.0.min.js' );
jr.eventManager = new jr.EventManager();
jr.eventManager.addListener( 'getTranslation', jr.translations, jr.internal.translate );
if( document.title.indexOf( 'jrLoad:' ) === 0 )
	jr.include( document.title.replace( 'jrLoad:', '' ) );
jr.init( function() {
	$.ajaxSetup( { cache: false } );
} );
