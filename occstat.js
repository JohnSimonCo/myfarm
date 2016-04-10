jr.include('/alstat.css');
jr.include('/util.js');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');

var occstat = {
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
		occstat.texts = {
			exportToFile:	jr.translate('Export to file'),
			vc:				jr.translate('VC'),
			robot:			jr.translate('VMS robot'),
			total:			jr.translate('Total'),
			nrVms:			jr.translate('#Vms'),
			nrDays:			jr.translate('Nr days'),
			selMsVc:		jr.translate('Select per VC or VMS'),
			selPeriod:		jr.translate('Select time period'),
			numberOf:		jr.translate('Number of'),
			totalMilk:		jr.translate('Total milkings'),
			occTotal:		jr.translate('#Occ'),
			occNormal:		jr.translate('#Normal'),
			occErrors:		jr.translate('#Error'),
			occWarnings:	jr.translate('#Warning'),
			occAlarms:		jr.translate('#Alarm'),
			average:		jr.translate('Average'),
			totalPercent:	'%'+jr.translate('Occ'),
			normalPercent:	'%'+jr.translate('Normal'),
			errPercent:		'%'+jr.translate('Error'),
			warnPercent:	'%'+jr.translate('Warning'),
			alarmPercent:	'%'+jr.translate('Alarm'),
			perVcMs: occstat.filterMan(1,jr.translate('Show per VC'), jr.translate('Show per VMS')),
			perTimePer: occstat.filterMan(2,jr.translate('Last 24h'), jr.translate('Last week'), jr.translate('Last 21 days'), jr.translate('Max days'))
		};
		occstat.perAll = [occstat.texts.selMsVc, occstat.texts.perVcMs, occstat.texts.selPeriod, occstat.texts.perTimePer];
		occstat.perAll[1].def=1;
		occstat.perAll[3].def=1;
		occstat.mapMajorCodes = [0,1,2,3,4,5,6,7,9,12,13,14,205];
		occstat.now=new Date();
    },
	alarmListener:
		{ addListener: { typeName: 'occStatData', method: function( data ) {
			new occstat.instance( this, data );
		} } },
	instance: function(container,data) {
		var d=new JsSerilz('$',data), o, ar, key, max, dayInd=-1,
			xlat={},
			robots=[],
			vcs=[],
			arrsize,
			vc={},
			table,
			tableParent,
			tempIndex=-1,
			tempVal=-1,
			selectedMajorCode,
			filterDOM,
			lastTipData=null,
			matrix=null,
			sortCodes=function(c1,c2){
				c1=xlat[c1];
				c2=xlat[c2];
				return c1.major==c2.major?c1.minor-c2.minor:c1.major-c2.major;
			},
			sortNumbers=function(c1,c2){
				return Number(c1)-Number(c2);
			},
			sortDevice=function(d1,d2){
				var ms1=d1.ms.ms.toLowerCase(), ms2=d2.ms.ms.toLowerCase(), vc1=d1.ms.vcName.toLowerCase(), vc2=d2.ms.vcName.toLowerCase();
				return vc1==vc2?ms1.localeCompare(ms2):vc1.localeCompare(vc2);
			},
			makeDiv = function(text){
				return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
			},
			onToolTipClick = function(){
				if(!selectedMajorCode){
					var i=occstat.perAll[5].def=occstat.mapMajorCodes.indexOf(this.data),col=Math.floor(i/4),row=i%4+1;
					// Patch...
					filterDOM.childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[row].childNodes[col].childNodes[0].childNodes[0].checked=true;
					recalculate();
				}
			},
			onToolTip = function(){
//				mouseBox.show(makeDiv("Hej"),'mouseBoxDiv');
				mouseBox.move();
			},
			onToolTipOut = function() {
				mouseBox.hide();
			},
			onMouseMove = function() {
				mouseBox.move();
			},
			onFilterChange = function(grp,val) {
				var isClick=typeof grp=='object';
				if(isClick){
					val=this.value;
					if(!val){
						this.parentNode.childNodes[0].checked=true;
						val=this.textContent;
					}
					grp=this.name;
				}
				var ind=((Number(grp)-1)<<1)+1,i=-1;
				while(++i<occstat.perAll[ind].lab.length&&occstat.perAll[ind].lab[i]!=val){}
				if(i<occstat.perAll[ind].lab.length)
					occstat.perAll[ind].def=i;
				if(isClick){
					tempIndex=ind;
					tempVal=i;
				}
				recalculate();
			},
			onTempFilterIn = function() {
				tempIndex=((Number(this.name)-1)<<1)+1;
				tempVal=occstat.perAll[tempIndex].def;
				onFilterChange(this.name,this.textContent);
			},
			onTempFilterOut = function() {
				occstat.perAll[tempIndex].def=tempVal;
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
							s+=';'+v})});
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
				if(ncol==1){
					jr.foreach(cont.lab, function(d){
						rv.push({'tr': {children: checked(d,cont.def==++i,cont.group)}});
					})
					if(!isNotFirst)
						rv.push({'tr': {children: {'td':{children:{'input':{onclick:exportToFile,type:'button',className:'button',value:occstat.texts.exportToFile}}}}}});
				}
				else{
					while(++i<third){
						if(i==0)
							rv.push({'tr': {children: [
								checked(cont.lab[i],cont.def==i,cont.group),
								checked(cont.lab[i+third],cont.def==i+third,cont.group),
								checked(cont.lab[i+2*third],cont.def==i+2*third,cont.group),
								checked(cont.lab[i+3*third],cont.def==i+3*third,cont.group)
							]}});
						else
							rv.push({'tr': {children: [
								checked(cont.lab[i],cont.def==i,cont.group),
								checked(cont.lab[i+third],cont.def==i+third,cont.group),
								checked(cont.lab[i+2*third],cont.def==i+2*third,cont.group)
							]}});
					}
				}
				return rv;
			},
			getSelection = function(isNotFirst,head,cont) {
				return {td: {style:{'vertical-align': 'top'}, children:{'table': {className: 'filter',
					children:getChecked(head,cont,isNotFirst)}}}}
			},
			getSelections = function() {
				var rv=[],i=0;
				while(i<occstat.perAll.length)
					rv.push(getSelection(i,occstat.perAll[i++],occstat.perAll[i++]));
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
									if(xlat[o].major==code&&d[o][s])
										data[i]+=d[o][s];
						}
					}
				})
			},
			getCellData = function(code, currVc, currMs, severity) {
				var data=[],i=-1,d;
				while(++i<devices.length){
					d=devices[i];
					if(!currVc||(d.vcName==currVc&&(!currMs||currMs==d.ms)))
						getCellDay(d.days,data,code,severity);
				}
				return data;
			},
			getCellAlarms = function(code, currVc, currMs, severity) {
				var data=[],i=-1,d;
				while(++i<devices.length){
					d=devices[i];
					if(!currVc||(d.vcName==currVc&&(!currMs||currMs==d.ms)))
						getCellAlarm(d.days,data,code,severity);
				}
				data.sort(function(c1,c2){return c1.code-c2.code});
				return data;
			},
			onCellMove = function() {
				var data=this.parentNode.data, currVc=null, currMs=null, altbl, tbl, ndays, i=-1, tn, ii=-1;
				if(occstat.perAll[3].def!==0&&lastTipData!==data){
					lastTipData=data;
					ndays=getNrDays()+1;
					if(data.totMilk.length<ndays)
						ndays=data.totMilk.length;
					while(++i<ndays&&!data.totMilk[i]){}
					if(i<ndays){
						var view=jr.ec('canvas',{style:{'background-color':"#877A41"},width:20+32*(getNrDays()+1),height:40+11*20});
						sGraph.Clear('#000000','#697285','d/m');
						sGraph.setFont('italic 12px sans-serif', 20);
						tn=occstat.now-ndays*86400000+3*86400000/4;
						i=ndays;
						if(this.aver){
							sGraph.addLine("#3366ff",3);
							while(--i>=0)
								sGraph.addPoint(tn+86400000,data.totMilk[i]?data.aver[i]:0,(tn+=86400000)+86400000);
							sGraph.setLimits(600);
						}
						else{
							sGraph.addLine("#3366ff",3,"#C9D7FF");
							var o=this.val;
							while(--i>=0)
								sGraph.addStaple(tn,data.total[i]?100*o[i]/data.total[i]:0,(tn+=86400000)-86400000/2);
							sGraph.addLine("#3366ff",3);
							tn=occstat.now-ndays*86400000;
							i=ndays;
							while(--i>=0)
								sGraph.addPoint(tn+86400000,data.totMilk[i]?100*data.total[i]/data.totMilk[i]:0,(tn+=86400000)+86400000);
						}
						sGraph.setLimits(null, occstat.now-(getNrDays()+1)*86400000, occstat.now);
						sGraph.paint(view);
						mouseBox.show(view);
						mouseBox.move();
						return;
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
			getCount=function(arr,i){
				var s=0;
				++i;
				while(--i>=0)s+=arr[i];
				return s;
			},
			noll=function(s){
				return s===0?"&nbsp;":s.toString();
			}
			renderOcc = function(isPerMs) {
				var i,arr=isPerMs?robots:vcs,nrDays=getNrDays(),cl,tds=[],hd,ln=-1,ii,tot,normal,err,warn,alarm,sum,aver;
				matrix=[];
				while (table.hasChildNodes())
					table.removeChild(table.lastChild);
				jr.foreach(arr, function(o){
					i=Math.min(arrsize,nrDays)+1;
					while(--i>=0&&!o.totMilk[i]){}
					o.currLastDayIndex=i;
				})
				tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(isPerMs?occstat.texts.robot:occstat.texts.vc,true)} } } });
				if(!isPerMs)
					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(occstat.texts.nrVms)} } } });
				tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(occstat.texts.nrDays)} } } });
				cl=9;
				cl=cl<2?100:cl<3?25:cl<4?20:cl<5?15:cl<8?13:6;
				hd=[occstat.texts.totalMilk,
					occstat.texts.totalPercent,	occstat.texts.normalPercent,	occstat.texts.errPercent,	occstat.texts.warnPercent,	occstat.texts.alarmPercent,	occstat.texts.average,
					occstat.texts.occTotal,		occstat.texts.occNormal,		occstat.texts.occErrors,	occstat.texts.occWarnings,	occstat.texts.occAlarms];
//console.log('cl='+cl+' (cl bef='+cll+')');
				jr.foreach(hd, function(o){
					tds.push({ 'td': { className: 'infoCell', children: {'div': {onmouseover:onToolTip,onmouseout:onToolTipOut,onmousemove:onMouseMove, data:o, innerHTML:pushMatrix(o)} } } });
				});
				jr.ec( 'tr', { parentNode: table, children: tds } );
				jr.foreach(arr, function(o){
					tot=getCount(o.total,o.currLastDayIndex);
					normal=getCount(o.normal,o.currLastDayIndex);
					err=getCount(o.err,o.currLastDayIndex);
					warn=getCount(o.warn,o.currLastDayIndex);
					alarm=getCount(o.alarm,o.currLastDayIndex);
					aver=getCount(o.aver,o.currLastDayIndex)/(o.currLastDayIndex+1);
					if(tot){
						var isEven=((++ln>>1)<<1)===ln,clName=isEven?' other':'';
						ii=-1;
						tds=[];
						tds.push({ 'td': { className: 'headingCell'+clName, children: {'div': {innerHTML:pushMatrix(o.name,true)} } } });
						if(!isPerMs)
							tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(o.nrMs)} } } });
						tds.push({ 'td': { className: 'infoCell dayCell', children: {'div': {innerHTML:pushMatrix(o.currLastDayIndex+1)} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(sum=getCount(o.totMilk,o.currLastDayIndex)))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(Math.round((tot/sum)*100)))} } } });
						tds.push({ 'td': { val:o.normal, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(tot?Math.round((normal/tot)*100):0))} } } });
						tds.push({ 'td': { val:o.err, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(tot?Math.round((err/tot)*100):0))} } } });
						tds.push({ 'td': { val:o.warn, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(tot?Math.round((warn/tot)*100):0))} } } });
						tds.push({ 'td': { val:o.alarm, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(tot?Math.round((alarm/tot)*100):0))} } } });
						tds.push({ 'td': { aver:1, onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(Math.round(aver)))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(tot))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(normal))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(err))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(warn))} } } });
						tds.push({ 'td': { className: 'infoCell'+clName, children: {'div': {innerHTML:pushMatrix(noll(alarm))} } } });
						tds.push({ 'td': { width: '90%', children: {'div': {innerHTML:'&nbsp;'} } } });
						jr.ec( 'tr', { data:o, parentNode: table, assignments: { rowData: o }, children: tds } );
					}
				});
//				if(total.length){
//					tds=[];
//					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix(occstat.texts.total,true)} } } });
//					if(!isPerMs)
//						tds.push({ 'td': { className: 'infoCell', children: {'div': {innerHTML:pushMatrix(nd)} } } });
//					tds.push({ 'td': { className: 'headingCell', children: {'div': {innerHTML:pushMatrix('&nbsp;')} } } });
//					if(showStopCount)
//						tds.push({ 'td': { className: 'infoCell', children: {'div': {innerHTML:pushMatrix(sTot)} } } });
//					ii=-1;
//					jr.foreach(total, function(sum){
//						tds.push({ 'td': { rowData:codes[++ii], onmouseout:onCellOut, onmousemove:onCellMove, className: 'infoCell', children: {'div': {innerHTML:pushMatrix(sum)} } } });
//					});
//					jr.ec( 'tr', { parentNode: table, assignments: { rowData: o }, children: tds } );
//				}
			},
			getNrDays = function() {
				var nrDays=occstat.perAll[3].def;
				nrDays=nrDays==0?0:nrDays==1?6:nrDays==2?20:22;
				return nrDays;
			},
			recalculate = function() {
				renderOcc(occstat.perAll[1].def);
			},
			ms=function(){
				var arr=function(a,sz){while(--sz>=0)a.push(d.getInt());},i=-1;
				this.vcGUID=d.getString();
				this.vcName=d.getString();
				this.msGUID=d.getString();
				this.msName=d.getString();
				this.name=this.vcName+'.'+this.msName;
				arr(this.totMilk=[],arrsize);
				arr(this.alarm=[],arrsize);
				arr(this.warn=[],arrsize);
				arr(this.err=[],arrsize);
				arr(this.normal=[],arrsize);
				arr(this.aver=[],arrsize);
				this.total=[];
				while(++i<arrsize)
					this.total.push(this.alarm[i]+this.warn[i]+this.err[i]+this.normal[i]);
			};
			vcd=function(ms){
				var arr=function(a,s){var i=-1;while(++i<s.length)a.push(s[i]);};
				var add=function(a,s){var i=-1;while(++i<s.length)a[i]+=s[i];};
				this.vcGUID=ms.vcGUID;
				this.vcName=ms.vcName;
				this.name=ms.vcName;
				this.nrMs=1;
				arr(this.totMilk=[],ms.totMilk);
				arr(this.alarm=[],ms.alarm);
				arr(this.warn=[],ms.warn);
				arr(this.err=[],ms.err);
				arr(this.total=[],ms.total);
				arr(this.normal=[],ms.normal);
				arr(this.aver=[],ms.aver);
				this.add=function(ms){
					this.nrMs++;
					add(this.totMilk,ms.totMilk);
					add(this.alarm,ms.alarm);
					add(this.warn,ms.warn);
					add(this.err,ms.err);
					add(this.normal,ms.err);
					add(this.total,ms.total);
					add(this.aver,ms.aver);
				}
			}
		var nrDev=d.getInt(),lt,vc;
		arrsize=d.getInt();
		while(--nrDev>=0)
			robots.push(new ms());
		robots.sort(function(o1,o2){return o1.vcGUID===o2.vcGUID?o1.msName.localeCompare(o2.msName):o1.vcName.localeCompare(o2.vcName);});
		jr.foreach(robots,function(r){
			if(!lt||lt.vcGUID!==r.vcGUID)
				vcs.push(lt=vc=new vcd(r));
			else
				lt.add(r);
		})
		
		renderFilter();
		(table = (tableParent = jr.ec( 'div', { className:'alarms', parentNode: container, children: {'table': {className: 'alarms', children:[
				{tr:{children:[]}}]}}})).childNodes[0].childNodes[0]).innerHTML = '';
		recalculate();
//		(table = (tableParent = jr.ec( 'table', { parentNode: container, className: 'alarms', children:[
//				{tr:{children:[]}}]})).childNodes[0]).innerHTML = '';
	}

};

jr.init( function() {
    occstat.init();
    jr.ec( document.body, { children: [
		{ 'div': { style: { left: '0.5%', top: '99%' }, actions: occstat.alarmListener } },
	] } );
	jr.ajax( 'SrvAnimal', 'occStat', {now:occstat.now.getTime(),offs:occstat.now.getTimezoneOffset()}, 'occStatData' );
} );
