jr.include( '/js/qalarms.js' );
jr.include( '/js/qchat.js' );
jr.include( '/js/qcan.js' );
jr.include( '/js/qcowq.js' );
jr.include( '/js/qtab.js' );
jr.include( '/4.css' );
jr.include( '/js/qutil.js' );
jr.include( '/Resources/info6.png' );
var farm = {
    init: function() {
		farm.texts = {
			farms:			jr.translate('Farms'),
			settings:		jr.translate('Settings'),
			mySettings:		jr.translate('My settings'),
			adminUsers:		jr.translate('Administrate users'),
			logout:			jr.translate('Logout'),
			version:		jr.translate('Version'),
			overview:		jr.translate('Overview'),
			clearAlarms:	jr.translate('Clear all Alarms'),
			sureClearAlarms:jr.translate('Clear all Alarms, are you sure?'),
			noPermission:	jr.translate("Sorry, you have no permission to view this farm")
		};
	},
	instance:	function(farmId, myDiv){
	var
		imgIcons=jr.getImage('/Resources/info6.png'),
		winAlarms,
		winCowqs,
		winCan,
		winChat,
		settings,
		firstRender=true,
		farms,
		farmOptGroupIndex,
		farmDiv,
		ce={},
		cookie=getSessCookie(),
		initFlag=0xf,
		onresize = function() {
			var newHeight = window.innerHeight - ( 130 );
			$( ce.slotContainer ).css( 'height', newHeight );
			winAlarms && winAlarms.resize();
			winCan && winCan.resize();
			winChat && winChat.resize();
			jr.foreach(winCowqs, function(o){o.resize();});
		},
		cowQueues=[],
		tabDiv,
		tabCanvas,
		allTabs,
		tabCmd = function(div) {
			tabCanvas = jr.ec('canvas',{parentNode:div});
			allTabs=new tabs(tabCanvas,imgIcons);
			allTabs.add(40, 949, 88, 949,	48, 40,	onFour);
			allTabs.add(104, 710, 104, 755, 31, 44,	function(){render( 'slot1' );});
			allTabs.add(90, 667, 70, 70,	45, 40,	function(){render( 'slot2' );});
			allTabs.add(60, 699, 60, 749,	37, 48,	function(){render( 'slot3' );});
			allTabs.add(1, 710, 1, 747,		51, 36,	function(){render( 'slot4' );});
			allTabs.select(0);
			tabs = allTabs;
		},
		ajaxError = function() {
			if(0==lastComStatus) {
				if(ce['comErr'].childNodes.length>0)
					ce['comErr'].removeChild(ce['comErr'].childNodes[0]);
				if((lastComStatus=1)){
					var canvas=
						jr.ec('canvas',{parentNode:ce['comErr'],className: 'comErr',width:70,height:53}),
						ctx=canvas.getContext("2d");
						ctx.drawImage(imgIcons,70,872,70,53,0,0,70,53);
				}
			}
		},
		chat = function(div) {
			var messages = jr.meInitData['m'];
			if (messages){
				if(messages.requestLog) {
					typeof window.android !='undefined' && typeof window.android.reportErrors == 'function' && window.android.reportErrors();
					jr.sendRequest('SrvUser.requestLog', {userId: messages.userId, active: false} );
				}
				winChat = new delavalChat.Chat( div, messages, ajaxError );
			}
		},
		alarms = function(div) {
			winAlarms = new delavalAlarms.Alarms( div, farmId, jr.meInitData['a'] );
			jr.touch.attachTouchScroll( div );
		},
		cowq = function(div,index) {
			cowQueues.push(new CowQueue( div, farmId, index ));
			jr.touch.attachTouchScroll( this );
		},
		can = function(div) {
			var canData = jr.meInitData['c'];
			if (canData) {
				winCan = new delavalCan.Can( div, canData, jr.meInitData['q'].perm );
				if(firstRender) {
					firstRender = false;
					typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
					// todo: remove phoneId when App 0.8.8 is history
					var phoneId = jr.getUrlVar('phoneId');
					if(phoneId != null && phoneId != "") {
						jr.sendRequest('SrvUser.setPhoneUser',phoneId);
					}
				}
			}
		},
		logoImageDisplayed=false,
		menu=[],
		farmIndexSelected=0,
		zoomedIn = false,
		zoomingIn = false,
		timer=null,
		lastContact=new Date(0),
		lastComStatus=0,	// Ok, 1=Warning, 2=Err
		zoomIn = function( ) {
			if(!isMobile)return false;
			var tab=parseInt(this.slot.charAt(this.slot.length-1));
			allTabs.select(tab);
			render(this.slot);
			return false;
		},
		render = function( v ) {
			location.hash = 'zoom';
			jr.foreach( ce.slotContainer.children, function( item ) {
				item.className = 'hidden';
			});
			element = ce[v].className = 'zoomed';
			zoomingIn = true;
			$(window).resize();
		},
		onFour=function(){
			ce.slot1.className = 'partsContainer4_1';
			ce.slot2.className = 'partsContainer4_2';
			ce.slot3.className = 'partsContainer4_3';
			ce.slot4.className = 'partsContainer4_4';
			if(isMobile){
				ce.slot01.className = 'partsContainer4_1';
				ce.slot02.className = 'partsContainer4_2';
				ce.slot03.className = 'partsContainer4_3';
				ce.slot04.className = 'partsContainer4_4';
			}
			zoomedIn = false;
			document.body.className = 'all';
			$(window).resize();
		},
		displayComInfo=function(data){
			lastContact=data?new Date(new Date().getTime()-data*1000):new Date(0);
			var nrSec=(new Date().getTime()-lastContact.getTime()) / 1000;
			var lev=nrSec>60?nrSec>180?2:1:0;
			if(lev!==lastComStatus) {
				if(ce['comErr'].childNodes.length>0)
					ce['comErr'].removeChild(ce['comErr'].childNodes[0]);
				if((lastComStatus=lev)){
				var canvas=
					jr.ec('canvas',{parentNode:ce['comErr'],className: 'comErr',width:70,height:53}),
					ctx=canvas.getContext("2d");
					ctx.drawImage(imgIcons,lev===1?70:0,872,70,53,0,0,70,53);
				}
			}
		},
		showImages=function(){
			var logoCanvas = jr.ec('canvas',{parentNode:ce['logo'], className: 'logo', width:120, height:23});
			var ctx=logoCanvas.getContext("2d");
			ctx.drawImage(imgIcons,1,925,120,23,0,0,120,23);
			var menuCanvas = jr.ec('canvas',{parentNode:ce['menuImage'], className: 'menuImage', width:38, height:40});
			ctx=menuCanvas.getContext("2d");
			ctx.drawImage(imgIcons,1,949,38,40,0,0,38,40);
		},
		agent=navigator.userAgent.toLowerCase(),
		isMobile=(agent.indexOf('android')>=0&&agent.indexOf('nexus 7')<0)||agent.indexOf('iphone')>=0,
		cssArr=[{ 'div': { contextIdentity: 'slot1', className: 'partsContainer4_1', children: function(div){can(div);}} },
				{ 'div': { contextIdentity: 'slot2', className: 'partsContainer4_2', children: function(div){chat(div);}} },
				{ 'div': { contextIdentity: 'slot3', className: 'partsContainer4_3', children: function(div){cowq(div,21);}}},
				{ 'div': { contextIdentity: 'slot4', className: 'partsContainer4_4', children: function(div){alarms(div);}} }],
		onSelectMenu=function(){
			var item=getMenuObject(this.selectedIndex);
			this.selectedIndex=-1;
			if(item.adm){
				if(window.confirm(farm.texts.sureClearAlarms))
					jr.sendRequest('SrvAlarms.clearAll',farmId);
			} else if (item.empty) {
				// do nothing!
			} else if(!item.cmd&&!item.id){	//logout
				logoutSessCookie();
				location.reload();
			} else if (item.cmd) {
				navigateTo(item.cmd);
			} else {
				cookie.farm=item.id;
				setSessCookie(cookie);
				if (typeof window.history.replaceState === 'function') {			
					window.history.replaceState({},"",window.location.pathname+'?id='+item.id);
				} else {
					window.location.replace=window.location.pathname+'?id='+item.id;
				}
				window.history.go(0);
			}
		},
		getMenuObject=function(index){
			var i=-1;
			for(var o in menu) {
				o=menu[o];
				if(o.optgroup) {
					for(var o2 in o.optgroup.data) {
						if(++i===index) {
							return o.optgroup.data[o2];
						}
					}
				} else {
					if(++i===index) {
						return o;
					}
				}
			}
		},
		getMenuLength=function(){
			var i=-1;
			for(var o in menu) {
				o=menu[o];
				if(o.optgroup) {
					for(var o2 in o.optgroup.data) {
						i++;
					}
				} else {
					i++;
				}
			}
			return i;
		},
		hide=function(){
			if(farmDiv)
				myDiv.removeChild(farmDiv);
			farmDiv=null;
		},
		sortMenu=function(o1,o2){return o1.name.localeCompare(o2.name);},
		getLastContact=function(){
			clearTimeout(timer);
			timer=setTimeout(getLastContact,60000);
		}

		this.show=function(){
			hide();
			farmDiv=jr.ec( myDiv, {children: {'div': { className: 'topDiv', children: [
				{ 'div': { className: 'topRow', children: [
					{ 'div': { contextIdentity: 'logo', className: 'logo'} },
					{ 'div': { className: 'farmName', children: [
						{ 'label': { contextIdentity: 'farmName' } }
					]} },
					{ 'div': { contextIdentity: 'menu', className: 'menu', children: [
						{ 'div': { contextIdentity: 'menuImage', className: 'menuImage'} },
						{ 'div': { contextIdentity: 'menuSelect', className: 'menuSelect'} }
					] } }
				] } },
				{ 'div': { className: 'tabs', children:  function(obj){tabDiv=obj;}} },
				{ 'div': { contextIdentity: 'comErr', className: 'comErrDiv' } },
				{ 'div': { className: 'partsContainer1', contextIdentity: 'slotContainer', children: cssArr } }
			] }}}, ce );
			winChat.show();
			if(cowQueues.length){
				var data = jr.meInitData['q'];
				if(data.error) {
					window.alert(data.errorMessage);
				} else {
					if(data.backgroundColor)
						document.body.style.backgroundColor=data.backgroundColor;
					farmId=data.vcId;
					data.myFarms.sort(sortMenu);
					farmIndexSelected=-1;
					menu=[];
					settings=[];
					farms=[];
					var isAndroidKitKat = navigator.userAgent.match('Android 4\.4.*Chrome/30.0.0.0') !== null;
					if(isAndroidKitKat) {
						settings = menu;
						farms = menu;
					}
					settings.push({name:farm.texts.mySettings,cmd:'/jr-myfarm.html?id='+farmId+'#/settings'});
					if(data.existsVersion && data.perm&0x00080000)
						settings.push({name:farm.texts.version,cmd:'/jr-myfarm.html?id='+farmId+'#/version'});
					if(data.perm&0x00000040 && !cookie.isApp)
						settings.push({name:farm.texts.adminUsers,cmd:'/Delaval/mvc/Pages/Show/domain'});
					if(data.perm&0x00004000)
						settings.push({name:farm.texts.clearAlarms,adm:1});
					settings.push({name:farm.texts.logout});
					if(isAndroidKitKat) {
						farms.push({name:'',empty:true});
					}
					if(data.overview) {
						farms.push({name:farm.texts.overview,cmd:'farms.html'});
					}
					jr.foreach(data.myFarms, function(o) {
						if(o.status!==0) {
							farms.push(o);
						}
					});
					if(!isAndroidKitKat) {
						menu.push( { optgroup: {name: farm.texts.settings.toUpperCase(), data: settings } } );
					}
					farmOptGroupIndex=menu.length;
					if(!isAndroidKitKat) {
						menu.push( { optgroup: {name: farm.texts.farms.toUpperCase(), data: farms } } );
					}
					l = getMenuLength();
					while(++farmIndexSelected<l&&getMenuObject(farmIndexSelected).id!==farmId);
					jr.ec(ce['menuSelect'], {children: [
						{'select': {contextIdentity: 'sel', className: 'menu', onchange: onSelectMenu, children: function(p){
							var i=-1;
							jr.foreach( menu, function(o) {
								if(o.optgroup) {
									jr.ec('optgroup', {parentNode:p, label:o.optgroup.name, children: function(p){
										jr.foreach(o.optgroup.data, function(o) {
											jr.ec('option', {parentNode:p, id:'menu'+i, text:o.name, selected:++i===farmIndexSelected, contextIdentity: 'menu'+i});
										}, ce);
									}});
								} else
									jr.ec('option', {parentNode:p, id:'menu'+i, text:o.name, selected:++i===farmIndexSelected, contextIdentity: 'menu'+i}, ce);
							} ); }}}
					]}, ce);
					$(ce['farmName']).text(getMenuObject(farmIndexSelected).name);
				}
			}
			else{
				if(farmId!=null || (jr.getUrlVar('redirect') == '1'))
					window.alert(farm.texts.noPermission);
				if(jr.getUrlVar('redirect') != '1') 
					window.location.href='farms.html?redirect=1';
//						myDiv.innerHTML=farm.texts.noPermission;
//						myDiv.style.background='rgb(255,0,0)';
//						myDiv.style.color='rgb(255,255,255)';
			};
			jr.eventManager.addListener('contactUpdate', 'contactUpdateOnce', function(data) {
				if(data){lastContact=new Date(new Date().getTime()-data*1000);}displayComInfo();});
		};
		this.hide=function(){hide();};
	    farm.init();
		$( window ).resize( onresize );
		winCowqs=cowQueues;
		if(isMobile){
			cssArr.push({ 'div': { contextIdentity: 'slot01', className: 'partsContainer4_1', slot: 'slot1', onclick: zoomIn } });
			cssArr.push({ 'div': { contextIdentity: 'slot02', className: 'partsContainer4_2', slot: 'slot2', onclick: zoomIn } });
			cssArr.push({ 'div': { contextIdentity: 'slot03', className: 'partsContainer4_3', slot: 'slot3', onclick: zoomIn } });
			cssArr.push({ 'div': { contextIdentity: 'slot04', className: 'partsContainer4_4', slot: 'slot4', onclick: zoomIn } });
		}
		window.onhashchange = function() {
			if( zoomingIn ) {
				zoomedIn = true;
				zoomingIn = false;
			}
			else if( zoomedIn )
				onFour();
		};
		this.show();
		jr.foreach(cowQueues, function(q){q.initData(jr.meInitData['q'],jr.meInitData['p']);});
		tabCmd(tabDiv);
		displayComInfo(jr.meInitData['l']);
		if(!logoImageDisplayed) {
			logoImageDisplayed=true;
			showImages();
		}
		onresize();
//		setInterval(function(){	// Shall be replaced when VC has WebSockets!!
//			jr.sendRequest( 'SrvFarm.getLastContact', jr.meId, function(data){displayComInfo()(data);} );
//		},60000);
	}
};
