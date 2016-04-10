jr.include( '/util.js' );
jr.include( '/buttons.css' );
jr.include( '/registerUser.css' );
function registerUser() {
	var
	colon=jr.translate(':'),
	ce={},
	firstRender = true,
	languages=[],
	formData,
	tim=null,
	checkCR = function(ev) {
		var key;
		if(typeof ev=="undefined")ev=window.event;key=document.layers?ev.which:ev.keyCode;
		if(key==13 && checkOk())
			register();
		else
			setLoginAttr();
	},
	setLoginAttr = function() {
		if(checkOk(false)) {
			$(ce['register']).attr("disabled", null);
		} else {
			$(ce['register']).attr("disabled", "disabled");
		}
	},
	register = function() {
		if(checkOk(true)) {
			jr.ajax('Users','registerAtDemoFarm',{
											email: ce['email'].value, 
											firstName: ce['firstName'].value, 
											lastName: ce['lastName'].value, 
											languageCode: formData.lcid
										},
										'registerReturn',null,null,function(){msg(jr.translate('Failed to register'), false, 20)});
		} else {
			setLoginAttr();
		}
	},
	getFormData=function(){
		formData.email=ce['email'].value;
		formData.firstName=ce['firstName'].value;
		formData.lastName=ce['lastName'].value;
	},
	registerReturn = function(ret){
		if(ret.success) {
			formData=getSessCookie();
			formData.email=ce['email'].value;
			setSessCookie(formData);
			msg(jr.translate('Registered successfully, redirecting to login page'), true, 20);
			setTimeout(
				function() {
					window.location.href=ret.data;
				}, 5000
			);
		} else {
			msg(jr.translate(ret.data), false, 20);
		}
	},
	checkOk = function() {
		ce['email'].value=ce['email'].value.trim();
		return ce['email'].value.length>0 && ce['email'].value.indexOf('@')>0;
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
		formData.firstName=ce['firstName'].value;
		formData.lastName=ce['lastName'].value;
		setSessCookie(formData);
		getFormData();
		jr.ajax('Translator', 'newPageTranslation', jr.pageName, 'newPageTranslation');
	},
	fetchCookie = function(){
		var i=-1;
		var firstName = formData === undefined ? "" : formData.firstName;
		var lastName = formData === undefined ? "" : formData.lastName;
		formData=getSessCookie();
		formData.firstName = firstName;
		formData.lastName = lastName;
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
	render = function(){
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
								{'div': {className: 'label', innerHTML: jr.translate('E-mail Address')+colon}},
								{'div': {children: {'input': {contextIdentity: 'email', type: 'text', className: 'rounded wide shadow',value:formData.email}}}},
							]}},
							{'div': {className: 'inpt', children:[
								{'div': {className: 'label', innerHTML: jr.translate('First Name')+colon}},
								{'div': {children: {'input': {contextIdentity: 'firstName', type: 'text', className: 'rounded wide shadow',value:formData.firstName}}}},
							]}},
							{'div': {className: 'inpt', children:[
								{'div': {className: 'label', innerHTML: jr.translate('Last Name')+colon}},
								{'div': {children: {'input': {contextIdentity: 'lastName', type: 'text', className: 'rounded wide shadow',value:formData.lastName}}}},
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
							{'button': {contextIdentity: 'register', className: 'wide btn', innerHTML: jr.translate('Register'), onclick: register}},
						]}}
					}}
				}}
			}}
		]}, ce);
		fontHeight = parseInt($('button.buttonSelect').css('font-size'),10);
		$( 'button img' ).css( 'height', fontHeight * 0.7 + 'px' );
		$( 'button img' ).css( 'margin-top', fontHeight / 5 + 'px' );
		$( 'button img' ).css( 'right', $('button.buttonSelect').width() * 0.3 * 0.015 + 10 + 'px' );
		checkCR();
		ce['email'].focus();
	},
	getLanguagesConf = function(data) {
		languages=data.langs;
		render();
		if(data.backgroundColor) {
			$('body').css('backgroundColor',data.backgroundColor);
			$('body').css('background','-webkit-gradient(linear,0 0,0 100%,from('+data.backgroundColor+'),to('+data.backgroundColor+'))');
		}
		if(firstRender) {
			firstRender = false;
			typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
		}
	},
	getInitData = function() {
		try{
			jr.ajax('Language','getLanguages',null,'getLanguages');
		} catch(error){}
		jr.eventManager.addListener( 'getLanguages', null, getLanguagesConf );
	}
	jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton');
	jr.eventManager.addListener('registerReturn', jr.eventManager, function(data) {registerReturn(data);});
	jr.eventManager.addListener( 'newPageTranslation', jr.eventManager, function(d){
		jr.setNewTranslations(d);
		if(window.android && window.android.setTranslation) 
			window.android.setTranslation(jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton'))
		render();
	});
	getInitData();
	document.onkeyup=checkCR;
} 
jr.init( function() {
	registerUser();
} );
