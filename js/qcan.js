jr.include( '/Resources/info6.png' );
jr.include( '/can.css' );
var HEADING=0.15,ALLCOWS=0.41,ONECOW=0.785,ICONH=0.058,BLUE="#103d82",MORE="#009646",LESS="#DBC200",TEXT="#000000";
function updown(level,upDown){
	this.level = level;
	this.upDown = upDown;
}

var delavalCan = {
	myData: localStorage&&localStorage.myFarm&&JSON.parse(localStorage.myFarm)||{},
	Can: function( container, milkData, perm ) {
		var
		allImage=jr.getImage('/Resources/info6.png'),
		image,
		onresize,
		currentCan,
		data,
		permission=perm,
		robotData,
		robotCellGUI,
		canGUI={},
		checkImageLoad=function(){
			if(--totImg===0)
				onresize();
		},
		totImg=3,
		imageMan = jr.ec( new Image(), { src: jr.getResource('Mode_Manual.png'), onload: checkImageLoad} ),
		imageAuto = jr.ec( new Image(), { src: jr.getResource('Mode_Auto.png'), onload: checkImageLoad} ),
		image = jr.ec( new Image(), { src: jr.getResource('can1.png'), onload: checkImageLoad} ),
		robotModeActive=0,
		selectedCan=0;
		renderCan= function(div,imageObj,xWidth,yHeight,canData,allImage) {
			var canvas=
				jr.ec('canvas',{parentNode:jr.clearHTML( div ),className:'',width:xWidth,height:yHeight}),
				ctx=canvas.getContext("2d"),
				thick=xWidth/50,
				line=function(posY,thickness,color){
					ctx.beginPath();
					ctx.strokeStyle=color;
					ctx.moveTo(10,posY+thickness);
					ctx.lineTo(xWidth-10,posY+thickness);
					ctx.stroke();
				},
				write=function(info,pos,color,label){
					ctx.fillStyle=color;
					ctx.fillText(info.toString(),0.5*xWidth-ctx.measureText(info.toString()).width,pos);
					ctx.fillText(label.toString(),0.9*xWidth-ctx.measureText(label.toString()).width,pos);
				},
				lines=function(pos,last24,upDn24,sevenDays,upDn7){
					var y=pos*yHeight,yy=ICONH*yHeight+thick/2,gradient;
					line(y,yy,BLUE);
					write(sevenDays,y+2.26*yy,BLUE,delavalCan.texts.d7);
					try{
						if(upDn24>=-1)
							ctx.drawImage(allImage,0,600+(upDn24+1)*38,38,35,Math.round(0.52*xWidth),Math.round(y-2.3*yy),Math.round(38*xWidth/400),Math.round(37*yHeight/600));
						if(upDn7>=-1)
							ctx.drawImage(allImage,0,600+(upDn7+1)*38,38,35,Math.round(0.52*xWidth),Math.round(y+1.25*yy),Math.round(38*xWidth/400),Math.round(37*yHeight/600));
					}
					catch(e){}
					if(last24>=sevenDays){
						write(last24,y-(yy+3*thick/2),MORE,delavalCan.texts.h24);
						gradient=ctx.createLinearGradient(0,y+ICONH*yHeight,0,y-ICONH*yHeight);
						gradient.addColorStop(0,"white");
						gradient.addColorStop(1,MORE);
						ctx.fillStyle=gradient;
						ctx.fillRect(10,y-ICONH*yHeight-thick,xWidth-20,2*ICONH*yHeight+thick);
						ctx.stroke();
					}
					else{
						line(y,-yy,LESS);
						write(last24,y-(yy+3*thick/2),TEXT,delavalCan.texts.h24);
						gradient=ctx.createLinearGradient(0,y+ICONH*yHeight,0,y-ICONH*yHeight);
						gradient.addColorStop(1,"white");
						gradient.addColorStop(0,LESS);
						ctx.fillStyle=gradient;
						ctx.fillRect(10,y-ICONH*yHeight,xWidth-20,2*ICONH*yHeight);
						ctx.stroke();
					}
				},i,sz;
			ctx.lineWidth=thick;
			ctx.fillStyle="black";
//			i=ICONH*yHeight*1.5+1;
//			do { ctx.font="bold "+(--i).toString()+"px Arial"; } while(i>8 && (sz=ctx.measureText(canData.name).width) > xWidth*0.38);
//			ctx.fillText(canData.name,0.5*xWidth-sz/2,HEADING*yHeight);
			ctx.font="bold "+Math.floor(ICONH*yHeight*1.5).toString()+"px Arial";
			lines(ALLCOWS,
					Math.round(canData.last24h),
					updown(canData.last24h,canData.lastLast24h),
					Math.round(canData.lastSeven),
					updown(canData.lastSeven,canData.lastLastSeven));
			lines(ONECOW,
				canData.nrAnimalLast24h>0 ? Math.round(canData.last24h / canData.nrAnimalLast24h * 10) / 10 : 0,
				updown(canData.nrAnimalLast24h>0?canData.last24h/canData.nrAnimalLast24h:0, canData.nrAnimalLastLast24h>0?canData.lastLast24h/canData.nrAnimalLastLast24h:0),
				Math.round(canData.nrAnimalLastSeven>0?canData.lastSeven/canData.nrAnimalLastSeven * 10:0) / 10,
				updown(canData.nrAnimalLastSeven>0?canData.lastSeven/canData.nrAnimalLastSeven:0, canData.nrAnimalLastLastSeven>0?canData.lastLastSeven/canData.nrAnimalLastLastSeven:0));
			ctx.drawImage(imageObj,0,0,400,600,0,0,xWidth,yHeight);
		},
		updown=function(now,before){
			var v=before>0?(now-before)/before*100:now>0?1:now===0?0:-1;
			return v>1?1:v<-1?-1:0;
		},
		sort=function(o1,o2){
			return o1.name.toLowerCase().localeCompare(o2.name.toLowerCase());
		},
		aver=function(d,i,cnt){
			var sum=0,c=0;
			i++;cnt++;
			while(--i>=0&&--cnt>0){
				sum+=d[i];
				c++;
			}
			return c==0?0:sum/c;
		},
		canData=function(d){
			this.name=d.target;
			var o=this.data={},v=Math.round(d.kg[13]/10);
			o.all24h = new updown(v,updown(v,Math.round(aver(d.kg,12,3)/10)));
			o.cow24h = new updown(d.kgCowT10[13]/10,updown(d.kgCowT10[13]/10,aver(d.kgCowT10,12,3)/10));
			var d7=Math.round(aver(d.kg,13,7)/10);
			o.all7d = new updown(d7,updown(d7,aver(d.kg,12,13)));
			d7=aver(d.kgCowT10,13,7)/10;
			o.cow7d = new updown(d7,updown(d7,aver(d.kgCowT10,7,7)/10));
		},
		convertData=function(milkData) {
			var rv=[];
			rv.push(milkData.jsVcMilkData);
			if(milkData.jsRobots.length>1)
				jr.foreach(milkData.jsRobots, function(d){d.isRobot=1;rv.push(d);});
			else if(milkData.jsRobots.length===1)
				milkData.jsRobots[0].isRobot=1;
			if(milkData.jsGroups.length>1)
				jr.foreach(milkData.jsGroups, function(d){d.isGroup=1;rv.push(d);});
			return rv;
		},
		onSelectCan=function(){
			var oldMode=robotModeActive;
			selectedCan=this.selectedIndex;
			if((robotModeActive=this.selectedIndex>=data.length))
				$('div.can span.drop-down-text').text(delavalCan.texts.vmsMode);
			else{
				if(oldMode!==robotModeActive){
					clean(canGUI.canPane);
					jr.ec('div', {parentNode:canGUI.canPane, className: 'innerCanPane', contextIdentity: 'innerCanPane' }, canGUI);
				}
				currentCan = data[this.selectedIndex];
				$('div.can span.drop-down-text').text(currentCan.name);
			}
			onresize();
		},
		clean=function(div){
			while (div.firstChild)
			    div.removeChild(div.firstChild);
		},
		robots=function(div,data){
			clean(div);
			var i=-1,d,robotCells=[],col=-1,arr;
			robotCellGUI={};
			while(++i<data.length)
				if((d=data[i]).isRobot){
					if(++col%3===0)
						robotCells.push({'tr':{children:arr=[]}});
					arr.push({'td':{contextIdentity:d.guid}});
				}
			jr.ec('table',{parentNode:div,width:'100%',children:{'tr':{align:'center',children:{'td':{children:{'table':{children:robotCells}}}}}}},robotCellGUI);
			i=-1;
			while(++i<data.length)
				if((d=data[i]).isRobot)
					robot(robotCellGUI[d.guid],d.guid,d.name,d.mode);
		},
		robot=function(myDiv,id,name,mode){
			var ce={},idd='rCell'+id;
			clean(myDiv);
			jr.ec('table',{className:'mode',parentNode:myDiv,children:[
				{'tr':{children:{'td':{align:'center',children:{'canvas':{className:'mode',contextIdentity:idd,width:43,height:43}}}}}},
				{'tr':{children:{'td':{align:'center',className:'mode',innerHTML:'<nobr>'+name+'</nobr>'}}}}
			]},ce);
			var ctx=ce[idd].getContext("2d");
			ctx.drawImage(mode===3?imageMan:imageAuto,0,0);
		},
		robotStatusUpdate=function(data){
			var changed=false;
			jr.foreach(data,function(o){
				var i=-1;
				while(++i<robotData.length&&robotData[i].guid!==o.robotId);
				if(i<robotData.length){
					robotData[i].mode=o.status;
					changed|=robotModeActive;
				}
			});
			if(changed)
				onresize();
		};
		delavalCan.texts = {
			d7: jr.translate('7d'),
			h24: jr.translate('24h'),
			group: jr.translate('Group'),
			vmsMode: jr.translate('VMS mode')
			};
		milkData.jsRobots.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
		milkData.jsGroups.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
		jr.foreach(milkData.jsGroups, function(g){g.name=delavalCan.texts.group+' '+g.name});
		data=convertData(milkData);
		robotData=milkData.jsRobots;
		jr.eventManager.addListener('robotStatus', null, robotStatusUpdate);
		jr.ec( 'div', { parentNode: jr.clearHTML( container ), contextIdentity: 'can', className: 'can', children: [
			{ 'div': { className: 'buttonPane', contextIdentity: 'buttonPane', children: [
				{ 'button': { className:'unselectedButton buttonSelect', children: [
					{ 'span': { className: 'drop-down-text', innerHTML: data[selectedCan].name } } ,
					{ 'img': { src: jr.getResource('arrows.png') } },
				] } },
				{'div': { className: 'buttonSelect', children: [
					{'select': { className: 'canSelect', contextIdentity: 'sel', onchange: onSelectCan, children: function(parent){
						jr.foreach( data, function(o) {
							jr.ec('option', {parentNode:parent, assignments: { canData: o }, text: o.name, selected: !robotModeActive&&name===data[selectedCan].name?'selected':null});
							if(!currentCan)
								currentCan=o;
						})
						if(permission&0x84000)
							jr.ec('option', {parentNode:parent, text: delavalCan.texts.vmsMode, selected: robotModeActive?'selected':null});
						}}}
				]} } ] } },
			{ 'div': { className: 'canPane', contextIdentity: 'canPane', children: [
				{ 'div': { className: 'innerCanPane', contextIdentity: 'innerCanPane', innerHTML: 'Loading...' } }
			] } }
		] }, canGUI );
		jr.touch.attachTouchScroll( canGUI.buttonPane );
		onresize = function() {
			var totalHeight = canGUI.can.offsetHeight;
			var fontHeight = $( canGUI.can).height() / 16.5;
			$( 'div.canPane' ).css( 'height', (totalHeight - fontHeight * 1.6) + 'px' );
			$( 'div.canPane' ).css( 'top', (fontHeight * 1.6) + 'px' );
			$( 'div.buttonPane' ).css( 'height', (fontHeight * 1.6) + 'px' );
			$( 'div.buttonPane' ).css( 'margin-top', (fontHeight * 1.6 * 0.1) + 'px' );
			$( 'div.buttonSelect select.canSelect' ).css( 'height', (fontHeight * 1.5) + 'px' );
			var width = canGUI.canPane.offsetWidth, height = canGUI.canPane.offsetHeight;
			var canWidth = Math.min( width * 0.96, height * 0.60 );
			var canHeight = Math.min( height * 0.96, width / 0.60 );
			jr.ec( canGUI.innerCanPane, { style: { 
				top: parseInt( ( height - canHeight ) / 2, 10 ) + 'px',
				left: parseInt( ( width - canWidth ) / 2, 10 ) + 'px',
				width: parseInt( canWidth, 10 ) + 'px',
				height: parseInt( canHeight, 10 ) + 'px'
			} } );
			$( 'div.can button' ).css( 'font-size', fontHeight );
			$( 'div.can button' ).css( 'height', (fontHeight * 1.5) + 'px' );
			$( 'div.can button img' ).css( 'height', fontHeight * 0.7 + 'px' );
			$( 'div.can button img' ).css( 'width', fontHeight * 0.7 * 0.625 + 'px' );
			$( 'div.can button img' ).css( 'margin-top', fontHeight / 5 + 'px' );
			$( 'div.can button img' ).css( 'right', $(canGUI.can).width() * 0.015 + 10 + 'px' );
			if(robotModeActive)
				robots(canGUI.canPane,robotData);
			else
				renderCan(canGUI.innerCanPane,image,canGUI.innerCanPane.offsetWidth,canGUI.innerCanPane.offsetHeight,currentCan,allImage);
			$( 'div.can table' ).css( 'padding', (fontHeight * 0.2) + 'px' );
			$( 'div.can td.mode' ).css( 'font-size', (fontHeight * 0.7) + 'px' );
			$( 'div.can canvas.mode' ).css( 'height', (fontHeight * 3) + 'px', 'width', (fontHeight * 3) + 'px' );
		};
		this.resize=function(){onresize();};
		$( window ).resize( onresize );
	},
};
