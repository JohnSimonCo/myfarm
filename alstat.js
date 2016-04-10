jr.include('/alstat.css');
jr.include('/util.js');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');

var alstat = {
	filterMan: function(group) {
		var rv={},i=0;
		rv.group=group;
		rv.lab=[];
		while(++i<arguments.length)
			rv.lab.push(arguments[i]);
		rv.def=0;
		return rv;
	},
    init: function() {
		alstat.texts = {
			exportToFile: jr.translate('Export to file'),
			vc: jr.translate('VC'),
			robot: jr.translate('VMS robot'),
			total: jr.translate('Total'),
			nrVms: jr.translate('#Devices'),
			nrDays: jr.translate('Nr days'),
			selMsVc: jr.translate('Select per VC or VMS'),
			selPeriod: jr.translate('Select time period'),
			selCat: jr.translate('Select alarm category (major code)'),
			selAlType: jr.translate('Alarm type'),
			numberOf: jr.translate('Number of'),
			numberOfStop: jr.translate('Number of stop'),
			minorCode: jr.translate('Minor code'),
			alarmText: jr.translate('Alarm text'),
			perVcMs: alstat.filterMan(1,jr.translate('Show per VC'), jr.translate('Show per VMS')),
			perTimePer: alstat.filterMan(2,jr.translate('Last 24h'), jr.translate('Last week'), jr.translate('Last 21 days'), jr.translate('Max days')),
			perMajor: alstat.filterMan(3, jr.translate('All Major'),jr.translate('1 Overall'), jr.translate('2 Robot'), jr.translate('3 Milk'), jr.translate('4 Gates'), jr.translate('5 Milk transport'), jr.translate('6 Extern'), jr.translate('7 Hyg'), jr.translate('9 System'), jr.translate('12 ICS'), jr.translate('13 VP'), jr.translate('14 Wash'), jr.translate('205 Cleaning'), jr.translate('351')),
//			perCount: alstat.filterMan(4,jr.translate('Show absolute counts'), jr.translate('Show counts per VMS')),
			perAlType: alstat.filterMan(4,jr.translate('Stop alarms'), jr.translate('Notifications'), jr.translate('Both'))
		};
		alstat.perAll = [alstat.texts.selMsVc, alstat.texts.perVcMs, alstat.texts.selPeriod, alstat.texts.perTimePer, alstat.texts.selCat, alstat.texts.perMajor, alstat.texts.selAlType, alstat.texts.perAlType];
		alstat.perAll[7].def=2;
		alstat.mapMajorCodes = [0,1,2,3,4,5,6,7,9,12,13,14,205,351];
		alstat.now=new Date().getTime();
    },
	alarmListener:
		{ addListener: { typeName: 'alarmStatData', method: function( data ) {
			new alstat.Alarms( this, data );
		} } },
	Alarms: function(container,data) {
		var d=new JsSerilz('$',data), o, ar, key, max, dayInd=-1,
			xlat={},
			devices=[],
			vc={},
			nextDay=d.getInt(),
			i = d.getInt(),
			table,
			tableParent,
			tempIndex=-1,
			tempVal=-1,
			selectedMajorCode,
			filterDOM,
			lastTipData=null,
			matrix=null,
			parse=function(severity){
				var max = d.getInt(), a, i, rv=max===0?null:{}, codes, count, ms, o;
				while (--max >= 0) {
					rv[codes=d.getString()] = a = [];
					i = d.getInt();
					while (--i >= 0) {
						a.push({device:ms=devices[d.getInt()], count:count=d.getInt()});
						if (!(o=ms.days[dayInd]))
							ms.days[dayInd]=o={};
						if (!o[codes])
							o[codes]=[];
						o[codes][severity]=count;
					}
				}
			return rv;
			},
			sortCodes=function(c1,c2){
				c1=xlat[c1];
				c2=xlat[c2];
				return c1.major===c2.major?c1.minor-c2.minor:c1.major-c2.major;
			},
			sortNumbers=function(c1,c2){
				return Number(c1)-Number(c2);
			},
			sortDevice=function(d1,d2){
				var ms1=d1.ms.ms.toLowerCase(), ms2=d2.ms.ms.toLowerCase(), vc1=d1.ms.vcName.toLowerCase(), vc2=d2.ms.vcName.toLowerCase();
				return vc1===vc2?ms1.localeCompare(ms2):vc1.localeCompare(vc2);
			},
			makeDiv = function(text){
				return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
			},
			onToolTipClick = function(){
				if(!selectedMajorCode){
					var i=alstat.perAll[5].def=alstat.mapMajorCodes.indexOf(this.data),col=Math.floor(i/4),row=i%4+1;
					// Patch...
					filterDOM.childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[row].childNodes[col].childNodes[0].childNodes[0].checked=true;
					recalculate();
				}
			},
			onToolTip = function(){
				if(selectedMajorCode){
					mouseBox.show(makeDiv(xlat[this.data].message),'mouseBoxDiv');
					mouseBox.move();
				}
			},
			onToolTipOut = function() {
				mouseBox.hide();
			},
			onMouseMove = function() {
				mouseBox.move();
			},
			onFilterChange = function(grp,val) {
				var isClick=typeof grp==='object';
				if(isClick){
					val=this.value;
					if(!val){
						this.parentNode.childNodes[0].checked=true;
						val=this.textContent;
					}
					grp=this.name;
				}
				var ind=((Number(grp)-1)<<1)+1,i=-1;
				while(++i<alstat.perAll[ind].lab.length&&alstat.perAll[ind].lab[i]!==val){}
				if(i<alstat.perAll[ind].lab.length)
					alstat.perAll[ind].def=i;
				if(isClick){
					tempIndex=ind;
					tempVal=i;
				}
				recalculate();
			},
			onTempFilterIn = function() {
				tempIndex=((Number(this.name)-1)<<1)+1;
				tempVal=alstat.perAll[tempIndex].def;
				onFilterChange(this.name,this.textContent);
			},
			onTempFilterOut = function() {
				alstat.perAll[tempIndex].def=tempVal;
				recalculate();
			},
			checked = function(text, yesNo, group) {
				return {'td': {className: 'infoCell', children: {'span': { children: [
					{'input':{onchange:onFilterChange, assignments:{value:text, type:'radio', name:group, checked: yesNo}}},
					{'span':{onmouseover:onTempFilterIn, onmouseout:onTempFilterOut, onclick:onFilterChange, name:group, style:{cursor: 'default'}, innerHTML:text}}
				]}}}};
			},
			exportToFile = function() {
				if(matrix.length){
					var s=matrix[0].length;
					jr.foreach(matrix, function(r){
						jr.foreach(r, function(v){
							s+=';'+v;});});
					self.location="/ExportAlStat.vcx";
					var form = document.createElement("form");
					form.setAttribute("method", 'post');
					form.setAttribute("action", '/ExportAlStat.vcx');

					var hiddenField = document.createElement("input");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", 'data');
					hiddenField.setAttribute("value", s);
					form.appendChild(hiddenField);
					document.body.appendChild(form);
					form.submit();
				}
			},
			getChecked = function(head,cont,isNotFirst) {
				var rv=[],i=-1,ncol=cont.lab.length>6?4:1,last,d,third=Math.ceil(cont.lab.length/4);
				rv.push(filterHead(head,ncol));
				if(ncol===1){
					jr.foreach(cont.lab, function(d){
						rv.push({'tr': {children: checked(d,cont.def===++i,cont.group)}});
					});
					if(!isNotFirst)
						rv.push({'tr': {children: {'td':{children:{'input':{onclick:exportToFile,type:'button',className:'button',value:alstat.texts.exportToFile}}}}}});
				}
				else{
					while(++i<third){
						if(i<=1)
							rv.push({'tr': {children: [
								checked(cont.lab[i],cont.def===i,cont.group),
								checked(cont.lab[i+third],cont.def===i+third,cont.group),
								checked(cont.lab[i+2*third],cont.def===i+2*third,cont.group),
								checked(cont.lab[i+3*third],cont.def===i+3*third,cont.group)
							]}});
						else
							rv.push({'tr': {children: [
								checked(cont.lab[i],cont.def===i,cont.group),
								checked(cont.lab[i+third],cont.def===i+third,cont.group),
								checked(cont.lab[i+2*third],cont.def===i+2*third,cont.group)
							]}});
					}
				}
				return rv;
			},
			getSelection = function(isNotFirst,head,cont) {
				return {td: {style:{'vertical-align': 'top'}, children:{'table': {className: 'filter',
					children:getChecked(head,cont,isNotFirst)}}}};
			},
			getSelections = function() {
				var rv=[],i=0;
				while(i<alstat.perAll.length)
					rv.push(getSelection(i,alstat.perAll[i++],alstat.perAll[i++]));
				return rv;
			},
			filterHead = function(text,ncol) {
				return {'tr': {children: {'td': {colSpan:ncol, className: 'infoCell', children: {'span': { children: [
					{'span':{innerHTML:text}}
				]}}}}}};
			},
			renderFilter = function() {
				filterDOM=jr.ec('div',{parentNode: container, className: 'filter', children: [
					{'table': {children:[{'tr': {children:getSelections()}}]}}]});
			},
			getCellDay = function(days,data,code,severity){
				while(data.length<days.length)
					data.push(0);
				jr.foreach(severity, function(s){
					var i=-1,d;
					while(++i<days.length){
						d=days[i];
						if(d){
							if(selectedMajorCode){
								if((d=d[code])&&d[s])
									data[i]+=d[s];
							}
							else
								for(var o in d)
									if(xlat[o].major===code&&d[o][s])
										data[i]+=d[o][s];
						}
					}
				});
			},
			getCellData = function(code, currVc, currMs, severity) {
				var data=[],i=-1,d;
				while(++i<devices.length){
					d=devices[i];
					if(!currVc||(d.vcName===currVc&&(!currMs||currMs===d.ms)))
						getCellDay(d.days,data,code,severity);
				}
				return data;
			},
			getCellAlarm = function(days,data,code,severity) {
				var o,n,i,minor;
				if(days.length>0)
					for(var cd in days[0])
						if(xlat[cd].major===code)
							jr.foreach(severity, function(oo){
								if((o=days[0][cd])[oo]){
									i=-1;
									minor=xlat[cd].minor;
									while(++i<data.length&&(data[i].code!==minor||data[i].severity!==oo)){}
									if(i<data.length)
										data[i].count+=o[oo];
									else{
										data.push(n={});
										n.count=o[oo];
										n.severity=oo;
										n.code=minor;
									}
								}
							});
			},
			getCellAlarms = function(code, currVc, currMs, severity) {
				var data=[],i=-1,d;
				while(++i<devices.length){
					d=devices[i];
					if(!currVc||(d.vcName===currVc&&(!currMs||currMs===d.ms)))
						getCellAlarm(d.days,data,code,severity);
				}
				data.sort(function(c1,c2){return c1.code-c2.code;});
				return data;
			},
			onCellMove = function() {
				var code=this.rowData, currVc=null, currMs=null, o=this.parentNode.rowData, altbl, tbl;
				if(o){
					o=o.ms;
					currVc=o.vcName;
					currMs=o.ms;
				}
				data=currVc+'_'+currMs+'_'+code;
				if(lastTipData!==data){
					lastTipData=data;
					var severity=[],si=alstat.perAll[7].def;
					if(si!==1)
						severity.push(0);
					if(si>0)
						severity.push(1);
					if(alstat.perAll[3].def){
						var rv=getCellData(code,currVc,alstat.perAll[1].def?currMs:null,severity),i=-1,tn,ii=-1,max=0,ndays;
						ndays=getNrDays()+1;
						if(rv.length<ndays)
							ndays=rv.length;
						while(++i<ndays&&!rv[i]){}
						if(i<ndays){
							tn=alstat.now-ndays*86400000;
							while(++ii<ndays)max=Math.max(max,rv[ii]);
							var view=jr.ec('canvas',{style:{'background-color':"#877A41"},width:20+32*(getNrDays()+1),height:40+Math.min(max,10)*20});
							sGraph.Clear('#000000','#697285','d/m');
							sGraph.setFont('italic 12px sans-serif', 20);
							sGraph.addLine("#3366ff",1,"#C9D7FF");
							i=ndays;
							while(--i>=0)
								sGraph.addStaple(tn,rv[i],tn+=86400000);
							sGraph.setLimits(null, alstat.now-(getNrDays()+1)*86400000, alstat.now);
							sGraph.paint(view);
							mouseBox.show(view);
							return;
						}
					}
					else if(!alstat.perAll[5].def){
						rv=getCellAlarms(code,currVc,alstat.perAll[1].def?currMs:null,severity);
						if(rv.length>0){
							(tbl = (altbl = jr.ec( 'div', { className:'day', children: {'table': {className: 'minor', children:[
									{tr:{children:[
										{'td': {className:'dayHead', children:{'div': {innerHTML:alstat.texts.numberOf}}}},
										{'td': {className:'dayHead', children:{'div': {innerHTML:alstat.texts.minorCode}}}},
										{'td': {className:'dayHead', children:{'div': {innerHTML:alstat.texts.alarmText}}}}
									]}}]}}})).childNodes[0].childNodes[0]);
							jr.foreach(rv, function(o){
								jr.ec('tr',{className:o.severity?'Notifi':'Stop', parentNode:tbl, children:[
									{'td': {className:'dayNumb', children:{'div': {innerHTML:o.count}}}},
									{'td': {className:'dayNumb', children:{'div': {innerHTML:o.code}}}},
									{'td': {className:'dayVal', children:{'div': {innerHTML:xlat[code+'_'+o.code].message}}}}
								]});});
							mouseBox.show(altbl);
						}
					}
				}
				mouseBox.move();
			},
			onCellOut = function() {
				if(lastTipData){
					lastTipData=null;
					mouseBox.hide();
				}
			},
			pushMatrix = function(text,isNew) {
				if(isNew)
					matrix.push([]);
				matrix[matrix.length-1].push(text==='&nbsp;'?'':text);
				return text;
			},
			renderAlarms = function(isPerMs,d,isMajor,showStopCount) {
				var i,codes=[],tds=[],cl,total=[],ii,ind=-1,o,nm,cnts,sCnts=0,sTot=0,ld,nd=0,ln=-1;
				matrix=[];
				while(table.childNodes.length)
					table.removeChild(table.childNodes[0]);
				jr.foreach(d, function(o){
					jr.foreach(o.counts, function(cnts){
						if(codes.indexOf(cnts.code)<0)
							codes.push(cnts.code);
					});
				});
				cl=codes.length;
				codes.sort(isMajor ? sortCodes : sortNumbers);
				tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(isPerMs?alstat.texts.robot:alstat.texts.vc,true)} } } });
				if(!isPerMs)
					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(alstat.texts.nrVms)} } } });
				tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(alstat.texts.nrDays)} } } });
				if(showStopCount)
					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(alstat.texts.numberOfStop)} } } });
				cl=cl<2?100:cl<3?25:cl<4?20:cl<5?15:cl<8?13:6;
//console.log('cl='+cl+' (cl bef='+cll+')');
				jr.foreach(codes, function(o){
					var msg;
					if(isMajor){
						msg=xlat[o].message.substr(0,cl>xlat[o].message.length?xlat[o].message.length:cl);
						if(msg==='???')msg='';
						msg=xlat[o].minor+' '+msg;
					}
					else{
						var ss=alstat.texts.perMajor.lab[alstat.mapMajorCodes.indexOf(o)];
						msg=ss?ss:o;
					}
					tds.push({ 'td': { className: 'infoCell', children: {'div': {data:o,onmouseover:onToolTip,onmouseout:onToolTipOut,onmousemove:onMouseMove,onclick:onToolTipClick,innerHTML:pushMatrix(msg)} } } });
				});
				jr.ec( 'tr', { parentNode: table, assignments: { rowData: codes }, children: tds } );
				if(isPerMs){
					jr.foreach(d, function(o){
						if(o.counts.length){
							var isEven=((++ln>>1)<<1)===ln,clName=isEven?' other':'',nrStop=0;
							ii=-1;
							tds=[];
							tds.push({ 'td': { className: 'headingCell'+clName, children: {'div': {innerHTML:pushMatrix(o.ms.vcName+', '+o.ms.ms,true)} } } });
							tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(o.lastIndex+1)} } } });
							jr.foreach(codes, function(code){
								i=-1;
								while(++i<o.counts.length&&o.counts[i].code!==code){}
								if(i<o.counts.length)
									nrStop+=o.counts[i].stop;
							});
							sTot+=nrStop;
							if(showStopCount)
								tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(nrStop?nrStop:'&nbsp;')} } } });
							jr.foreach(codes, function(code){
								i=-1;
								while(++i<o.counts.length&&o.counts[i].code!==code){}
								tds.push({ 'td': { rowData:code, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(i<o.counts.length?o.counts[i].count:'&nbsp;')} } } });
								if(!total[++ii])
									total[ii]=0;
								total[ii]+=i<o.counts.length?o.counts[i].count:0;
							});
							tds.push({ 'td': { width: '90%', children: {'div': {innerHTML:'&nbsp;'} } } });
							jr.ec( 'tr', { parentNode: table, assignments: { rowData: o }, children: tds } );
						}
					});
				}
				else
					while(++ind<=d.length){
						o=d[ind];
						if(ind===d.length||nm!==o.ms.vcName){
							if(ind&&cnts.length){
								var isEven=((++ln>>1)<<1)===ln,clName=isEven?' other':'';;
								tds=[];
								tds.push({ 'td': { className: 'headingCell'+clName, children: {'div': {innerHTML:pushMatrix(nm,true)} } } });
								nd+=vc[nm].length;
								tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(vc[nm].length)} } } });
								tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(ld)} } } });
								if(showStopCount)
									tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(sCnts?sCnts:'&nbsp;')} } } });
								ii=-1;
								jr.foreach(cnts, function(sum){
									tds.push({ 'td': { rowData:codes[++ii], onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(sum?sum:'&nbsp;')} } } });
								});
								tds.push({ 'td': { width: '90%', children: {'div': {innerHTML:'&nbsp;'} } } });
								jr.ec( 'tr', { parentNode: table, assignments: { rowData: d[ind-1] }, children: tds } );
								sTot+=sCnts;
								sCnts=0;
							}
							if(ind===d.length)
								break;
							nm=o.ms.vcName;
							cnts=[];
							ld=o.lastIndex+1;
						}
						if(nm===o.ms.vcName)
							ld=Math.max(ld,o.lastIndex+1);
						if(o.counts.length){
							ii=-1;
							jr.foreach(codes, function(code){
								i=-1;
								while(++i<o.counts.length&&o.counts[i].code!==code){}
								if(++ii>=cnts.length){
									cnts.push(0);
									if(total.length<cnts.length)
										total.push(0);
								}
								cnts[ii]+=(cl=i<o.counts.length?o.counts[i].count:0);
								sCnts+=i<o.counts.length?o.counts[i].stop:0;
								total[ii]+=cl;
							});
						}
					}
				if(total.length){
					tds=[];
					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(alstat.texts.total,true)} } } });
					if(!isPerMs)
						tds.push({ 'td': { className: 'infoCell', children: {'div': {innerHTML:pushMatrix(nd)} } } });
					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix('&nbsp;')} } } });
					if(showStopCount)
						tds.push({ 'td': { className: 'infoCell', children: {'div': {innerHTML:pushMatrix(sTot)} } } });
					ii=-1;
					jr.foreach(total, function(sum){
						tds.push({ 'td': { rowData:codes[++ii], onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell', children: {'div': {innerHTML:pushMatrix(sum)} } } });
					});
					jr.ec( 'tr', { parentNode: table, assignments: { rowData: o }, children: tds } );
				}
			},
			getNrDays = function() {
				var nrDays=alstat.perAll[3].def;
				nrDays=nrDays===0?0:nrDays===1?6:nrDays===2?20:22;
				return nrDays;
			},
			recalculate = function() {
				var alarmType=alstat.perAll[7].def;
				selectedMajorCode=alstat.mapMajorCodes[alstat.perAll[5].def];
				renderAlarms(alstat.perAll[1].def, select(alarmType,selectedMajorCode,null,0,getNrDays()), selectedMajorCode, alarmType!==1);
			},
			select=function(severity, majorCode, arrMinorCodes, fromDayIndex, toDayIndex) {
				var rv=[],i=-1;
				jr.foreach(devices, function(o){rv.push({ms:o});});
				rv.sort(sortDevice);
				jr.foreach(rv, function(o){
					var dev=o.ms,days,day,d,stpCnt;
					var i=fromDayIndex-1;
					o.counts=[];
					o.lastIndex=-1;
					while(++i<=toDayIndex){
						days=dev.days;
						day=days[i];
						if(day) {
							o.lastIndex=i;
							for(var code in day){
								d=0;
								stpCnt=day[code][0]?day[code][0]:0;
								if(severity===2)
									d=stpCnt + (day[code][1]?day[code][1]:0);
								else
									d=day[code][severity];
								if(d){
									var ii=-1,m=xlat[code].major,cmp=majorCode?code:m;
									if(!majorCode||((majorCode===m) && (!arrMinorCodes||arrMinorCodes.indexOf(xlat[code].minor)>=0))){
										while(++ii<o.counts.length&&o.counts[ii].code!==cmp){}
										if(ii<o.counts.length){
											o.counts[ii].count+=d;
											o.counts[ii].stop+=stpCnt;
										}
										else
											o.counts.push({code:cmp,count:d,stop:stpCnt});
									}
								}
							}
						}
					}
				});
				return rv;
			};
		// Alarms, function start
		while (--i >= 0) {
			xlat[key=d.getString()]=o={};
			ar = key.split('_');
			o.major = parseInt(ar[0],10);
			o.minor = parseInt(ar[1],10);
			o.message = d.getString();
		}
		max = d.getInt();
		i = -1;
		while (++i < max) {
			devices[i]=o={};
			o.vcName = d.getString();
			o.ms = d.getString();
			o.days=[];
			if(!vc[o.vcName])
				vc[o.vcName]=[];
			vc[o.vcName].push(o);
		}
		max = d.getInt();
		while (++dayInd < max) {
			parse(0);				// Stop alarms
			parse(1);				// notification
			parse(2);				// recovery
		}
		
		renderFilter();
		(table = (tableParent = jr.ec( 'div', { className:'alarms', parentNode: container, children: {'table': {className: 'alarms', children:[
				{tr:{children:[]}}]}}})).childNodes[0].childNodes[0]).innerHTML = '';
		recalculate();
//		(table = (tableParent = jr.ec( 'table', { parentNode: container, className: 'alarms', children:[
//				{tr:{children:[]}}]})).childNodes[0]).innerHTML = '';
	}

};

jr.init( function() {
    alstat.init();
    jr.ec( document.body, { children: [
		{ 'div': { style: { left: '0.5%', top: '99%' }, actions: alstat.alarmListener } }
	] } );
//	jr.ajax( 'Srvlarms', 'getCounts', 86400000*(Math.floor(dd.getTime()/86400000))+dd.getTimezoneOffset()*60000, 'alarmStatData' );
	jr.ajax( 'SrvAlarms', 'getCounts', alstat.now-86400000, 'alarmStatData' );
} );
