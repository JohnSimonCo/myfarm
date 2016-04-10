if(typeof hr=='undefined'){function hr(n){if(n<120)return n==0?fs.labNow:(n<60?n+'s':'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t)}function n0(n){return n<10?'0'+n:n}function n3(n){return n<100?'0'+n0(n):n}function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60))}}
jr.include('/cli.css');
jr.include('/domain.css');
jr.include('/util.js');
jr.include('/mouseBox.js');
jr.include('/tree.js');
var filter = {
	imgIcons:new Image(),
    init: function() {
		filter.texts = {
			back:				jr.translate('Back'),
			save:				jr.translate('Save'),
			saveAsNew:			jr.translate('Save as new filter'),
			rename:				jr.translate('Rename'),
			delete:				jr.translate('Delete'),
			nameOfFilter:		jr.translate('Name of filter'),
			filterNameExists:	jr.translate('Filter name already exists'),
			filterEditor:		jr.translate('Filter editor'),
			includedRobots:		jr.translate('Included robots'),
			includeAll:			jr.translate('Include all in'),
			excludeAll:			jr.translate('Exclude all in'),
			expandAll:			jr.translate('Expand all in'),
			expandAllChoosen:	jr.translate('Show all included in tree'),
			collapseAll:		jr.translate('Collapse all in'),
			failedToSave:		jr.translate('Failed to save, please try again!'),
		};
		filter.imgIcons.src="/Delaval/Resources/tree.png";

	},
	filterChooser:function(userFilter,myDiv,isForEdit,selectCallback,headingLabels,dialogLables,dialogCallback,onHoverCallback){
		var last,i=-1,arr=[],unic,
			renderFilter=function(label,id,isChecked,isDefault){
				return {'span': {className:(isDefault?'selected':''),onmouseover:onToolTip, onmouseout:onToolTipOut,onmousemove:onToolTip, style:{'white-space':'nowrap'},children: [
					{'input':{id:'filterGroup_'+id,onchange:onChange, assignments:{value:id, type:isForEdit?'radio':'checkbox', name:'filterGroup'+unic, checked:isChecked}}},
					{'span':{value:id, onclick:onHelpChange, style:{cursor:'default'}, innerHTML:label+'&nbsp;'}}
				]}};
			},
			renderDialog=function(label,id,isChecked,isDefault){
				return {'span': {className:(isDefault?'selected':''), style:{'white-space':'nowrap'},children: [
					{'input':{id:'dialogGroup'+unic+'_'+id,onchange:onChangeDlg, assignments:{value:id, type:'radio', name:'dialogGroup'+unic, checked:isChecked}}},
					{'span':{value:id, onclick:onHelpChangeDlg, style:{cursor:'default'}, innerHTML:label+'&nbsp;'}}
				]}};
			},
			getNode=function(id){return document.getElementById('filterGroup_'+id);},
			getNodeDlg=function(id){return document.getElementById('dialogGroup'+unic+'_'+id);},
			onToolTip=function(){onHoverCallback&&onHoverCallback(this.value,this);},
			onToolTipOut=function(){onHoverCallback&&onHoverCallback(-2);},
			onHelpChange=function(){
				var node=getNode(this.value);
				if(isForEdit)
					node.checked=1;
				else
					node.checked=!node.checked;
				selectCallback&&selectCallback(parseInt(this.value),node.checked);
			},
			onChange=function(){
				var ind=parseInt(this.value),checked=userFilter.all[ind].checked=getNode(this.value).checked;
				selectCallback&&selectCallback(ind,checked);
			},
			onHelpChangeDlg=function(){
				dialogCallback&&dialogCallback(userFilter.setDialog(parseInt(this.value)),document.getElementById('dialogGroup'+unic+'_'+this.value).checked=1);
			},
			onChangeDlg=function(){
				dialogCallback&&dialogCallback(userFilter.setDialog(parseInt(this.value)),getNodeDlg(this.value).checked);
			};
		unic='';
		if(dialogLables){
			i=-1;
			while(++i<dialogLables.length)
				unic+=dialogLables[i];
		}
		i=-1;
		while (last=myDiv.lastChild)
			myDiv.removeChild(last);
		if(headingLabels&&headingLabels[0])
			arr.push({'span':{innerHTML:headingLabels[0]+':'}});
		if(dialogLables)
			while(++i<dialogLables.length)
				arr.push(renderDialog(dialogLables[i],i,userFilter.dialogInd===i,userFilter.defDialogInd===i));
		if(headingLabels&&userFilter.all.length)
			arr.push({'span':{innerHTML:'&nbsp;&nbsp;&nbsp;&nbsp;'+headingLabels[1]+':'}});
		i=-1;
		while(++i<userFilter.all.length){
			var f=userFilter.all[i];
			arr.push(renderFilter(f.name,i,isForEdit?i===userFilter.selected:userFilter.all[i].checked,userFilter.all[i].default));
		}
		jr.ec('div',{parentNode:myDiv,children:arr});
	},
	filter:function(serialized){
		this.all=[];
		this.selected=-1;
		this.dialogInd=0;
		this.defDialogInd=0;
		this.defOptional=this.optional='!!';
		if(serialized){
			var sd=new JsSerilz('#',serialized),
				strings=[],
				next=function(){
					this.name=sd.getString();
					var cnt=sd.getInt();
					if(this.checked=this.default=cnt<0)
						cnt=-cnt;
					this.id=[];
					while(--cnt>=0)
						this.id.push(strings[sd.getInt()]);
				};
			var mi=serialized.indexOf('#'),si=serialized.indexOf('!')
			if(si>=0&&si<mi)
				this.defOptional=this.optional=sd.getString();
			this.defDialogInd=sd.getInt();
			var cnt=sd.getInt();
			if(!isNaN(cnt)){
				while(--cnt>=0)
					strings.push(sd.getString());
				var i=sd.getInt();
				while(--i>=0)
					this.all.push(new next());
			}
		}
		this.getDialog=function(){
			return this.dialogInd;
		},
		this.setDialog=function(ind){
			return this.dialogInd=ind;
		},
		this.getDialogDefault=function(){
			return this.defDialogInd;
		},
		this.setDialogDefault=function(ind){
			this.defDialogInd=ind;
		},
		this.setOptional=function(v){
			this.optional=v;
		},
		this.getOptional=function(){
			return this.optional;
		},
		this.setDefault=function(){
			this.defDialogInd=this.dialogInd;
			this.defOptional=this.optional;
			jr.foreach(this.all,function(o){o.default=o.checked;});
		};
		this.isDefault=function(){
			var itIs=true;
			jr.foreach(this.all,function(o){
				itIs&=o.default===o.checked;
			});
			return itIs&&this.defDialogInd===this.dialogInd&&this.defOptional===this.optional;
		};
		this.getIds=function(ind){
			var ids=[];
			if(ind>=0)
				return this.all[ind].id;
			else
				jr.foreach(this.all,function(o){
					if(o.checked)
						jr.foreach(o.id,function(s){
							if(ids.indexOf(s)<0)
								ids.push(s);
							});
				});
			return ids.length?ids:null;
		};
		this.update=function(ind,ids){
			ids=this.makeArr(ids);
			if(ids&&ids.length){
				ids.sort();
				this.all[ind].id=ids;
			}
		};
		this.delete=function(ind){
			this.all.splice(ind,1);
			this.selected=-1;
		};
		this.add=function(name,ids){
			ids=this.makeArr(ids);
			name=name&&name.trim();
			if(name&&ids&&ids.length){
				ids.sort();
				var i=-1;
				while(++i<this.all.length&&this.all[i].name!==name){}
				if(i===this.all.length){
					this.all.push({name:name,id:ids,default:0,checked:0});
					this.all.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
					i=-1;
					while(++i<this.all.length&&this.all[i].name!==name){}
					return this.selected=i;
				}
			}
			return -1;
		};
		this.makeArr=function(ids){
			var a=[];
			if(ids){
				for(var k in ids)
					a.push(k);
				a.sort();
			}
			return a;
		};
		this.setChecked=function(ind,checked){
			this.all[ind].checked=checked;
		};
		this.select=function(ind){
			this.selected=ind;
		};
		this.getSelected=function(){
			return this.selected;
		};
		this.isSame=function(ids){
			ids=this.makeArr(ids);
			if(!ids.length||this.selected<0)
				return true;
			if(this.all[this.selected].id.length===ids.length){
				var j=-1;
				while(++j<ids.length&&this.all[this.selected].id[j]===ids[j]){}
				if(j===ids.length)
					return true;
			}
			return false;
		};
		this.serialize=function(){
			var sd=new JsSerilz('#'),i=-1,strings=[];
			while(++i<this.all.length){
				var j=-1,ids=this.all[i].id;
				while(++j<ids.length)
					if(strings.indexOf(ids[j])<0)
						strings.push(ids[j]);
			}
			i=-1;
			sd.serialize(this.optional,this.defDialogInd,strings.length);
			while(++i<strings.length)
				sd.serialize(strings[i]);
			sd.serialize(this.all.length);
			i=-1;
			while(++i<this.all.length){
				var f=this.all[i];
				sd.serialize(f.name,f.default?-f.id.length:f.id.length);
				jr.foreach(f.id,function(s){sd.serialize(strings.indexOf(s));});
			}
			return sd.getData();
		};
	},
	imgIconPos:	[[1,0],[3,2],[3,2],[3,2],	[4,0],[4,0],[7,0],[7,0],	[2,0],[3,2],[3,2],[3,2],	[5,0],[5,0],[8,0],[8,0],
				 [3,0],[3,2],[3,2],[3,2],	[6,0],[3,2],[9,0],[3,2],	[3,0],[3,2],[3,2],[3,2],	[6,0],[6,0],[9,0],[9,0]],
	instance:	function(myDiv,exitFkn,userFilter){
		var
		exit,
		farms,
		createdId=0,
		checked,
		treeDiv,
		resultDiv,
		filterDiv,
		rcId,
		rcName,
		mouseX,
		mouseY,
		rcMenu,
		treeInstance,
		btnSave,
		btnSaveAsNew,
		btnDelete,
		btnRename,
		currentUserFilter,
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1000);
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		setType=function(node){
			if(node.children){
				var typ=0,i=-1;
				while(++i<node.children.length)
					typ=setType(node.children[i])-1;
				node.state=1;
				return node.typ=typ>0?typ:0;
			}
			node.state=0;
			return node.typ=3;
		},
		save=function(){
			currentUserFilter.update(currentUserFilter.getSelected(),checked);
			saveFilterToServer();
		},
		rename=function(){
			var ind=currentUserFilter.getSelected(),name=window.prompt(filter.texts.nameOfFilter,currentUserFilter.all[ind].name);
			name=name&&name.trim();
			if(name&&name.length&&name!==currentUserFilter.all[ind].name)
				currentUserFilter.all[ind].name=name;
				saveFilterToServer(-2);
		},
		_delete=function(){
			var ind=currentUserFilter.getSelected();
			if (window.confirm(jr.translate('Are you sure you want to delete $label',{label:currentUserFilter.all[ind].name}))){
				currentUserFilter.delete(ind);
				saveFilterToServer();
			}
		},
		saveFilterToServer=function(ind){
			var filterSerialize=currentUserFilter.serialize();
			jr.ajax( 'Users', 'saveFilter', filterSerialize, null, null, false );
			updateFilterInfo();
		},
		saveAsNew=function(){
			var name=window.prompt(filter.texts.nameOfFilter);
			name=name&&name.trim();
			if(name&&name.length){
				var ind=currentUserFilter.add(name,checked);
				if(ind>=0)
					saveFilterToServer(ind);
				else
					alert(filter.texts.filterNameExists);
			}
		},
		updateFilterInfo=function(){
			filter.filterChooser(currentUserFilter,filterDiv,true,filterChoosed);
			checkButtons();
		},
		checkButtons=function(){
			var isEmpty=!Object.keys(checked).length;
			btnSaveAsNew.disabled=isEmpty;
			btnDelete.disabled=btnRename.disabled=currentUserFilter.getSelected()<0;
			btnSave.disabled=currentUserFilter.getSelected()<0||currentUserFilter.isSame(checked);
		},
		render=function(){
			var a=[],ce={};
			a.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:filter.texts.back,onclick:exit}}}}});
			a.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:filter.texts.filterEditor}});
			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',contextIdentity:'rename',assignments:{type:'button',value:filter.texts.rename,onclick:rename}}}}});
			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',contextIdentity:'save',assignments:{type:'button',value:filter.texts.save,onclick:save}}}}});
			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',contextIdentity:'saveAsNew',assignments:{type:'button',value:filter.texts.saveAsNew,onclick:saveAsNew}}}}});
			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',contextIdentity:'delete',assignments:{type:'button',value:filter.texts.delete,onclick:_delete}}}}});
			jr.ec('div',{parentNode:myDiv,contextIdentity:'background',children:{'div':{className:'background',children:[
						{'div':{children:{'table':{width:'100%',children:{'tr':{children:a}}}}}},
						{'div':{contextIdentity:'filterDiv'}},
						{'div':{style:{'border-radius':'6px'},className:'styleWhite container',children:{'table':{children:[{'tr':{children:[
							{'td':{children:{'div':{contextIdentity:'treeDiv'}}}},
							{'td':{children:{'div':{contextIdentity:'resultDiv'}}}}
						]}}]}}}}
					]}}},ce);
			btnSave=ce['save'];
			btnSaveAsNew=ce['saveAsNew'];
			btnDelete=ce['delete'];
			btnRename=ce['rename'];
			treeDiv=ce['treeDiv'];
			resultDiv=ce['resultDiv'];
			filterDiv=ce['filterDiv'];
			onresize();
			return treeDiv;
		},
		renderOnlyChoosen=function(){
			setExpandedChecked(farms,null);
			showTree();
		},
		renderChoosen=function(){
			var a=[],f=[],last,n=[],id;
			while (last=resultDiv.lastChild)
				resultDiv.removeChild(last);
			for(id in checked){
				var robotName='',node=checked[id];
				do{
					robotName=node.name+(robotName.length?'.'+robotName:'');
				} while(node=node.parent);
				f.push({_name:robotName,'tr':{children:{'td':{children:{'div':{className:'styleWhite',innerHTML:robotName}}}}}});
			}
			f.sort(function(o1,o2){return o1._name.localeCompare(o2._name);});
			a.push({'td':{className:'topHeading',align:'center',innerHTML:filter.texts.includedRobots}});
			a.push({'td':{align:'right',children:{'input':{className:'button',assignments:{type:'button',value:filter.texts.expandAllChoosen,onclick:renderOnlyChoosen}}}}});
			jr.ec('div',{parentNode:resultDiv,contextIdentity:'background',children:{'div':{className:'background',children:[
						{'div':{children:{'table':{width:'100%',children:{'tr':{children:a}}}}}},
						{'div':{className:'styleWhite container',style:{'border-radius':'6px'},children:{'table':{width:'100%',children:f}}}},
					]}}});
			updateFilterInfo();
		},
		find=function(node,id){
			if(String(node.id)===id)
				return node;
			else if(node.children)
				for(var k in node.children){
					var n=find(node.children[k],id);
					if(n)
						return n;
				}
			return null;
		},
		oncheck=function(id,isChecked){
			if(typeof id === 'string'){
				if(checked[id]){
					checked[id].checked=false;
					delete checked[id];
				}
				else{
					var node=find(farms,id);
					checked[node.id]=node;
					node.checked=true;
				}
				renderChoosen();
				return !isChecked;
			}
		},
		onMenu=function(){
			alert('onMenu');
		},
		noMenu = function(){
			var x=window.event.x,y=window.event.y,div=this.parentElement;
			var rect=div.getClientRects();
			if(rect.length>0&&(x<rect[0].left||x>=rect[0].right||y<rect[0].top||y>=rect[0].bottom))mouseBox.hide();
		},
		showMenu=function(ent,x,y){
			mouseBox.hide();
			mouseBox.show(jr.ec('div',{className:'menusAll',children:{'div':{children:ent}}}));
			mouseBox.asMenu(x,y);
		},
		addEntry=function(ent,text,id,command,name){
			ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,command:command,name:name,onclick:onMenu,innerHTML:text+(name?' '+name:'')}});
		},
		includeAllUnder=function(n){
			if((typeof n.id==='string')&&!checked[n.id]){
				n.checked=true;
				checked[n.id]=n;
				treeInstance.setChecked(n.id,true);
			}
			jr.foreach(n.children,function(o){includeAllUnder(o);});
		},
		excludeAllUnder=function(n){
			if((typeof n.id==='string')&&checked[n.id]){
				n.checked=false;
				delete checked[n.id];
				treeInstance.setChecked(n.id,false);
			}
			jr.foreach(n.children,function(o){excludeAllUnder(o);});
		},
		includeAll=function(){
			mouseBox.hide();
			includeAllUnder(find(farms,this.id));
			renderChoosen();
			treeInstance.showAllUnder(this.id,true);
		},	
		excludeAll=function(){
			mouseBox.hide();
			excludeAllUnder(find(farms,this.id));
			renderChoosen();
			treeInstance.showAllUnder(this.id,false);
		},	
		expandAll=function(){
			mouseBox.hide();
			treeInstance.showAllUnder(this.id,true);
		},	
		collapseAll=function(){
			mouseBox.hide();
			treeInstance.showAllUnder(this.id,false);
		},	
		setupMenu=function(id,name,isParent,type,perm){
			var ent=[];
//			addEntry(ent,jr.translate('Move licences from $from',{from:name}),id,9);
			if(isParent){
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:includeAll,innerHTML:filter.texts.includeAll+' '+name}});
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:excludeAll,innerHTML:filter.texts.excludeAll+' '+name}});
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:expandAll,innerHTML:filter.texts.expandAll+' '+name}});
				ent.push({'div':{onmouseout:noMenu,className:'menus',id:id,name:name,onclick:collapseAll,innerHTML:filter.texts.collapseAll+' '+name}});
			}
			return ent;
		},
		onrightclick=function(id,name,isParent){
			mouseX=window.event.clientX-8;
			mouseY=window.event.clientY+window.pageYOffset-10;
			rcMenu=setupMenu(rcId=id,rcName=name,isParent);
			showMenu(rcMenu);
		},
		setExpandedChecked=function(node, parentChecked){
			if(node.children){
				var isExpanded=false;
				for(var o in node.children)
					isExpanded|=setExpandedChecked(node.children[o], node.checked);
				return node.isExpanded=isExpanded;
			}
			else
				return node.checked || parentChecked;
		},
		getFarms=function(sd,parent){
			var node={name:sd.getString()},typ=sd.getInt();
			var cnt=typ?sd.getInt():0;
			if(typ!==1){
				var nodeData=checked[node.id=sd.getString()];
				node.checked=!!nodeData;
				if(nodeData)
					checked[node.id]=node;
				node.parent=parent;
			}
			if(cnt){
				node.children=[];
				while(--cnt>=0)
					node.children.push(getFarms(sd,node));
				node.children.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
				if(!node.id)
					node.id=++createdId;
				node.parent=parent;
			}
			return node;
		}
		showTree=function(){
			var last;
			while (last=treeDiv.lastChild)
				treeDiv.removeChild(last);
			treeInstance=new jsTree(treeDiv,farms,filter.imgIcons,filter.imgIconPos,19,20,
									null,'Fetching...',null,null,onrightclick,null,true,oncheck);
		},
		uncheck=function(n){
			if(n.typ===3||n.typ===2)
				n.checked=false;
			jr.foreach(n.children,function(nn){uncheck(nn);
			});
		}
		setChecked=function(ids){
			jr.foreach(ids,function(id){
				(checked[id]=find(farms,id)).checked=true;
			});
		},
		filterChoosed=function(ind){
			currentUserFilter.select(ind);
			checked={};
			uncheck(farms);
			if(ind>=0)
				setChecked(currentUserFilter.getIds(ind));
			setExpandedChecked(farms,null);
			renderChoosen();
			showTree();
		},
		this.render=function(data,selection){
			checked={};
			myDiv=jr.ec('div',{parentNode:myDiv});
			currentUserFilter.select(-1);
			if(selection)
				for(var k in selection)
					checked[selection[k]]=1;
			farms=getFarms(new JsSerilz('$',data));
			setType(farms);
			setExpandedChecked(farms,null);
			render();
			showTree();
			renderChoosen();
			return myDiv;
		};
		this.resize=function(){onresize();};
		currentUserFilter=userFilter;
		exit=exitFkn;
	}
};
