jr.include( '/util.js' );
jr.include( '/setup.css' );
jr.include('/buttons.css');
jr.include('/modalContainer.css');
var activate = {
	init: function() {
		activate.texts = {
			MyFarm:						jr.translate('MyFarm'),
			notNow:						jr.translate('Remind me later'),
			activate:					jr.translate('Activate'),
			activateVCs:				jr.translate('Activate VCs'),
			activateUser:				jr.translate('Activate User'),
			userActivated:				jr.translate('User activated!'),
			userNotActivated:			jr.translate('Got problem activating user!'),
			VcActivated:				jr.translate('VC activated!'),
			VcNotActivated:				jr.translate('Got problem activating VC!'),
			VcActivatedInfo:			jr.translate('It can take up to'),
			VcActivatedInfo2:			jr.translate('minutes before data is availible in'),
			noUnactivatedVCs:			jr.translate('No unactivated VCs are connected to this user!'),
			userIsActivated:			jr.translate('This user is already activated!'),
			IHaveReadAndAccepted:		jr.translate('I have read and accepted the end user license agreement (EULA)'),
			viaApp:						jr.translate('The only way to activate MyFarm is via a mobile App.\nPlease download Delaval MyFarm app from Google play')
		};
	},
	instance:	function(root,type){
	var
		myDiv,
		imgIcons=new Image(),
		logoImageDisplayed=false,
		numVCs=0,
		cookie=getSessCookie(),
		ce={},
		gotData=false,
		gotEula=false,
		firstTime=true;
		onresize = function() {
			var width = $( 'div.backgroundLogo' ).width();
			var height = $(window).height();;
			$( 'div.heading' ).css( 'font-size', Math.max( width / 20, 25 ) );
			$( 'div.text' ).css( 'font-size', Math.max( width / 35, 10 ) );
			$( 'td.text' ).css( 'font-size', Math.max( width / 35, 10 ) );
			$( 'span.messageErr' ).css( 'font-size', Math.max( width / 35, 10 ) );
//			$( 'div.eula' ).css( 'font-size', Math.max( width / 25, 20 ) );
			$( 'div.eula' ).css( 'height', Math.max( height*0.60, 300 ) );
			$( 'button' ).css( 'font-size', Math.max( width / 25, 13 ) );
			$(ce['checkbox']).width(Math.max( width / 10, 13));
		},
		conf=function(d){
			if(!cookie.isApp) {
				if(firstTime)
					window.alert(activate.texts.viaApp);
				logoutSessCookie();
				firstTime=false;
				return;
			}
			if(typeof d == 'string') {
				gotEula=true;
				eula=d;
			} else {
				if(type=='vc') {
					gotData=true;
					data=d;
					numVCs = data.length;
				} else {
					gotData=true;
					data=d;
				}
			}
			if(gotData && gotEula && doShow){
				doShow=false;
				typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
				show();
			}
		},
		doShow=false,
		data=null,
		eula=null,
		checkBoxChecked=false,
		ce={},
		showImages=function(){
			var logoCanvas = jr.ec('canvas',{parentNode:ce['logo'], className: 'logo', width:120, height:23});
			var ctx=logoCanvas.getContext("2d");
			ctx.drawImage(imgIcons,1,925,120,23,0,0,120,23);
			checkbox('checkbox',checkBoxChecked);
		},
		notNow=function(){
			$(ce['errorMessage']).remove();
			jr.ajax( 'Users', 'noActivationNow', null, 'returnNotNow' );
			$('button#notNow').attr('disabled', true);
		},
		returnNotNow=function(ok){
			if(ok)
				navigateTo('/Delaval/mvc/Pages/Show/farm');
			else
				$('button#notNow').attr('disabled', false);
		},
		activateVC=function(){
			$(ce['errorMessage']).remove();
			jr.ajax( 'Users', 'activateVC', this.id, 'returnActivate' );
		},
		activateUser=function(){
			$(ce['errorMessage']).remove();
			jr.ajax( 'Users', 'activateUser', this.id, 'returnActivate' );
		},
		returnActivate=function(id){
			if(type=='vc') {
				if(id) {
					if(numVCs>1) {
						ok(activate.texts.VcActivated, 
							activate.texts.VcActivatedInfo + '&nbsp;5&nbsp;' + activate.texts.VcActivatedInfo2 + "&nbsp;" + activate.texts.MyFarm, 
							"Ok", 
							function(){$(ce[id]).remove(); numVCs--}
						);
					} else {
						ok(activate.texts.VcActivated, 
							activate.texts.VcActivatedInfo + '&nbsp;5&nbsp;' + activate.texts.VcActivatedInfo2 + "&nbsp;" + activate.texts.MyFarm, 
							"Ok", 
							function(){navigateTo('/Delaval/mvc/Pages/Show/farm')}
						);
					}
				} else {
					ok(activate.texts.VcNotActivated, 
						'', 
						"Ok", 
						function(){jr.ajax( 'Users', 'getDomainsFromOwner', null, 'myConf' );}
					);
				}
			} else {
				if(id) {
					ok(activate.texts.userActivated, 
						"", 
						"Ok", 
						function(){navigateTo('/Delaval/mvc/Pages/Show/farm')}
					);
				} else {
					ok(activate.texts.userNotActivated, 
						'', 
						"Ok", 
						function(){jr.ajax( 'Users', 'getMyUser', null, 'myConf' );}
					);
				}
			}
		},
		ok=function(text,desc,okText,onOk) {
			var ce = {modalContainer: null};
			jr.ec( root, {children: [
				{'div': {className: cookie.isApp?'modalBlocker':'modalDimmer', contextIdentity: 'modalDimmer'}},
				{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
					{'p': {className: 'modalOuterContainer', children: [
						{'p': {className: 'modalInnerContainer', children: [
							{'p': {className: 'modalContainer', children: [
								{'div': {className: 'title', children: [
									{'span': {innerHTML: text}}
								]}},
								{'div': {className: 'text', children: [
									{'span': {innerHTML: desc}}
								]}},
								{'div': {className: 'title', children: [
									{'button': {className: 'save', innerHTML: okText, onclick: function() { onOk(); jr.remove( ce.modalContainer ); jr.remove( ce.modalDimmer ); }}},
								]}},
							]}},
						]}},
						{'b': {}},
					]}},
				]}},
			]}, ce );
		},
		onClick=function() {
			checkBoxChecked = !checkBoxChecked;
			checkbox('checkbox',checkBoxChecked);
			if(checkBoxChecked) {
				$('button[id!="notNow"]').attr('disabled', false);
			} else {
				$('button[id!="notNow"]').attr('disabled', true);
			}
		},
		checkbox=function(key,isChecked){
			if(ce[key]) {
				var ctx=ce[key].getContext("2d"),isBlack=false;
				ctx.clearRect(0,0,45,45); // only work some times in stock browser of android 4.1.1+
				if(isBlack)
					ctx.drawImage(imgIcons,40,597+(isChecked?45:0),45,45,0,0,45,45);
				else
					ctx.drawImage(imgIcons,(isChecked?42:0),400,42,45,0,0,42,45);
			}
		},
		show=function(){
			if(data&&eula){
				var a=[],rows=[];
				var heading = activate.texts.MyFarm + '&nbsp;-&nbsp;' + (type=='vc'?activate.texts.activateVCs:activate.texts.activateUser);
				rows.push({'tr': {children:[
							{td:{height:'23px', children:{'div':{innerHTML:'&nbsp;'}}}}
						]}},
						{'tr': {children:[
							{td:{width:'90%',align:'center',children:{'div':{className:'heading', innerHTML:heading}}}}
						]}},
						{'tr': {children:[
							{td:{width:'90%',align:'center',children:{'div':{style: {width: '90%', height: '450px', overflow: 'scroll', border: '1px grey solid', padding: '5px', 'text-align': 'left'}, className:'eula', innerHTML:eula}}}}
						]}},
						{'tr': {children:[
							{td:{className:'text', align:'center', children: [
								{'span':{style:{'font-size':'22px'},innerHTML: activate.texts.IHaveReadAndAccepted + '&nbsp;'}},
								{'span':{onclick:onClick,children:{'canvas':{contextIdentity:'checkbox',width:43,height:43}}}}
							]}}
						]}});
				if(type=='vc') {
					var allActive = true;
					jr.foreach(data, function(d){
						if(d.notActivated) { // notActivated
							allActive = false;
							rows.push({'tr': {contextIdentity:d.id, children:[
								{td:{align:'center',children:{'button':{id:d.id ,disabled:true, innerHTML:activate.texts.activate + '&nbsp;' + d.parentName + '&nbsp;' + d.name, onclick:activateVC}}}},
							]}});
						}
					})
					if(allActive) {
						rows.push({'tr': {contextIdentity:'errorMessage', children:[
							{td:{align:'center',children:{
								'span':{className:'messageErr', innerHTML: activate.texts.noUnactivatedVCs}									
							}}},
						]}});
					} else {
						rows.push({'tr': {children:[
							{td:{align:'center',children:{'button':{id:'notNow', disabled:false, innerHTML:activate.texts.notNow, onclick:notNow}}}},
						]}});
					}
				} else {
					if(data.status===0) {
						rows.push({'tr': {children:[
							{td:{align:'center',children:{'button':{id:data.id ,disabled:true, innerHTML:activate.texts.activate + '&nbsp;' + data.email, onclick:activateUser}}}},
						]}});
					} else {
						rows.push({'tr': {contextIdentity:'errorMessage', children:[
							{td:{align:'center',children:{
								'span':{className:'messageErr', innerHTML: activate.texts.userIsActivated}									
							}}},
						]}});
					}
				}
				a.push({'div':{children:[
							{'table':{width:'99%',children: rows}}
						]}});
				jr.ec(myDiv, {children:{div:{className:'backgroundLogo',children:a}}},ce);
				checkbox('checkbox',checkBoxChecked);
				onresize();
			}
			else
				doShow=true;
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		$( window ).resize( onresize );
		$(root).css('background-color', '#103d82');
		jr.ec(root, {children:[{'span': { contextIdentity: 'logo', className: 'logo'} },{div:{}}]},ce);
		myDiv=root.lastChild;
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)conf(data);});
		jr.eventManager.addListener('returnActivate', jr.eventManager, function(data) {
			if(data)returnActivate(data);});
		jr.eventManager.addListener('returnNotNow', jr.eventManager, function(data) {
			if(data)returnNotNow(data);});
		if(type=='vc') {
			jr.ajax( 'Users', 'getDomainsFromOwner', null, 'myConf' );
		} else {
			jr.ajax( 'Users', 'getMe', null, 'myConf' );
		}
		jr.ajax( 'Users', 'getEula', type, 'myConf' );
		imgIcons.onload=function(){
			if(!logoImageDisplayed) {
				logoImageDisplayed=true;
				showImages();
			}
		};
		imgIcons.src=jr.getResource("info6.png");
	}
};
