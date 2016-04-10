jr.include('/util.js');
jr.include('/cli.css');
jr.include('/mouseBox.js');
var roles = {
    init: function() {
		roles.texts = {
			roles:				jr.translate('All roles'),
			role:				jr.translate('Role'),
			permissions:		jr.translate('Permissions'),
			nrUsers:			jr.translate('Nr users with role'),
			back:				jr.translate('Back'),
			newRole:			jr.translate('Add new'),
			cancel:				jr.translate('Cancel'),
			save:				jr.translate('Save'),
			delete:				jr.translate('Delete'),
			edit:				jr.translate('Edit'),
			name:				jr.translate('Name'),
			sureDelete:			jr.translate('Are you sure you want to delete role '),
		};
	},
	instance:	function(vcId,myDiv){
	var
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1000);
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'td.dialogLabField' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.heading' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		head=[	roles.texts.role,
				roles.texts.permissions,
				roles.texts.nrUsers],
		myData,
		editData,
		oldData={},
		clearData,
		ce={},
		imgIcons=new Image(),
		onCheck=function(){
		},
		makeCheckbox=function(id,lab,status,arr){
			arr.push({td:{innerHTML:'&nbsp;&nbsp;&nbsp;'}});
			arr.push({td:{children:[{input:{id:id,onchange:onCheck,type:'checkbox',checked:status}}]}});
			arr.push({td:{innerHTML:'<label for="'+id+'">'+lab+'</label>'}});
		},
		Delete=function(){
			if(window.confirm(roles.texts.sureDelete+oldData.roleName))
				jr.ajax('Domains','deleteRole',editData,'myConf');
		},
		save=function(){
			jr.ajax('Domains','setRole',editData,'myConf');
		},
		OnKeyUp=function(){
			editData.roleName=ce['name'].value;
			checkAll();
		},
		checkClick=function(){
			editData.accessRightMask^=this.bit;
			checkAll();
		},
		checkbox=function(key,isChecked){
			var ctx=ce[key].getContext("2d"),isBlack=false;
			ctx.putImageData(clearData, 0, 0);
			if(isBlack)
				ctx.drawImage(imgIcons,40,597+(isChecked?45:0),45,45,0,0,45,45);
			else
				ctx.drawImage(imgIcons,(isChecked?42:0),400,42,45,0,0,42,45);
		},
		makeCheckbox=function(bit,text){
			return {'tr':{onclick:checkClick,className:'topHand',bit:bit,children:[
				{'td':{children:{'canvas':{contextIdentity:bit,width:43,height:43}}}},
				{'td':{children:{'span':{innerHTML:text}}}}
				]}};
		},
		checkAll=function(){
			jr.foreach(myData.permissions,function(r){
				checkbox(r.bit,r.bit&editData.accessRightMask);
			});
			ce['save'].disabled=editData.roleName.length===0||(editData.accessRightMask===oldData.accessRightMask&&oldData.roleName===editData.roleName);
		},
		creFld=function(lab,val){
			var o=
				{tr:{children:[
					{td:{className:'dialogLabField', innerHTML:lab}},
					{td:{children:val}}
				]}};
			return o;
		},
		editRole=function(d){
			var checks=[],t=[],i=-1,p=[];
			editData=d?d:{accessRightMask:0,roleName:'',id:null};
			oldData.accessRightMask=editData.accessRightMask;
			oldData.roleName=editData.roleName;
			ce={};
			hide();
			checks.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:roles.texts.cancel,onclick:makeTable}}}}});
			checks.push({'td':{width:'1%',align:'left',children:{'input':{contextIdentity:'save',className:'button',assignments:{type:'button',value:roles.texts.save,onclick:save}}}}});
			checks.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:roles.texts.role+' - '+(d?roles.texts.edit:roles.texts.newRole)}});
			if(d)
				checks.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:roles.texts.delete,onclick:Delete}}}}});
			t.push(creFld(roles.texts.name,{'input':{className:'heading', contextIdentity:'name', assignments:{type:'text', value:d?d.roleName:'', onkeyup:OnKeyUp}}}));
			while(++i<myData.permissions.length)
				p.push(makeCheckbox(myData.permissions[i].bit,myData.permissions[i].permissionName));
			t.push(creFld(roles.texts.permissions,{'table':{contextIdentity:'content',className:'styleTable',children:p}}));
			jr.ec('div',{parentNode:myDiv,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:checks}}}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:t}}}}
			]}}},ce);
			clearData = ce[myData.permissions[0].bit].getContext("2d").createImageData(45, 45);
			for (var i=0;i<clearData.data.length;i+=4) {
//				color: 103d82
				clearData.data[i+0]=16;
				clearData.data[i+1]=61;
				clearData.data[i+2]=130;
				clearData.data[i+3]=255;
			}
			checkAll();
			onresize();
		},
		details=function(){
			editRole(this.data);
		},
		newRole=function(){
			editRole();
		},
		makeTable=function(){
			hide();
			var checks=[],f=[],t=[],i=-1,stl='styleCleanOk styleRole container';
			checks.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:roles.texts.back,onclick:function(){window.history.back();}}}}}});
			checks.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:roles.texts.roles}});
			checks.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',assignments:{type:'button',value:roles.texts.newRole,onclick:newRole}}}}});
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{className:'styleRubber container',contextIdentity:'hd'+i,id:i,innerHTML:head[i]}}},{'div':{className:'cellSpace'}}]}});
			t.push({'tr':{contextIdentity:'tblHead',className:'container',children:f}});
			jr.foreach(myData.roles,function(r){
				var p='',i=-1;
				while(++i<myData.permissions.length){
					if(myData.permissions[i].bit&r.accessRightMask)
						p+=(p.length?'<br/>':'')+myData.permissions[i].permissionName;
				}
				t.push({'tr':{data:r,onclick:details,children:[
					{'td':{className:stl,innerHTML:'<nobr>'+r.roleName+'&nbsp;'+'</nobr>'}},
					{'td':{className:stl,innerHTML:p+'&nbsp;'}},
					{'td':{className:stl,innerHTML:r.permOrder}}
				]}});
			});
			jr.ec('div',{parentNode:myDiv,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:checks}}}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:t}}}}
			]}}},ce);
			onresize();
		},
		show=function(){
			if(myData){
				makeTable();
			}
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		conf=function(d){
			d.roles.sort(function(o1,o2){return o1.roleName.localeCompare(o2.roleName);});
			d.permissions.sort(function(o1,o2){return o1.permissionName.localeCompare(o2.permissionName);});
			myData=d;
			show();
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		this.setData=function(d){conf(d);};
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)conf(data);else myDiv.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		imgIcons.onload=function(){jr.ajax( 'Domains', 'getAllRoles', null, 'myConf');};
		imgIcons.src=jr.getResource("info6.png");
	}
};
jr.init( function() {
    roles.init();
	var myselft='/roles',path=window.location.pathname;
	if(path.indexOf(myselft,path.length-myselft.length)!==-1){
		document.body.style.width='1000px';
//		document.body.style.backgroundColor='#103d82';
//		document.body.style.height = '99%';
		new roles.instance(jr.getUrlVar('id'),document.body).show();
	}
} );
