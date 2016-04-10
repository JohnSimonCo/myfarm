if(typeof hr=='undefined'){function hr(n){if(n<120)return n==0?fs.labNow:(n<60?n+'s':'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t)}function n0(n){return n<10?'0'+n:n}function n3(n){return n<100?'0'+n0(n):n}function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60))}}
jr.include('/cli.css');
jr.include('/util.js');
jr.include('/mouseBox.js' );
jr.include('/version.js' );
jr.include('/filter.js' );
jr.include('/perRobot.js' );
jr.include('/perVc.js' );
var stat = {
    init: function() {
		stat.texts = {
			back:				jr.translate('Back'),
			value:				jr.translate('Value'),
			nrRobots:			jr.translate('Number of robots with value'),
			versionOverview:	jr.translate('Version overview'),
			makeSelection:		jr.translate('Edit filter'),
			setAsDefault:		jr.translate('Set as default'),
			version:			jr.translate('Version'),
			filter:				jr.translate('Filter'),
			source:				jr.translate('Source'),
			perRobot:			jr.translate('Per robot'),
			cleanings:			jr.translate('Cleanings'),
			statExpYld:			jr.translate('Expected yield'),
			perVC:				jr.translate('Per VC'),
		};
		stat.labels = [null,stat.texts.filter];
		stat.dialog = [stat.texts.version,stat.texts.perVC,stat.texts.perRobot,stat.texts.cleanings];
	},
	instance:	function(myDiv){
		var
		dlg=[],
		dlgPos=[],
		times,
		strings,
		allVC,
		allParams=[],
		robots={},
		selected,
		filterData,
		userFilterAll,
		dayData,
		lastChoosedFkn,
		lastData,
		lastHeading,
		lastView,
		lastRobotInstance,
		lastCleaningInstance,
		lastVcInstance,
		filteredData,
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
		back=function(){
			if(dlg.length===1)
				window.history.back();
			else{
				myDiv.removeChild(dlg.pop());
				dlg[dlg.length-1].style.display='block';
				window.scrollTo(0,dlgPos[dlg.length-1]);
				updateFilter();
			}
		},
		// --- New part ---
		getValuesInRobotInVC=function(robotId,value){
			for(var i in allVC){
				selected=allVC[i];
				for(var ii in allVC[i].robots)
					if(allVC[i].robots[ii].id===robotId){
						var all=allVC[i].robots[ii].values;
						for(var ind in all)
							if(all[ind].label===value)
								return all[ind].values;
					}
			}
		},
		hashMap=function(d,isTime){
			var rv={},cnt=d.getInt();
			while(--cnt>=0){
				var v=d.getString();
				if(v)
					v=v.trim();
				if(isTime)
					v=new Date(parseInt(v));
				var k=d.getString();
				rv[k]=v;
			}
			return rv;
		},
		getTimeVal=function(d){
			var v={value:strings[d.getString()],time:times[d.getString()]};
			return v;
		},
		getValue=function(d){
			var v={label:strings[d.getString()],values:getArray(d,getTimeVal)};
			return v;
		},
		getRobot=function(d){
			var v={id:d.getString(),name:strings[d.getString()],values:getArray(d,getValue)};
			return v;
		},
		getArray=function(d,fn){
			var rv=[],cnt=d.getInt();
			while(--cnt>=0)
				rv.push(fn(d));
			return rv;
		},
		getVc=function(d){
			return {vcId:d.getString(),vcName:d.getString(),robots:getArray(d,getRobot)};
		},
		tRb=function(no){
			var qi=-1,added=[];
			while(++qi<no.values.length){
				var n=no.values[qi];
				if(n.values.length>1){
					var tms={},a,i=-1,o;
					while(++i<n.values.length){
						var o=n.values[i];
						var s=tms[o.time.getTime()];
						if(!s)
							s=tms[o.time.getTime()]=[];
						s.push({v:o.value,o:i});
					}
					for(var key in tms){
						if((a=tms[key]).length>1){
							var i=-1,c,sCmp=a[0].v;
							while(++i<sCmp.length){
								c=sCmp[i];
								var ii=0;
								while(++ii<a.length&&a[ii].v.length>i&&c===a[ii].v[i]);
								if(ii<a.length)
									break;
							}
							if(i>0){
								i=-1;
								while(++i<a.length){
									var na=[],oo=a[i];
									na.push({time:new Date(parseInt(key)),value:oo.v});
									added.push({label:n.label+' #'+i,values:na});
								}
							}
							else{
								i=-1;
								while(++i<a.length){
									var na=[],oo=a[i],ind=oo.v.indexOf(':');
									if(ind<0)
										ind=oo.v.indexOf(' ');
									else
										ind++;
									if(ind<0)
										ind=oo.v.length;
									var ky=n.label+' '+oo.v.substr(0,ind),val=oo.v.substr(ind).trim();
									na.push({time:new Date(parseInt(key)),value:val});
									added.push({label:ky,values:na});
								}
							}
							i=-1;
							while(++i<a.length)
								n.values[a[i].o].time=0;
						}
					}
					i=-1;
					while(++i<n.values.length)
						if(!n.values[i].time)
							n.values.splice(i--,1);
					if(!n.values.length)
						no.values.splice(qi--,1);
				}
			}
			if(added.length>0){
				i=-1;
				while(++i<added.length){
					var ii=i,c=added[i];
					while(++ii<added.length&&c.label!==added[ii].label);
					if(ii<added.length){
						if(c.value!==added[ii].value)
							c.values.push(added[ii]);
						added.splice(ii,1);
						i--;
					}
				}
				no.values=no.values.concat(added);
			}
		},
		tVc=function(n){
			traverseArray(n.robots,tRb);
		},
		traverseArray=function(arr,fkn){
			var i=-1;
			while(++i<arr.length)
				fkn(arr[i]);
		},
		prepare=function(data){
			document.addEventListener('keydown',function(event){if(event.keyCode===27&&dlg.length>1)back();});
			var sd=new JsSerilz('$',data);
			userFilterAll=new filter.filter(sd.getString());
			filterData=data.filter;
			times=hashMap(sd,1);
			strings=hashMap(sd);
			allVC=getArray(sd,getVc);
			traverseArray(allVC,tVc);
			var d={},vcInd=-1,oo;
			while(++vcInd<allVC.length){
				var vc=allVC[vcInd],robInd=-1,i=vc.vcName.length;
				while(vc.vcName[--i]!=='.');
				robots[vc.id]={name:vc.vcName.substr(0,i)};
				while(++robInd<vc.robots.length){
					var rob=vc.robots[robInd],labInd=-1;
					if(!rob.id)
						rob.id=vc.vcId;
					robots[rob.id]={name:vc.vcName+'.'+rob.name,vc:vc.vcId};
					while(++labInd<rob.values.length){
						var lab=rob.values[labInd],val=lab.values[0],o=d[lab.label],rbt=[];
						if(o)
							if(o[val.value])
								o[val.value].push(rob.id);
							else{
								rbt.push(rob.id);
								o[val.value]=rbt;
							}
						else{
							var oo={};
							rbt.push(rob.id);
							oo[val.value]=rbt;
							d[lab.label]=oo;
						}
					}
				}
			}
			for(var k in d)
				allParams.push({lab:k,val:d[k]});
			allParams.sort(function(o1,o2){return o1.lab.localeCompare(o2.lab);});
			dayData=parseStat(sd);
		},
		makeDiv = function(pp){
			return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:pp}}});
		},
		makeList=function(arr,dataKey){
			var pp=[];
			pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},innerHTML:jr.translate('Robots with value')}}]}}]}});
			for(var key in arr){
				var val=robots[arr[key]];
				pp.push({tr:{children:[
							{td:{align:'left',children:{div:{data:val.vc,dataKey:dataKey,innerHTML:'<nobr>'+val.name+'</nobr>'}}}}]}});
			}
			return pp;
		},
		onShowAll=function(){
			jr.ajax( 'Versions', 'getVersions', this.data, 'myVerConf' );
		},
		onShowUsage=function(){
			selected={val:this.data,key:this.dataKey};
			mouseBox.show(makeDiv(makeList(this.data,this.dataKey)),'mouseBoxDiv');
			mouseBox.move();
		},
		onUsageAll=function(){
			var key=this.dataKey,val=this.data,all=[];
			for(var lab in val)
				for(var r in val[lab])
					all.push({d:val[lab][r],n:robots[val[lab][r]].name});
			all.sort(function(o1,o2){return o1.n.localeCompare(o2.n);});
			all={key:key,data:all};
			render(key,all,usageAllFkn);
		},
		onGoUsage=function(){
			mouseBox.hide();
			render(selected.key,selected,usageFkn);
		},
		addHistory=function(table,key,val,stl){
			var robotValues=getValuesInRobotInVC(val,key),td=[],i=-1;
			while(++i<robotValues.length){
				var v=robotValues[i];
				td.push({'div':{style:{'white-space': 'nowrap'}, innerHTML:v.time.printiso()+'&nbsp;&nbsp;&nbsp;'+(v.value?v.value:'')}});
			}
			jr.ec('tr',{parentNode:table,children:[
				{'td':{algn:'right',className:stl,data:selected.vcId,dataKey:key,onclick:onShowAll,style:{'white-space': 'nowrap',cursor:'pointer'},innerHTML:robots[val].name+'&nbsp;'}},
				{'td':{className:stl,children:td}}]});
		},
		usageAllFkn=function(div,data,stl){
			var i=-1,tBody=makeHeader(div,[stat.texts.source,stat.texts.value]);
			var i=-1;
			while(++i<data.data.length){
				var line=data.data[i.toString()].d;
				addHistory(tBody,data.key,line,stl);
			}
		},
		usageFkn=function(div,data,stl){
			var i=-1,tBody=makeHeader(div,[stat.texts.source,stat.texts.value]);
			while(++i<Object.keys(data.val).length){
				var line=data.val[i.toString()];
				addHistory(tBody,data.key,line,stl);
			}
		},
		addParam=function(table,key,val,stl){
			var sum=0,varr=[],td=[],i=-1;
			for(var lab in val){
				varr.push({lab:lab.trim(),val:val[lab]});
				sum+=val[lab].length;
			}
			varr.sort(function(o1,o2){return o1.lab.localeCompare(o2.lab);var rv=o2.val.length-o1.val.length;return rv?rv:o1.lab.localeCompare(o2.lab);});
			while(++i<varr.length){
				var cnt=varr[i].val.length,value=varr[i].lab;
				if(!value || value==='null') value='';
				cnt=(cnt<10?'&nbsp;&nbsp;&nbsp;&nbsp;':cnt<100?'&nbsp;&nbsp;':'')+cnt;
				td.push({'div':{data:varr[i].val, dataKey:key, style:{'white-space': 'nowrap',cursor:'pointer'}, innerHTML:cnt+': '+value, onclick:onGoUsage,onmouseover:onShowUsage,onmouseout:mouseBox.hide,onmousemove:mouseBox.move}});
			}
			jr.ec('tr',{parentNode:table,children:[
				{'td':{algn:'right',className:stl,onclick:onUsageAll,data:val,dataKey:key,style:{'white-space': 'nowrap',cursor:'pointer'}, innerHTML:key+'&nbsp;'}},
				{'td':{className:stl,children:td}}]});
		},
		makeHeader=function(div,head){
			var f=[],i=-1,ce={};
			while(++i<head.length)
				f.push({'td':{'width':(i?'95%':'5%'),children:[{'div':{className:'styleRubber container',assignments:{innerHTML:head[i]}}},{'div':{className:'cellSpace'}}]}});
			jr.ec('table',{parentNode:div,className:'styleTable',children:{'tr':{contextIdentity:'headerRow',className:'container',children:f}}},ce);
			return ce.headerRow.parentNode;
		},
		basicFkn=function(div,data,stl){
			var i=-1,tBody=makeHeader(div,[stat.texts.value,stat.texts.nrRobots]);
			while(++i<data.length){
				var line=data[i];
				addParam(tBody,line.lab,line.val,stl);
			}
		},
		saveState=function(){
			if(dlg.length){
				dlgPos[dlg.length-1]=window.scrollY;
				dlg[dlg.length-1].style.display='none';
				window.scrollTo(0,0);
			}
		},
		editFilter=function(){
			var filterData=this.data.val;
			if(!filterData){
				var i=-1,d=this.data.data;
				if(d){
					filterData={};
					while(++i<d.length)
						filterData[i]=d[i].d;
				}
			}
			jr.ajax( 'Users', 'getRobots', null, 'robotConf', null, false );
		},
		filterChoosed=function(ind,checked){
			while(dlg.length>1)
				back();
			dlg.pop();
			var last;
			userFilterAll.setChecked(ind,checked);
			while (last=myDiv.lastChild)
				myDiv.removeChild(last);
			filteredData=doFilterData();
			renderView();
		},
		setAsDefault=function(){
			userFilterAll.setDefault();
			jr.ajax( 'Users', 'saveFilter', userFilterAll.serialize(), null, null, false );
			updateFilter();
		},
		doFilterData=function(){
			var ids=userFilterAll.getIds();
			if(ids){
				var rv=[],i=-1,id={},ln,o,arr,ii,oo;
				jr.foreach(ids,function(s){id[s]=1;});
				while(++i<allParams.length){
					ln=allParams[i].val;
					oo={};
					for(var k in ln){
						o=ln[k];
						arr=[];
						ii=-1;
						while(++ii<o.length)
							if(id[o[ii]])
								arr.push(o[ii]);
						if(arr.length>0)
							oo[k]=arr;
					}
					if(Object.keys(oo).length)
						rv.push({lab:allParams[i].lab,val:oo});
				}
				return rv;
			}
			else
				return allParams;
		},
		updateFilter=function(){
			var order=dlg.length-1;
			document.getElementById('setAsDefault_'+order).disabled=userFilterAll.isDefault();
			filter.filterChooser(userFilterAll,document.getElementById('filterDiv_'+order),false,filterChoosed,stat.labels,stat.dialog,dialogChoosed);
		},
		getDate=function(f){
			var y,m,d;
			try {
				if(f.length===6){
					y=parseInt(f.substr(0,2));
					m=parseInt(f.substr(2,2));
					d=parseInt(f.substr(4,2));
					if(y>=14&&y<50&&m>0&&m<=12&&d>0&&d<=31)
						return new Date(y,m-1,d);
				}
			}
			catch(err){
			}
			return null;
		},
		updateData=function(data){
			var sd=new JsSerilz('$',data);
			dayData=parseStat(sd);
			filteredData=doFilterData();
			dialogChoosed();
		},
		getOpt=function(){
			var nrDays=parseInt(document.getElementById('nrDays').value),usr=document.getElementById('myFromDate').value,old=userFilterAll.getOptional(),fromDate=getDate(usr),opt=new JsSerilz('!');
			if(nrDays||fromDate){
				opt.serialize(fromDate?usr:'',nrDays?nrDays.toString():'');
				var newOpt=opt.getData();
				return newOpt!==old ? newOpt : 0;
			}
			return null;
		},
		getDaydata=function(){
			var newOpt=getOpt();
			if(newOpt){
				userFilterAll.setOptional(newOpt);
				document.getElementById('setAsDefault_'+(dlg.length-1)).disabled=userFilterAll.isDefault();
				jr.ajax( 'Stat', 'get', newOpt, 'StatGet' );
			}
		},
		getDayData=function(){
			var dayData=new JsSerilz('!',userFilterAll.getOptional()),rv={};
			if(dayData.hasMore())
				rv.fromDate=getDate(rv.fromDateStr=dayData.getString());
			if(dayData.hasMore())
				rv.nrDays=dayData.getInt();
			return rv;
		},
		checkGet=function(){
			document.getElementById('setOptBtn').disabled=!getOpt();
		},
		render=function(heading,data,dataFkn){
			if(data){
				saveState();
				var a=[],b=[],order=dlg.length,dateData=getDayData();
				a.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:stat.texts.back,onclick:back}}}}});
				a.push({'td':{id:'myTopHeading',className:'topHeading',width:'90%',align:'center',innerHTML:lastHeading=heading}});
				b.push({'td':{children:{'div':{innerHTML:'From date'},'input':{id:'myFromDate',size:6,onkeyup:checkGet,assignments:{type:'text',data:data,value:dateData.fromDate?dateData.fromDateStr:''}}}}});
				b.push({'td':{children:{'div':{innerHTML:'Nr days'},'input':{id:'nrDays',size:3,onkeyup:checkGet,assignments:{type:'text',data:data,value:dateData.nrDays?dateData.nrDays:''}}}}});
				b.push({'td':{children:{'input':{id:'setOptBtn',style:{'font-weight':'bolder'},assignments:{type:'button',disabled:1,value:jr.translate('Get'),onclick:getDaydata}}}}});
				a.push({'td':{width:'1%',align:'right',children:{'table':{style:{'border':'2px ridge white'},children:{'tr':{children:b}}}}}});
				a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',assignments:{type:'button',data:data,value:stat.texts.makeSelection,onclick:editFilter}}}}});
				a.push({'td':{width:'1%',align:'right',children:{'input':{id:'setAsDefault_'+order,className:'button',assignments:{type:'button',value:stat.texts.setAsDefault,onclick:setAsDefault}}}}});
	//			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',assignments:{type:'button',value:systat.texts.refresh,onclick:this.refresh}}}}});
				dlg.push(jr.ec('div',{parentNode:myDiv,children:{'div':{className:'background',children:[
							{'div':{children:{'table':{width:'100%',children:{'tr':{children:a}}}}}},
							{'div':{id:'filterDiv_'+order}},
							{'div':{id:'contentDiv_'+order}}
						]}}}));
				(lastChoosedFkn=dataFkn)(document.getElementById('contentDiv_'+order),lastData=data,'styleWhite container');
				updateFilter();
				onresize();
			}
			else
				jr.ec('div',{parentNode:myDiv,innerHTML:'No access'});
		},
		dialogChoosed=function(){
			dlg=[];
			var last;
			while (last=myDiv.lastChild)
				myDiv.removeChild(last);
			renderView();
		},
		renderPerVC=function(myDiv, data, style){
			var lastDlg=lastVcInstance?lastVcInstance.getFunction():0;
			(lastVcInstance=new perVc()).render(myDiv, data, userFilterAll, style, lastDlg);
		},
		renderPerRobot=function(myDiv, data, style){
			var lastDlg=lastRobotInstance?lastRobotInstance.getFunction():null;
			(lastRobotInstance=new perRobot()).render(myDiv, data, userFilterAll, style, lastDlg, 0);
		},
		renderCleanings=function(myDiv, data, style){
			var lastDlg=lastCleaningInstance?lastCleaningInstance.getFunction():0;
			(lastCleaningInstance=new perRobot()).render(myDiv, data, userFilterAll, style, lastDlg, 1);
		},
		renderView=function(){
			switch(lastView=userFilterAll.getDialog()){
				case 0:
					render(stat.texts.versionOverview,filteredData,basicFkn);
					break;
				case 1:
					render(stat.texts.statExpYld,dayData,renderPerVC);
					break;
				case 2:
					render(stat.texts.perRobot,dayData,renderPerRobot);
					break;
				case 3:
					render(stat.texts.perRobot,dayData,renderCleanings);
					break;
			}
		},
		parseStat=function(sd){
			var cnt=sd.getInt()+1,data=[],
				robot=function(vcName){
					this.milkingDeviceGUID= sd.getString();
					this.robotName =		sd.getString();
					this.fullname =			vcName+'.'+this.robotName;
					this.secMilkingTime =	sd.getInt();
					this.kg =				parseFloat(sd.getString());
					this.conductivity =		parseFloat(sd.getString());
					this.flow =				parseFloat(sd.getString());
					this.nrIncomplete =		sd.getInt();
					this.nrKickOff =		sd.getInt();
					this.performance =		sd.getInt();
					this.nrMilkings =		sd.getInt();
					this.nrCleaningPerDay =	sd.getInt();
					this.secCleaningTime =	sd.getInt();
					this.bloodSum =			sd.getInt();
					this.nrBloodWarning =	sd.getInt();
					this.nrBloodAlarm =		sd.getInt();
					this.nrOccSamples =		sd.getInt();
					if (this.nrOccSamples > 0) {
						this.occSum =		sd.getInt();
						this.nrOccError =	sd.getInt();
						this.nrOccOk =		sd.getInt();
						this.nrOccWarning =	sd.getInt();
						this.nrOccAlarm =	sd.getInt();
					}
					this.stopAlarms =		sd.getInt();
					this.reminders =		sd.getInt();
					if(sd.getString()==='1'){
						var cc=this.cleaning={};
						cc.totalTimeSec=sd.getInt();
						cc.rinseNr=		sd.getInt();
						cc.rinsingTimeSec=sd.getInt();
						cc.cleaningTimeSec=sd.getInt();
						cc.circTimeSec=	sd.getInt();
						cc.alcaVol=		sd.getInt();
						cc.acidVol=		sd.getInt();
						cc.nrOk=		sd.getInt();
						cc.returnTemp=	sd.getInt();
						cc.afterFillTemp=sd.getInt();
						cc.failedNr=	sd.getInt();
						cc.failedTimeSec=sd.getInt();
						cc.failedAlcaVol=sd.getInt();
						cc.failedAcidVol=sd.getInt();
					}
					sd.getString(); sd.getString(); sd.getString();
				},
				vcData=function(){
					var rob;
					this.vcId=sd.getString();
					this.vcName=sd.getString();
					this.timeStartDay=sd.getInt();
					this.totNrMilkingsVc=0;
					this.robots=[];
					var cnt=sd.getInt()+1;
					while(--cnt){
						this.robots.push(rob=new robot(this.vcName));
						this.totNrMilkingsVc+=rob.nrMilkings;
					}
					this.expectedYield=[];
					cnt=62;
					while(--cnt)
						this.expectedYield.push(sd.getInt());
					this.nrAnimals =			sd.getInt();
					this.alarmCount =			sd.getInt();
					this.alarmReminder =		sd.getInt();
					this.alarmAnomaly =			sd.getInt();
					this.feedingRatio =			parseFloat(sd.getString());
					this.nrAfterCowCleanings =	sd.getInt();
					this.activity =				sd.getInt();
					sd.getString(); sd.getString(); sd.getString(); sd.getString(); sd.getString();
					sd.getString(); sd.getString(); sd.getString(); sd.getString(); sd.getString(); sd.getString();
				},
				oneDay=function(){
					this.recTime = sd.getInt();
					this.dayData = [];
					var cnt=sd.getInt()+1;
					while(--cnt)
						this.dayData.push(new vcData());
				};
			while(--cnt)
				data.push(new oneDay());
			var lastDate=data[0].recTime,i=-1;
			lastDate=parseInt(lastDate/3600000)*3600000-86400000;
			while(++i<data.length){
				data[i].startOfDay=lastDate;
				lastDate-=86400000;
			}
			return data;
		};
		this.prepare=function(data){
			prepare(data);
			userFilterAll.setDialog(userFilterAll.getDialogDefault());
			filteredData=doFilterData();
			renderView();
		};
		this.resize=function(){onresize();};
		jr.eventManager.addListener('myVerConf', jr.eventManager, function(data) {
			if(data){
				saveState();
				dlg.push(jr.ec('div',{parentNode:myDiv}));
				new version.instance(dlg[dlg.length-1],data,back).show();
			}
		});
		jr.eventManager.addListener('StatGet', jr.eventManager, function(data){updateData(data)});
		jr.eventManager.addListener('robotConf', jr.eventManager, function(data) {
			if(data){
				saveState();
				dlg.push(new filter.instance(myDiv,back,userFilterAll).render(data,filterData));
			}
		});
	}
};
