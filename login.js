jr.include('/cli.css');
jr.include( '/util.js' );
jr.include( '/buttons.css' );
jr.include( '/login.css' );
function login() {
	var
	url = jr.getUrlVar( 'url' ),
	// todo: remove phoneId when App 0.8.8 is history
	phoneId = jr.getUrlVar( 'phoneId' ),
	checkAll=['email','pwd'],
	colon=jr.translate(':'),
	ce={},
	firstRender = true,
	languages=[],
	servers=[],
	dynamic,
	dynInner,
	okServers,
	serversAnswer,
	formData,
	tim=null,
	checkCR = function(ev) {
		var key;
		if(typeof ev=="undefined")ev=window.event;key=document.layers?ev.which:ev.keyCode;
		if(key==13)
			if(checkOk(true))
				getSeed();
			else
				switch(ev.target){
					case ce['email']:
						ce['pwd'].focus();
						break;
					case ce['pwd']:
						getSeed();
						break;
				}
		else
			setLoginAttr();
	},
	setLoginAttr = function() {
		if(checkOk(false)) {
			$(ce['lgin']).attr("disabled", null);
		} else {
			$(ce['lgin']).attr("disabled", "disabled");
		}
	},
	chooseServer=function(server) {
		while(document.body.childNodes.length)document.body.removeChild(document.body.childNodes[0]);
		if (server) {
			if (server.seed.length >= 36) {
//				window.location.href=server.server.url+"/seed.vcx?usr=" + ce['email'].value + '&id=' + server.pwd + '&url=' + encodeURIComponent(url);

				var serverCall = server.server.url+'/seed.vcx';
				$.ajax({
					type: 'POST',
					url: serverCall,
					data: JSON.stringify({
						usr:	ce['email'].value,
						id:		server.pwd,
						url:	1
					}),
					xhrFields: {
						withCredentials: true
					},
					success: function(response) {
						try {
							var answer = JSON.parse(response);
							if (answer.success)
								window.location.href=server.server.url+(url?url:'');
							else
								render();
						}
						catch (e) {
							render();
						}
					},
					error: function(xhr) {
						render();
					}
				})
			}
			else 
				window.location.href=server.server.url+(url?url:'');
			return;
		}
		render();
	},
	seedDone=function() {
		switch (okServers.length) {
			case 0:
				msg(jr.translate('Login failed'), false, 20);
				break;
			case 1:
				chooseServer(okServers[0]);
				break;
			default:
				var pp=[];
				pp.push({tr:{children:[{td:{align:'center',children:{'div': {className:'styleRole', innerHTML:jr.translate('Select server')}}}}]}});
				okServers.forEach(function(o){
					pp.push({tr:{children:[{td:{align:'center',children:{'input':{style:{width:'100%','font-size':'x-large','color':'#000000','font-weight':'bold'},type:'button',value:jr.translate(o.server.name),onclick:function(){chooseServer(o);}}}}}]}});
				});
				pp.push({tr:{children:[{td:{align:'center',children:{'div': {className:'styleRole', innerHTML:'&nbsp;'}}}}]}});
				pp.push({tr:{children:[{td:{align:'center',children:{'input':{style:{width:'100%','font-size':'x-large','color':'#000000','font-weight':'bold'},type:'button',value:jr.translate('Cancel'),onclick:function(){chooseServer();}}}}}]}});
				while(document.body.childNodes[0])document.body.removeChild(document.body.childNodes[0]);
				var dynDivs={};
				dynamic=jr.ec('div',{style:{'z-index':10},parentNode:document.body,className:'dynamicDiv',
									children:{table:{className:'dialogTable',children:{tr:{children:{td:{children:{div:{contextIdentity:'inner',className:'dynamicDivContent'}}}}}}}}},dynDivs);
				dynInner=dynDivs.inner;
				showDynTbl(pp,dynInner);
				showDynamic(true);
				var parentWidth =	$(document.body).width();
				var parentHeight =	$(document.body).height();
				var elementWidth =	$(dynInner).width();
				var elementHeight =	$(dynInner).height();
				clearDynPos(parentWidth/2 - elementWidth/2, parentHeight/2 - elementHeight/2);
				break;
		}
	},
	isPresent=function(o) {
		var pwd = gethashcode(o.seed+ce['pwd'].value), serverCall = o.server.url+'/seed.vcx';
		$.post(serverCall, JSON.stringify({
			usr:	ce['email'].value,
			id:		pwd
		}), function(response) {
			if (response==='ok') {
				o.pwd = pwd;
				okServers.push(o);
			}
			!--serversAnswer && seedDone();
		})
		.fail(function(error) {
			!--serversAnswer && seedDone();
		});
	},
	getSeed = function() {
		if(checkOk(true)) {
			if (servers.length) {
				var i = -1,
					tryLogin = function(server) {
						var serverCall = server.url+'/seed.vcx';
						try {
							$.ajax({
								type: 'POST',
								data: JSON.stringify({
									usr:	ce['email'].value
								}),
								url: serverCall,
								success: function(response) {
									var o = {server:server,seed:response};
									if (response === 'ok') {
										o.ok = 1;
										okServers.push(o);
										!--serversAnswer && seedDone();
									}
									else if (response === 'not existent')
										!--serversAnswer && seedDone();
									else
										isPresent(o);
								},
								error: function(xhr) {
									!--serversAnswer && seedDone();
								}
							});
						}
						catch(e) {
							!--serversAnswer && seedDone();
						}
					};
				serversAnswer = servers.length;
				okServers=[];
				while (++i < servers.length)
					tryLogin(servers[i]);
			}
			else
				jr.ajax('Users','seed',ce['email'].value,'tryToLogin');
		}
		else
			setLoginAttr();
	},
	clearDynPos=function(left,top){
		var stl = dynamic.style;
		var y = top ? top : window.pageYOffset+10;
		var x = left ? left : 10;
		stl.left = ""+x+"px";
		stl.top = ""+y+"px";
	},
	setDynPos=	function(){
		var stl = dynamic.style;
		var tbl = dynamic.childNodes[0];
		var y = 21+window.event.clientY+window.pageYOffset;
		var x = window.event.clientX-tbl.clientWidth/2;
		if(y+tbl.clientHeight>window.innerHeight+window.pageYOffset){
			y=window.event.clientY-tbl.clientHeight-10+window.pageYOffset;
			if(y<0){
				y=0;
				x=window.event.clientX;
				if(y+tbl.clientHeight>window.event.clientY){
					x=window.event.clientX-tbl.clientWidth-10;
					y=window.event.clientY-tbl.clientHeight/2;
					if(y<0)y=0;
				}
			}
		}
		if(x+tbl.clientWidth>window.innerWidth-3)x=window.innerWidth-tbl.clientWidth-3;
		if(x<0)x=0;
		stl.left = ""+x+"px";
		stl.top = ""+y+"px";
		showDynamic(true);
	},
	showDynTbl=	function(d,parent,style){
		var rVal=null;
		if(parent)
			if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.childNodes[0]);
		rVal=jr.ec('table',{border:style?1:0,style:style,className:'tblOrd',children:[{tr:{children:[{td:{styele:{padding:0},align:'center',children:[{div:{children:d}}]}}]}}]});
		if(parent)
			parent.appendChild(rVal);
		setDynPos();
		return rVal;
	},
	showDynamic=function(show){if(!show){infoLabel='';};dynamic.style.visibility=show?"visible":"hidden";},
	getFormData=function(){
		formData.email=ce['email'].value;
	},
	tryToLogin = function(seed){
		if(seed&&seed.length>1){
			formData.session='';
			formData.pwd=gethashcode(seed+ce['pwd'].value);
			formData.email=ce['email'].value;
			setSessCookie(formData);
			loginParam={};
			if(!(navigator.platform.match(/mac/i) || 
				 navigator.platform.match(/win/i) || 
				 navigator.platform.match(/unix/i) || 
				 (navigator.platform.match(/linux/i) && !navigator.platform.match(/arm|mips/i))))
				loginParam={isMobile:true,isIOS:(navigator.platform.match(/iphone|ipad/i)!=null)};
			if(typeof window.android !='undefined' && typeof window.android.getPhoneId == 'function') { 
				loginParam.phoneId=window.android.getPhoneId();
			}
			jr.ajax('Users','login',loginParam,'login',null,null,function(){msg(jr.translate('Login failed'), false, 20)});
		}
		else
			msg(jr.translate('Login failed'), false, 20);
	},
	login = function(redir){
		if(redir)
			if (typeof redir === 'string')
				// todo: remove phoneId when App 0.8.8 is history
				window.location.href=url?phoneId?url+'?phoneId='+phoneId:url:redir;
			else {
				msg(jr.translate('Mobile browser not supported.<br>Download and use app or<br>contact DeLaval support'), false, 100);
				logoutSessCookie();
			}
		else
			tryToLogin();
//			render();
//			msg(jr.translate('Login successful'), true, 2);
	},
	logout = function() {
		logoutSessCookie();
		render();
		msg(jr.translate('Logout successful'), true, 2);
	},
	trim = function(doTrim) {
		var isOk=true;
		jr.foreach(checkAll, function(s){
			if(doTrim)
				ce[s].value=ce[s].value.trim();
			isOk&=ce[s].value.length>0;
		})
		return isOk;
	},
	checkOk = function(doTrim) {
		return trim(doTrim)&&ce['pwd'].value.length>=6;
	},
	creOptions = function() {
		var rVal=[],i=-1,l;
		while(++i<languages.length){
			l=languages[i];
			rVal.push({option:{text:l.languageLabel,value:l.languageCode,selected:l.languageCode==formData.lcid}});
		}
		return rVal;
	},
	getSelectedLang = function() {
		var i=-1,l;
		while(++i<languages.length){
			l=languages[i];
			if(l.languageCode==formData.lcid) {
				return l.languageLabel;
			}
		}
		return languages[0].languageLabel;
	},
	gethashcode = function(s){var h=0,i=-1;while(++i<s.length){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return h;},
	setLanguage = function() {
		formData.lcid=this.value;
		formData.email=ce['email'].value;
		setSessCookie(formData);
		getFormData();
		jr.ajax('Translator', 'newPageTranslation', jr.pageName, 'newPageTranslation');
	},
	fetchCookie = function(){
		var i=-1;
		formData=getSessCookie();
		if(jr.getUrlVar('app')!==null)
			formData.isApp=1;
		while(++i<languages.length&&languages[i].languageCode!=formData.lcid);
		if(i==languages.length)
			formData.lcid=null;
		if(formData.lcid==null)
			formData.lcid=navigator.language;
	},
	msg = function(txt, isSuccess, timeSec) {
		if(tim)
			msgOut();
		jr.ec( 'table', {className:'wide message '+(isSuccess?'':'warning'), parentNode:ce['msg'], align:'center', children:[
			{tr:{ className:'wide', children:[
				{td:{width:'50%',children:{span:{innerHTML:' '}}}},
				{td:{valign:'right',children:{img:{src:'/Delaval/Resources/'+(isSuccess?'success':'warning')+'.png'}}}},
				{td:{children:{span:{innerHTML:'&nbsp;'}}}},
				{td:{children:{div:{innerHTML:txt}}}},
				{td:{width:'50%',children:{span:{innerHTML:' '}}}}
			]}}]});
		tim=setTimeout(msgOut,timeSec*1000);
	},
	msgOut = function() {
		clearTimeout(tim);
		tim=null;
		ce['msg'].removeChild(ce['msg'].childNodes[0]);
	},
	render = function(npwd){
		fetchCookie();
		while(document.body.childNodes[0])document.body.removeChild(document.body.childNodes[0]);
		jr.ec( document.body, { children: [
			{'div': {className: 'block top', children:
				{'div': {className: 'centered', children:
					{'div': {className: 'logo', children:[
						{'img': {src: '/Delaval/ResAlarm/delaval_nb.png'}},
						{'div': {className: 'name', innerHTML: jr.translate('MyFarm')}}
					]}}
				}}
			}},
			{'div': {className: 'block bottom', children:
				{'div': {className: 'centered login', children:
					{'div': {className: 'outher', children:
						{'div': {className: 'inner', children:[
							{'div': {className: 'inpt', children:[
								{'div': {className: 'label', innerHTML: jr.translate('e-mail address')+colon}},
								{'div': {children: {'input': {contextIdentity: 'email', type: 'text', className: 'rounded wide shadow',value:formData.email}}}},
								{'div': {className: 'label', innerHTML: jr.translate('Password')+colon}},
								{'div': {children: {'input': {contextIdentity: 'pwd', type: 'password', className: 'rounded wide shadow', value: npwd ? npwd : ''}}}},
							]}},
							{'div': { className: 'wide', children:[
								{'div': {className: 'label inpt', innerHTML: ' '+jr.translate('Language')+colon}},
								{ 'button': { className:'unselectedButton buttonSelect btn', children: [
									{ 'span': { className: 'drop-down-text', innerHTML: getSelectedLang() } } ,
									{ 'img': { src: jr.getResource('arrows.png') } },
								] } },
								{'div': {className: 'buttonSelect', children: {select:{className: 'rounded wide shadow', onchange:setLanguage, contextIdentity:'lang', children:creOptions()}}}},
							]}},
							{'div': {innerHTML: '&nbsp;'}},
							{'div': {contextIdentity: 'msg', className:'wide'}},
							{'button': {contextIdentity: 'lgin', className: 'wide btn', innerHTML: jr.translate('Login'), onclick: getSeed}},
							{'div': {contextIdentity: 'logout'}},
						]}}
					}}
				}}
			}}
		]}, ce);
		fontHeight = parseInt($('button.buttonSelect').css('font-size'),10);
		$( 'button img' ).css( 'height', fontHeight * 0.7 + 'px' );
		$( 'button img' ).css( 'margin-top', fontHeight / 5 + 'px' );
		$( 'button img' ).css( 'right', $('button.buttonSelect').width() * 0.3 * 0.015 + 10 + 'px' );
		if(formData.farm){
			jr.ec('button', {parentNode:ce['logout'], className: 'wide btn', innerHTML: jr.translate('Logout'), onclick: logout});
		}
		var focus='email';
		if(formData.farm && formData.farm.length>0)
			focus=formData.email.length>0?'pwd':'email';
		checkCR();
		ce[focus].focus();
	},
	getLanguagesConf = function(data) {
		languages=data.langs;
		if (data.servers && data.servers.length) {
			var o=data.servers.split(','), i = -1;
			while (++i < o.length) {
				var oo = o[i].split(';');
				servers.push({name:oo[0],url:oo[1]});
			}
		}
		render();
		if(data.backgroundColor) {
			$('body').css('backgroundColor',data.backgroundColor);
			$('body').css('background','-webkit-gradient(linear,0 0,0 100%,from('+data.backgroundColor+'),to('+data.backgroundColor+'))');
		}
		if(firstRender) {
			firstRender = false;
			typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
		}
		setLoginAttr();
	},
	getInitData = function() {
		try{
			jr.ajax('Language','getLanguages',null,'getLanguages');
		} catch(error){}
		jr.eventManager.addListener( 'getLanguages', null, getLanguagesConf );
	}
	jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton');
	jr.eventManager.addListener('tryToLogin', jr.eventManager, function(data) {tryToLogin(data);});
	jr.eventManager.addListener('login', jr.eventManager, function(data) {login(data);});
	jr.eventManager.addListener('reseted', jr.eventManager, function() {render();});
	jr.eventManager.addListener( 'newPageTranslation', jr.eventManager, function(d){
		jr.setNewTranslations(d);
		if(window.android && window.android.setTranslation) 
			window.android.setTranslation(jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton'))
		render(ce['pwd'].value);
	});
	getInitData();
	document.onkeyup=checkCR;
	jr.ec( document.body, { children:
			{'div': {className: 'block all', children:
				{'div': {className: 'centered', children:
					{'div': {className: 'waitMessage', innerHTML: jr.translate('Trying to login...')}}
				}}
			}}
		}
	);
} 
jr.init( function() {
	login();
} );
