var smsk=[-1,0,5,9,-1,0,1,2,5,4,5,7,10,8,10,14];
var lab_blood=null,lab_mdi,lab_cells;
function calc7days(endTime){
	this.endTime=(this.beTime=endTime)+86400000;
	this.firstTime=this.ft=endTime-604800000;
	this.dayYield=
	this.dayTime=
	this.sumYield=
	this.sumTime=0;
	this.date=new Date(endTime).toString();
	this.event=function(time,yield,deltaTime){
		if(yield>3&&deltaTime<=86400000){
			var dd;
			if(time>this.firstTime&&time<this.endTime){
				this.sumYield+=yield;
				this.sumTime+=deltaTime;
			}
			if(time<this.endTime){
				if(time-deltaTime>this.beTime){
					this.dayYield+=yield;
					this.dayTime+=deltaTime;
				}
				else if(time>this.beTime){
					dd=time-this.beTime;
					this.dayYield+=yield*dd/deltaTime;
					this.dayTime+=dd;
				}
			}
			else if(time-deltaTime<this.endTime){
				dd=this.endTime-(time-deltaTime);
				this.dayYield+=yield*dd/deltaTime;
				this.dayTime+=dd;
			}
//if(this.sumTime>172800000)this.seven=this.sumYield/this.sumTime*86400000;
		}
	}
	this.get7Days=function(){	
		return this.sumTime>172800000?this.sumYield/this.sumTime*86400000:0;
	}
	this.getDayYield=function(){
		return this.dayTime>10800000?this.dayYield/(this.dayTime/86400000):0;
	}
}
function renderUpDown(v,i,parent,image){
	v=(v>>=i)&3;
	if(v==0)
		parent.appendChild(jr.ec('span',{innerHTML:'-'}));
	else {
		var cnv;
		parent.appendChild(cnv=jr.ec('canvas',{className:'arrows',width:38,height:38}));
		var ctx=cnv.getContext("2d");
		ctx.drawImage(image,0,559+38*v,38,38,0,0,38,38);
	}
}
function renderBMCarrow(parent,v,pos,image){
	v=v>>pos;var gl=v&3,lv=(v>>2)&3,cnv;
	parent.appendChild(cnv=jr.ec('canvas',{className:'arrows',width:38,height:38}));
	if(lv!=0)
		cnv.getContext("2d").drawImage(image,38*(lv-1),445+38*gl,38,38,0,0,38,38);
}
function getLevels(mask,parent,images){
	if(lab_blood==null){
		lab_blood=jr.translate("B:");
		lab_mdi=jr.translate("M:");
		lab_cells=jr.translate("C:");
	}
	while(parent.childNodes.length>0)
		parent.removeChild(parent.childNodes[0]);
	parent.appendChild(jr.ec('span',{innerHTML:lab_blood}));
	renderBMCarrow(parent,mask,10,images);
	parent.appendChild(jr.ec('span',{innerHTML:lab_mdi}));
	renderBMCarrow(parent,mask,14,images);
	parent.appendChild(jr.ec('span',{innerHTML:lab_cells}));
	renderBMCarrow(parent,mask,18,images);
}
function getIncompletePict(cow,innerParent,height,cowImage,className,assignments){
	var mask,canvas,ctx,pos;
	canvas=jr.ec('canvas',{className:className,assignments:assignments,parentNode:innerParent,width:74,height:height});ctx=canvas.getContext("2d");pos=-1;
	if((mask=cow.mask&0x9999)!=0)
		{
		ctx.drawImage(cowImage,0,0,70,height,0,0,70,height);
		while(++pos<4){
			if((mask&0xf)!=4){
				var x=pos<=1?-11:11,y=pos==0||pos==2?-11:11;
				ctx.beginPath();
				ctx.fillStyle="#000000";
				ctx.arc(36+x,23+y,8, 0, Math.PI*2, true);
				ctx.fill();
				ctx.beginPath();
				ctx.fillStyle=(mask&0xf)!=0?"#FF0000":"#FFFFFF";
				ctx.arc(36+x,23+y,5, 0, Math.PI*2, true);
				ctx.fill();
			}
			mask>>=4;
		}
	}
	else
		ctx.drawImage(cowImage,0,0,1,70,0,0,1,70);
}

function milkings(milkData,container,parent,cowImage,sortCol,sortDirection,onresize) {
	this.getSortCol=function(){return sortCol}
	this.getSortDir=function(){return sortDirection}
	var i=-1,o,day,now=new Date(),dayDiff,t=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0).getTime()+86400000,h,m,tm,mm,ss,
		today=jr.translate('today'),yesterday=jr.translate('yesterday'),minmin=jr.translate('min_min'),minsec=jr.translate('min_sec'),
		onSortCol=function(colIndex){
			if(typeof colIndex!='undefined')
				if(colIndex==sortCol)
					sortDirection=-sortDirection;
				else{
					sortCol=colIndex;
					sortDirection=1;
				}
			render();
		},
		sort=function(o1,o2){
			var d=sortDirection;
			switch(sortCol){
				case 5:
					var v1=o1.bmcMask,v2=o2.bmcMask;
					v1=smsk[v1>>10&15]+smsk[v1>>14&15]+smsk[v1>>18&15];
					v2=smsk[v2>>10&15]+smsk[v2>>14&15]+smsk[v2>>18&15];
					if(v1!=v2)
						return d*(v2-v1);
				case 0:
					return d*(o2.time-o1.time);
				case 1:
					return d*(o2.flow-o1.flow);
				case 2:
					return d*(o2.yield-o1.yield);
				case 3:
					return d*(o1.robotName==o2.robotName?o2.time-o1.time:o1.robotName==null?-1:o2.robotName==null?1:o1.robotName.localeCompare(o2.robotName));
				case 4:
					return d*(o1.milkDest==o2.milkDest?o2.time-o1.time:o1.milkDest==null?-1:o2.milkDest==null?1:o1.milkDest.localeCompare(o2.milkDest));
				case 6:
					if(o1.mask&0x9999)
						if(o2.mask&0x9999)
							return d*(o2.time-o1.time);
						else
							return -1;
					else if(o2.mask&0x9999)
						return 1;
					return d*(o2.time-o1.time);
				case 7:
					if(o1.mask&0x2222)
						if(o2.mask&0x2222)
							return d*(o2.time-o1.time);
						else
							return -1;
					else if(o2.mask&0x2222)
						return 1;
					return d*(o2.time-o1.time);
			}
			return 0;
		},
		getYield=function(milking,parent,image){
			parent.appendChild(jr.ec('span',{innerHTML:Math.floor(milking.yield*10+0.5)/10}));
			var v=milking.bmcMask&3;
			if(v>0){
				var cnv;
				parent.appendChild(cnv=jr.ec('canvas',{className:'arrows',width:38,height:38}));
				var ctx=cnv.getContext("2d");
				ctx.drawImage(image,0,559+38*v,38,38,0,0,38,38);
			}
			parent.appendChild(jr.ec('span',{innerHTML:(milking.hour24==null?'':' ('+milking.hour24+')')}));
		},
		getKickOffPict=function(cow,innerParent,height,cowImage){
			var mask,canvas,ctx,pos,xp=37;
			if((mask=cow.mask&0x2222)!=0)
				{
				canvas=jr.ec('canvas',{parentNode:innerParent,width:75,height:height});ctx=canvas.getContext("2d");pos=-1;
				ctx.drawImage(cowImage,0,0,70,height,0,0,70,height);
				while(++pos<4){
					if(mask&0x2){
						var x=pos<=1?-11:11,y=pos==0||pos==2?-11:11;
						ctx.beginPath();
						ctx.fillStyle="#000000";
						ctx.arc(xp+x,23+y,8, 0, Math.PI*2, true);
						ctx.fill();
						ctx.beginPath();
						ctx.fillStyle="#FFFFFF";
						ctx.arc(xp+x,23+y,5, 0, Math.PI*2, true);
						ctx.fill();
						ctx.beginPath();
						ctx.lineWidth=4;
						ctx.moveTo(xp+x-8,23+y-8);
						ctx.lineTo(xp+x+8,23+y+8);
						ctx.moveTo(xp+x-8,23+y+8);
						ctx.lineTo(xp+x+8,23+y-8);
						ctx.stroke();
					}
					mask>>=4;
				}
			}
			else{
				canvas=jr.ec('canvas',{parentNode:innerParent,width:1,height:70}),ctx=canvas.getContext("2d");
				ctx.drawImage(cowImage,0,0,1,70,0,0,1,70);
			}
		},
		renderImage=function(canvas,x,y) {
			canvas.getContext("2d").drawImage(cowImage,x,y,70,70,0,0,70,70);
		},
		render=function(){
			container.innerHTML='';
			var ce={}, i=-1,
				colNames=['Milking time','Flow kg/m (time)','Yield kg (~/24h)','Robot name','Milk dest','Blo MDi Cel'],
				createCell = function( td ) { jr.ec('div', {parentNode:td, assignments:{pos:++i}, className:i==sortCol?'headchoosen':'', innerHTML:jr.translate(colNames[i]) } ) },
				table = jr.ec( 'table', { parentNode: container, className: 'cowq', children:[{tr:{children:[]}}]}).firstChild;
			table.innerHTML = '';
			jr.ec( 'tr', { parentNode: table, className: 'topHeading',
				onclick: function( e ) { onSortCol( e.srcElement.pos ); },
				children: [
					{ 'td': { className: 'imageCell', children: [
						{ 'div': { children: [
							{ 'canvas': {contextIdentity: 'incomplete', width:70, height:70, assignments: { pos: 6 } } }
						] } },
						{ 'div': { children: [
							{ 'canvas': {contextIdentity: 'kickOff', width:70, height:70, assignments: { pos: 7 } } }
						] } }
					] } },
					{ 'td': { className: 'infoCell', children: [
						{ 'div': { className: 'cInfoCell', children: function( parent ) {
							createCell( parent ); createCell( parent ); createCell( parent );
						} } }
					] } },
					{ 'td': { className: 'infoCell lastCell', children: [
						{ 'div': { className: 'cInfoCell', children: function( parent ) {
							createCell( parent ); createCell( parent ); createCell( parent );
						} } }
					] } }
			] }, ce );
			renderImage(ce.incomplete,70,210);
			renderImage(ce.kickOff,70,0);
			jr.foreach(milkData, function(o) {o.flow=o.yield/o.secMilkingTime*60} );
			milkData.sort(sort);
			jr.foreach(milkData, function(o){
				dayDiff=Math.floor((t-(o.time-o.secMilkingTime*1000))/86400000);
				tm=new Date(o.time);
				day=dayDiff<=0?today:dayDiff==1?yesterday:tm.getDate()+'/'+(tm.getMonth()+1);
				m=tm.getMinutes();
				h=tm.getHours();
				mm=Math.floor(o.secMilkingTime/60);
				ss=o.secMilkingTime%60;
				jr.ec( 'tr', { style:{cursor:'default'}, parentNode: table,
					children: [
						{ 'td': { className: 'imageCell styleMilking', children: [
							{div:{children:function(innerParent){getIncompletePict(o,innerParent,70,cowImage)}}},
							{div:{children:function(innerParent){getKickOffPict(o,innerParent,70,cowImage)}}}
							] } },
						{ 'td': { className: 'infoCell styleMilking', children: [
							{ 'div': { className: 'cInfoCell', children: [
								{'div':{style:{overflow:'hidden',whiteSpace:'nowrap'},innerHTML:(h<10?'0'+h:h)+':'+(m<10?'0'+m:m)+' ('+day+')'}},
								{'div':{style:{overflow:'hidden',whiteSpace:'nowrap'},innerHTML:Math.floor(o.flow*10+0.5)/10+' ('+(mm<10?'0'+mm:mm)+minmin+' '+(ss<10?'0'+ss:ss)+minsec+')'}},
								{'div':{style:{overflow:'hidden',whiteSpace:'nowrap'},children:function(innerParent){getYield(o,innerParent,cowImage)}}},
							] } } ] } },
						{ 'td': { className: 'infoCell lastCell styleMilking', children: [
							{ 'div': { className: 'cInfoCell', children: [
								{div:{style:{overflow:'hidden',whiteSpace:'nowrap'},innerHTML:o.robotName}},
								{div:{style:{overflow:'hidden',whiteSpace:'nowrap'},innerHTML:o.milkDest}},
								{div:{children:function(innerParent){getLevels(o.bmcMask,innerParent,cowImage)}}},
							] } } ] } }
				] });
			})
			onresize();
		};
	render();
}