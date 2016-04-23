'use strict';

angular.module('jrGraph', [])
.factory('jrGraph', [function() {
	var myGraph = {
		log10:				2.302585092994046,
		localTimeOffset:	new Date().getTimezoneOffset() * 60000,
		instance:  function(onMosueStopIn, monthsIn) {
			var
			months=			monthsIn.toUpperCase().split(' '),
			canvas,
			colorOrginal=	0,
			colorText=		0,
			colorGrid=		0,
			colorMont1=		0,
			colorMont2=		0,
			hourGrid=		null,
			pixOrigoX=		5,
			pixOrigoYUpper=	2,
			pixOrigoY=		pixOrigoYUpper,
			pixTextLeft=	14,
			pixTextBottom=	14,
			fontHeight=		12,
			font=			null,
			currIndex=		-1,
			dateFormat=		'd/m',
			onMosueStop=	onMosueStopIn,

			point=function(xFrom, y, xTo, id, col, specialColor, makeBig){
				this.x = xFrom;
				this.x2 = xTo;
				this.y = y;
				this.id = id;
				this.col = col;
				this.specialColor = specialColor;
				this.makeBig = makeBig;
				this.xPix = 0;
				this.yPix = 0;
				this.sort = function(o1,o2) {return parseInt(o1.x-o2.x,10);};
			},
			plotLine=function(colorLine, thickness, stapleOutlineColor, onMouseOver, markDiameter, onClick){
				this.colorLine = colorLine;
				this.thickness = thickness;
				this.stapleOutlineColor = stapleOutlineColor;
				this.points = [];
				this.xMin = 0x3fffffffffff;
				this.xMax = -0x3fffffffffff;
				this.onMouseOver = onMouseOver;
				this.markDiameter = markDiameter;
				this.onClick = onClick;
				this.addPoint = function(x, y, x2, id, col, specialColor, makeBig){
					this.points.push(new point(x, y, x2, id, col, specialColor, makeBig));
					if (this.xMin===0x3fffffffffff) {
						this.xMin = this.xMax = x;
						if (x2)
							this.xMax = x2;
						this.yMin = this.yMax = y;
					}
					else {
						if (this.xMin > x) this.xMin = x;
						if (this.yMin > y) this.yMin = y;
						if (x2)
							x = x2;
						if (this.xMax < x) this.xMax = x;
						if (this.yMax < y) this.yMax = y;
					}
				};
			},
			dateOfYear = function(ctx, d) {
				var n0=function(n){return n};	// {return n<10?'0'+n:n};
				var o="", i=-1, tmf=dateFormat;
				while(++i<tmf.length)switch(tmf[i]){case'y':o+=d.getFullYear();break;case'm':o+=n0(d.getMonth()+1);break;case'd':o+=n0(d.getDate());break;case'H':o+=n0(d.getHours());break;case'M':o+=n0(d.getMinutes());break;case'S':o+=n0(d.getSeconds());break;case'T':o+=n3(d.getMilliseconds());break;default:o+=tmf[i];}
				this.date = o;
				this.size = ctx.measureText(o);
			},
			plotData=function() {
				this.lines = [];
				this.info;
				this.textStyle;

				var
				firstTime = true,
				recalculate = true,
				notSorted = false,
				xPixLimit = 0,
				yPixLimit = 0,
				xLimMin = 0,
				xLimMax = 0,
				yLimMin = 0,
				yLimMax = 0,
				xPixWidth = 0,
				yPixHeight = 0,
				xMin = 0x3fffffffffff,
				xMax = -0x3fffffffffff,
				yMin = 0,
				yMax = 0,
				steps = 0,
				scaleX = 0,
				scaleY = 0;
				this.pixX = function(x)			{return pixOrigoX + pixTextLeft + Math.round(((x-xLimMin) / scaleX) * xPixWidth);};
				this.pixY = function(y)			{return pixOrigoY + yPixHeight - Math.round(((y-yLimMin) / scaleY) * yPixHeight);};
				this.pixXreverse = function(x)	{return (((x - (pixOrigoX + pixTextLeft)) / xPixWidth) * scaleX) + xLimMin;};
				this.pixYreverse = function(y)	{return (((pixOrigoY + yPixHeight) - y) / yPixHeight * scaleY) + yLimMin;};
				this.setYmax = function(yMaxIn)	{yMax = yMaxIn;};
				this.getXmin = function()		{return xMin;};
				this.setXmin = function(xMinIn)	{xMin = xMinIn;};
				this.getXmax = function()		{return xMax;};
				this.setXmax = function(xMaxIn)	{xMax = xMaxIn;};
				this.setLimit = function(ctx, xPixLimitIn, yPixLimitIn) {
					recalculate |= (xPixLimit !== xPixLimitIn) || (yPixLimit !== yPixLimitIn);
					if (recalculate) {
						pixOrigoY += ctx.measureText('M').width + 3;
						recalculate = false;
						xPixLimit = xPixLimitIn;
						yPixLimit = yPixLimitIn;
						var tmp = Math.pow(10.0, Math.ceil(Math.log(yMax)/2.302585092994046));
						yLimMax = (Math.ceil(10.0 * yMax / tmp) * tmp / 10.0);
						var lg = Math.log(yLimMax)/2.302585092994046;
						steps = parseInt(Math.pow(10.0, lg < 0 ? 1 + lg-parseInt(lg) : lg-parseInt(lg)) + 0.01, 10);
						steps = (steps===2) || (steps===5) ? 10 : steps===3 ? 6 : steps===4 ? 8 : steps===6 ? 12 : steps===1 ? 10 : steps;
						if (steps > yMax)
							steps = yMax;
						var reducedSteps = parseInt(Math.ceil(yMax / yLimMax * steps), 10);
						yLimMax *= reducedSteps / steps;
						pixTextLeft = ctx.measureText(''+yLimMax).width + 4;
						steps = reducedSteps;
						yLimMin = 0;
						scaleY = yLimMax >= 0 ? (yLimMax - (yLimMin >= 0 ? yLimMin : -2 * yLimMin)) : yLimMin - yLimMax;
						xLimMin = new Date(xMin).setHours(0,0,0,0);// - myGraph.localTimeOffset;
						xLimMax = new Date(xMax).setHours(0,0,0,0) + 86400000;
						scaleX = xLimMax - xLimMin;
						xPixWidth = xPixLimit - pixOrigoX - pixTextLeft;
						yPixHeight = yPixLimit - pixOrigoX - pixTextBottom - fontHeight / 2 - pixOrigoY;
						var i = -1;
						while (++i < this.lines.length) {
							var ln = this.lines[i];
							var j = -1;
							while (++j < ln.points.length) {
								var point = ln.points[j];
								point.xPix = this.pixX(point.x);
								point.yPix = this.pixY(point.y);
								if (point.x2)
									point.x2Pix = this.pixX(point.x2);
							}
						}
					}
				};
				this.makeGrid = function(ctx) {
					var min = this.pixY(yLimMin)+1, max = this.pixY(yLimMax);
					var tMin = new Date(xMin), tMax = new Date(xMax), tFrom = xMin, t = xMin, first = true;
					var tMinMonth = tMin.getMonth(), lastMonth = xMin;
					var fillMonth = function(from, to, month) {
						ctx.fillStyle=first ? colorMont1 : colorMont2;
						first = !first;
						ctx.fillRect(from, pixOrigoYUpper, to - from, min - pixOrigoYUpper);
						ctx.fillStyle = colorText;
						ctx.fillText(months[month], from + 3, pixOrigoYUpper + fontHeight);
					};
	//				var nrMonth = tMax.getMonth() + (tMax.getYear() - tMin.getYear()) * 12 - tMinMonth + 1;
					while (t <= xMax) {
						t += 86400000;
						if (tMinMonth !== new Date(t).getMonth()) {
							fillMonth(this.pixX(lastMonth), this.pixX(t), tMinMonth);
							lastMonth = t;
							tMinMonth = new Date(t).getMonth();
						}
					}
					fillMonth(this.pixX(lastMonth), this.pixX(t), tMinMonth);
					var i = -1;
					while (++i < this.lines.length)
						if (this.lines[i].stapleOutlineColor)
							this.paintLine(ctx, this.lines[i]);
					var x = xLimMin;
					var textPos = 0;
					if (colorText)
						ctx.fillStyle = colorText;
					ctx.lineWidth = 1;
					var hStep = 86400000 / 4;
					var delta = this.pixX(x + hStep) -  this.pixX(x);
					if (delta > 10 && hourGrid) {
						x += hStep;
						ctx.strokeStyle = hourGrid;
						ctx.beginPath();
						while (x <= xLimMax - 10) {
							var pixX = this.pixX(x);
							ctx.moveTo(pixX, min);
							ctx.lineTo(pixX, max);
							x += hStep;
						}
						ctx.stroke();
						ctx.closePath();
						x = xLimMin;
					}
					ctx.strokeStyle = colorGrid;
					ctx.lineWidth = 1; // 2;
					ctx.beginPath();
					while (x <= xLimMax - myGraph.localTimeOffset) {
						var pixX = this.pixX(x);
						ctx.moveTo(pixX, min+4);
						ctx.lineTo(pixX, max);
						var d = new dateOfYear(ctx, new Date(x));
						var tPos = pixX + ((x + 1) < (xLimMax + 0.5) ? -d.size.width/2 : -d.size.width);
						if (tPos > textPos + 5) {
							textPos = tPos + d.size.width;
							ctx.fillText(d.date, tPos, min + fontHeight + 3);
						}
						x += 86400000;
					}
					min = this.pixX(xLimMin) - 3;
					max = this.pixX(xLimMax);
					x = -1;
					var step = (yLimMax - yLimMin) / steps;
					var y = yLimMin;
					textPos = 100000;
					while (++x <= steps) {
						var yPix = this.pixY(y);
						ctx.moveTo(min - 3, yPix);
						ctx.lineTo(max, yPix);
						var s = Math.round(y * 10) / 10;
						var px = ctx.measureText(s);
						tPos = x ? yPix - fontHeight/2 : yPix - fontHeight + 4;
	//					tPos = yPix - fontHeight/2;
						if (tPos < textPos) {
							textPos = tPos-fontHeight;
							ctx.fillText(s, min-px.width - 5, tPos + fontHeight);
						}
						y += step;
					}
					ctx.stroke();
					ctx.closePath();
					canvas.style.cursor = 'default';
				};
				this.paintMarks = function(ctx, ln) {
					if (ln.markDiameter) {
						var i = 0, diam = ln.markDiameter, diam2 = diam << 1, diam3 = diam2 << 1;
						ln.markX=[];
						ln.markY=[];
						if (ln.points.length > 0) {
							while (++i < ln.points.length) {
								var p = ln.points[i];
								if (p.id) {
									ln.markX.push(p.xPix);
									ln.markY.push(p.yPix);
									if (p.makeBig&2) {
										if (!(p.makeBig&1)) {
											ctx.fillStyle = '#ffffff';
											ctx.fillRect(p.xPix - diam2, p.yPix - diam2, diam3, diam3);
											if (p.col && ln.markDiameter)
												ctx.fillStyle = p.col;
											ctx.fillRect(p.xPix - diam, p.yPix - diam, diam2, diam2);
										}
										else {
											if (p.col && ln.markDiameter)
												ctx.fillStyle = p.col;
											ctx.fillRect(p.xPix - diam2, p.yPix - diam2, diam3, diam3);
										}
									}
									else {
										ctx.beginPath();
										ctx.fillStyle = p.specialColor ? p.specialColor : p.col;
										var dm = p.specialColor || p.makeBig ? Math.max(2 * diam, 6) : diam;
										ctx.arc(p.xPix, p.yPix, dm, 0, 2 * Math.PI, false);
										ctx.fill();
										ctx.lineWidth = 1;
										ctx.strokeStyle = '#003300';
										ctx.stroke();
									}
								}
								else {
									ln.markX.push(10000000);
									ln.markY.push(0);
								}
							}
						}
					}
				};
				this.printInfo = function(ctx) {
					var info = this.info, textStyle = this.textStyle;
					var font = ctx.font, step = fontHeight, height = ctx.measureText('M').width;
					if (textStyle && textStyle.font) {
						ctx.font = textStyle.font;
						step = textStyle.size;
					}
					var i = -1, xPos = Math.round(this.pixX(xLimMin)) + 10, yPos = Math.round(this.pixY(yLimMax) + step);
					this.onClickX = xPos + step / 3;
					this.onClickY=[];
					this.onClickId=[];
					this.radius = step / 3;
					while (++i < info.length) {
						var o = info[i];
						this.onClickId.push(o.id);
						ctx.beginPath();
						var yy = yPos - step / 4;
						this.onClickY.push(yy);
						ctx.arc(this.onClickX, yy, this.radius, 0, 2 * Math.PI, false);
						if (o.isOn) {
							ctx.fillStyle = o.color;
							ctx.fill();
						}
						ctx.lineWidth = 2;
						ctx.strokeStyle = o.color;
						ctx.stroke();
						ctx.fillStyle = textStyle.color; // info[i].color;
						ctx.fillText(info[i].text, xPos + step - 3, yPos);
						yPos += step;
					}
					ctx.font = font;
				};
				this.paintLine = function(ctx, ln) {
					var i = 0;
					ctx.strokeStyle = ln.colorLine;
					if (ln.stapleOutlineColor) {
						var fromX = ln.fromX=[];
						var toX = ln.toX=[];
						var toY = ln.toY=[];
						var y0 = ln.fromY = this.pixY(0);
						i = -1;
						while (++i < ln.points.length) {
							var p = ln.points[i];
							ctx.fillStyle='#000000';
							var x = Math.round(p.xPix), y = Math.round(p.yPix), width = Math.round(p.x2Pix - p.xPix), height = Math.round(y0 - p.yPix);
							fromX.push(x);
							toX.push(x + width);
							toY.push(y);
							ctx.fillRect(x, y, width, height);
							ctx.fillStyle = p.specialColor ? p.specialColor : ln.stapleOutlineColor;
							if (width > 2 && height > 2)
								ctx.fillRect(x+1, y+1, width-2, height-2);
						}
					}
					else {
						ctx.beginPath();
						ctx.lineWidth = ln.thickness;
						if (ln.points.length > 0) {
							ctx.moveTo(ln.points[0].xPix, ln.points[0].yPix);
							while (++i < ln.points.length)
								ctx.lineTo(ln.points[i].xPix, ln.points[i].yPix);
						}
						ctx.stroke();
						ctx.closePath();
					}
				};
				this.paint = function(width, height, ctx) {
					if (currIndex >= 0) {
						this.setLimit(ctx,width, height);
						this.makeGrid(ctx);
						var i = -1;
						while (++i < this.lines.length)
							if (!this.lines[i].stapleOutlineColor)
								this.paintLine(ctx, this.lines[i]);
						i = -1;
						while (++i < this.lines.length)
							if (!this.lines[i].stapleOutlineColor)
								this.paintMarks(ctx, this.lines[i]);
						if (this.info)
							this.printInfo(ctx);
					}
				};
				this.clicked = function(data) {
					if (!this.getClosest()) {
						var me = data.plot, x = event.offsetX, y = event.offsetY;
						if (me.onClickX && x - me.radius <= me.onClickX && x + me.radius >= me.onClickX) {
							var i = -1;
							while (++i < me.onClickY.length) {
								if (y - me.radius <= me.onClickY[i] && y + me.radius >= me.onClickY[i]) {
									var id = me.onClickId[i];
									i = -1;
									while (++i < me.info.length)
										if (me.info[i].id === id) {
											me.onClickInfo(id);
											return false;
										}
									break;
								}
							}
						}
						var newTarget = me.getTarget();
						if (data.mouseClickCallback)
							if (newTarget)
								data.mouseClickCallback(data, newTarget);
							else
								data.mouseClickCallback(me, Math.round(me.pixXreverse(window.event.offsetX)), Math.round(me.pixYreverse(window.event.offsetY)));
					}
					return false;
				};
				this.addInfo = function(infoIn, textStyleIn, onClick) {
					this.info = infoIn;
					this.textStyle = textStyleIn;
					this.onClickInfo = onClick;
				};
				this.addPoint = function(index, x, y, x2, id, col, specialColor, makeBig) {
					recalculate = true;
					var ln = this.lines[index];
					ln.addPoint(x, y, x2, id, col, specialColor, makeBig);
					if (firstTime) {
						firstTime = false;
						xMin = ln.xMin;
						yMin = ln.yMin;
						xMax = ln.xMax;
						yMax = ln.yMax;
					}
					else {
						if (xMin > ln.xMin) xMin = ln.xMin;
						if (yMin > ln.yMin) yMin = ln.yMin;
						if (xMax < ln.xMax) xMax = ln.xMax;
						if (yMax < ln.yMax) yMax = ln.yMax;
					}
				};
				this.getClosest = function() {
					if (window.event.type === 'click') {
						var mouseX=window.event.offsetX, mouseY=window.event.offsetY, i = -1;
						while (++i < this.lines.length) {
							var ln = this.lines[i], ii = -1;
							if (ln.onClick)
								if (ln.markX) {
									var dist = Number.MAX_SAFE_INTEGER, id = null;
									while (++ii < ln.markX.length) {
										var ndX = mouseX - ln.markX[ii], ndY = mouseY - ln.markY[ii], nd = ndX * ndX + ndY * ndY;
										if (nd < dist) {
											dist = nd;
											var pnt = ln.points[ii+1];
											id = pnt.id;
										}
									}
									ln.onClick(id);
									return true;
								}
								else if (ln.fromX)
									while (++ii < ln.fromX.length)
										if (mouseX >= ln.fromX[ii] && mouseX <= ln.toX[ii] && mouseY >= ln.toY[ii] && mouseY <= ln.fromY) {
											ln.onClick(ln.points[ii].id);
											return true;
										}
						}
					}
					return null;
				};
				this.getTarget = function() {
					var mouseX=window.event.offsetX, mouseY=window.event.offsetY, i = -1;
					while (++i < this.lines.length) {
						var ln = this.lines[i], ii = -1, xl=mouseX-ln.markDiameter, xr=mouseX+ln.markDiameter, yu=mouseY-ln.markDiameter, yd=mouseY+ln.markDiameter;
						if (ln.markX)
							while (true) {
								while (++ii < ln.markX.length && xl > ln.markX[ii]) {}
								if (ii === ln.markX.length)
									break;
								if (ln.markX[ii] <= xr && yu < ln.markY[ii] && yd > ln.markY[ii] && ln.onMouseOver) {
									var pnt = ln.points[ii+1];
									ln.onMouseOver(pnt.id, window.event);
									return pnt.id;
								}
						}
					}
					return this.getClosest();
//					return null;
				};
			};
			this.plot =	null;
			this.clicked = function() {
				this.myself.plot.clicked(this.myself);
			};
			this.setFont = function(fontIn, fontHeightIn) {
				fontHeight = fontHeightIn;
				font = fontIn;
			};
			this.restartPoint = function(d) {
				this.plot.addPoint(currIndex, 0);
			};
			this.addInfo = function(textInfo, textStyle, onClick) {
				this.plot.addInfo(textInfo, textStyle, onClick);
			};
			this.addPoint = function(d, value, id, col, specialColor, makeBig) {
				this.plot.addPoint(currIndex, d, value, null, id, col, specialColor, makeBig);
			};
			this.addStaple = function(d,value,x2,altCol,id) {
				this.plot.addPoint(currIndex, d, value, x2, id, null, altCol);
			};
			this.addLine = function(color, thickness, stapleOutlineColor, onMouseOver, markDiameter, onClick) {
				if (!this.plot)
					this.plot = new plotData();
				currIndex++;
				this.plot.lines.push(new plotLine(color, thickness, stapleOutlineColor, onMouseOver, markDiameter, onClick));
			};
			this.clear = function(colorGridIn, colorHour, dateFormatIn, colorTextIn, colorMont1In, colorMont2In) {
				if (dateFormatIn)
					dateFormat = dateFormatIn;
				colorText = colorTextIn;
				hourGrid = colorHour;
				colorGrid = colorGridIn;
				colorMont1 = colorMont1In;
				colorMont2 = colorMont2In;
				this.plot = null;
				currIndex = -1;
			};
			this.setLimits = function(ymax, from, to) {
				if (ymax)
					this.plot.setYmax(ymax);
				if (from < this.plot.getXmin())
					this.plot.setXmin(from);
				if (to > this.plot.getXmax())
					this.plot.setXmax(to);
			};
			this.getYmax = function() {
				return this.plot.yMax;
			};
			this.setYmax =function(ymax) {
				this.plot.setYmax(ymax);
			};
			this.setDimensions = function(pixOrigoXIn, pixOrigoYIn, pixTextLeftIn, pixTextBottomIn) {
				pixOrigoX = pixOrigoXIn;
				pixOrigoY = pixOrigoYIn;
				pixTextBottom = pixTextBottomIn;
				pixTextLeft = pixTextLeftIn;
			};
			this.paint = function() {
		//		fm = g.getFontMetrics();
		//		fontHeight = fm.getHeight();
				if (this.plot && canvas.getContext) {
					var ctx = canvas.getContext('2d');
					if (font)
						ctx.font = font;
					colorOrginal = ctx.fillStyle;
					this.plot.paint(canvas.width, canvas.height, ctx);
				}
			};
			this.setCanvas = function(canvasIn) {
				canvas = canvasIn;
				canvas.myself = this;
				canvas.addEventListener('click', this.clicked, false);
			};
			this.oldTarget=null;
			this.checkTarget = function() {
				if (this.plot && canvas.getContext) {
					var newTarget = this.plot.getTarget();
					if (!this.oldTarget && newTarget)
						canvas.style.cursor='pointer';
					else if (!newTarget && this.oldTarget) {
						canvas.style.cursor='default';
						onMosueStop && onMosueStop();
					}
					if (this.cursor && canvas.style.cursor === 'default')
						canvas.style.cursor=this.cursor;
					this.oldTarget = newTarget;
				}
			};
			this.mouseTargetStart = function() {
				this.myself.checkTarget();
			};
			this.mouseTargetMove = function() {
				this.myself.checkTarget();
			};
			this.setCursor = function(cursor) {
				this.cursor = cursor;
			};
			this.mouseClickSetCallback = function(callback) {
				this.mouseClickCallback = callback;
			};
		}
	};
	return myGraph;
}]);
