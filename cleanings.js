jr.include('/util.js');
jr.include('/cli.css');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');
var cleanings = {
    init: function() {
		cleanings.texts = {
			cleanings:			jr.translate('Cleanings'),
			bounced:			jr.translate('Bounced'),
			rinses:				jr.translate('Rinses'),
			show:				jr.translate('Show'),
			back:				jr.translate('Back'),
			robot:				jr.translate('Robot'),
			date:				jr.translate('Date')+'<br/>&nbsp;',
			time:				jr.translate('Time')+'<br/>&nbsp;',
			cleaningTime:		jr.translate('Cleaning time'),
			nrDays:				jr.translate('Nr days'),
			tempReturn:			jr.translate('Return temperature'),
			circuationTime:		jr.translate('Circulation time'),
			programNr:			jr.translate('Program number'),
			alcaVolume:			jr.translate('Alca volume'),
			acidVolume:			jr.translate('Acid volume'),
			nrSteps:			jr.translate('Nr steps'),
			today:				jr.translate('Today'),
			details:			jr.translate('Cleaning details'),
			shortMin:			jr.translate('min_min'),
			shortSec:			jr.translate('min_sec'),
			today:				jr.translate('Today'),
			labWeekDay:			jr.translate("Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"),
			parameter:			jr.translate('Parameter'),
			value:				jr.translate('Value'),
			seqNr:				jr.translate('Sequence number'),
			noCleanings:		jr.translate('No ok cleanings this day'),
			noCleaningsToday:	jr.translate('No ok cleanings yet today'),
		};
		cleanings.texts.labWeekDay=cleanings.texts.labWeekDay.split(',');
	},
	instance:	function(vcId,myDiv){
	var
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1000);
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		head=[	cleanings.texts.date,
				cleanings.texts.time,
				cleanings.texts.nrDays,
				cleanings.texts.cleaningTime,
				cleanings.texts.circuationTime,
				cleanings.texts.programNr,
				cleanings.texts.nrSteps,
				cleanings.texts.tempReturn,
				cleanings.texts.alcaVolume,
				cleanings.texts.acidVolume],
		MIN_CIRC_TIME=420,
		MIN_VOLUME=100,
		MIN_RET_TEMP=45,
		myData,
		now,
		nextDay,
		showBounced=true,
		showRinses=false,
		updateSortHeader=function(ce){
			var i=-1;
			while(++i<head.length)
				ce.tblHead.childNodes[i].childNodes[0].className='styleRubber container ';
		},
		addParam=function(table,val,key,stl){
			val=val[key];
			if(key.indexOf('Time')>=0)
				val=val>100000?new Date(val).printiso():printTime(val);
			jr.ec('tr',{parentNode:table,children:[
				{'td':{algn:'right',className:stl,innerHTML:key+'&nbsp;'}},
				{'td':{className:stl,innerHTML:val}}]});
		},
		details=function(){
			var d=this.data.cleanings,a=[],i=-1,ce={},hd=[cleanings.texts.parameter,cleanings.texts.value],f=[],table,stl='styleWhite container',keys;
			hide();
			a.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:cleanings.texts.back,onclick:show}}}}});
			a.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:cleanings.texts.details}});
			while(++i<hd.length)f.push({'td':{'width':(i?'95%':'5%'),children:[{'div':{className:'styleRubber container',assignments:{innerHTML:hd[i]}}},{'div':{className:'cellSpace'}}]}});
			jr.ec('div',{parentNode:myDiv,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:a}}}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
					{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}}
			]}}},ce);
			jr.ec('div',{parentNode:myDiv,className:'content',innerHTML:'&nbsp;'});
			table=ce.tblHead.parentNode;
			addParam(table,d[0],'CleaningProgramNumber',stl);
			addParam(table,d[0],'EventDateTime',stl);
			addParam(table,d[0],'TotalCleaningTime',stl);
			i=-1;
			while(++i<Object.keys(d).length){
				jr.ec('div',{parentNode:myDiv,className:'styleBackground',contextIdentity:'background',children:{'div':{className:'background',children:[
					{'div':{className:'topHeading',children:{'table':{width:'100%',children:{'tr':{children:[
						{'td':{align:'center',innerHTML:cleanings.texts.seqNr+': '+(i+1).toString()}}]
					}}}}}},
					{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
						{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}},
				]}}},ce);
				jr.ec('div',{parentNode:myDiv,className:'content',innerHTML:'&nbsp;'});
				table=ce.tblHead.parentNode;
				a=d[i];
				keys=Object.keys(a);
				keys.sort(function(o1,o2){return o1.localeCompare(o2);});
				jr.foreach(keys,function(key){
					if(key!=='SequenceNumber'&&key!=='Status'&&key!=='CleaningProgramNumber'&&key!=='EventDateTime'&&key!=='TotalCleaningTime')
						addParam(table,a,key,stl);
				});
			}
			onresize();
		},
		printTime=function(t){
			var m=Math.floor(t/60),s=t%60;
			return (m?m.toString():'0')+':'+(s<10?'0'+s:s);
		},
		render=function(d,ce){
			nextDay=new Date();
			now=new Date().getTime();
			nextDay.setHours(0,0,0,0);
			nextDay=nextDay.getTime()+86400000;
			var table=ce.tblHead.parentNode,wday=-1,i=-1,lastDay=0,okToday=0;
			while(table.childNodes.length>1)
				table.removeChild(table.childNodes[table.childNodes.length-1]);
			i=-1;
			var days=[],day,lastDay=-1;
			jr.foreach(d,function(cl){
				var isCleaning=cl.alcali>0||cl.acid>0;
				if(isCleaning&&!showBounced&&!cl.ok)
					return;
				if(!showRinses&&!isCleaning)
					return;
				var dayNr=Math.floor((nextDay-cl.time)/86400000);
				while(dayNr!==lastDay){
					lastDay++;
					days.push(day={okCount:0,cl:[]});
				}
				day.cl.push(cl);
				if(cl.ok){
					day.okCount++;
					if(now-cl.time<86400000)
						okToday++;
				}
			});
			i=-1;
			while(++i<days.length){
				var o=days[i],okCount=i==0?okToday:o.okCount;
				var bstl=okCount<2?'styleCleanAlarm':okCount<3?'styleCleanWarn':'styleCleanOk',wday,nrDays;
				var date=new Date(nextDay-i*86400000-1);
				wday=cleanings.texts.labWeekDay[date.getDay()];
				date=date.printdate()+' '+wday;
				nrDays=i===0?cleanings.texts.today:i;
				if(o.cl.length)
					jr.foreach(o.cl,function(cl){
						var stl=bstl+' container'+(cl.ok?'':' '+'styleCleanNo');
						var stl1=wday?stl:bstl+' container';
						jr.ec('tr',{parentNode:table,data:cl,onclick:details,children:[
							{'td':{className:stl1,innerHTML:'<nobr>'+date+'</nobr>'}},
							{'td':{align:'right',className:stl,innerHTML:cl.printTime}},
							{'td':{align:'right',className:stl1,innerHTML:nrDays+'&nbsp;'}},
							{'td':{align:'right',className:stl,innerHTML:printTime(cl.totalTime)}},
							{'td':{align:'right',className:stl,innerHTML:cl.circTime?printTime(cl.circTime):'&nbsp;'}},
							{'td':{align:'right',className:stl,innerHTML:cl.progNr.toString()}},
							{'td':{align:'right',className:stl,innerHTML:cl.steps.toString()}},
							{'td':{align:'right',className:stl,innerHTML:cl.temp>0?cl.temp.toString():'&nbsp;'}},
							{'td':{align:'right',className:stl,innerHTML:cl.alcali>0?(cl.alcali/100).toString():'&nbsp;'}},
							{'td':{align:'right',className:stl,innerHTML:cl.acid>0?(cl.acid/100).toString():'&nbsp;'}},
						]});
						date=nrDays='';
					});
				else{
					jr.ec('tr',{parentNode:table,onclick:details,children:[
						{'td':{className:bstl,innerHTML:'<nobr>'+date+'</nobr>'}},
						{'td':{colSpan:9,align:'center',className:bstl+' container',innerHTML:i===0?cleanings.texts.noCleaningsToday:cleanings.texts.noCleanings}},
					]});
				}
				jr.ec('tr',{parentNode:table,children:{'td':{colspan:9,className:'styleLine',children:{}}}});
			}
			onresize();
		},
		onCheck=function(){
		showBounced=document.getElementById('bounce').checked;
		showRinses=document.getElementById('rinse').checked;
		show();
		},
		makeCheckbox=function(id,lab,status,arr){
			arr.push({td:{innerHTML:'&nbsp;&nbsp;&nbsp;'}});
			arr.push({td:{children:[{input:{id:id,onchange:onCheck,type:'checkbox',checked:status}}]}});
			arr.push({td:{innerHTML:'<label for="'+id+'">'+lab+'</label>'}});
		},
		makeCmdLine=function(){
			var ce={},checks=[];
			checks.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:cleanings.texts.back,onclick:function(){window.history.back();}}}}}});
			checks.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:cleanings.texts.cleanings}});
			checks.push({td:{innerHTML:'&nbsp;&nbsp;'+cleanings.texts.show}});
			makeCheckbox('bounce',cleanings.texts.bounced,showBounced,checks);
			makeCheckbox('rinse',cleanings.texts.rinses,showRinses,checks);
			jr.ec('div',{parentNode:myDiv,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:checks}}}}}}]}}},ce);
			jr.ec('div',{parentNode:myDiv,className:'content',innerHTML:'&nbsp;'});
		},
		makeTable=function(d){
			var f=[],i=-1,ce={};
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{contextIdentity:'hd'+i,id:i,innerHTML:head[i]}}},{'div':{className:'cellSpace'}}]}});
			jr.ec('div',{parentNode:myDiv,className:'styleBackground',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{className:'topHeading',children:{'table':{width:'100%',children:{'tr':{children:[
					{'td':{align:'center',innerHTML:cleanings.texts.robot+': '+d.vmsName}}]
											
				}}}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
					{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}},
			]}}},ce);
			jr.ec('div',{parentNode:myDiv,className:'content',innerHTML:'&nbsp;'});
			updateSortHeader(ce);
			if(d.vmsData&&d.vmsData.length)
				render(d.vmsData,ce);
		},
		show=function(){
			hide();
			if(myData){
				makeCmdLine();
				jr.foreach(myData,function(d){
					makeTable(d);
				});
			}
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		dateInd,
		dateStr,
		ni=function(){
			var s=++dateInd;
			while(++dateInd<dateStr.length&&dateStr.charCodeAt(dateInd)>=0x30&&dateStr.charCodeAt(dateInd)<=0x39){}
			return parseInt(dateStr.substring(s,dateInd),10);
		},
		parseDate=function(s){
			dateInd=-1;
			dateStr=s;
			var tm=new Date(ni(),ni()-1,ni(),ni(),ni(),ni(),ni());
			return new Date(tm.getTime()-tm.getTimezoneOffset()*60000);
		},
		parseVMSData=function(d){
			var ss=d.split(';'),rVal={},iq;
			jr.foreach(ss,function(o){
				var i=o.indexOf('='),key=o.substr(0,i),val=o.substr(i+1);
				if(key!=='Device'&&key!=='CleaningId'){
					if(val.length>20)
						val=parseDate(val).getTime();
					else if((iq=getTimeSec(val))>=0)
						val=iq;
					else if(!isNaN(iq=parseInt(val)))
						val=iq;
					else
						val=val==='true';
					rVal[key]=val;
				}
			});
			return rVal;
		},
		getTimeSec=function(s) {
			var rVal=0,ind=2,temp;
			while (ind<9) {
				rVal*=60;
				temp = parseInt(s.substr(ind,ind+2),10);
				if(isNaN(temp)){
					rVal=-1;
					break;
				}
				if(temp>0)
					rVal+=temp;
				ind+=3;
			}
			return rVal;
		},
		conf=function(d){
			myData=[];
			for(var key in d){
				myData.push(d[key]);
				for(var k in d[key].vmsData){
					var dd=d[key].vmsData[k],i=-1,obj;
					d[key].vmsData[k]=obj={cleanings:dd};
					while(++i<dd.length){
						var o=parseVMSData(dd[i]);
						if(o.Status){
							dd[i]=o;
							if(!i){
								obj.date=new Date(obj.time=o.EventDateTime);
								obj.date.setHours(0,0,0,0);
								obj.date=obj.date.getTime();
								obj.sec=obj.time-obj.date;
								var tm=new Date(obj.time);
								obj.weekDay=tm.getDay();
								obj.printDate=tm.printdate();
								obj.printTime=tm.printhms();

								obj.progNr=o.CleaningProgramNumber;
								obj.temp=o.ReturnWaterTemperature?o.ReturnWaterTemperature:-1;
								obj.alcali=o.AlkaliDosingVolume?o.AlkaliDosingVolume:-1;
								obj.acid=o.AcidDosingVolume?o.AcidDosingVolume:-1;
								obj.circTime=o.CirculationTime?o.CirculationTime:0;
								obj.totalTime=o.TotalCleaningTime;
							}
							else{
								if(o.ReturnWaterTemperature&&o.ReturnWaterTemperature>obj.temp)
									obj.temp=o.ReturnWaterTemperature;
								if(o.AlkaliDosingVolume&&o.AlkaliDosingVolume>obj.alcali)
									obj.alcali=o.AlkaliDosingVolume;
								if(o.AcidDosingVolume&&o.AcidDosingVolume>obj.acid)
									obj.acid=o.AcidDosingVolume;
								if(o.CirculationTime)
									obj.circTime+=o.CirculationTime;
							}
						}
						else
							dd.splice(i,dd.length-i);
						obj.steps=dd.length;
						obj.ok=obj.circTime&&obj.circTime>=MIN_CIRC_TIME&&obj.temp>=MIN_RET_TEMP&&(obj.acid&&obj.acid>MIN_VOLUME||obj.alcali&&obj.alcali>MIN_VOLUME);
					}
				};
			};
			myData.sort(function(o1,o2){return o1.vmsName.localeCompare(o2.vmsName);});
			jr.foreach(myData,function(d){
				d.vmsData.reverse();});
			show();
			typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		this.setData=function(d){conf(d);};
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)conf(data);});
		jr.ajax( 'FarmAdmin', 'getAllCleanings', vcId, 'myConf' );
	}
};
jr.init( function() {
    cleanings.init();
	var myselft='/cleanings',path=window.location.pathname;
	if(path.indexOf(myselft,path.length-myselft.length)!==-1){
		document.body.style.width='1000px';
//		document.body.style.backgroundColor='#103d82';
//		document.body.style.height = '99%';
		new cleanings.instance(jr.getUrlVar('id'),document.body).show();
	}
} );
