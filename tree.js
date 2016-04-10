function jsTree(myDiv,treeData,img,imgCnv,cWidth,cHeight,moreData,textIsFetching,onClick,onDrag,onRightClick,onChangeTree,rightShift,onCheck) {
	var
	dragFromNode,
	isOkToToolTip=true,
	treeNode = function(data,isSibling,hasSiblings,hasParent,colBefore){
		this.expandChildren=function(isExpanded){
			this.isExpanded = isExpanded;
			if ((data.children != null)){
				data.children.sort(sortChildren);
				var i=-1;
				this.children=[];
				this.colBefore.push(hasSiblings);
				while(++i<data.children.length)
					this.children.push(new treeNode(data.children[i],i>0,i<data.children.length-1,1,this.colBefore));
				this.colBefore.pop();
			}
		};
		this.nrChildren=function(){
			var sum=0,i=-1;
			if(this.children&&this.mask&16){
				sum=this.children.length;
				while(++i<this.children.length)
					sum+=this.children[i].nrChildren();
			}
			return sum;
		};
		this.find=function(id){
			if(this.id==id)return this;
			else if(this.children){
				var i=-1,r;
				while(++i<this.children.length)
					if((r=this.children[i].find(id))!=null)
						return r;
			}
			return null;
		};
		this.reRenderFromThis=function(ind){
			var divs=[],j=-1;
			display(divs,this);
			while(++j<divs.length)
				if(ind+j===myDiv.childNodes.length)
					myDiv.appendChild(divs[j]);
				else
					myDiv.insertBefore(divs[j],myDiv.childNodes[ind+j]);
			if(onChangeTree)onChangeTree();
		};
		this.setIsExpanded=function(isExpanded){
			if(this.children){
				if(this.isExpanded=isExpanded)
					this.mask|=16;
				else
					this.mask&=~16;
				jr.foreach(this.children,function(n){n.setIsExpanded(isExpanded);});
			}
		};
		this.collapseThis=function(){
			var ind=this.getDOMnodeIndex(),remove=1+(this.isExpanded?this.nrChildren():0);
			while(--remove>=0)
				myDiv.removeChild(myDiv.childNodes[ind]);
			return ind;
		},
		this.nodeClick=function(isFromMore){
			this.isClicked=true;
			if(!isFromMore)
				this.expandAll=false;
			if(this.children){
				var ind=this.collapseThis();
				this.isExpanded=!this.isExpanded;
				this.mask^=16;
				this.reRenderFromThis(ind);
			}
			else if(this.hasChildren&&moreData){
				moreData(this.id);
				this.isFetching=true;
				this.reRender();
			}
		};
		this.reRender=function(){
			var ind=this.getDOMnodeIndex();
			myDiv.removeChild(myDiv.childNodes[ind]);
			var divs=[];
			display(divs,this);
			if(ind==myDiv.childNodes.length)
				myDiv.appendChild(divs[0]);
			else
				myDiv.insertBefore(divs[0],myDiv.childNodes[ind]);
		};
		this.getDOMnodeIndex=function(){
			var i=-1;
			while(++i<myDiv.childNodes.length&&!(myDiv.childNodes[i].data===this)){}
			return i<myDiv.childNodes.length?i:-1;
		};
		this.getExpanded=function(a,parentIsExpandAll){
			if(this.isExpanded){
				a.push((this.expandAll?'!':'#')+this.id);
				var i=a.length-1,expandAll=this.expandAll||parentIsExpandAll;
				jr.foreach(this.children, function(d){
					d.getExpanded(a,expandAll);});
				if(expandAll)
					while(++i<a.length)
						if(a[i].charAt(0)=='#')
							a.splice(i--, 1);
						else if(a[i].charAt(0)=='!')
							break;
			}
			else if(parentIsExpandAll&&this.mask&8)
				a.push('-'+this.id);
		};
		this.collapse=function(){
			if(this.isExpanded)
				this.nodeClick();
			this.children=null;
			this.expandAll=false;
		};
		this.getNodesOfType=function(type){
			var s='',ss;
			if(this.type==type)
				s+=','+this.id;
			if(this.isExpanded)
				jr.foreach(this.children, function(d){if((ss=d.getNodesOfType(type)))s+=ss;});
			return s;
		};
		this.setData=function(d){data=d;};
		this.id = data.id;
		this.text = data.name;
		this.perm = data.perm;
		this.isChecked = data.checked;
		if(data.data){
			var s=data.data.split(','),ss=null;
			s.sort(function(o1,o2){return o1.localeCompare(o2);});
			jr.foreach(s, function(d){if(ss)ss+='<br>';else ss='';ss+=d;});
			this.data=ss;
		}
		this.hasChildren = data.state & 1;
		if(typeof this.isChecked !== 'undefined'){
			this.iconX=8*cWidth;
			this.iconY=cHeight;
		}
		else{
			this.iconX = Math.round((this.type=data.typ)===0?2*cWidth:data.typ===1?4*cWidth:data.typ===3?6*cWidth:data.typ===4?8*cWidth:2*cWidth);
			this.iconY = cHeight+(data.typ>0?cHeight:0);
		}
		this.colBefore=colBefore.slice(0);
		this.expandChildren(data.children != null && (this.isExpanded=data.isExpanded));
		this.mask=(isSibling?1:0) | (hasSiblings?2:0) | (hasParent?4:0) | (this.hasChildren?8:0) | (this.isExpanded?16:0);
		this.expandAll=data.state & 2;
		this.isFetching=false;
		this.status=data.status;
	},
	sortChildren=function(o1,o2){
		return o1.name.toLowerCase().localeCompare(o2.name.toLowerCase());
	},
	nodeClicked=function(){
		if(onCheck){
			var node=this.parentNode.data,checked=node.isChecked;
			if(checked!=(node.isChecked=onCheck(node.id,checked))){
				var ind=node.getDOMnodeIndex(),divs=[];
				myDiv.removeChild(myDiv.childNodes[ind]);
				display(divs,node);
				myDiv.insertBefore(divs[0],myDiv.childNodes[ind]);
			}
		}
		else if(onClick)
			onClick(this.parentNode.data.id,this.parentNode.data.text);
	},
	allowDrop=function(ev){ev.preventDefault();},
	dragstart=function(){dragFromNode=this.parentNode.data;},
	dropped=function(ev){
		ev.preventDefault();
		if(this.parentNode.data.children&&this.parentNode.data.children.indexOf(dragFromNode)>=0)
			return;
		if(dragFromNode){
			if(!(dragFromNode===this.parentNode.data))
				onDrag(dragFromNode.id,this.parentNode.data.id);
		}
		else
			onDrag(null,this.parentNode.data.id);
	},
	onrightclick=function(){if(onRightClick){var d=this.parentNode.data;isOkToToolTip=false;onRightClick(d.id,d.text,d.mask&8,d.perm);return false;}return true;},
	nodeClick=function(){
		this.data.nodeClick();},
	makeDiv = function(text){
		return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
	},
	onToolTip = function(){
		if(isOkToToolTip&&this.parentNode.data.data){
			mouseBox.show(makeDiv(this.parentNode.data.data),'mouseBoxDiv',rightShift);
			mouseBox.move();
		}
	},
	onToolTipOut = function() {
		if(isOkToToolTip)
			mouseBox.hide();
	},
	onMouseMove = function() {
		if(isOkToToolTip)
			mouseBox.move();
	},
	display=function(rows,node){
		var rowDiv=jr.ec('div',{assignments:{data:node}}),ctx,cc=imgCnv[node.mask];
		rows.push(rowDiv);
		jr.foreach(node.colBefore, function(d){
			ctx=jr.ec('canvas',{parentNode:rowDiv,width:cWidth,height:cHeight}).getContext("2d");
			if(d)ctx.drawImage(img,0,0,cWidth,cHeight,0,0,cWidth,cHeight);});
		ctx=jr.ec('canvas',{style:node.expandAll?{'background-color':'lime'}:{},parentNode:rowDiv,assignments:{data:node},onclick:nodeClick,width:cWidth,height:cHeight}).getContext("2d");
		ctx.drawImage(img,cc[0]*cWidth,cc[1]*cHeight,cWidth,cHeight,0,0,cWidth,cHeight);
		ctx=(node.img=jr.ec('canvas',{style:node.id===rootNode.highLight?{'background-color':'yellow'}:{},width:150,height:cHeight,parentNode:rowDiv,onclick:nodeClicked,draggable:(onDrag!=null),
									  ondragstart:dragstart,ondrop:dropped,ondragover:allowDrop,oncontextmenu:onrightclick,onmouseover:onToolTip,onmouseout:onToolTipOut,onmousemove:onMouseMove})).getContext("2d");
		var isOffs=typeof node.isChecked==='undefined'?node.mask&16:node.isChecked;
		ctx.drawImage(img,node.iconX+(isOffs?cWidth:0),node.iconY,cWidth,cHeight,0,0,cWidth,cHeight);
		ctx.font='bold '+(cHeight-5)+"px Helvetica";
		ctx.fillText(node.text+(node.isFetching?' '+textIsFetching:''),3+cWidth,cHeight-5);	//+' ('+node.mask+')'
		if(node.children&&(node.mask&16)){
			jr.foreach(node.children, function(d){
				display(rows,d);
			});
		}
		if(node.id===rootNode.highLight) {rootNode.highLight=false;}
		return rowDiv;
	};
	this.getName=function(id){return rootNode.find(id).text;};
	this.getType=function(id){return rootNode.find(id).type;};
	this.getType=function(id){return typeof id==='string'?rootNode.find(id).type:-1;};
	this.getStatus=function(id){return typeof id==='string'?rootNode.find(id).status:-1;};
	this.setOkToToolTip=function(){isOkToToolTip=true;};
	this.collapse=function(id){rootNode.find(id).collapse();};
	this.showAllUnder=function(id,show){
		var n=rootNode.find(id),ind=n.collapseThis();
		n.setIsExpanded(show);
		n.reRenderFromThis(ind);
	};
	this.expand=function(id){
		var n=rootNode.find(id);
		if(n){
			if(n.isExpanded)
				n.collapse();
			n.expandAll=true;
			n.isFetching=true;
			n.reRender();
		}
		return n;
	};
	this.isExpanded=function(id){
		var n=rootNode.find(id);
		return n&&n.isExpanded;
	};
	this.nodeClick=function(id,highLight){
		var n=rootNode.find(id);
		if(n){
			if(highLight)
				rootNode.highLight=highLight;
			n.nodeClick(0);
		}
	};
	this.setChecked=function(id,isChecked){
		var n=rootNode.find(id);
		if(n){
			n.isChecked=isChecked;
			var ind=n.getDOMnodeIndex();
			if(ind>=0)
				n.reRender();
		}
	};
	this.onMoreData=function(data){
		var n=rootNode.find(data.id);
		n.setData(data);
		n.isFetching=false;
		n.expandChildren(false);
		n.nodeClick(1);
	};
	this.getExpanded=function(){
		var n=[];
		rootNode.getExpanded(n,false);
		var s='';
		jr.foreach(n, function(str){s+=','+str;});
		return s.substr(1);
	};
	this.getNodesOfType=function(type){
		var s=rootNode.getNodesOfType(type,'');
		return s.length>0?s:null;
	};
	this.dragClear=function(){
		dragFromNode=null;
	};
	var rows=[],rootNode=new treeNode(treeData,0,0,0,[]);
	display(rows,rootNode);
	jr.foreach(rows, function(row){myDiv.appendChild(row);});
}