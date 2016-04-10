jr.include( '/util.js' );
jr.include( '/tree.js' );
jr.include( '/mouseBox.js' );
jr.include( '/farms.js' );
jr.include( '/farm.js' );
jr.include( '/clients.js' );
jr.include( '/domain.css' );

var domains = {
	cookieName : '_AppDomBtn',
    init: function() {
		domains.texts = {
			expandAll:	jr.translate('Expand all in'),
			collapseAll:jr.translate('Collapse all in'),
			activate:	jr.translate('Activate Farm'),
			inactivate:	jr.translate('Inactivate Farm'),
			editUsers:	jr.translate('Edit users in'),
			addDomain:	jr.translate('Add new in'),
			editDomain:	jr.translate('Edit'),
			deleteDomain:jr.translate('Delete'),
			giveLicence:jr.translate('Give licences to'),
			removeLicence:'Remove all $nrLicences licence(s) from $node',
			licence:	jr.translate('licence'),
			licences:	jr.translate('licences'),
			nrLicence:	jr.translate('Number of licences'),
			wrongLicence:jr.translate('Number of licences shall be 1-100'),
			offlineInterval:jr.translate('offlineInterval'),
			pingInterval:jr.translate('pingInterval'),
			minutes:	jr.translate('min'),
			seconds:	jr.translate('sec'),
			isFetching: jr.translate('...fetching...'),
			editName:	jr.translate('Edit name for'),
			hideTree:	jr.translate('Hide tree'),
			showTree:	jr.translate('Show tree'),
			setup:		jr.translate('Setup'),
			search:		jr.translate('Search'),
			searchUser:	jr.translate('Search user'),
			move:		jr.translate('Move'),
			toLeft:		jr.translate('to the left'),
			toRight:	jr.translate('to the right'),
			save:		jr.translate('Save'),
			saveAs:		jr.translate('Save as new button'),
			newName:	jr.translate('New name for button'),
			newUnit:	jr.translate('Name on new Unit'),
			deleteButton:jr.translate('Delete'),
			deleteSure:	jr.translate('Are you sure you want to delete button'),
			roles:		jr.translate('Edit roles'),
			setOwner:	jr.translate('Change owner of VC'),
			broadcastNotification:	jr.translate('Send Broadcast'),
			disconnectedUsers:		jr.translate('Disconnected users')
		};
		perms = {
			AdminUsers:			0x00000040,
			MoveLicence:		0x00000400,
			AdminSuper:			0x00004000,
			AdminCreateLicence:	0x00008000,
			AdminTree:			0x00100000
		};
	},
	imgIconPos:	[[1,0],[3,2],[3,2],[3,2],	[4,0],[4,0],[7,0],[7,0],	[2,0],[3,2],[3,2],[3,2],	[5,0],[5,0],[8,0],[8,0],
				 [3,0],[3,2],[3,2],[3,2],	[6,0],[3,2],[9,0],[3,2],	[3,0],[3,2],[3,2],[3,2],	[6,0],[6,0],[9,0],[9,0]],
	domain: function() {
		var treeButtons,
			domainData,
			treeInstance,
			loadCount=2,
			imgIconWidth=19,
			imgIconHeight=20,
			showTree,
			btnIndex,
			mouseX,
			mouseY,
			moveLicensesFrom=null,
			imgIcons=new Image(),
			ceMyDiv={},
			parentsToOpen,
			domainSearchedFor,
			farmsInstance,
			clientInstance,
			clientInstanceId,
			clientDragFrom,
			lastQueryString,
			myDiv=jr.ec('div',{parentNode:document.body,width:'100%',children:[
				{div:{contextIdentity: 'buttons'}},
				{div:{contextIdentity: 'left',style:{display:'inline-block','vertical-align':'top'}}},
				{div:{contextIdentity: 'right',style:{display:'inline-block','vertical-align':'top'}}}
			]},ceMyDiv),
			treeBtnData=function(d){
				var i=0,dd=[];
				if(d){
					d=new JsSerilz('$',d);
					i=d.getInt();
				}
				while(--i>=0)
					dd.push(d.getString());
				this.data=dd;
				this.getName=function(ind){
					return this.data.length?this.data[ind].substr(0,this.data[ind].indexOf(',')):'';
				}
				this.getData=function(ind){
					return this.data[ind].substr(this.data[ind].indexOf(',')+1);
				}
				this.add=function(s){
					this.data.push(s)
					return this.serialize();
				}
				this.setName=function(ind,s){
					var d=this.data[ind],i=d.indexOf(',');
					this.data[ind]=s+d.substr(i);
					return this.serialize();
				}
				this.move=function(ind,newIndex){
					var d=this.data[ind];
					this.data[ind]=this.data[newIndex];
					this.data[newIndex]=d;
					return this.serialize();
				}
				this.setData=function(ind,data){
					var d=this.data[ind],i=d.indexOf(',');
					this.data[ind]=d.substr(0,i+1)+data;
					return this.serialize();
				}
				this.getData=function(ind){
					var d=this.data[ind],i=d.indexOf(',');
					return d.substr(i+1);
				}
				this.remove=function(ind){
					this.data.splice(ind,1);
					return this.serialize();
				}
				this.serialize=function(){
					var s=this.data.length.toString()+'$';
					jr.foreach(this.data, function(d){s+=d+'$'});
					return s;
				}
			},
			fixName=function(name){
				if(name&&(name=name.trim()).length)
					return name.replace(',','').replace('$','_');
				return null;
			},
			eraseAll=function(div){
				while(div.childNodes.length>0)
					div.removeChild(div.childNodes[0]);
			},
			onClickMenuBtn=function(){
				var id=this.id,serialized,expanded,name,old;
				if(id==0){
					old=treeButtons.getData(btnIndex);
					if((expanded=treeInstance.getExpanded()).length&&old!=expanded)
						serialized=treeButtons.setData(btnIndex,expanded);
				}
				else if(id==-1){
					if((name=fixName(window.prompt(domains.texts.newName+' '+treeButtons.getName(btnIndex)))))
						serialized=treeButtons.setName(btnIndex,name);
				}
				else if(id==-2){
					if((expanded=treeInstance.getExpanded()).length&&((name=fixName(window.prompt(domains.texts.saveAs))))){
						if(treeButtons==null)
							treeButtons=new treeBtnData();
						serialized=treeButtons.add(name+','+expanded);
						btnIndex=treeButtons.data.length-1;
					}
				}
				else if(id==-3)
					serialized=treeButtons.move(btnIndex,btnIndex=btnIndex-1);
				else if(id==-4)
					serialized=treeButtons.move(btnIndex,btnIndex=btnIndex+1);
				else{
					treeButtons.remove(btnIndex=id-1);
					jr.ajax( 'Domains', 'saveTreeButtons', treeButtons.serialize(), 'newTreeButtons', null, false );
					pushButton(btnIndex-1);
				}
				if(serialized){
					jr.ajax( 'Domains', 'saveTreeButtons', serialized, 'newTreeButtons', null, false );
					pushButton(btnIndex);
				}
				hideMenu();
			},
			addMenuBtn=function(ent,text,id,name,onClick){
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:onClick,innerHTML:text+(name?' '+name:'')}});
			},
			addMenuHeading=function(ent,text){
				ent.push({'div':{onmouseout:noMenu,className:'menuHead',innerHTML:text}});
			},
			searchFkn=function(){
				var s;
				mouseX=window.event.clientX-8;
				mouseY=window.event.clientY+window.pageYOffset-10;
				if((s=window.prompt(domains.texts.searchUser)))
					jr.ajax( 'Users', 'search', s, 'searchUser' );
			},
			showMenu=function(ent,x,y){
				mouseBox.hide();
				mouseBox.show(jr.ec('div',{className:'menusAll',children:{'div':{children:ent}}}));
				mouseBox.asMenu(x,y);
			},
			setupFkn=function(){
				var ent=[],name=treeButtons==null?null:treeButtons.getName(btnIndex),changed=treeButtons==null?true:treeButtons.getData(btnIndex)!=treeInstance.getExpanded();
				if(name&&changed)
					addMenuBtn(ent,domains.texts.save,0,null,onClickMenuBtn);
				if(changed)
					addMenuBtn(ent,domains.texts.saveAs,-2,null,onClickMenuBtn);
				if(name)
					addMenuBtn(ent,domains.texts.editName,-1,name,onClickMenuBtn);
				if(treeButtons){
					if (btnIndex>0)
						addMenuBtn(ent,domains.texts.move,-3,name+' '+domains.texts.toLeft,onClickMenuBtn);
					if (btnIndex<treeButtons.data.length-1)
						addMenuBtn(ent,domains.texts.move,-4,name+' '+domains.texts.toRight,onClickMenuBtn);
					var i = -1;
					while(++i<treeButtons.data.length)
						addMenuBtn(ent,domains.texts.deleteButton,i+1,treeButtons.getName(i),onClickMenuBtn);
				}
				showMenu(ent);
			},
			showTreeDiv=function(doShow){
				if((showTree=doShow))
					myDiv.insertBefore(ceMyDiv.left,ceMyDiv.right);
				else
					myDiv.removeChild(ceMyDiv.left);
				setupBtn();
			},
			hideShowFkn=function(){
				showTreeDiv(!showTree);
				setButtonIndexInCookie(btnIndex);
			},
			pushButton=function(ind){
				if(ind<0)
					ind=0;
				setButtonIndexInCookie(btnIndex=ind);
				loadCount=1;
				jr.ajax( 'Domains', 'getDomains', {btnIndex:ind}, 'getDomains', null, false );
				setupBtn();
			},
			btnFkn=function(){
				pushButton(this.id);
			},
			addBtn=function(text,onClickFkn,id,isDefault,nrSpaces){
				if(nrSpaces==null)
					nrSpaces=1;
				var i=-1;
				jr.ec('input',{id:id,parentNode:ceMyDiv.buttons,onclick:onClickFkn,type:'button',className:'button'+(isDefault?' BtnPressed':''),value:text});
				while(++i<nrSpaces)
					jr.ec('span',{parentNode:ceMyDiv.buttons,className:'betweenSpace',innerHTML:'&nbsp;'});
			},
			getButtonIndexFromCookie=function(){
				var cookie=getCookie(domains.cookieName),index=1;
				if(cookie!=null)
					index = parseInt(cookie,10);
				if(isNaN(index))index=1;
				btnIndex=Math.abs(index)-1;
				showTree=index>0;
			},
			setButtonIndexInCookie=function(index){
				index=parseInt(index)+1;
				if(!showTree)index=-index;
				setCookie(domains.cookieName,index.toString(),1000);
			},
			setupBtn=function(){
				eraseAll(ceMyDiv.buttons);
				addBtn(showTree?domains.texts.hideTree:domains.texts.showTree,hideShowFkn);
				if(showTree){
					addBtn(domains.texts.setup,setupFkn,-1,false,1);
					if(domainData.perm&perms.AdminSuper) {
						addBtn(domains.texts.roles,function(){navigateTo('/Delaval/mvc/Pages/Show/roles')},-1000,false,1);
						addBtn(domains.texts.broadcastNotification,function(){navigateTo('/Delaval/mvc/Pages/Show/BroadcastNotification')},-1002,false,1);
						addBtn(domains.texts.disconnectedUsers,function(){hideOtherInstance();clientInstance.show(clientInstanceId=null);},-1001,false,1);
					}
					addBtn(domains.texts.search,searchFkn,-2,false,5);
				}
				if(treeButtons){
					var i=-1;
					while(++i<treeButtons.data.length)
						addBtn(treeButtons.getName(i),btnFkn,i,i==btnIndex);
				}
			},
			loaded=function(){
				if(--loadCount<=0){
					eraseAll(ceMyDiv.left);
					eraseAll(ceMyDiv.buttons);
					treeInstance=new jsTree(ceMyDiv.left,domainData,imgIcons,domains.imgIconPos,imgIconWidth,imgIconHeight,
											onMoreData,domains.texts.isFetching,onclick,ondrag,onrightclick,onChangeTree,true);
					onChangeTree();
//console.log(treeInstance.getNodesOfType(2));
					setupBtn();
				}
			},
			hideOtherInstance=function(){
				clientInstance.hide();
				farmsInstance.hide();
			},
			onclick=function(id,name){
				var type=treeInstance.getType(id);
				var status=treeInstance.getStatus(id);
				if(status==1) {
					if(type>=0){
						hideOtherInstance();
//						if(type==2) {
//							farmsInstance.show(lastQueryString);
//							$('div.styleBackground').css('width','800px');
//						} else
							clientInstance.show(clientInstanceId=id);
					}
				}
			},
			hideMenu=function(){
				mouseBox.hide();
				treeInstance.setOkToToolTip();
			},
			noMenu = function(){
				var x=window.event.x,y=window.event.y,div=this.parentElement;
				var rect=div.getClientRects();
				if(rect.length>0&&(x<rect[0].left||x>=rect[0].right||y<rect[0].top||y>=rect[0].bottom))hideMenu();
			},
			expandAll=function(){
				hideMenu();
				treeInstance.expand(this.id);
				jr.ajax( 'Domains', 'getDomains', {topNode:this.id, nrLevels:1000, btnIndex:null}, 'moreDomains', null, false );
			},
			collapseAll=function(){
				hideMenu();
				treeInstance.collapse(this.id);
			},
			onMenu=function(){
				hideMenu();
				var id=this.id,newName;
				switch(this.command){
					case 1:		// edit
						if((newName=window.prompt(domains.texts.editName+' '+treeInstance.getName(id))))
							jr.ajax( 'Domains', 'changeDomainName', {name:newName, domainId:id, returnBtnIndex:btnIndex}, 'getDomains', null, false );
						break;
					case 2:		// add
						if((newName=window.prompt(domains.texts.newUnit)))
							jr.ajax( 'Domains', 'addDomain', {name:newName, domainId:id, returnBtnIndex:btnIndex}, 'getDomains', null, false );
						break;
					case 3:		// delete
						jr.ajax( 'Domains', 'deleteDomain', {domainId:id, returnBtnIndex:btnIndex}, 'getDomains', null, false );
						break;
					case 4:		// edit users
						onclick(id);
						break;
					case 5:		// give licence
						if((newName=window.prompt(domains.texts.nrLicence))) {
							var nrLicences = parseInt(newName,10);
							if (nrLicences === Number.NaN || nrLicences > 100)
								alert(domains.texts.wrongLicence)
							else
								jr.ajax( 'FarmAdmin', 'addLicences', {domainId:rcId,nrLicences:nrLicences}, 'returnMiscLicences');
						}
						break;
					case 6:		// remove licence
						var n=getNode(domainData,rcId);
						if(window.confirm(jr.translate(domains.texts.removeLicence,{nrLicences:n.nrLicences,node:n.name})))
							jr.ajax( 'FarmAdmin', 'removeAllLicences', {domainId:rcId}, 'returnMiscLicences');
						break;
					case 7:		// set offline interval fo VC
						if((newName=window.prompt(this.outerText)))
							jr.ajax( 'FarmAdmin', 'setVcData', {id:rcId,offlineInterval:newName});
						break;
					case 8:		// set ping interval fo VC
						if((newName=window.prompt(this.outerText)))
							jr.ajax( 'FarmAdmin', 'setVcData', {id:rcId,pingInterval:newName});
						break;
					case 9:		// move licence from here
						moveLicensesFrom={domainId:id};
						break;
					case 10:	// move licence to here
						if((newName=window.prompt(domains.texts.nrLicence))) {
							nrLicences = parseInt(newName,10);
							if (nrLicences === Number.NaN || nrLicences > 100)
								alert(domains.texts.wrongLicence);
							else {
								if(moveLicensesFrom!=null) {
									n=getNode(domainData,moveLicensesFrom.domainId);
									if(n.nrLicences >= nrLicences) {
										jr.ajax( 'FarmAdmin', 'moveLicences', {fromDomainId:moveLicensesFrom.domainId,toDomainId:id,nrLicences:nrLicences}, 'returnMoveLicences' );
									} else {
										alert(jr.translate('$from only has $nrLicences to move',{from:n.name, nrLicences:n.nrLicences}));
									}
								} else {
									alert(jr.translate('You have not selected where to move from'));
								}
							}
						}
						break;
					case 11:	// stop move licence from here
						moveLicensesFrom=null;
						break;
					case 12:
						jr.ajax( 'Domains', 'activateDomain', {id:rcId,activate:1}, 'getDomains', null, false );
						break;
					case 13:
						jr.ajax( 'Domains', 'activateDomain', {id:rcId,activate:0}, 'getDomains', null, false );
						break;
					case 14:
						n=getNode(domainData,rcId);
						n=window.prompt(domains.texts.setOwner, n.owner);
						if(n)
							jr.ajax( 'Domains', 'changeOwner',  {vcId:rcId,newEmail:n}, 'getDomains', null, false);
						break;
				}
			},
			addEntry=function(ent,text,id,command,name){
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,command:command,name:name,onclick:onMenu,innerHTML:text+(name?' '+name:'')}});
			},
			setupMenu=function(id,name,isParent,type,perm){
				var ent=[];
				if(perm&perms.AdminTree){
					addEntry(ent,domains.texts.editDomain,id,1,name);
					if(type==0)
						addEntry(ent,domains.texts.addDomain,id,2,name);
					addEntry(ent,domains.texts.deleteDomain,id,3,name);
				}
				if(perm&perms.AdminUsers){
					addEntry(ent,domains.texts.editUsers,id,4,name);
				}	
				if(perm&perms.AdminCreateLicence){
					if(type==0||type==2){
						addEntry(ent,domains.texts.giveLicence,id,5,name);
						var n=getNode(domainData,id);
						if(n.nrLicences)
							addEntry(ent,jr.translate(domains.texts.removeLicence,{nrLicences:n.nrLicences,node:name}),id,6);
						if(type==2)
							addEntry(ent,jr.translate(domains.texts.setOwner,{node:name}),id,14);
					}
				}
				if(perm&perms.MoveLicence||perm&perms.AdminCreateLicence){
					if(type==0||type==2){
						var n=getNode(domainData,id);
						if(n.nrLicences) {
							if(moveLicensesFrom==null || moveLicensesFrom.domainId!=id) {
								addEntry(ent,jr.translate('Move licences from $from',{from:name}),id,9);
							} else {
								addEntry(ent,jr.translate('Stop move licences from $from',{from:name}),id,11);
							}
						}
						if(moveLicensesFrom!=null && moveLicensesFrom.domainId!=id) {
							var n=getNode(domainData,moveLicensesFrom.domainId);
							if(n.nrLicences) {
								addEntry(ent,jr.translate('Move licences from $from to $to',{from:n.name,to:name}),id,10);
							}
						}
					}
				}
				if(perm&perms.AdminSuper&&type===2) {
					var activated = getNode(domainData,id).activated;
					addEntry(ent,jr.translate((activated?'Ina':'A')+'ctivate this VC'),id,activated?13:12);
				}
				if(isParent){
					ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:expandAll,innerHTML:domains.texts.expandAll+' '+name}});
					ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:collapseAll,innerHTML:domains.texts.collapseAll+' '+name}});
				}
				return ent;
			},
			onAjaxVcData=function(data){
				addEntry(rcMenu,domains.texts.offlineInterval+' ('+data.offlineInterval+' '+domains.texts.minutes+')',rcId,7);
				addEntry(rcMenu,domains.texts.pingInterval+' ('+data.pingInterval+' '+domains.texts.seconds+')',rcId,8);
				showMenu(rcMenu,mouseX,mouseY);
			},
			rcMenu,rcId,rcName,
			onrightclick=function(id,name,isParent,perm){
				var typ=treeInstance.getType(id);
				mouseX=window.event.clientX-8;
				mouseY=window.event.clientY+window.pageYOffset-10;
				rcMenu=setupMenu(rcId=id,rcName=name,isParent,typ,perm);
				if(perm&perms.AdminTree && typ==2) {
					jr.ajax( 'FarmAdmin', 'getVcData', id, 'onAjaxVcData' );
				} else {
					showMenu(rcMenu);
				}
			},
			onMoreData=function(id){
				jr.ajax( 'Domains', 'getDomains', {topNode:id, nrLevels:1}, 'moreDomains', null, false );
			},
			ondrag=function(idFrom,idTo){
				if(idFrom)
					jr.ajax( 'Domains', 'moveDomain', {domainToMove:idFrom, domainIdTo:idTo, returnBtnIndex:btnIndex}, 'getDomains', null, false );
				else{
					loadCount=1;
					jr.ajax( 'Domains', 'addAccess', {userId:clientDragFrom,domainId:idTo,fromDomainId:clientInstanceId,moveAccess:false,btnIndex:btnIndex}, 'getDomains' );
				}
			},
			getNode=function(node,id){
				if(node.id===id)
					return node;
				else if(node.children){
					var i=-1,res;
					while(++i<node.children.length)
						if((res=getNode(node.children[i],id)))
							return res;
				}
				return null;
			},
			getParent=function(node,id,parent){
				if(node.id===id)
					return parent;
				else if(node.children){
					var i=-1,res;
					while(++i<node.children.length) {
						if((res=getParent(node.children[i],id,node)))
							return res;
					}
				}
				return null;
			},
			onChangeTree=function(){
				var query=treeInstance.getNodesOfType(2);
				hideOtherInstance();
				clientInstance.hide();
				if(query)
					farmsInstance.show(query);
				if(true)return
				if(query==null||query.length==0)
					lastQueryString=null;
				else if(query!=lastQueryString)
					farmsInstance.show(lastQueryString=query);
			},
			onClickUser=function(){
				var id=this.id.split(',');
					hideOtherInstance();
					clientInstance.show(clientInstanceId=id[1],id[0]);
			},
			onClickDomain=function(id,parents){
				hideMenu();
				var didAnyThing=false;
				if(id!==undefined && parents!==undefined && parents.length > 0) {
					var p = parents.shift(), n;
					if(domainSearchedFor) {
						n=getParent(domainData,domainSearchedFor);
						if(n) {
							treeInstance.nodeClick(n.id);
							treeInstance.nodeClick(n.id);
						}
					}
					while(p!==undefined){
						n=getNode(domainData,p.id);
						if(n!==null) {
							if(!treeInstance.isExpanded(p.id)) {
								treeInstance.nodeClick(p.id,id);
								didAnyThing=true;
								domainSearchedFor=id;
							}
						} else {
							parents.unshift(p);
							parentsToOpen=parents;
							domainSearchedFor=id;
							break;
						}
						if(parents.length<1) {
							break;
						}
						p = parents.shift();
					}
					if(!didAnyThing){
						treeInstance.nodeClick(p.id,id);
						treeInstance.nodeClick(p.id,id);
						domainSearchedFor=id;
					}
				}
			},
			sortUsers=function(u1,u2){
				try{
				return u1.div.innerHTML.localeCompare(u2.div.innerHTML);
				}
				catch(e){
					var tt=0;
					tt++;
				}
				var ee=0;
				ee++;
			},
			onClientDragId=function(id){
				clientDragFrom=id;
				treeInstance.dragClear();
			},
			prepareLicences=function(n){
				n.isExpanded=1;
				if(domainData.perm&perms.AdminSuper){		
					n.data=n.data?n.data.replace(/.*-- .+ --,/,''):'';
					var old = n.data;
					n.data='';
					n.data+='-- '+n.id+' --,';
					if(n.owner !== undefined) {
						n.data+='-- '+n.owner+' --,';
					}
					if(new Date(n.offlineUntil) > new Date()) {
						n.data+='-- '+(new Date(n.offlineUntil)).printiso()+' '+n.offlineReason+' --,';
					}
					n.data+=old;
				} else {
					n.data=n.data?n.data.replace(/-- .+ --,/,''):'';
				}
				if (n.nrLicences) {
					n.data='-- '+n.nrLicences.toString()+' '+(n.nrLicences===1?domains.texts.licence:domains.texts.licences)+' --,'+(n.data?n.data:'');
				}
				jr.foreach(n.children,function(nn){prepareLicences(nn)});
			},
			returnMiscLicences=function(data) {
				if(data) {
					var n=getNode(domainData,data.domainId);
					if(data.nrLicences) {
						n.nrLicences+=data.nrLicences;
					} else {
						n.nrLicences=0;
					}
					prepareLicences(domainData);
					loaded();
				}				
			},
			returnMoveLicences=function(data) {
				if(data.status) {
					var n=getNode(domainData,data.fromDomainId);
					n.nrLicences-=data.nrMovedLicences;
					var n2=getNode(domainData,data.toDomainId);
					n2.nrLicences+=data.nrMovedLicences;
					alert(jr.translate("$numLicences licences moved from $from to $to", {numLicences: data.nrMovedLicences, to: n2.name, from: n.name}));
					prepareLicences(domainData);
					loaded();
				} else {
					alert(jr.translate("Could not move licences from $from to $to", {to: n2.name, from: n.name}));
				}
			};
		getButtonIndexFromCookie();
		if(!showTree)
			showTreeDiv(false);
		farmsInstance=new farms.instance(ceMyDiv.right,'800px');
//		farmInstance=new farm.instance(ceMyDiv.right);
		clientInstance=new clients.instance(ceMyDiv.right,onClientDragId);
		imgIcons.onload=loaded;
		imgIcons.src="/Delaval/Resources/tree.png";
		jr.eventManager.addListener('newTreeButtons', jr.eventManager, function(data) {
			if(data){
				treeButtons=new treeBtnData(data);
				setupBtn();
			}
		});
		jr.eventManager.addListener('searchUser', jr.eventManager, function(data) {
			var ent=[],allRoles=data.users.length>0?data.users[0].allRoles:null;
			jr.foreach(data.users, function(u){
				var name=u.firstName+(u.lastName?' '+u.lastName:'');
				if(u.role){
					var d=u.role,i=d.domainPathName.indexOf('.');
					var roleName='';
					jr.foreach(d.roles,function(n){
						roleName+=(roleName.length?'+':' ')+allRoles[n].roleName;
					});
					addMenuBtn(ent,name+', '+d.domainPathName.substr(i>=0?i+1:0)+':'+roleName,u.id+','+d.domainId,null,onClickUser);
				}
				else
					addMenuBtn(ent,name,u.id,null,onClickUser);
			});
			ent.sort(sortUsers);
			var tmp=[];
			if(ent.length > 0) {
				addMenuHeading(tmp,jr.translate('Users'));
				ent=tmp.concat(ent);
			}
			var entDomains=[];
			jr.foreach(data.domains, function(d){
				var parents= '';
				jr.foreach(d.parents.reverse(), function(d){
					parents+= d.name + '.';
				});
				addMenuBtn(entDomains,parents+d.name,d.id,d.name,function(){onClickDomain(d.id,d.parents)});
			});
			entDomains.sort(sortUsers);
			if(entDomains.length > 0) {
				addMenuHeading(ent,jr.translate('Domains'));
			}
			ent = ent.concat(entDomains);
			showMenu(ent,mouseX,mouseY);
		});
		jr.eventManager.addListener('moreDomains', jr.eventManager, function(data) {
			var n = getNode(domainData,data.domain.id);
			n.children = data.domain.children;
			prepareLicences(n);
			treeInstance.onMoreData(data.domain);
			if(parentsToOpen) {
				var p=$.extend(true, [], parentsToOpen);
				parentsToOpen=null;
				onClickDomain(domainSearchedFor,p);
			}
//			farmsInstance.show(treeInstance.getNodesOfType(2));
		});
		jr.eventManager.addListener('returnMiscLicences', jr.eventManager, returnMiscLicences);
		jr.eventManager.addListener('returnMoveLicences', jr.eventManager, returnMoveLicences);
		jr.eventManager.addListener('onAjaxVcData', jr.eventManager, onAjaxVcData);
		jr.eventManager.addListener('getDomains', jr.eventManager, function(data) {
			if(data){
				prepareLicences(domainData = data.domain);
				treeButtons = data.treeData&&data.treeData.length>2 ? new treeBtnData(data.treeData) : null;
				loaded();
			}
		});
		jr.ajax( 'Domains', 'getDomains', {nrLevels:1, btnIndex:btnIndex, getRoles:true}, 'getDomains', null, false );
		
    }
//			jr.ec( 'div', { parentNode: container, className: 'chat', children: [

}
jr.init( function() {
    domains.init();
    farms.init();
	domains.domain();
} );
