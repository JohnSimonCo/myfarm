jr.include( '/util.js' );
jr.include( '/mouseBox.js' );
jr.include( '/setup.css' );
jr.include( '/buttons.css' );
var setup = {
	init: function() {
		setup.texts = {
			mySettings:			jr.translate('My settings'),
			myPhones:			jr.translate('My phones'),
			delete:				jr.translate('Delete'),
			undelete:			jr.translate('Undelete'),
			testSend:			jr.translate('Test'),
			phone:				jr.translate('Phone'),
			phoneType:			jr.translate('Type'),
			created:			jr.translate('Created'),
			lastContact:		jr.translate('Last contact'),
			language:			jr.translate('Language'),
			firstName:			jr.translate('First name'),
			lastName:			jr.translate('Last name'),
			email:				jr.translate('e-mail'),
			appVersion:			jr.translate('App version'),
			osVersion:			jr.translate('OS version'),
			oldPassword:		jr.translate('Old password'),
			password:			jr.translate('Password'),
			verifyPassword:		jr.translate('Verify password'),
			passwordChanged:	jr.translate('Password changed'),
			notifications:		jr.translate('Notifications'),
			stopAlarms:			jr.translate('Stop alarms'),
			vcCommProblems:		jr.translate('Farm communication problems'),
			messages:			jr.translate('Messages'),
			quietTime:			jr.translate('Quiet time'),
			sound:				jr.translate('Sound is controlled by settings in your phone'),
			vibration:			jr.translate('Vibration'),
			save:				jr.translate('Save'),
			saving:				jr.translate('Saving...'),
			failedToSave:		jr.translate('Failed to save, please try again!'),
			saved:				jr.translate('Saved'),
			back:				jr.translate('Back'),
			from:				jr.translate('from'),
			to:					jr.translate('to'),
			reset:				jr.translate('Reset'),
			atLeast:			jr.translate('at least 6 char'),
			myNotifications:	jr.translate('My phone notifications'),
			subscribe:			jr.translate('Subscribe'),
			notQuiet:			jr.translate('Not under quiet time'),
			sentOk:				jr.translate('Sent ok'),
			notSentOk:			jr.translate('Not sent ok!')
		};
		firstRender = true;
		jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton');
	},
	instance:	function(targetId,userId,myDiv){
	var
		imgIcons=new Image(),
		imgIconsLoaded=0,
		onresize = function() {
			if(ce){
				var width=myDiv.clientWidth;
				width=Math.min(width,1000);
				ce.background.style.width=width+'px';
				$( 'div.heading' ).css( 'font-size', Math.max(width/20,28));
				$( 'td.heading' ).css( 'font-size', Math.max(width/20,28));
				$( 'td.label' ).css( 'font-size', Math.max(width/27,18));
				$( 'td.info' ).css( 'font-size', Math.max(width/36,13));
				$( 'input.field' ).css('font-size',Math.max(width/30,18));
				$( 'select.field' ).css('font-size',Math.max(width/30,18));
				$( 'span.field' ).css('font-size',Math.max(width/30,18));
				$( 'select.hourmin' ).css('font-size',Math.max(width/30,18));
				$( 'span.message' ).css('font-size',Math.max(width/27,18));
				$( 'input.button' ).css('font-size',Math.max(width/24,18));
				$( 'canvas.hint' ).css('width',Math.max(width/24,20));
			}
		},
		userConf=function(u){
			user=u;
			user.notifyMask^=0x2000000;
			if(!(user.notifyMask&0x1ffffc0))
				user.notifyMask|=((12*20)<<7)|((12*6)<<16);
			if(user.notifyMask&0x7c)
				user.notifyMask|=4;
			else
				user.notifyMask&=~4;
			u.notification=[];
			if(u.phones){
				u.phones.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
				var i=-1,n,s=null;
				if(u.notify){
					while(++i<u.notify.length)
						if((n=u.notify[i]).domainId===u.vcId)
							s={id:n.domainId,name:n.domainName,mask:n.notifyMask};
						else
							u.notification.push({id:n.domainId,name:n.domainName,mask:n.notifyMask});
					u.notification.sort(function(o1,o2){return o1.name.localeCompare(o2.name)});
				}
				if(s===null)
					s={id:u.vcId,name:u.vcName,mask:0}
				u.notification.splice(0,0,s);
			}
			tryToShow();
			if(firstRender) {
				firstRender = false;
				typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
			}
		},
		tryToShow=function(){
			if(user&&doShow&&imgIconsLoaded){
				var pwd=!formData||formData.pwd.length===0?null:formData.pwd;
				doShow=false;
				reset();
				if(isSaving){
					if(pwd!==null){
						cookie.pwd=gethashcode(user.id+pwd);
						setSessCookie(cookie);
					}
					message(pwd===null||pwd.length===0||pwd===0?setup.texts.saved:setup.texts.passwordChanged,false,ce.lang.parentNode.parentNode,true);
				}
			}
		},
		doShow=false,
		user=null,
		verifyNode=null,
		oldNode=null,
		msgNode=null,
		lastNode=null,
		isVerify,
		cookie=getSessCookie(),
		formData,
		isMessage,
		timer,
		isSaving=false,
		clearData,
		ce={},
		trim=function(){
			ce.email.value=ce.email.value.trim();
			ce.pwd.value=ce.pwd.value.trim();
			ce.vpwd.value=ce.vpwd.value.trim();
			ce.opwd.value=ce.opwd.value.trim();
		},
		isEmpty=function(){
			trim();
			return ce.fName.value.length===0||ce.eName.value.length===0||ce.email.value.length===0;
		},
		isChanged=function(){
			trim();
			return ce.fName.value!==user.firstName||ce.eName.value!==user.lastName||ce.email.value!==user.email||ce.pwd.value.length>0;
		},
		OnKeyUp=function(){
			var changed=isChanged(),okOld=parseInt(cookie.pwd)===gethashcode(user.id+ce.opwd.value),ok=true,i=-1,s,d;
			if(user.phones)
				while(++i<user.phones.length){
					ok&=ce['phone'+i].value.length>0;
					changed|=formData.phone[i].name!==ce['phone'+i].value||formData.phone[i].delete;
			}
			if(user.notification&&user.notification.length){
				i=-1;
				changed|=formData.notification!==user.notifyMask;
				while(!changed&&++i<user.notification.length){
					s=user.notification[i];
					d=formData.noti[i];
					changed|=s.mask!==d.mask;
				}
			}
			var passwordProblem=checkPassword(ce.pwd.value);
			if(ce.pwd.value.length>0){
				if(passwordProblem==null) {
					removeMessage();
					setFieldOk('pwd_canvas',true);
				} else {
					setFieldOk('pwd_canvas',false);
				}
				if(ce.pwd.value==ce.vpwd.value)
					setFieldOk('vpwd_canvas',true);
				else
					setFieldOk('vpwd_canvas',false);
				if(okOld)
					setFieldOk('opwd_canvas',true);
				else
					setFieldOk('opwd_canvas',false);
			}
			ce.save.disabled=!ok||!changed||isEmpty()||(ce.pwd.value.length!==0&&(ce.pwd.value!==ce.vpwd.value||!okOld||passwordProblem!==null));
			if(!ce.save.disabled&&event.keyCode===13)
				save();
			else{
				ce.reset.disabled=!(changed||ce.pwd.value.length>0);
				if(ce.pwd.value.length>0){
					if(passwordProblem!=null) {
						if(!isVerify)
							insertVerify();
						message(passwordProblem,true,verifyNode,false);
					}
				}
				else if(isVerify)
					removeVerify();
			}
		},
		setFieldOk=function(canvas,ok) {
			var ctx=ce[canvas].getContext("2d");
//			ctx.clearRect(0,0,45,45); // only work some times in stock browser of android 4.1.1+
			ctx.putImageData(clearData, 0, 0);
			ctx.drawImage(imgIcons,ok?1:36,1017,33,35,0,0,33,35);
		},
		getUserData=function(){
			formData={};
			formData.firstName=user.firstName;
			formData.lastName=user.lastName;
			formData.email=user.email;
			formData.pwd=formData.vpwd=formData.opwd='';
			if(user.phones){
				var i=-1;
				formData.phone=[];
				while(++i<user.phones.length){
					var p=formData.phone[i]={},s=user.phones[i];
					p.name=s.name;
					p.type=s.type;
					p.id=s.id;
					p.delete=s.delete;
					p.last=s.last;
					p.cre=s.cre;
					p.appVer=s.appVer;
					p.osVer=s.osVer;
					p.delete=false;
				}
				formData.notification=user.notifyMask;
				if(user.notification){
					formData.noti=[];
					i=-1;
					jr.foreach(user.notification,function(n){
						formData.noti.push({index:++i,mask:n.mask,id:n.id,name:n.name});});
				}
			}
		},
		setUserData=function(){
			formData.firstName=ce.fName.value.trim();
			formData.lastName=ce.eName.value.trim();
			formData.email=ce.email.value.trim();
			formData.pwd=ce.pwd.value.trim();
			formData.vpwd=ce.vpwd.value.trim();
			formData.opwd=ce.opwd.value.trim();
			if(user.phones){
				var i=-1;
				while(++i<user.phones.length)
					formData.phone[i].name=ce['phone'+i].value;
			}
		},
		reset=function(){
			if(user){
				getUserData();
				show();
			}
			else
				doShow=true;
		},
		insertVerify=function(){
			lastNode.parentNode.insertBefore(verifyNode,lastNode);
			lastNode.parentNode.insertBefore(oldNode,lastNode);
			isVerify=true;
			onresize();
		},
		removeVerify=function(){
			verifyNode.parentNode.removeChild(verifyNode);
			oldNode.parentNode.removeChild(oldNode);
			isVerify=false;
		},
		setLanguage=function(){
			cookie.lcid=this.value;
			setSessCookie(cookie);
			setUserData();
			jr.ajax('Users','saveUserLanguage',null,"dummy");
			jr.ajax('Translator', 'newPageTranslation', jr.pageName, 'newPageTranslation', null, true);
		},
		removeMessage=function(){
			if(msgNode.parentNode != null)
				msgNode.parentNode.removeChild(msgNode);
			isMessage=false;
		},
		message=function(msg,isError,node,autoRemove){
			if(!isMessage){
				isMessage=true;
				node.parentNode.insertBefore(msgNode,node);
			}
			ce.imsg.innerHTML=msg;
			ce.imsg.className=isError?'messageErr':'messageOk';
			onresize();
			if(autoRemove)
				timer=setTimeout(function(){timer=null;removeMessage()},typeof autoRemove=='number'?autoRemove*1000:2500);
		},
		creOptions=function() {
			var rVal=[],i=-1,l;
			var languages=user.languages;
			while(++i<languages.length){
				l=languages[i];
				rVal.push({option:{text:l.languageLabel,value:l.languageCode,selected:l.languageCode===cookie.lcid}});
			}
			return rVal;
		},
		gethashcode=function(s){var h=0,i=-1;while(++i<s.length){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return h;},
		save=function(){
			ce.fName.value=ce.fName.value.trim();
			ce.eName.value=ce.eName.value.trim();
			if(user.phones){
				var i=-1;
				while(++i<user.phones.length)
					ce['phone'+i].value=ce['phone'+i].value.trim();
			}
			OnKeyUp();
			if(!ce.save.disabled){
				setUserData();
				doShow=true;
				isSaving=true;
				var rv={target:targetId,id:user.id,firstName:formData.firstName,lastName:formData.lastName,email:formData.email,pwd:formData.pwd.length===0?0:gethashcode(user.id+formData.pwd),timeOffsetMinutes:new Date().getTimezoneOffset()};
				if(formData.phone){
					rv.phones=[];
					jr.foreach(formData.phone,function(o){rv.phones.push({name:o.delete?'':o.name,id:o.id});});
				}
				if(formData.noti){
					var i=-1,o;
					rv.notifyMask=formData.notification;
					rv.notifyMask^=0x2000000;
						rv.notifyMask&=~0x7c;
					if(formData.notification&0x4)
						rv.notifyMask|=0x7c;
					else
						rv.notifyMask&=~0x7c;
					rv.notifications=[];
					while(++i<formData.noti.length){
						o=formData.noti[i];
						if(o.mask)
							rv.notifications.push({id:o.id,mask:o.mask});
					}
				}
				ce.save.value=setup.texts.saving;
				ce.save.disabled=true;
				jr.ajax('Users', 'saveUserSettings', rv, 'myUserConf', null, null, failedToSave );
			}
		},
		failedToSave=function(){
			message(setup.texts.failedToSave,true,ce.lang.parentNode.parentNode,5);
			ce.save.value=setup.texts.save;
			ce.save.disabled=false;
		},
		back=function(){
			if(targetId!=null) {
				window.location='/Delaval/mvc/Pages/Show/farm?id='+targetId;
			} else {
				window.location='/Delaval/mvc/Pages/Show/FarmSmall';
			}
		},
		crePhones=function(arr){
			arr.push({tr:{children:{td:{colSpan:4, align:'center', className:'heading', innerHTML:setup.texts.myPhones}}}});
			var i=-1;
			while(++i<user.phones.length){
				var p=formData.phone[i];
				arr.push(creFld(setup.texts.phone,'phone'+i,formData.phone[i].name,'text',p.delete,false));
				arr.push(creInf(setup.texts.phoneType,p.type,p.delete,p.id,2));
				arr.push(creInf(setup.texts.created,new Date(p.cre).printiso()));
				if(p.last)
					arr.push(creInf(setup.texts.lastContact,new Date(p.last).printiso()));
				arr.push(creInf(setup.texts.appVersion,p.appVer,setup.texts.testSend,p.id,p.last?3:2,i));
				arr.push(creInf(setup.texts.osVersion,p.osVer));
			}
		},
		creFld=function(lab,cntx,val,typ,disabled,hint){
			var o=
				{tr:{children:[
					{td:{className:'label', innerHTML:lab}},
					{td:{colSpan:3, children:[{'input':{className:'field'+(hint?' hint':''), contextIdentity:cntx, assignments:{type:typ, value:val, onkeyup:OnKeyUp, disabled:disabled?true:false}}}]}}
				]}};
			if(hint) {
				o.tr.children[1].td.children.push({'canvas':{className: 'hint',contextIdentity:cntx+'_canvas',width:43,height:43}});
			}
			return o;
		},
		deletePhone=function(){
			var i=-1,id=this.id;
			while(++i<user.phones.length&&formData.phone[i].id!==id){}
			formData.phone[i].delete=!formData.phone[i].delete;
			setUserData();
			show();
		},
		testPhone=function(){
			var phoneId=this.phoneId;
			jr.ajax( 'Users', 'testSend', this.id, 'returnTestSend', this.phoneId, null, function(){returnTestSend(false,phoneId)} );
		},
		returnTestSend=function(success, id){
			if(success) {
				message(setup.texts.sentOk,false,ce['phone'+id].parentNode.parentNode.nextSibling,5);
			} else {
				message(setup.texts.notSentOk,true,ce['phone'+id].parentNode.parentNode.nextSibling,5);
			}
		},
		creInf=function(lab,val,del,id,rowspan,phoneId){
			var o=
				{tr:{children:[typeof del==='undefined'?{}:typeof del==='string'?
						{td:{rowSpan:rowspan,className:'delbtn',children:{'input':{contextIdentity:'test'+id, id:id, phoneId:phoneId, className:'button', assignments:{type:'button',value:del,onclick:testPhone}}}}}
							:
						{td:{rowSpan:rowspan,className:'delbtn',children:{'input':{contextIdentity:'del'+id, id:id, className:'button', assignments:{type:'button',value:del?setup.texts.undelete:setup.texts.delete,onclick:deletePhone}}}}},
					{td:{className:'info', innerHTML:lab}},
					{td:{colSpan:2, className:'info', innerHTML:val}}
				]}};
			return o;
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		checkbox=function(key,isChecked){
			var ctx=ce[key].getContext("2d"),isBlack=false;
//			ctx.clearRect(0,0,45,45); // only work some times in stock browser of android 4.1.1+
			ctx.putImageData(clearData, 0, 0);
			if(isBlack)
				ctx.drawImage(imgIcons,40,597+(isChecked?45:0),45,45,0,0,45,45);
			else
				ctx.drawImage(imgIcons,(isChecked?42:0),400,42,45,0,0,42,45);
		},
		makeCheckbox=function(index,bit,isUser){
			return {td:{onclick:checkClick,index:index,bit:bit,children:{'canvas':{contextIdentity:isUser?bit:index+'_'+bit,width:43,height:43}}}};
		},
		checkClick=function(){
			var val;
			if(this.index<0)
				val=formData.notification^=1<<this.bit;
			else
				val=formData.noti[this.index].mask^=1<<this.bit;
			val&=(1<<this.bit);
			checkAll();
			OnKeyUp();
		},
		checkAll=function(){
			var i=-1,bit;
			checkbox(0,formData.notification&1);
			checkbox(1,formData.notification&2);
//			checkbox(2,formData.notification&4);
			checkbox(25,formData.notification&0x2000000);
			var dspl=formData.notification&0x2000000?'inline':'none';
			while(++i<formData.noti.length){
				bit=-1;
				while(++bit<8)
					checkbox(i+'_'+bit,(formData.noti[i].mask>>bit)&1);
				if(ce['quietLab'+i])
					ce['quietLab'+i].style.display=dspl;
				ce[i.toString()+'_1'].style.display=dspl;
				ce[i.toString()+'_3'].style.display=dspl;
				ce[i.toString()+'_5'].style.display=dspl;
				ce[i.toString()+'_7'].style.display=dspl;
			}
			ce['quiet'].style.display=dspl;
		},
		creLabel=function(arr,lab){
			arr.push(
				{tr:{children:
					{td:{style:{'text-align':'center'},colSpan:4, className:'label', innerHTML:lab}}
				}});
		},
		creNotification=function(arr,lab,index,bit,isUser){
			arr.push(
				{tr:{children:[
					{td:{className:'label', innerHTML:lab}},
					makeCheckbox(index,bit,isUser),
					isUser?{td:{}}:makeCheckbox(index,bit+1,false)
				]}});
		},
		creNotiHead=function(arr,lab,name,cntx){
			arr.push({tr:{children:{td:{colSpan:4, align:'center', className:'heading', children:[
				{span:{innerHTML:lab}},
				name?{span:{innerHTML:' '+name}}:{},
			]}}}});
			if(name)
				arr.push({tr:{children:[{td:{}}, {td:{className:'info', innerHTML:setup.texts.subscribe}}, {td:{className:'info', children:{span:{contextIdentity:'quietLab'+cntx,innerHTML:setup.texts.notQuiet}}}}]}});
		},
		creNumberOption=function(maxVal,selected,step){
			var rVal=[],i=0;
			selected=Math.floor(selected);
			if(!step)
				step=1;
			while(i<maxVal){
				rVal.push({option:{text:n0(i.toString()),value:i,selected:i===selected*step}});
				i+=step;
			}
			return rVal;
		},
		OnVolumeClick=function(){
			formData.notification=(formData.notification&0x7fffff83)|(this.value<<2);
			OnKeyUp();
		},
		OnTimeClick=function(){
			var i=this.index,from=ce['fh'+i].value*12+ce['fm'+i].value/5,to=ce['th'+i].value*12+ce['tm'+i].value/5;
			formData.notification&=~0x1ffffc0;
			formData.notification|=(formData.notification&0x7f)|(from<<7)|(to<<16);
			OnKeyUp();
		},
		creNotifications=function(arr){
			if(formData.noti){
				var i=-1;
				creNotiHead(arr,setup.texts.myNotifications);
				var fromVal=(formData.notification>>7)&0x1ff,toVal=(formData.notification>>16)&0x1ff,fromH=fromVal/12,fromM=fromVal%12,toH=toVal/12,toM=toVal%12;
				creNotification(arr,setup.texts.subscribe,i,0,true);
				creNotification(arr,setup.texts.vibration,i,1,true);
//				creNotification(arr,setup.texts.sound,i,2,true);
				arr.push(
					{tr:{children:[
					]}});
					arr.push(
						{tr:{children:[
							{td:{className:'label', innerHTML:setup.texts.quietTime}},
							{td:{colSpan:3,children:[
								{'canvas':{onclick:checkClick,index:i,bit:25,contextIdentity:25,width:43,height:43}},
								{'span':{contextIdentity:'quiet',children:[
									{'span':{className: 'field', innerHTML:'&nbsp;'+setup.texts.from+'&nbsp;'}},
									{'select':{className: 'hourmin', contextIdentity:'fh'+i, index:i, onchange:OnTimeClick, children:creNumberOption(24,fromH)}},
									{'span':{className: 'field', innerHTML:':'}},
									{'select':{className: 'hourmin', contextIdentity:'fm'+i, index:i, onchange:OnTimeClick, children:creNumberOption(60,fromM,5)}},
									{'span':{className: 'field', innerHTML:'&nbsp;'+setup.texts.to+'&nbsp;'}},
									{'select':{className: 'hourmin', contextIdentity:'th'+i, index:i, onchange:OnTimeClick, children:creNumberOption(24,toH)}},
									{'span':{className: 'field', innerHTML:':'}},
									{'select':{className: 'hourmin', contextIdentity:'tm'+i, index:i, onchange:OnTimeClick, children:creNumberOption(60,toM,5)}}]}},
							]}}
						]}});
				creLabel(arr,setup.texts.sound);
				while(++i<formData.noti.length){
					creNotiHead(arr,setup.texts.from,formData.noti[i].name,i);
					creNotification(arr,setup.texts.stopAlarms,i,0);
					creNotification(arr,setup.texts.notifications,i,2);
					creNotification(arr,setup.texts.messages,i,4);
					creNotification(arr,setup.texts.vcCommProblems,i,6);
				}
			}
		},
		show=function(){
			hide();
			var rows=[
				{tr:{children:[
					{td:{align:'right',children:{'input':{contextIdentity:'back', className:'button',assignments:{type:'button',value:setup.texts.back,onclick:back}}}}},
					{td:{colSpan:2, children:
						{'input':{contextIdentity:'save', className:'button',assignments:{type:'button',value:setup.texts.save,onclick:save}}}
						}},
					{td:{align:'right',children:{'input':{contextIdentity:'reset', className:'button',assignments:{type:'button',value:setup.texts.reset,onclick:reset}}}}},
				]}},
				{tr:{children:[{td:{}},
					{td:{colSpan:3, align:'center', children:{'span':{contextIdentity:'msg', className:'message', children:{span:{contextIdentity:'imsg'}}}}}},
				]}},
				{tr:{children:[
					{td:{className:'label', innerHTML:setup.texts.language}},
					{td:{colSpan:3, children:{'select':{className: 'field', onchange:setLanguage, contextIdentity:'lang', children:creOptions()}}}}
				]}},
				creFld(setup.texts.firstName,'fName',formData.firstName,'text',null,false),
				creFld(setup.texts.lastName,'eName',formData.lastName,'text',null,false),
				creFld(setup.texts.email,'email',formData.email,'text',true,false),
				creFld(setup.texts.password,'pwd',formData.pwd,'password',null,true),
				creFld(setup.texts.verifyPassword,'vpwd',formData.vpwd,'password',null,true),
				creFld(setup.texts.oldPassword,'opwd',formData.opwd,'password',null,true),
				{tr:{contextIdentity:'last'}}];
			if(user.phones){
				creNotifications(rows);
				crePhones(rows);
			}
			jr.ec(myDiv, {children:{div:{contextIdentity:'background', className:'background',children:[
				{div:{className:'heading', innerHTML:setup.texts.mySettings}},
				{table:{width:'100%', children:rows}},
				{canvas:{style:{display:'none'},contextIdentity:'clearer',width:45,height:45}}
			]}}},ce);
			if(ce['clearer']){
				clearData = ce['clearer'].getContext("2d").createImageData(45, 45);
				for (var i=0;i<clearData.data.length;i+=4) {
//				color: 103d82
					clearData.data[i+0]=16;
					clearData.data[i+1]=61;
					clearData.data[i+2]=130;
					clearData.data[i+3]=255;
				}
			}
			if(formData.noti)
				checkAll();

			verifyNode=ce.vpwd.parentNode.parentNode;
			oldNode=ce.opwd.parentNode.parentNode;
			msgNode=ce.msg.parentNode.parentNode;
			lastNode=ce.last;
			removeVerify();
			removeMessage();
			OnKeyUp();
			onresize();
			if(user.backgroundColor) {
				$('div.background').css('backgroundColor',user.backgroundColor);
			}
		};
		imgIcons.onload=function(){imgIconsLoaded=1;tryToShow();};
		imgIcons.src=jr.getResource("info6.png");
		this.resize=function(){onresize();};
		this.hide=function(){hide();};
		this.show=function(){show();};
		this.reset=function(){reset();};
		$( window ).resize( onresize );
		jr.eventManager.addListener('myUserConf', jr.eventManager, function(user){if(user)userConf(user);});
		jr.eventManager.addListener('returnTestSend', jr.eventManager, returnTestSend);
		jr.eventManager.addListener( 'newPageTranslation', jr.eventManager, function(d){
			jr.setNewTranslations(d);
			if(window.android && window.android.setTranslation) 
				window.android.setTranslation(jr.translate('MyFarm'), jr.translate('AppStartupText'), jr.translate('AppConnectionErrorText'), jr.translate('AppConnectionErrorButton'))
			setup.init();show();
		});
		jr.ajax( 'Users', 'getMyUser', null, 'myUserConf', null, true );
	}
}
jr.init( function() {
    setup.init();
	new setup.instance(jr.getUrlVar('id'),jr.getUrlVar('uid'),document.body).reset();
} );
