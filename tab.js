jr.include( '/util.js' );
function tabs(Canvas,Image){
	var
	tabWidth=75,
	tabSpace=5,
	tabHeight=67,
	tabLift=5,
	tab = function(x,isFirst,isSelected){
		var y=0, sx=isSelected?110:90, sy=isSelected?360:280, h=isSelected?tabLift:0, y=isSelected?y:y+tabLift;
		if(!isSelected) {
			// Hide last selected tab, fix for android browser bug
			ctx.drawImage(cowImage,109,278,1,1,x,y-tabLift,tabWidth+1,22);
		}
		// Left section
		ctx.drawImage(cowImage,90,sy,21,tabHeight+h,x,y,21,tabHeight+h);
		if(isFirst) {
			// Align to rounded frame beneath
			ctx.drawImage(cowImage,isSelected?77:55,990,21,26,x,y+tabHeight+h-1-(isSelected?tabLift:0),21,21);
		} else {
			// Rounded inner corner
			ctx.drawImage(cowImage,isSelected?0:28,990,26,26,x-18,y+tabHeight+h-26,26,26);
		}
		x+=21;
		// Middle section
		ctx.drawImage(cowImage,111,sy,1,tabHeight,x,y,tabWidth-21-20,tabHeight+h);
		x+=tabWidth-21-20;
		// Right section
		ctx.drawImage(cowImage,112,sy,21,tabHeight+h+1,x,y,21,tabHeight+h+1);
		x+=20;
		// Rounded inner corner
		ctx.drawImage(cowImage,sx,650,18,18,x,y+tabHeight+h-17,18,18);
	},
	icon = function(icon,isSelected){
		var sx=isSelected?icon.ssx:icon.sux,sy=isSelected?icon.ssy:icon.suy, y=isSelected?0:tabLift;
		ctx.drawImage(cowImage, sx, sy, icon.w, icon.h, icon.x+Math.floor((tabWidth-icon.w)/2), 34-icon.h/2+y, icon.w, icon.h);
	},
	onClick = function() {
		var xEvent=event.layerX?event.layerX:event.offsetX;
		var i=-1,x=(xEvent-canvas.offsetLeft)/sizeFactor;
		while(++i<icons.length)
			if(x<icons[i].x+icons[i].tabWidth){
				onSelect(i);
				icons[i].onSelect();
				break;
			}
	},
	onSelect = function(tabPos) {
		var i=-1,nextX=0,o;
		if(!totalWidth){
			canvas.height=90;
			while(++i<icons.length){
				o=icons[i];
				o.x=nextX;
				o.tabWidth=tabWidth+18;
				nextX=nextX+tabWidth+tabSpace;
			}
			canvas.width=totalWidth=icons[icons.length-1].x+icons[icons.length-1].tabWidth;
		}
		selPos=tabPos;
		i=-1;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		while(++i<icons.length){
			if(i!=tabPos) {
				o=icons[i];
				tab(o.x,i==0,false);
				icon(o,false);
			}
		}
		o=icons[tabPos];
		tab(o.x,tabPos==0,true);
		icon(o,true);
	},
	icons=[],
	canvas,
	ctx,
	width,
	cowImage,
	selPos,
	totalWidth=0,
	sizeFactor=1;
	this.add = function(ssx, ssy, sux, suy, w, h, onSelect) {
		var o={};
		o.vPos =	icons.length;
		o.sux =	sux;
		o.suy =	suy;
		o.ssx =	ssx;
		o.ssy =	ssy;
		o.w =	w;
		o.h =	h;
		o.onSelect=onSelect;
		icons.push(o);
	}
	this.goLeft = function() {
		out =  "cant go Left: " + selPos;
		if(selPos > 0) {
			icons[selPos-1].onSelect();
			onSelect(selPos-1);
			out = "goLeft";
		}
		return out;
	},
	this.goRight = function() {
		out =  "cant go Right: " + selPos;
		if(selPos < icons.length - 1) {
			icons[selPos+1].onSelect();
			onSelect(selPos+1);
			out = "goRight";
		}
		return out;
	},
	this.maxWidth = function(width){
		sizeFactor = width < totalWidth ? width/totalWidth : 1;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(sizeFactor, 1);
		onSelect(selPos);
	}
	this.select = function(tabPos){
		onSelect(tabPos);
	};
	canvas = Canvas;
	canvas.onclick = onClick;
	ctx=canvas.getContext("2d");
	cowImage = Image;
}
