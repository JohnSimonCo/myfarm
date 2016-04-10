var sGraph = {
	colorOrginal:	0,
	colorGrid:		0,
	hourGrid:		null,
	pixOrigoX:		5,
	pixOrigoY:		2,
	pixTextLeft:	14,
	pixTextBottom:	14,
	fontHeight:		12,
	localTimeOffset:new Date().getTimezoneOffset() * 60000,
	font:			null,
	plot:			null,
	currIndex:		-1,
	dateFormat:		'd/m',

	log10:			2.302585092994046,

	Point:		function(xFrom,y,xTo){
		this.x = xFrom;
		this.x2 = xTo;
		this.y = y;
		this.xPix = 0;
		this.yPix = 0;
		this.sort = function(o1,o2) {return parseInt(o1.x-o2.x,10);}
	},
	PlotLine:	function(colorLine, thickness, stapleOutlineColor){
		this.colorLine = colorLine;
		this.thickness = thickness;
		this.stapleOutlineColor = stapleOutlineColor;
		this.points = [];
		this.xMin = 0x3fffffffffff;
		this.xMax = -0x3fffffffffff;
		this.AddPoint = function(x,y,x2){
			this.points.push(new sGraph.Point(x,y,x2));
			if (this.xMin==0x3fffffffffff) {
				this.xMin = this.xMax = x;
				if (x2 != null)
					this.xMax = x2;
				this.yMin = this.yMax = y;
			}
			else {
				if (this.xMin > x) this.xMin = x;
				if (this.yMin > y) this.yMin = y;
				if (x2 != null)
					x = x2;
				if (this.xMax < x) this.xMax = x;
				if (this.yMax < y) this.yMax = y;
			}
		};
	},
	PlotData:	function() {
		this.firstTime = true;
		this.recalculate = true;
		this.notSorted = false;
		this.lines = [];
		this.xPixLimit = 0;
		this.yPixLimit = 0;
		this.xLimMin = 0;
		this.xLimMax = 0;
		this.yLimMin = 0;
		this.yLimMax = 0;
		this.xPixWidth = 0;
		this.yPixHeight = 0;
		this.xMin = 0x3fffffffffff;
		this.xMax = -0x3fffffffffff;
		this.yMin = this.yMax = 0;
		this.deltaY = 0;
		this.steps = 0;
		this.scaleX = 0;
		this.scaleY = 0;
		this.PixX = function(x) {return sGraph.pixOrigoX+sGraph.pixTextLeft+parseInt(((x-this.xLimMin)/this.scaleX)*this.xPixWidth+0.5);};
		this.PixY = function(y) {return sGraph.pixOrigoY+this.yPixHeight-parseInt(((y-this.yLimMin)/this.scaleY)*this.yPixHeight+0.5);};
		this.SetLimit = function(ctx, xPixLimit, yPixLimit) {
			this.recalculate |= (this.xPixLimit != xPixLimit) || (this.yPixLimit != yPixLimit);
			if (this.recalculate) {
				this.recalculate = false;
				this.xPixLimit = xPixLimit;
				this.yPixLimit = yPixLimit;
				var tmp = Math.pow(10.0, Math.ceil(Math.log(this.yMax)/2.302585092994046));
				this.yLimMax = (Math.ceil(10.0 * this.yMax / tmp) * tmp / 10.0);
				var lg = Math.log(this.yLimMax)/2.302585092994046;
				this.steps = parseInt(Math.pow(10.0, lg < 0 ? 1+lg-parseInt(lg) : lg-parseInt(lg))+0.01,10);
				this.steps = (this.steps==2) || (this.steps==5) ? 10 : this.steps==3 ? 6 : this.steps==4 ? 8 : this.steps==6 ? 12 : this.steps==1 ? 10 : this.steps;
				if(this.steps>this.yMax)this.steps=this.yMax;
				var reducedSteps = parseInt(Math.ceil(this.yMax / this.yLimMax * this.steps),10);
				this.yLimMax *= reducedSteps / this.steps;
				sGraph.pixTextLeft = ctx.measureText(''+this.yLimMax).width + 4;
				this.steps = reducedSteps;
				this.yLimMin = 0;
				this.scaleY = this.yLimMax >= 0 ? (this.yLimMax - (this.yLimMin >= 0 ? this.yLimMin : -2 * this.yLimMin)) : this.yLimMin - this.yLimMax;
				this.deltaY = this.scaleY / 10;
				this.xLimMin = 86400000 * parseInt(this.xMin / 86400000,10);
				this.xLimMax = 86400000 * parseInt((this.xMax / 86400000) + 1,10);
				this.scaleX = this.xLimMax - this.xLimMin;
				this.xPixWidth = xPixLimit - sGraph.pixOrigoX - sGraph.pixTextLeft;
				this.yPixHeight = yPixLimit - sGraph.pixOrigoX - sGraph.pixTextBottom - sGraph.fontHeight / 2;
				var i = -1;
				while (++i < this.lines.length) {
					var ln = this.lines[i];
					var j = -1;
					while (++j < ln.points.length) {
						var point = ln.points[j];
						point.xPix = this.PixX(point.x);
						point.yPix = this.PixY(point.y);
						if (point.x2 != null)
							point.x2Pix = this.PixX(point.x2);
					}
				}
			}
		};
		this.DateOfYear = function(ctx,d) {
			var n0=function(n){return n};	// {return n<10?'0'+n:n};
			var o="",i=-1,tmf=sGraph.dateFormat;
			while(++i<tmf.length)switch(tmf[i]){case'y':o+=d.getFullYear();break;case'm':o+=n0(d.getMonth()+1);break;case'd':o+=n0(d.getDate());break;case'H':o+=n0(d.getHours());break;case'M':o+=n0(d.getMinutes());break;case'S':o+=n0(d.getSeconds());break;case'T':o+=n3(d.getMilliseconds());break;default:o+=tmf[i];}
			this.date = o;
			this.size = ctx.measureText(o);
		};
		this.makeGrid = function(ctx) {
			var min = this.PixY(this.yLimMin)+1, max = this.PixY(this.yLimMax);
			var x = this.xLimMin;
			var textPos = 0;
//			ctx.fillStyle = sGraph.orginal;
			ctx.lineWidth = 1;
			var hStep = 86400000 / 4;
			var delta = this.PixX(x + hStep) -  this.PixX(x);
			if (delta > 10 && sGraph.hourGrid != null) {
				x += hStep;
				ctx.strokeStyle = sGraph.hourGrid;
				ctx.beginPath();
				while (x <= this.xLimMax - 10) {
					var pixX = this.PixX(x);
					ctx.moveTo(pixX, min);
					ctx.lineTo(pixX, max);
					x += hStep;
				}
				ctx.stroke();
				ctx.closePath();
				x = this.xLimMin;
			}
			ctx.strokeStyle = sGraph.colorGrid;
			ctx.beginPath();
			while (x <= this.xLimMax + 0.5) {
				var pixX = this.PixX(x);
				ctx.moveTo(pixX, min+4);
				ctx.lineTo(pixX, max);
				var d = new this.DateOfYear(ctx,new Date(x));
				var tPos = pixX + ((x + 1) < (this.xLimMax + 0.5) ? -d.size.width/2 : -d.size.width);
				if (tPos > textPos + 5) {
					textPos = tPos + d.size.width;
					ctx.fillText(d.date, tPos, min + sGraph.fontHeight - sGraph.pixOrigoY + 3);
				}
				x += 86400000;
			}
			min = this.PixX(this.xLimMin)-3;
			max = this.PixX(this.xLimMax);
			x = -1;
			var step = (this.yLimMax-this.yLimMin)/this.steps;
			var y = this.yLimMin;
			textPos = 100000;
			while (++x <= this.steps) {
				var yPix = this.PixY(y);
				ctx.moveTo(min-3, yPix);
				ctx.lineTo(max, yPix);
				var s = Math.round(y * 10) / 10;
				var px = ctx.measureText(s);
				tPos = x == this.steps ? yPix-3 : yPix - sGraph.fontHeight/2;
				if (tPos < textPos) {
					textPos = tPos-sGraph.fontHeight;
					ctx.fillText(s, min-px.width - 5, tPos + sGraph.fontHeight - sGraph.pixOrigoY);
				}
				y += step;
			}
			ctx.stroke();
			ctx.closePath();
		};
		this.paintLine = function(ctx, ln) {
			var i = 0;
			ctx.strokeStyle = ln.colorLine;
			if (ln.stapleOutlineColor != null) {
				ctx.fillStyle=ln.stapleOutlineColor;
				var y0 = this.PixY(0);
				i = -1;
				while (++i < ln.points.length)
					ctx.fillRect(ln.points[i].xPix, ln.points[i].yPix, ln.points[i].x2Pix - ln.points[i].xPix, y0 - ln.points[i].yPix);
			}
			else {
				ctx.beginPath();
				ctx.lineWidth = ln.thickness;
				if (ln.points.length > 0) {
					ctx.moveTo(ln.points[0].xPix, ln.points[0].yPix);
					while (++i < ln.points.length)
						ctx.lineTo(ln.points[i].xPix, ln.points[i].yPix);
				}
			}
			ctx.stroke();
			ctx.closePath();
		};
		this.Paint = function(width, height, ctx) {
			if (sGraph.currIndex >= 0) {
				this.SetLimit(ctx,width, height);
				var i = 0;
				while ((i < this.lines.length) &&  (this.lines[i].stapleOutlineColor != null))
					this.paintLine(ctx, this.lines[i++]);
				this.makeGrid(ctx);
				while (i < this.lines.length)
					this.paintLine(ctx, this.lines[i++]);
			}
		};
		this.AddPoint = function(index,x,y,x2) {
			this.recalculate = true;
			var ln = this.lines[index];
			ln.AddPoint(x,y,x2);
			if (this.firstTime) {
				this.firstTime = false;
				this.xMin = ln.xMin;
				this.yMin = ln.yMin;
				this.xMax = ln.xMax;
				this.yMax = ln.yMax;
			}
			else {
				if (this.xMin > ln.xMin) this.xMin = ln.xMin;
				if (this.yMin > ln.yMin) this.yMin = ln.yMin;
				if (this.xMax < ln.xMax) this.xMax = ln.xMax;
				if (this.yMax < ln.yMax) this.yMax = ln.yMax;
			}
		}
	},
	setFont:	function(font, fontHeight) {
		sGraph.fontHeight = fontHeight;
		sGraph.font = font;
	},
	addPoint:	function(d,value) {
		sGraph.plot.AddPoint(this.currIndex, d - sGraph.localTimeOffset, value, null);
	},
	addStaple:	function(d,value,x2) {
		sGraph.plot.AddPoint(this.currIndex, d - sGraph.localTimeOffset, value, x2 - sGraph.localTimeOffset);
	},
	addLine:	function(color, thickness, stapleOutlineColor) {
		if (sGraph.plot == null)
			sGraph.plot = new sGraph.PlotData();
		sGraph.currIndex++;
		sGraph.plot.lines.push(new sGraph.PlotLine(color, thickness, stapleOutlineColor));
	},
	Clear:		function(colorGrid,colorHour,dateFormat) {
		if (dateFormat != null)
			sGraph.dateFormat = dateFormat;
		sGraph.hourGrid = colorHour;
		sGraph.colorGrid = colorGrid;
		sGraph.plot = null;
		sGraph.currIndex = -1;
	},
	setLimits:	function(max,from,to) {
		if(max!=null)
			sGraph.plot.yMax = max;
		if(from<sGraph.plot.xMin)
			sGraph.plot.xMin = from;
		if(to>sGraph.plot.xMax)
			sGraph.plot.xMax = to;
	},
	getYmax:	function() {
		return sGraph.plot.yMax;
	},
	setYmax:	function(ymax) {
		sGraph.plot.yMax = ymax;
	},
	setDimensions:	function(pixOrigoX,pixOrigoY,pixTextLeft,pixTextBottom) {
		sGraph.pixOrigoX = pixOrigoX;
		sGraph.pixOrigoY = pixOrigoY;
		sGraph.pixTextBottom = pixTextBottom;
		sGraph.pixTextLeft = pixTextLeft;
	},
	paint:	function(canvas) {
//		fm = g.getFontMetrics();
//		fontHeight = fm.getHeight();
		if ((sGraph.plot != null) && (canvas.getContext != null)) {
			var ctx = canvas.getContext('2d');
			if (sGraph.font != null)
				ctx.font = sGraph.font
			sGraph.orginal = ctx.fillStyle;
			sGraph.plot.Paint(canvas.width, canvas.height, ctx);
		}
	},
	last:			0
}