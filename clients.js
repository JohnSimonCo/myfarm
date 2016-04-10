jr.include('/cli.css');
jr.include('/mouseBox.js');
jr.include('/util.js');
jr.include('/simpleGraph.js');
if(typeof hr=='undefined'){function hr(n){if(n<120)return n==0?farms.texts.labNow:(n<60?n:'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?t>7200?"":(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t)}function n0(n){return n<10?'0'+n:n}function n3(n){return n<100?'0'+n0(n):n}function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60))}}
var clients = {
    init: function() {
		clients.texts = {
			status_inactive:		jr.translate('Inactive'),
			status_active:			jr.translate('Active'),
			status_newUser:			jr.translate('New user'),
			status_emailed:			jr.translate('E-mail sent'),
			status_deactivated:		jr.translate('Inactive'),
			btn_save:				jr.translate('Save'),
			btn_addNew:				jr.translate('Add new'),
			btn_cancel:				jr.translate('Cancel'),
			btn_deactivate:			jr.translate('Inactivate'),
			lab_deactivateSure:		jr.translate('Are you sure you want to deactivate this user? The user must have a new password to login after this!'),
			btn_activate:			jr.translate('Activate'),
			btn_delete:				jr.translate('Delete user'),
			btn_requestLog:			jr.translate('Req. log'),
			lab_requestLogOk:		jr.translate('Error log will be requested from one of this users devices once.'),
			lab_heading:			jr.translate('Mobile users in '),
			lab_firstName:			jr.translate('First name'),
			lab_lastName:			jr.translate('Last name'),
			lab_latestContactTime:	jr.translate('Latest contact'),
			lab_password:			jr.translate('Password'),
			lab_verifyPassword:		jr.translate('Verify password'),
			lab_passwordConstraint:	jr.translate('at least 6 char'),
			lab_newPassword:		jr.translate('Create new password'),
			lab_newPasswordSure:	jr.translate('Are you sure you want to send a new automatically generated password to user by e-mail?'),
			lab_newPasswordOk:		jr.translate('E-mail with new password is sent!'),
			lab_newPasswordNotOk:	jr.translate('Got problem sending e-mail with new password!'),
			lab_newPasswordNotOk2:	jr.translate('Got problem creating new password!'),
			lab_email:				jr.translate('e-mail address'),
			lab_status:				jr.translate('Status'),
			lab_fieldSpace:			jr.translate(': '),
			lab_newUser:			jr.translate('New user'),
			lab_alsoAccessTo:		jr.translate('Also user in'),
			lab_editUser:			jr.translate('Edit user'),
			lab_activateByEmail:	jr.translate('Save and activate by e-mail'),
			lab_online:				jr.translate('On line'),
			lab_noPermissions:		jr.translate('You have no permission to edit users'),
			lab_deleteSure:			jr.translate('Are you sure you want to delete user: '),
			lab_permissions:		jr.translate('Permissions'),
			lab_permissionTo:		jr.translate('PermissionTo'),
			lab_roles:				jr.translate('Roles'),
			lab_role:				jr.translate('Role'),
			lab_inhereted:			jr.translate('From inheritance'),
		};
		clients.status=[clients.texts.status_newUser,clients.texts.waitEmailConf,clients.texts.waitLegalConf,clients.texts.status_active,clients.texts.status_deactivated,clients.texts.waitEmailChangeConf];
		clients.status_ids={newUser: 0, waitEmailConf: 1, waitLegalConf: 2, active: 3, deactivated: 4, waitEmailChangeConf: 5};
		clients.head=[clients.texts.lab_firstName,clients.texts.lab_lastName,clients.texts.lab_latestContactTime,clients.texts.lab_email,clients.texts.lab_role,clients.texts.lab_status];
	},
	instance:  function(myDiv,onDragStart){
	var
		users,
		sm=0,
		sd=1,
		root,
		domainName,
		target,
		permissionMask,
		domainType,
		allowPasswordChange,
		allowUserNameChange,
		recurseAdminUsersRights,
		permissions,
		tableMembers={},
		verifyPassword,
		verifyPasswordAfter,
		editClient,
		verify=false,
		showClient,
		domainId,
		dialog,
		dialogInd=-1,
		dialogIndNew=-1,
		tableRowParent,
		allRoles,
		allEmails,
		allMyRoles,
		sameLevel,
		cookie=getSessCookie(),
		getDate=	function(d){d=d.getString();return d?parseInt(d,16):null;},
		scls=		function(row,style){var clsn=row.children[0].children[0].className.split(' ')[0]+' '+style;var ii=-1;while(++ii<clients.head.length)row.children[ii].children[0].className=clsn;},
		getString=	function(d){var cnt=d.getInt(),rv=[],i=-1;while(++i<cnt)rv.push(d.getString());return rv;},
		gethashcode=function(s){var h=0,i=-1;while(++i<s.length){h=((h<<5)-h)+s.charCodeAt(i);h=h&h;}return h;},
		onclickSave=function(){
			var user={
				target:			target,
				id:				editClient.id,
				firstName:		editClient.firstName,
				lastName:		editClient.lastName,
				status:			editClient.status,
				email:			editClient.email,
				pwd:			editClient.pwd,
				roles:			editClient.myRoles
			};
			jr.ajax('Users', 'saveUser', user, 'userDataConf' );
			onclickCancel();
		},
		onclickCancel=function(){
			if(dialogIndNew>=0){
				dialogIndNew=-1;
				if(verify){
					verifyPassword.parentNode.removeChild(verifyPassword);
					verify=false;
				}
				render();
			}
		},
		onclickDelete=function(){
			if(confirm(clients.texts.lab_deleteSure+' \"'+editClient.firstName+' '+editClient.lastName+'\"')){
				onclickCancel();
				jr.ajax('Users', 'delete', target+','+editClient.id, 'userDataConf' );
			}
		},
		onclickRequestLog=function(){
			jr.ajax('Users', 'requestLog', {userId:editClient.id, active: true}, 'returnRequestLog' );
			$('#requestLog').prop('disabled',true);
			i=-1;
			while(++i<users.length&&users[i].id!==editClient.id){};
			if(i<users.length){
				users[i].requestLog=true;
			}
		},
		returnRequestLog=function(data){
			if(data) {
				alert(clients.texts.lab_requestLogOk);
			}
		},
		onclickNewPassword=function(){
			if(confirm(clients.texts.lab_newPasswordSure)){
				var params={
					target:			target,
					user:			editClient.id
				};
				jr.ajax('Users', 'newPassword', params, 'returnNewPassword' );
			}
		},
		onActdeact=function(){
			if(this.client.status!==clients.status_ids.active || confirm(clients.texts.lab_deactivateSure)) {
				this.client.status=this.client.status===clients.status_ids.active?(this.client.orginal?clients.status_ids.deactivated:clients.status_ids.newUser):clients.status_ids.active;
				var e=document.getElementById("status");
				e.value=this.client.getStatusText();
				e.className=this.client.getStatusStyle();
				document.getElementById("edStatus").value=this.client.status!==clients.status_ids.active?clients.texts.btn_activate:clients.texts.btn_deactivate;
			}
			this.client.isOk();
		},
		initDialog=	function(user){
			return jr.ec('tr',{children:{'td':{assignments:{colSpan:clients.head.length},children:[{'div':{className:'styleDialog',children:[
					{'div':{className:'dialogHeading',id:'dialogHeading',innerHTML:user.firstName.length===0?clients.texts.lab_newUser:clients.texts.lab_editUser}},
					{'table':{className:'dialogTable',children:user.initDialog()}},
					{'div':{className:'dialogHeading',children:[
						{'input':{assignments:{id:'save',onclick:onclickSave,type:'button',value:clients.texts.btn_save}}},{'span':{className:'betweenSpace',innerHTML:'   '}},
//						{'input':{assignments:{id:'activateEmail',onclick:pg.onclickEmail,type:'button',value:lab_activateByEmail}}},{'span':{className:'betweenSpace',innerHTML:'   '}},
						{'input':{assignments:{id:'cancel',onclick:onclickCancel,type:'button',value:clients.texts.btn_cancel}}},{'span':{className:'betweenSpace',innerHTML:'   '}},
						permissionMask&0x800000?{'input':{assignments:{id:'delete',onclick:onclickDelete,type:'button',value:clients.texts.btn_delete}}}:{},{'span':{className:'betweenSpace',innerHTML:'   '}},
						permissionMask&0x4000?{'input':{assignments:{disabled:user.requestLog,id:'requestLog',onclick:onclickRequestLog,type:'button',value:clients.texts.btn_requestLog}}}:{},{'span':{className:'betweenSpace',innerHTML:'   '}},
						recurseAdminUsersRights[user.topNodeId]?{'input':{assignments:{id:'newPassword',onclick:onclickNewPassword,type:'button',value:clients.texts.lab_newPassword}}}:{}
					]}}]}}]}}});
		},
		renderDialog=	function(d){
			editClient=d;
			dialog=initDialog(editClient);
			render();
			if(dialogIndNew!=0) {
				$('#email').prop("disabled",true);
				if(editClient.email!=cookie.email && !(allowUserNameChange&&(permissionMask&0x4000))) {
					$('#fname').prop("disabled",true);
					$('#lname').prop("disabled",true);
				}
			}
			if (!editClient.firstName.length>0) {
				var dl = document.getElementById("delete");
				if (dl)
					dl.style.display='none';
				var np = document.getElementById("newPassword");
				if (np)
					np.style.display='none';
			}
			if(!editClient.isOk() && !$('#email').prop("disabled")) {
				$('#email').focus().select();
			} else if((verifyPassword=document.getElementById("verifypassword"))) {
				verifyPassword=verifyPassword.parentNode.parentNode;
				verifyPasswordAfter=verifyPassword.nextSibling;
				verifyPassword.parentNode.removeChild(verifyPassword);
				var dl = document.getElementById("delete");
				if (dl)
					dl.style.visibility=editClient.firstName.length>0?'visible':'hidden';
				document.getElementById(editClient.isOk()?'password':'fname').focus();				
			}
		},
		updateSortHeader=	function(){
			var i=-1;
			while(++i<clients.head.length)
				document.getElementById('hd'+i).className='styleRubber container '+(i===sm?'headchoosen':'headlabel');
		},
		sort=		function(o1,o2){
			switch(sm){
				case 2:	if(o1.lastAccessed||o2.lastAccessed)
							return -sd*(o1.lastAccessed>o2.lastAccessed?1:-1);
						else
							return -sd*(o1.created>o2.created?1:-1);
				case 0:	var cmp;
						return sd*((cmp=o1.firstName.toLowerCase().localeCompare(o2.firstName.toLowerCase())) === 0 ? o1.lastName.toLowerCase().localeCompare(o2.lastName.toLowerCase()) : cmp);
				case 1:	return sd*((cmp=o1.lastName.toLowerCase().localeCompare(o2.lastName.toLowerCase())) === 0 ? o1.firstName.toLowerCase().localeCompare(o2.firstName.toLowerCase()) : cmp);
				case 3:	return sd*(o1.email>o2.email?1:-1);
				case 4:	var rl1=allRoles[o1.myRoles[0]].roleName,rl2=allRoles[o2.myRoles[0]].roleName;
						return sd*(rl1===rl2?(cmp=o1.firstName.toLowerCase().localeCompare(o2.firstName.toLowerCase())) === 0 ? o1.lastName.toLowerCase().localeCompare(o2.lastName.toLowerCase()) : cmp:rl1.localeCompare(rl2));
				case 5:	return sd*(o1.status===o2.status?(cmp=o1.firstName.toLowerCase().localeCompare(o2.firstName.toLowerCase())) === 0 ? o1.lastName.toLowerCase().localeCompare(o2.lastName.toLowerCase()) : cmp:o1.status-o2.status);
			}
		},
		creField=	function(lab,val){
			return {'tr':{children:[
				{'td':{children:{div:{assignments:{className:'dialogLabField',innerHTML:lab}}}}},
				{'td':{children:{div:{assignments:{innerHTML:clients.texts.lab_fieldSpace}}}}},
				{'td':{children:[val]}}]}};
		},
		checkEmail=function() {
			var email;
			if((email = allEmails[this.value.toLowerCase()])) {
				$('#fname').val(email.firstName).prop("disabled",true);
				$('#lname').val(email.lastName).prop("disabled",true);
			} else {
				$('#fname').prop("disabled",false);
				$('#lname').prop("disabled",false);
			}
		},
		user=function(d){
			if(d)
				var rls=[];
				if(typeof d === 'string'){
					// new user
					this.id =				d;
					this.accessRightMask =	0;
					this.created =			0;
					this.email =
					this.firstName =
					this.lastName =			'';
					this.status =			0;
					this.lastAccessed =		0;
					this.requestLog =		false;
					this.roles =			[];
					this.myRoles =			rls;
					this.access =			0;
					this.topNode =			null;
				}
				else{
					this.accessRightMask =	d.accessRightMask;
					this.created =			d.created;
					this.email =			d.email?d.email:'';
					this.firstName =		d.firstName;
					this.lastName =			d.lastName?d.lastName:'';
					this.id =				d.id;
					this.status =			d.status;
					this.lastAccessed =		d.lastAccessed?d.lastAccessed:0;
					this.requestLog =		d.requestLog?true:false;
					this.roles =			d.roles;
					this.myRoles =			rls;
					this.access =			d.access;
					this.topNodeId =		d.topNodeId;
					if(this.roles){
						var i=-1;
						while(++i<d.roles.length&&target!==d.roles[i].domainId){}
						if(i<d.roles.length)
							jr.foreach(d.roles[i].roles,function(s){rls.push(s)})
						rls.sort();
					}
					this.nrOnline=0;
					if(d.isOrginal)
						this.orginal=d;
					else {
						this.isOrginal =		true;
						users.push(this);
					}
				}
			this.getGui=function(){
				Date.prototype.tmf="y-m-d H:M";
				var rls='';
				jr.foreach(this.myRoles,function(r){if(rls.length)rls+='<br>';rls+=allRoles[r].roleName});
				return [this.id,this.firstName,this.lastName.length?this.lastName:'&nbsp;',this.nrOnline>0?clients.texts.lab_online+(this.nrOnline>1?' ('+this.nrOnline+')':''):this.lastAccessed===0?'('+new Date(this.created).print()+')':(new Date(this.lastAccessed)).print(),this.email.length?this.email:'&nbsp;',rls,this.status];
			};
			this.getStatusText=function(){
				return clients.status[this.status];
			};
			this.initDialog=function(){
				var s,v,rVal=[
					creField(clients.texts.lab_email,{'input':{assignments:{id:'email',type:'text',className:'dialogValueField',value:this.email,onblur:checkEmail}}}),
					creField(clients.texts.lab_firstName,{'input':{assignments:{id:'fname',type:'text',className:'dialogValueField',value:this.firstName}}}),
					creField(clients.texts.lab_lastName,{'input':{assignments:{id:'lname',type:'text',className:'dialogValueField',value:this.lastName}}})]
				if(dialogIndNew&&allowPasswordChange&&(permissionMask&0x4000)){
					rVal.push(v=creField(clients.texts.lab_password,{'input':{assignments:{id:'password',type:'password',className:'dialogValueField',value:''}}}));
					rVal.push(creField(clients.texts.lab_verifyPassword,{'input':{assignments:{id:'verifypassword',type:'password',className:'dialogValueField',value:''}}}));
				}
				if(permissionMask&0x4000){
					rVal.push(s=creField(clients.texts.lab_status,{'input':{assignments:{id:'status',type:'text',disabled:'true',className:this.getStatusStyle(),value:clients.status[this.status]}}}));
					if(this.status===clients.status_ids.active || this.status===clients.status_ids.deactivated || this.status===clients.status_ids.newUser)
						s.tr.children[2].td.children.push({'input':{assignments:{id:'edStatus',client:this,onclick:onActdeact,type:'button',value:this.status!==clients.status_ids.active?clients.texts.btn_activate:clients.texts.btn_deactivate}}});
				}
				rVal.push(creField(clients.texts.lab_roles,roleDialog(this)));
				return rVal;
			};
			this.getStatusStyle=function(){
				return this.status==clients.status_ids.active?'styleWhite':this.status===clients.status_ids.deactivated?'styleRed':'styleYellow';
			};
			this.serialize=function(){
				var d=new JsSerilz('$');
				d.serialize(this.id,this.firstName,this.lastName,this.status,this.email,this.pwd!==0?this.pwd:'',this.myRoles?this.myRoles.length:0);
				if(this.myRoles){
					var i=-1;
					while(++i<this.myRoles.length)
						d.serialize(this.myRoles[i]);
				}
				return d.getData();
			};
			this.same=function(){
				return this.name===this.orginal.same;
			};
			this.trim=function(id){
				var id = "#"+id;
				return $(id)&&$(id).val()?$(id).val().trim():'';
			};
			this.collect=function(){
				this.firstName=this.trim("fname");
				this.lastName=this.trim("lname");
				this.email=this.trim("email");
				this.ppw=this.trim("password");
				if(verify^(this.ppw.length>0))
					if(verify)
						verifyPassword.parentNode.removeChild(verifyPassword);
					else
						verifyPasswordAfter.parentNode.insertBefore(verifyPassword,verifyPasswordAfter);
				verify=this.ppw.length>0;
				this.pwd=this.ppw!=null&&this.ppw.length>=6?gethashcode(this.id+this.ppw):0;
			}
			this.isOk=function(){
				var dl = document.getElementById("delete");
				if (dl && !dialogInd>0)
					dl.style.display='none';
				var filter=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				this.collect();
				var ok=!this.orginal||(this.email.length===0&&this.orginal.email.length===0);
				if(!ok)
					ok=filter.test(this.email)||!this.orginal||this.orginal.email.length>0;
				ok&=this.firstName.length>0&&this.lastName.length>0;
				if(this.ppw.length>0)
					ok&=this.ppw===document.getElementById("verifypassword").value.trim();
				ok&=this.myRoles.length>0;
				document.getElementById('save').disabled=!ok||(this.orginal&&(this.serialize()===this.orginal.serialize()));
				return ok;
			};
		},
		onClickQueue=function(){
			
		},
		onKey=		function(){
			if(dialogInd>=0){
				editClient.isOk();
				if(event.which===27&&document.getElementById('save').disabled)
					onclickCancel();
			}
		},
		onclickAdd=function(){
			jr.ajax( 'Users', 'newUserId', null, 'newId' );
		},
		onclickClient=function(){
			var ok;
			if (dialogInd>=0){
				editClient.collect();
				if (editClient.serialize()!==editClient.orginal.serialize())
					return;
				onclickCancel();
			}
			if(dialogInd<0)
				if((ok=permissionMask&0x40)){
					var id=showClient?showClient:this.id,i=-1;
					showClient=null;
					mouseBox.hide();
					while(++i<users.length&&users[i].id!==id);
					if((ok=i<users.length)){
						dialogIndNew=i+1;
						renderDialog(new user(users[i]));
					}
				}
				if(!ok)window.alert(clients.texts.lab_noPermissions);
		},
		onclickHead=function(){
			var nsm=parseInt(this.id.substring(2));
			if (nsm===sm)
				sd=-sd;
			else {
				sm=nsm;
				sd=1;
			}
			render();
		},
		onRoleTip=function(){
			var mask=allRoles[this.roleId].accessRightMask&~0x2200,i=-1,s=[];
			while(++i<permissions.length)
				if(permissions[i]&&(mask&(1<<permissions[i].bit)))
					s.push(permissions[i].name);
			if(s.length)
				popup(clients.texts.lab_permissionTo,s);
		},
		roleChange=function(){
			var id=this.id;
			if(this.checked){
				editClient.myRoles.push(id);
				editClient.myRoles.sort();
			}
			else{
				var i=-1;
				while(editClient.myRoles[++i]!==id){}
				editClient.myRoles.splice(i,1);
			}
			editClient.isOk();
			var r=0;
			r++;
		},
		roleDialog=function(cc){
			var pp=[],i=-1,role,j,isChecked,disabled,included,myself=cookie.email===cc.email;
			for(var id in allRoles){
				isChecked=false;
				role=allRoles[id];
				if(((permissionMask&0x4000)===0)&&(((domainType===0)^((role.accessRightMask&0x2000)!==0))||(!myself&&sameLevel&&((role.accessRightMask&0x200)===0))||(role.accessRightMask===0)))
					continue;
				if(cc.myRoles){
					j=-1;
					while(++j<cc.myRoles.length&&cc.myRoles[j]!==id){}
					isChecked=j<cc.myRoles.length;
				}
				included=allMyRoles[id]||(allRoles[id].accessRightMask===0);
				disabled=isChecked&&!included;
				if(included||disabled)
					pp.push({tr:{roleId:id,nme:role.roleName,onmouseover:i===3?onAccess:onRoleTip,onmouseout:mouseBox.hide,onmousemove:mouseBox.move,children:[{td:{children:[{input:{id:id,onchange:roleChange,type:'checkbox',checked:isChecked,disabled:disabled}}]}},{td:{assignments:{align:'left'},children:[{div:{innerHTML:'<label for="'+id+'">'+role.roleName+'</label>'}}]}}]}});
			}
			pp.sort(function(o1,o2){return o1.tr.nme.localeCompare(o2.tr.nme);});
			return {div:{className:'dialogArea1',children:[{div:{className:'dialogArea',children:[{'table':{className:'dialogTable',children:pp}}]}}]}};
		},
		permChange=		function(){
			if(this.checked)editClient.accessRightMask|=this.bit;
			else editClient.accessRightMask-=this.bit;
			editClient.isOk();
		},
		render=		function(){
			var a=[],i=-1;while(++i<users.length)a.push(users[i].id);
			users.sort(sort);
			i=-1;while(++i<users.length)if(a[i]!==users[i].id)break;
			var parent=tableRowParent;
			if (i<users.length&&users.length>0||dialogInd!==dialogIndNew){
				if (i<users.length&&dialogInd>=0&&dialogIndNew>=0){
					i=-1;while(++i<users.length&&users[i].id!==a[dialogInd-1]);
					dialogIndNew=i+1;
				}
				jr.foreach(users, function(d){parent.removeChild(d.gui);});
				if (dialogInd>=0)parent.removeChild(dialog);
				i=-1;
				while(++i<=users.length){
					if(i===dialogIndNew)
						parent.appendChild(dialog);
					if(i<users.length){
						parent.appendChild(users[i].gui);
						var cName=(users[i].getStatusStyle())+' container'+(dialogIndNew>=0&&dialogIndNew-1!==i?' opac':'');
						scls(users[i].gui,cName);
					}
				}
				dialogInd=dialogIndNew;
				document.getElementById("add").disabled=dialogInd>=0;
			}
			updateSortHeader();
		},
		hide=function(){
			if(root)myDiv.removeChild(root);
			root=null;
			dialogInd=-1;
		},
		makeDiv = function(text){
			return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
		},
		popup=function(lab,s,lab2,s2){
			var ss;
			jr.foreach(s, function(d){if(ss)ss+='<br/>';else ss='';ss+=d;});
			s='<b>'+lab+'</b><br/>'+ss;
			mouseBox.show(makeDiv(s),'mouseBoxDiv');
			mouseBox.move();
		},
		onAccess=function(){
			if(dialogIndNew<0){
				var roles=this.user.roles,s=[],ss=[],i=-1,r;
				if(roles&&roles.length>0){
					while(++i<roles.length)
						if((r=roles[i]).domainId!==target){
							var name=r.domainPathName,j=name.indexOf('.');
							ss.push('&nbsp;&nbsp;'+name.substr(j>=0?j+1:0));
						}
					if(ss.length){
						ss.sort(function(o1,o2){return o1.localeCompare(o2);});
						jr.foreach(ss,function(a){s.push(a)});
						popup(clients.texts.lab_alsoAccessTo,s);
					}
				}
			}
		},
		listPerm=function(u,mask){
			var i=-1,s=[];
			while(++i<permissions.length)
				if(permissions[i]&&(mask&(1<<permissions[i].bit)))
					s.push('&nbsp;&nbsp;'+permissions[i].name);
			s.sort(function(o1,o2){return o1.localeCompare(o2);});
			return s;
		},
		onToolTip = function(){
			if(dialogIndNew<0){
				var s,mask=this.user.accessRightMask&~0x2200,ss;
				s=listPerm(this.user,mask);
				mask=(this.user.access&~mask)&~0x2200;
				ss=listPerm(this.user,mask);
				if(ss.length>0){
					s.push('<b>'+clients.texts.lab_inhereted+'</b>');
					s=s.concat(ss);
				}
				if(s.length>0)
					popup(clients.texts.lab_permissionTo,s);
			}
		},
		dragstart=function(){
			if(onDragStart)
				onDragStart(this.id);
		},
		renderTable=function(head,users) {
			var i=-1,f=[];
			users.sort(sort);
			hide();
			root=jr.ec('div',{parentNode:myDiv,className:'styleBackground',children:{'div':{contextIdentity:'background',className:'background'}}},tableMembers);
			var el=[];
			el.push({'div':{onclick:onClickQueue,className:'topHeading topHand',innerHTML:clients.texts.lab_heading+' '+domainName}});
			if(permissionMask&0x40)el.push({'input':{assignments:{id:'add',onclick:onclickAdd,type:'button',value:clients.texts.btn_addNew}}});
			el.push({'div':{}});
			jr.ec('div',{parentNode:tableMembers.background,className:'top',children:el});
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{id:'hd'+i,innerHTML:head[i],onclick:onclickHead}}},{'div':{className:'cellSpace'}}]}});
			jr.ec('table',{parentNode:tableMembers.background,className:'styleTable',children:[
				{'tr':{assignments:{id:'tblHead'},className:'container',children:f}},
				function(parent){
					var ii=-1;
					while(++ii<users.length) {
						var flds=users[ii].getGui();
						var cName=(users[ii].getStatusStyle())+' container';
						var i=-1,f=[];
						while(++i<flds.length-1)f.push({'td':{children:[{'div':{className:cName,
												draggable:true,ondragstart:dragstart,
												onclick:onclickClient,onmouseover:i===3?onAccess:onToolTip,onmouseout:mouseBox.hide,onmousemove:mouseBox.move,
												assignments:{user:users[ii],id:users[ii].id,showProfile:i===flds.length-2,
												innerHTML:(i===flds.length-2?users[ii].getStatusText():flds[i+1])}}},{'div':{className:'cellSpace'}}]}});
						users[ii].gui=jr.ec('tr',{parentNode:parent,children:f});
					}
				}
				]});
			tableRowParent=document.getElementById("tblHead").parentNode;
			updateSortHeader();
		};

		this.show=function(showDomainId,clientId){
			showClient=clientId;
			hide();
			jr.ajax( 'Users', 'getUsersAtDomain', domainId=showDomainId, 'userDataConf' );
		};
		this.hide=function(){
			hide();
		};
		
		document.onkeyup=onKey;
		jr.eventManager.addListener('newId',jr.eventManager,function(data){
			dialogIndNew=0;
			renderDialog(new user(data));
		});
		jr.eventManager.addListener('userDataConf',jr.eventManager,function(data){
			if(data){
				users=[];
				allMyRoles={};
				for(var key in data.allRoles){
					var role=data.allRoles[key],mask=~0x2200;
					if(((role.accessRightMask&data.perm)&mask)===(role.accessRightMask&mask))
						allMyRoles[key]=role;
				}
				
				allRoles=data.allRoles;
				allEmails=data.allEmailAddresses;
				recurseAdminUsersRights=data.recurseAdminUsersRights;
				target=data.target;
				sameLevel=false;
				jr.foreach(data.users, function(d){
					if(cookie.email===d.email)
						sameLevel=true;
					if(d.roles){
						var i=-1;
						while(++i<d.roles.length&&d.roles[i].domainId!==target){}
						d.accessRightMask=0;
						jr.foreach(d.roles,function(domain){
							if(domain.domainId===target)
								jr.foreach(domain.roles,function(id){
									d.accessRightMask|=allRoles[id].accessRightMask;
								})
						});
					}
				});	// [id firstName lastName status email lastAccessed created access]
				jr.foreach(data.users, function(d){new user(d);});	// [id firstName lastName status email lastAccessed created accessRightMask]
				domainName=data.domainName;
				permissionMask=data.perm;
				domainType=data.domainType;
				allowPasswordChange=data.allowPasswordChange;
				allowUserNameChange=data.allowUserNameChange;
				var i=-1;
				permissions=[];
				while(++i<data.permissions.length)
					permissions.push(data.permissions[i]?{name:jr.translate(data.permissions[i]),bit:i}:null);
				permissions.sort(function(o1,o2){return o1&&o2?o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()):0});
				renderTable(clients.head,users);
				if(data.backgroundColor) {
					$('div.styleBackground').css('backgroundColor',data.backgroundColor);
					$('div.styleBackground').css('background','-webkit-gradient(linear,0 0,0 100%,from('+data.backgroundColor+'),to('+data.backgroundColor+'))');
				}
				if(showClient){
					dialogInd=-1;
					onclickClient();
				}
			}
		});
		jr.eventManager.addListener('returnNewPassword',jr.eventManager,function(data){
			if(data) {
				if(data=='true') {
					alert(clients.texts.lab_newPasswordOk);
				} else {
					alert(clients.texts.lab_newPasswordNotOk);
				}
			} else {
				alert(clients.texts.lab_newPasswordNotOk2);
			}
		});
		jr.eventManager.addListener('returnRequestLog',jr.eventManager,returnRequestLog);
	}
};
jr.init( function() {
    clients.init();
	var myselft='/clients',path=window.location.pathname;
	if(path.indexOf(myselft,path.length-myselft.length)!==-1){
		document.body.style.width='900px';
		var inst=new clients.instance(document.body);
		inst.show();
	}
} );
