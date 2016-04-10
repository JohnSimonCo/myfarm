jr.include('/util.js');
jr.include('/filter.js');
jr.include('/mouseBox.js' );
jr.include('/d3.js');
jr.include('/nv.d3.js');
jr.include('/nv.d3.css');
function perRobot(){
	var allData,
		userFilter,
		filteredData,
		allFilteredData,
		chartData,
		legendData,
		isCleanings,
		view,
		viewFunction=0,
		robotMap={},
		checkboxData=function(label,isChecked,color){
			this.label=label;
			this.color=color;	// == null for normal checkbox
			this.isChecked=isChecked;
		},
		cleanfunctions=[					// Indexes maps on switch statement in getValues()
			'TimeH',
			'CleanTimeH',
			'NrRins',
			'RinsTimeM',
			'NrOk',
			'CircTimeM',
			'alcaVol',
			'acidVol',
			'AftFillTemp',
			'RetTemp',
			'failNr:',
			'TimeM',
			'AlcaVol',
			'AcidVol'
		],
		functions=[						// Indexes maps on switch statement in getValues()
			jr.translate('All'),
			jr.translate('Kg'),
			jr.translate('Kg/Milk'),
			jr.translate('min/Milk'),
			jr.translate('NrMilk'),
			jr.translate('Flow'),
			jr.translate('PerfInd'),
			jr.translate('incomp')+'%',
			jr.translate('kickOff')+'%',
			jr.translate('Sev-5'),
			jr.translate('Sev-4'),
			jr.translate('hourTot'),
			jr.translate('hourIdle'),
			jr.translate('cond'),
			jr.translate('blood'),
			jr.translate('occ')+'%',
			jr.translate('occ'),
		];
		getCleanVal=function(cc,typ){
			switch(typ){
				case 0:		// TimeH
					return cc.totalTimeSec/60/60;
				case 1:		// CleanTimeH
					return cc.cleaningTimeSec/60/60;
				case 2:		// NrRins
					return cc.rinseNr;
				case 3:		// RinsTimeM
					return cc.rinsingTimeSec/60;
				case 4:		// NrOk
					return cc.nrOk;
				case 5:		// CircTimeM
					return cc.circTimeSec/60;
				case 6:		// alcaVol
					return cc.alcaVol/100;
				case 7:		// acidVol
					return cc.acidVol/100;
				case 8:		// AftFillTemp
					return cc.afterFillTemp/cc.nrOk;
				case 9:		// RetTemp
					return cc.returnTemp/cc.nrOk;
				case 10:	// failNr
					return cc.failedNr;
				case 11:	// TimeM
					return cc.failedTimeSec/60;
				case 12:	// AlcaVol
					return cc.failedAlcaVol/100;
				case 13:	// AcidVol
					return cc.failedAcidVol/100;
			}
		};
		getRobotVal=function(rs,typ){
			switch(typ){
				case 0:		// Kg
					return rs.kg;
				case 1:		// Kg/milk
					return rs.kg/rs.nrMilkings;
				case 2:		// min/Milk
					return rs.secMilkingTime/60/rs.nrMilkings;
				case 3:		// nrMilkings
					return rs.nrMilkings;
				case 4:		// Average flow
					return rs.flow/rs.nrMilkings;
				case 5:		// Performance index
					return rs.performance/rs.nrMilkings;
				case 6:	// incomp
					return rs.nrIncomplete/rs.nrMilkings*100;
				case 7:		// kickOff
					return rs.nrKickOff/rs.nrMilkings*100;
				case 8:		// stop alarm
					return rs.stopAlarms;
				case 9:		// reminder
					return rs.reminders;
				case 10:	// hourTot
					return rs.secMilkingTime/8640;
				case 11:	// hourIdle
					return 24-rs.secMilkingTime/8640;
				case 12:	// conductivity
					return rs.conductivity/rs.nrMilkings;
				case 13:	// blood
					return rs.bloodSum/rs.nrMilkings;
				case 14:	// occ%
					return rs.nrOccSamples/rs.nrMilkings*100;
				case 15:	// occVal
					return rs.nrOccSamples?rs.occSum/rs.nrOccSamples:0;
			}
		}
		getValues=function(head,typ){
			document.getElementById('myTopHeading').innerHTML=(isCleanings?stat.texts.cleanings:stat.texts.perRobot)+' - '+head;
			var nrDays=filteredData.length,values=[],i=-1,robots={},commonName,commonIndex;
			while(++i<nrDays){
				var o=filteredData[i],j=-1;
				if(o&&o.robots)
					while(++j<o.robots.length){
						var r=o.robots[j];
						if(r.included&&!robots[r.milkingDeviceGUID]){
							robots[r.milkingDeviceGUID]={fullName:r.fullname};
							if(commonName){
								var ii=-1;
								while(++ii<r.fullname.length&&commonName[ii]===r.fullname[ii]);
								commonIndex=Math.min(commonIndex,ii);
							}
							else{
								commonName=r.fullname;
								commonIndex=commonName.length;
							}
						}
					};
			}
			i=-1,j;
			for(var rr in robots){
				var r=robots[rr];
				r.values=[];
				j=nrDays;
				while(--j>=0)
					r.values.push({x:filteredData[j].day});
			};
			i=-1;
			while(++i<nrDays){
				var o=filteredData[i],j=-1;
				if(o&&o.robots)
					while(++j<o.robots.length){
						var rs=o.robots[j],r=robots[rs.milkingDeviceGUID],value;
						if(!isCleanings)
							r.values[nrDays-i-1].y=getRobotVal(rs,typ);
						else if(r&&rs.cleaning)
							r.values[nrDays-i-1].y=getCleanVal(rs.cleaning,typ);
					}
			}
			for(var rr in robots)
				values.push(robots[rr]);
			values.sort(function(o1,o2){return o1.fullName.localeCompare(o2.fullName);});
			if(!commonIndex)
				commonIndex=0;
			else{
				while(commonIndex>0&&commonName[commonIndex]!=='.')commonIndex--;
				if(commonName[commonIndex]==='.')
					commonIndex++;
			}
			i=-1;
			while(++i<values.length){
				var o=values[i];
				o.color=jr.rainbowColor(i,values.length);
				o.key=o.fullName.substr(commonIndex);
				o.shortName=values.length>10?i.toString():o.key;
			}
			return values;
		},
		onSelect=function(id,isChecked){
			legendData[id].isChecked=isChecked;
			render();
		},
		onCheck=function(id,isChecked){
			legendData[id].isChecked=isChecked;
			render();
		},
		onHoover=function(id,active){
			if(active){
				var div=jr.ec('div', {style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:
						{tr:{children:{td:{children:{div:{innerHTML:'<nobr>'+chartData[id-2].fullName+'</nobr>'}}}}}}}}});
				mouseBox.show(div,'mouseBoxDiv');
				mouseBox.move();
			}
			else
				mouseBox.hide();
		},
		onDouble=function(isChecked){
			var i=0;
			while(++i<legendData.length)
				legendData[i].isChecked=isChecked;
			addLegend();
			render();
		},
		changeView=function(ind){
			viewFunction=ind-(isCleanings?0:1);
			filter.filterChooser(view,document.getElementById('myView'),true,0,null,isCleanings?cleanfunctions:functions,changeView);
			render();
		},
		addLegend=function(){
			if(!legendData){
				var i=-1;
				legendData=[];
				legendData.push(new checkboxData(jr.translate('Aver.'),false));
				legendData.push(new checkboxData('%'+jr.translate('Diff'),false));
				chartData=getValues(isCleanings?cleanfunctions[viewFunction]:functions[viewFunction],viewFunction);
				while(++i<chartData.length){
					var o=chartData[i];
					legendData.push(new checkboxData(o.shortName,true,o.color));
				}
				view=new filter.filter();
				view.setDialog(viewFunction);
			}
			filter.filterChooser(view,document.getElementById('myView'),true,0,null,isCleanings?cleanfunctions:functions,changeView);
			new jr.userSelector(document.getElementById('myLegend'),legendData,onCheck,onSelect,onHoover,onDouble);
		},
		doFilter=function(){
			var ids={},noIds;
			jr.foreach(userFilter.getIds(),function(id){ids[id]=1;});
			noIds=!Object.keys(ids).length;
			var filtered=[],vcIds={},robotIds={};
			allFilteredData={};
			allFilteredData.data=filtered;
			allFilteredData.vcIds=vcIds;
			allFilteredData.robotIds=robotIds;
			jr.foreach(allData,function(day){
				var filteredVc=[], filteredRobots=[];
				jr.foreach(day.dayData,function(vc){
					if(vc.included=vc.vcId&&(noIds||!!ids[vc.vcId])){
						filteredVc.push(vc);
						vcIds[vc.vcId]=1;
					}
					jr.foreach(vc.robots,function(robot){
						if(robot.included=robot.milkingDeviceGUID&&(noIds||!!ids[robot.milkingDeviceGUID])){
							filteredRobots.push(robot);
							robotIds[robot.milkingDeviceGUID]=1;
						}
					});
				});
				filtered.push({day:day.startOfDay,vc:filteredVc,robots:filteredRobots});
			});
			filteredData=filtered;
		},
		prepare=function(myDiv,style,myViewFunction){
			if(allData.length > 0) {
				var nrFunctions=functions.length-1;
				allData[0].dayData.forEach(function(day){	// Last day
					day.robots.forEach(function(robot){
						if (robot.milkingDeviceGUID) {
							var r=robotMap[robot.milkingDeviceGUID];
							if (!r)
								r=robotMap[robot.milkingDeviceGUID]={farmGuid:day.vcId,farmName:day.vcName,guid:robot.milkingDeviceGUID,name:robot.fullname,lastDay:[],total:[],totalCnt:0};
							var i=-1;
							while (++i<nrFunctions){
								var v=getRobotVal(robot,i);
								r.lastDay.push(v);
								r.total.push(v);
								r.totalCnt=1;
							}
						}
					});
				});
				var ii=0;
				while(++ii<allData.length){
					allData[ii].dayData.forEach(function(day){	// Last day
						day.robots.forEach(function(robot){
							if (robot.milkingDeviceGUID) {
								var r=robotMap[robot.milkingDeviceGUID],newRobot=typeof(r)==='undefined';
								if (newRobot)
									r=robotMap[robot.milkingDeviceGUID]={farmGuid:day.vcId,farmName:day,guid:robot.milkingDeviceGUID,name:robot.fullname,lastDay:[],total:[],totalCnt:0};
								else{
									var ee=0;
									ee++;
								}
								var i=-1;
								if (robot.kg){
									r.totalCnt = newRobot ? 1 : (r.totalCnt + 1);
									while (++i<nrFunctions){
										var v=getRobotVal(robot,i);
										if(newRobot)
											r.total.push(v);
										else
											r.total[i] += v;
									}
								}
							}
						});
					});
				}
			}
			var ce={};
			doFilter();
			if(myViewFunction)
				viewFunction=myViewFunction;
			jr.ec('div',{parentNode:myDiv, className:style, children:[
				{'div':{id:'myView',className:'statisticsCommand'}},
				{'div':{id:'myLegend'}},
				{'div':{id:'chart', style:{'height':'550px'}, innerHTML:'<svg></svg>'}}
			]},ce);
			addLegend();
		},
		render=function(){
			var ce={},renderData=[],i=1,
				doChart=function() {
					var chart = nv.models.lineChart()
								.margin({left:100,top:7,right:30})  //Adjust chart margins to give the x-axis some breathing room.
								.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
								.showLegend(false)       //Show the legend, allowing users to turn on/off line series.
								.transitionDuration(1000)  //how fast do you want the lines to transition?
								.showYAxis(true)        //Show the y-axis
								.showXAxis(true)        //Show the x-axis
								.xScale(d3.time.scale()); //fixes misalignment of timescale with line graph

					chart.xAxis     //Chart x-axis settings
						.axisLabel('Date')
						.tickFormat(function(d) {return new Date(d).toLocaleDateString();});

					chart.yAxis     //Chart y-axis settings
						.axisLabel('Value')
						.tickFormat(d3.format('.02f'));

					var	inst=d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
						.datum(renderData);
				
					//Populate the <svg> element with chart data...
					inst.call(chart);          //Finally, render the chart!
					//Update the chart when window resizes.
					nv.utils.windowResize(function() { chart.update();});
					return chart;
				};
			chartData=getValues(isCleanings?cleanfunctions[viewFunction]:functions[viewFunction],viewFunction);
			if(legendData[1].isChecked){
				var ii=-1,o;
				while(++ii<chartData.length)
					if((o=chartData[ii])&&o.values){
						var sum=0,nr=0,jj=-1;
						while(++jj<o.values.length)
							if(!isNaN(o.values[jj].y)){
								sum+=o.values[jj].y;
								nr++;
							}
						if(nr){
							sum/=nr;
							jj=-1;
							while(++jj<o.values.length)
								if(!isNaN(o.values[jj].y))
									o.values[jj].y=(o.values[jj].y-sum)/sum*100;
						}
					}
			}
			if(legendData[0].isChecked){
				var j=-1,oo={key:'Selected values',color:'#ff0000',area:1},totNr=0;
				while(++i<legendData.length)
					if(legendData[i].isChecked){
						var o=chartData[i-2],j=-1;
						if(o&&o.values){
							if(!oo.values){
								oo.values=[];
								while(++j<o.values.length)
									oo.values[j]={x:o.values[j].x,y:0,totNr:0};
							}
							j=-1;
							while(++j<o.values.length)
								if(!isNaN(o.values[j].y)){
									oo.values[j].y+=o.values[j].y;
									oo.values[j].totNr++;
								}
						}
					}
				i=-1;
				while(++i<oo.values.length)
					oo.values[i].y/=oo.values[i].totNr;
				renderData.push(oo);
			}
			else
				while(++i<legendData.length)
					if(legendData[i].isChecked)
						renderData.push(chartData[i-2]);
			nv.addGraph(doChart);
		};
	this.getFunction=function(){
		return viewFunction;
	};
	this.render=function(myDiv, inData, inFilter, style, myViewFunction, myIsCleanings){
		isCleanings=myIsCleanings;
		allData=inData;
		userFilter=inFilter;
		prepare(myDiv,style,myViewFunction);
		render();
	};
}