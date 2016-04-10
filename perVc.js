jr.include('/util.js');
jr.include('/d3.js');
jr.include('/nv.d3.js');
jr.include('/nv.d3.css');
function perVc(){
	var allData,
		userFilter,
		filteredData,
		allFilteredData,
		chartData,
		charNrMilkings,
		legendData,
		view,
		viewFunction=-1,
		orginalDiv,
		orginalStyle,
		expYieldFkn=5,
		isExpYield,
		functions=[						// Indexes maps on switch statement in getValues()
			jr.translate('Stop alarm/robot'),	// 0
			jr.translate('Reminder/robot'),		// 1
			jr.translate('Kg/Milking'),			// 2
			jr.translate('Kg/Animal'),			// 3
			jr.translate('Activity'),			// 4
			jr.translate('Exp. Yield'),			// 5
		];
		checkboxData=function(label,isChecked,value,color){
			this.label=label;
			this.color=color;	// == null for normal checkbox
			this.value=value;
			this.isChecked=isChecked;
		},
		getExpYieldValues=function(){
			var nrCurves=filteredData.length,values=[],i=-1;
			charNrMilkings=[];
			while(++i<nrCurves){
				var o=filteredData[i],v={},vci=-1,iz=-1,ok=0,nrMilkings=0,vcMilkings=0;
				v.color=jr.rainbowColor(i,filteredData.length);
				v.key=new Date(o.day).toLocaleDateString();
				v.values=[];
				while(++iz<61)
					v.values[iz]={x:(iz-30)/100,yy:0};
				while(++vci<o.vc.length){
					var vvc=o.vc[vci],ii=-1,vvce;
					ok=1;
					if(vvc&&(vvce=vvc.expectedYield)){
						vcMilkings+=o.vc[vci].totNrMilkingsVc;
						while(++ii<vvce.length){
							nrMilkings+=vvce[ii];
							v.values[ii].yy+=vvce[ii];
						}
					}
				}
				if(ok&&nrMilkings){
					values.push(v);
					charNrMilkings.push((nrMilkings+vcMilkings)/2);
				}
			}
			return values;
		},
		onDouble=function(isChecked){
			createLegend(isChecked);
			render();
		},
		onCheck=function(id,isChecked){
			legendData[id].isChecked=isChecked;
			render(chartData);
		},
		onHooverExp=function(id,isActive){
			var ind=legendData[id].value;
			if(isActive)
				chartData[ind].area=true;
			else
				delete chartData[ind].area;
			render();
		},
		onHoover=function(id,active){
			if(!isExpYield)
				if(active){
					var div=jr.ec('div', {style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:
							{tr:{children:{td:{children:{div:{innerHTML:'<nobr>'+chartData[id-2].fullName+'</nobr>'}}}}}}}}});
					mouseBox.show(div,'mouseBoxDiv');
					mouseBox.move();
				}
				else
					mouseBox.hide();
		},
		changeView=function(ind){
			isExpYield=ind===expYieldFkn;
			chartData=isExpYield?getExpYieldValues():getValues(ind);
			if(viewFunction<0||(ind===expYieldFkn&&viewFunction!==expYieldFkn||ind!==expYieldFkn&&viewFunction===expYieldFkn))
				createLegend(true);
			view.setDialog(viewFunction=ind);
			render();
		},
		onSelect=function(id,isChecked){
			legendData[id].isChecked=isChecked;
			render();
		},
		createLegend=function(checked){
			var div=document.getElementById('myLegend'),i=-1;
			legendData=[];
			legendData.push(new checkboxData(jr.translate('Aver.'),false,0));
			if(isExpYield){
				legendData.push(new checkboxData(jr.translate('Integral'),false,1));
				while(++i<chartData.length){
					var o=chartData[i];
					legendData.push(new checkboxData(o.key,checked,i,o.color));
				}
			}
			else{
				legendData.push(new checkboxData('%'+jr.translate('Diff'),false));
				while(++i<chartData.length){
					var o=chartData[i];
					legendData.push(new checkboxData(o.shortName,checked,o.fullName,o.color));
				}
			}
			new jr.userSelector(div,legendData,onCheck,onSelect,onHoover,onDouble);
		},
		expYield=function(){
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
			expYield();
			jr.ec('div',{parentNode:myDiv, className:style, children:[
				{'div':{id:'myView',className:'statisticsCommand'}},
				{'div':{id:'myLegend'}},
				{'div':{id:'chart', style:{'height':'550px'}, innerHTML:'<svg></svg>'}}
			]});
			view=new filter.filter();
			view.setDialog(Math.max(myViewFunction,0));
			filter.filterChooser(view,document.getElementById('myView'),true,0,null,functions,changeView);
			changeView(view.getDialog());
		},
		integrate=function(arrY){
			var i=-1,tot=0;
			while(++i<arrY.length){
				tot+=arrY[i].y;
				arrY[i].y=tot;
			}
		},
		getValues=function(typ){
			var nrDays=filteredData.length,values=[],i=-1,vcs={},commonName,commonIndex;
			while(++i<nrDays){
				var o=filteredData[i],j=-1;
				if(o&&o.vc)
					while(++j<o.vc.length){
						var vc=o.vc[j];
						if(vc.included&&!vcs[vc.vcId]){
							vcs[vc.vcId]={fullName:vc.vcName};
							if(commonName){
								var ii=-1;
								while(++ii<vc.vcName.length&&commonName[ii]===vc.vcName[ii]);
								commonIndex=Math.min(commonIndex,ii);
							}
							else{
								commonName=vc.vcName;
								commonIndex=commonName.length;
							}
						}
					};
			}
			i=-1,j;
			for(var vv in vcs){
				var vc=vcs[vv];
				vc.values=[];
				j=nrDays;
				while(--j>=0)
					vc.values.push({x:filteredData[j].day});
			};
			i=-1;
			while(++i<nrDays){
				var o=filteredData[i],j=-1;
				if(o&&o.vc)
					while(++j<o.vc.length){
						var vc=o.vc[j],rvc=vcs[vc.vcId],value=0;
						if(vc){
							switch(typ){
								case 0:		// Stop alarms
									value=vc.robots.length?vc.alarmCount/vc.robots.length:0;
									break;
								case 1:		// Reminders
									value=vc.robots.length?vc.alarmReminder/vc.robots.length:0;
									break;
								case 2:		// Kg/Milking
								case 3:		// Kg/Animal
									var r=-1,kg=0,nr=0;
									if(vc.robots){
										while(++r<vc.robots.length){
											var robot=vc.robots[r];
											kg+=robot.kg;
											nr+=robot.nrMilkings;
										}
										value=typ-2?kg/vc.nrAnimals:kg/nr;
									}
									break;
								case 4:		// ActivityAlarm
									value=vc.activity;
									break;
							}
							rvc.values[nrDays-i-1].y=value;
						}
					}
			}
			for(var rr in vcs)
				values.push(vcs[rr]);
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
		render=function(){
			var ce={},last,renderData=[],isExpYield=view.dialogInd===expYieldFkn;
				doChart=function() {
					var chart = nv.models.lineChart()
							.margin({left:100,top:7,right:30})  //Adjust chart margins to give the x-axis some breathing room.
							.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
							.showLegend(false)			//Show the legend, allowing users to turn on/off line series.
							.transitionDuration(1000)	//how fast do you want the lines to transition?
							.showYAxis(true)			//Show the y-axis
							.showXAxis(true);			//Show the x-axis

					if(!isExpYield){
						chart.xScale(d3.time.scale()); //fixes misalignment of timescale with line graph
						chart.xAxis     //Chart x-axis settings
							.axisLabel('Date')
							.tickFormat(function(d) {return new Date(d).toLocaleDateString();});
						chart.yAxis     //Chart y-axis settings
							.axisLabel('Value')
							.tickFormat(d3.format('.02f'));
					}
					else{
						chart.xAxis     //Chart x-axis settings
							.axisLabel('Estimate error')
							.tickFormat(d3.format('%,3%'));

						chart.yAxis     //Chart y-axis settings
							.axisLabel('Percent of milkings')
							.tickFormat(d3.format('.1%'));
					}
					var inst=d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
						.datum(renderData);
				
					//Populate the <svg> element with chart data...
					inst.call(chart);          //Finally, render the chart!
					//Update the chart when window resizes.
					nv.utils.windowResize(function() { chart.update();});
					return chart;
				};
			chartData=isExpYield?getExpYieldValues():getValues(viewFunction);
			var i=1,all={};
			renderData=[];
			document.getElementById('myTopHeading').innerHTML=stat.texts.perVC+' - '+functions[viewFunction];
			if(isExpYield){
				if(legendData[0].isChecked){
					var j=-1,oo={key:'Selected values',color:'#ff0000',area:1},totNr=0;
					while(++i<legendData.length)
						if(legendData[i].isChecked){
							var o=chartData[i-2],j=-1;
							totNr+=charNrMilkings[i-2];
							if(o&&o.values){
								if(!oo.values){
									oo.values=o.values;
									while(++j<oo.values.length)
										oo.values[j].y=0;
								}
								j=-1;
								while(++j<o.values.length)
									oo.values[j].y+=o.values[j].yy;
							}
						}
					if(o&&o.values){
						j=-1;
						while(++j<o.values.length)
							oo.values[j].y/=totNr;
						if(legendData[1].isChecked)
							integrate(oo.values);
						renderData.push(oo);
					}
				}
				else
					while(++i<legendData.length)
						if(legendData[i].isChecked){
							var o=chartData[i-2],totNr=charNrMilkings[i-2];
							if(o&&o.values){
								jr.foreach(o.values,function(oo){
									oo.y=oo.yy/totNr;
								});
								if(legendData[1].isChecked)
									integrate(o.values);
								renderData.push(o);
							}
						}
			}
			else{
				i=1;
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
				}
			nv.addGraph(doChart);
		};
	this.getFunction=function(){
		return viewFunction;
	};
	this.render=function(myDiv, inData, inFilter, style, myViewFunction){
		allData=inData;
		userFilter=inFilter;
		prepare(orginalDiv=myDiv,orginalStyle=style,myViewFunction);
		render();
	};
}