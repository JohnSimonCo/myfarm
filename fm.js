jr.include('/cli.css');
jr.include( '/util.js' );
jr.include('/simpleGraph.js');
if(typeof hr==='undefined'){function hr(n){if(n<120)return !n?farms.texts.labNow:(n<60?n:'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?t>7200?"":(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t);};function n0(n){return n<10?'0'+n:n;};function n3(n){return n<100?'0'+n0(n):n;};function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60));};};
var farms = {
    init: function() {
		farms.texts = {
			labNow:					jr.translate('-Now-'),
			labFetchData:			jr.translate('Fetching data from server...'),
			labSevenDays:			jr.translate('Day average (last 7d):'),
			labLatest24:			jr.translate('Latest 24h:'),
			labBack:				jr.translate('Back'),
			labMilkingsPerDay:		jr.translate('Milk production per day'),
			labMilkingsPerDayMulti:	jr.translate('Milk production per robot per day'),
			labLparent:				jr.translate('('),
			labColon:				jr.translate(':'),
			labPerCountMilkingsDay:	jr.translate('Number of milkings per day'),
			labAllRobots:			jr.translate('Average for all robots'),
			labShowMilkProduction:	jr.translate('Show milking production instead'),
			labShowMilkingsPerHour:	jr.translate('Show number of milkings instead'),
			labNrRobots:			jr.translate('robots)'),
			milkingRatio:			jr.translate('Milking pulsation ratio (percent)'),
			labFarmsOnline:			jr.translate('Farms online'),
			labRobot:				jr.translate('Robot'),
			labNrCleaningsLast24:	'<nobr>'+jr.translate('Nr cleanings')+'</nobr>',
			labCleanings:			'<nobr>'+jr.translate('Nr cleanings last 24h')+'</nobr>'
		};
		firstRender = true;
	},
	instance:  function(myDiv){
		var
		canvasWidth=160,
		canvasHeight=20,
		isMobile=navigator.userAgent.toLowerCase().indexOf('mobile')>=0,
		root,
		allFarms,
		dynCol=null,
		dynClient=null,
		dlg,
		timer,
		latestGraphGUID=null,
		autoTime=0,
		sortCol=0,
		sortDir=1,
		userName,
		isMilkingsPerHour,
		isDialog,
		colPic=['#00ff00','#0000ff','#ff00ff','#00ffff','#ff0000'],
		dynamic,
		dynInner,
		farmQuery='',
		columns=['Farm','Last call','Cows','Red','Yel','Whi','Red/Yel/Whi percent','Alarms','Clea- ning','VC version'],
		popup=false,
		onCancel=	function(){
			dynClient=null;
			myDiv.removeChild(dlg);
			myDiv.appendChild(root);
		},
		initDialog=function(heading,buttons,afterButtons,content){
			var btns=[],i=-1,background,bb=[];
			while(++i<buttons.length){
				btns.push({span:{children:[
					{'input':{assignments:{id:i>>1,onclick:buttons[i+1],type:'button',className:'button',value:buttons[i++]}}},{'div':{className:'betweenSpace',innerHTML:' '}}]}});
			}
			myDiv.removeChild(root);
			offDynamic();
			dlg=jr.ec('div',{parentNode:myDiv,children:[
				{div:{children:{'div':{parentNode:myDiv,className:'styleBackground',children:function(ip){background=jr.ec('div',{parentNode:ip,className:'background'});}}}}}
			]});
			bb.push({td:{children:btns}});
			if(afterButtons){
				i=-1;
				while(++i<afterButtons.length)
					bb.push(afterButtons[i]);
			}
			var ce={};
			jr.ec('div',{parentNode:background,className:'top',children:[{div:{className:'topHeading',innerHTML:heading}},{table:{className:'dialogTable',children:{tr:{children:bb}}}}]});
			jr.ec('div',{className:'styleDialog',actions:{attachContextElements:true},parentNode:background,children:{div:{contextIdentity:'div',className:'dialogTable',children:content}}},ce);
	//		return ce.div;
			return background;
		},
		showDynamic=function(show){dynamic.style.visibility=show?"visible":"hidden";},
		offDynamic=	function(){latestGraphGUID=null;showDynamic(false);popup=false;},
		showCleanings=function(d){
			var pp=[],i=-1,nn=d.nrCleaingsLast24;
			pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},innerHTML:farms.texts.labCleanings}}]}}]}});
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:farms.texts.labRobot}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:farms.texts.labNrCleaningsLast24}}}}
					]}});

			while(++i<nn.length){
				var ss=nn[i];
				pp.push({tr:{children:[
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+ss.vmsName+'</nobr'}}}},
							{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
							{td:{align:'left',children:{div:{className:getCleaningsStyle(ss.latest24Count,'styleWhite'),innerHTML:ss.latest24Count}}}}
						]}});
			}
			showDynTbl(pp,dynInner);
		},
		showDdmInfo= function(d) {
			var pp=[],i=-1,nn=d.ddmInfo.split('|'),sdd=nn[0].split('='),sd=new JsSerilz('$',sdd[1]);
			pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},actions:{translate:{innerHTML:sdd[0]}}}}]}}]}});
			while(sd.hasMore()){
				pp.push({tr:{children:[
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+sd.getString()+'</nobr>'}}}},
							{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+sd.getString()+'</nobr>'}}}}]}});
			}
			showDynTbl(pp,dynInner);
		},
		showDynTbl=	function(d,parent){
			var rVal=null;
			if(parent)
				if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.childNodes[0]);
			rVal=jr.ec('table',{className:'styleTable',children:[{tr:{children:[{td:{align:'center',children:[{div:{children:d}}]}}]}}]});
			if(parent)
				parent.appendChild(rVal);
			return rVal;
		},
		graphData=	function(data){
			var d=data.graphData;
			var time=d.lastIndexDate,vms=d.data,i=-1;
			var dd=new Date(time);
			var isCount=isMilkingsPerHour&&!isDialog;
			this.begOfDay=86400000*(Math.floor(time/86400000))+dd.getTimezoneOffset()*60000;
			this.lastMultFactor=d.latestTimepart===0?1:3600/d.latestTimepart;
			this.ifirst=(d.lastIndexDate-this.begOfDay)/3600000;
			this.t=[];
			this.l24=
			this.tsum=
			this.nrRobots=0;
			this.tot=-1;
			for(var o in vms){
				if(o!=='*')this.nrRobots++;
				var tt=vms[o];
				tt.t=[];
				tt.tot=
				tt.l24=
				tt.tsum=0;
				if(this.tot===-1){
					this.tot=tt.kg.length;
					if(this.tot>24*7)
						this.tot=24*7;
					i=-1;
					while(++i<this.tot)this.t.push(0);
				}
				tt.tot=this.tot;
				i=-1;
				while(++i<tt.tot)tt.t.push(0);
				i=-1;
				while(++i<this.tot){
					var q=isCount?tt.count[i]:tt.kg[i];
					if(i<24){
						this.l24+=q;
						tt.l24+=q;
					}
					this.tsum+=q;
					this.t[i]+=q;
					tt.tsum+=q;
					tt.t[i]+=q;
				}
			}
			this.t[0]*=this.lastMultFactor;
			tt.t[0]*=this.lastMultFactor;
		},
		getNodeWithId=function(n,id){
			if(n.id===id)return n;
			if(!n)return null;
			var i=-1,rVal;
			while(++i<n.childNodes.length&&!(rVal=getNodeWithId(n.childNodes[i],id)));
			return rVal;
		},
		addRatio=	function(ratio,data,headLine,myDiv){
			sGraph.Clear('#7395C9','#B2CDF7','d/m');
			sGraph.setFont('italic bold 20px sans-serif', 20);
			var col=[],i=-1,cc={};
			while(++i<ratio.colors.length)
				col.push({span:{className:'graphHead',style:{'color':colPic[i]},innerHTML:ratio.colors[i].toString()}});
			jr.ec('div',{className:'styleDialog',parentNode:myDiv,children:[
				{div:{className:'dialogTable graphHead',innerHTML:headLine}},
				{div:{className:'dialogTable graphHead',children:col}},
				{'canvas':{contextIdentity:'ratio',width:760,height:300}}
			]},cc);
			i=-1;
			while(++i<ratio.colors.length){
				sGraph.addLine(colPic[i],3);
				var puls=ratio.colors[i].toString(),time=ratio.midnight,arr=data.ratio[puls],ii=arr.length,t=time-(ii-1)*86400000+43200000;
				while(--ii>=0){
					sGraph.addPoint(t,Math.round(arr[ii]/data.total[ii]*100));
					t+=86400000;
				}
			}
			sGraph.paint(cc.ratio);
		},
		addGraph=	function(data,headLine,g,tsum,l24,t,nrRobots,id,latest24,latest7d){
			var pp=[],i=-1,time=data.lastIndexDate,ii,sum=0;
			pp.push({tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold','font-size':'x-large'},innerHTML:headLine}}]}}]}});
			var s=farms.texts.labSevenDays+'&nbsp;'+Math.floor(latest7d/10+.5)+'&nbsp;&nbsp;&nbsp;'+farms.texts.labLatest24+'&nbsp;'+Math.floor(latest24/10+.5);
			pp.push({tr:{children:[{td:{children:[{div:{style:{'font-weight':'bold'},innerHTML:s}}]}}]}});
			pp.push({tr:{children:[{td:{align:'center',children:{'canvas':{id:id,width:760,height:300}}}}]}});
			var rVal=showDynTbl(pp,null);
			sGraph.Clear('#7395C9','#B2CDF7','d/m');
			sGraph.setFont('italic bold 20px sans-serif', 20);
			sGraph.addLine('#ff77ff',1);
			ii=i=g.lastMultFactor>3?0:-1;
			if(!i)time-=3600000;
			while(++i<g.tot){
				sGraph.addPoint(time, t[i]*24/nrRobots);
				time-=3600000;
			}
			sGraph.setYmax(3500);
			i=ii;
			ii=0;
			while(++i<g.ifirst&&i<g.t.length){
				sum+=t[i];
				ii++;
			}
			sGraph.addLine('#002CBD',3);
			if(ii>0)
				sGraph.addPoint(data.lastIndexDate,l24/nrRobots);
			time=g.begOfDay-43200000;
			ii=sum=0;
			while(++i<t.length){
				sum+=t[i];
				ii++;
				if(ii===24){
					sGraph.addPoint(time,sum/nrRobots);
					sum=0;
					time-=86400000;
					ii=0;
				}
			}
			if(ii>0){
				time+=43200000;
				time-=ii/2*3600000;
				sGraph.addPoint(time,sum*24/ii/nrRobots);
			}
			sGraph.paint(getNodeWithId(rVal,id));
			return rVal;
		},
		showGraph=	function(d){
			if(!d.graphData){
				ajaxGetFarmGraph(d.vcGUID);
				showDynTbl({div:{innerHTML:'<nobr>'+farms.texts.labFetchData+'</nobr'}},dynInner);
			}
			else{
				var g=new graphData(d);
					if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.firstChild);
				var s=farms.texts.labMilkingsPerDay,ss,o=d.graphData.data;
				if(g.nrRobots>1)
					s=farms.texts.labMilkingsPerDayMulti+'&nbsp;'+farms.texts.labLparent+g.nrRobots+'&nbsp;'+farms.texts.labNrRobots;
				else
					for(var dd in o)
						if(dd!=='*'){
							ss=dd;
							break;
						}
				var allDlg=addGraph(d.graphData,isDialog?g.nrRobots>1?farms.texts.labAllRobots:ss:s,g,g.tsum,g.l24,g.t,g.nrRobots,'graph',d.graphData.lastest24T10PerRobot,d.graphData.lastest7dT10PerRobot);
				if(isDialog){
					var dlg,oo,i=-1;
					dlg=initDialog(d.vcName+farms.texts.labColon+'&nbsp;'+s, [farms.texts.labBack,onCancel], null, allDlg);
					if(g.nrRobots>1)
						for(var dd in o)
							if(dd!=='*'){
								oo=o[dd];
								jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addGraph(d.graphData,dd,g,oo.tsum,oo.l24,oo.t,1,'graph'+(++i))}}});
							}
					var ratio=d.ratio?d.graphData.ratio:null;
					if(ratio){
						jr.ec('div',{parentNode:dlg,className:'top',children:{div:{className:'topHeading',innerHTML:farms.texts.milkingRatio}}});
						jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addRatio(ratio,ratio,farms.texts.labAllRobots,dlg)}}});
						if(ratio.devices.length>1)
							jr.foreach(ratio.devices,function(d){
								jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addRatio(ratio,d,d.name,dlg)}}});
							});
					}
					isDialog=false;
				}
				else
					dynInner.appendChild(allDlg);
			}
		},
		onClickColumn=function(){
			var vcGUID,data=getFarm(vcGUID=this.parentNode.data.vcGUID),type=this.col;
			if(type===8)
				window.location='/Delaval/mvc/Pages/Show/cleanings?id='+vcGUID;
			else if(type===9){
				if(!data.ddmInfo)return;
				window.location='/Delaval/mvc/Pages/Show/ver?id='+vcGUID;
			}
			else if(type===7)
				window.location='/Delaval/mvc/Pages/Show/a?id='+vcGUID;
			else if (data.hasAccess) {
				if((isDialog=(type===6))){
					if(data!==null)
						showGraph(data);
				}
				else if(type===0)
					window.location='/Delaval/mvc/Pages/Show/farm?id='+vcGUID;
				else if(type===5)
					window.location='/Delaval/mvc/Pages/Show/cq?id='+vcGUID;
				else if(type===4)
					jr.ajax( 'FarmAdmin', 'dumpMilkings', vcGUID );
				else if(type===3)
					jr.ajax( 'FarmAdmin', 'recalcSeven', vcGUID );
				else if(type===2)
					jr.ajax( 'FarmAdmin', 'recalcSeven', vcGUID );
				else
					onClickFarm(vcGUID);
			}
		},
		setDynamic=	function(){
			var data=getFarm(this.parentNode.parentNode.data.vcGUID),type=this.parentNode.col;
			if(type==0)
				showDynTbl([{tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold'},innerHTML:'<nobr>'+data.vcFullName+'</nobr>'}}]}}]}}],dynInner);
			else if(type===6){
				if(data.nrCows===0)return;
				if(latestGraphGUID!==data.vcGUID&&(dynClient!==data||dynCol!==type))
					showGraph(dynClient=data);
			}
			else if(type===8){
				if(data.cleaning===null)return;
				if(dynClient!==data||dynCol!==type)
					showCleanings(dynClient=data);
			}
			else if(type===9){
	//			VC version
				if(!data.ddmInfo)return;
				if(dynClient!==data||dynCol!==type)
					showDdmInfo(dynClient=data);
			}
			dynCol=type;
			setDynPos();
			popup=true;
			return;
		},
		setDynPos=	function(){
			var stl = dynamic.style;
			var tbl = dynamic.childNodes[0];
			var y = 21+window.event.clientY+window.pageYOffset;
			var x = window.event.clientX-tbl.clientWidth/2;
			if(y+tbl.clientHeight>window.innerHeight){
				y=window.event.clientY-tbl.clientHeight-10;
				if(y<0){
					y=0;
					x=window.event.clientX;
					if(y+tbl.clientHeight>window.event.clientY){
						x=window.event.clientX-tbl.clientWidth-10;
						y=window.event.clientY-tbl.clientHeight/2;
						if(y<0)y=0;
					}
				}
			}
			if(x+tbl.clientWidth>window.innerWidth-3)x=window.innerWidth-tbl.clientWidth-3;
			if(x<0)x=0;
			stl.left = ""+x+"px";
			stl.top = ""+y+"px";
			showDynamic(true);
		},
		getFarm=	function(vcGUID){
			var i=-1;while((++i<allFarms.length)&&allFarms[i].vcGUID!==vcGUID);
			return i<allFarms.length?allFarms[i]:null;
		},
		prepareMilkStat=function(d){
			var totalLen=-1,i,key;
			d.devices.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
			d.total=[];
			d.ratio=[];
			jr.foreach(d.devices,function(o){
				o.total=[];
				var len=-1;
				i=-1;
				for(key in o.ratio){
					var oo=o.ratio[key];
					if(len<oo.length)
						len=oo.length;
				};
				if(totalLen<len)
					totalLen=len;
				i=-1;
				while(++i<len)o.total.push(0);
				for(key in o.ratio){
					var oo=o.ratio[key];
					var sum=d.ratio[key];
					if(!sum)
						sum=d.ratio[key]=[];
					i=-1;
					while(++i<oo.length){
						o.total[i]+=oo[i];
						while(sum.length<=i)
							sum.push(0);
						sum[i]+=oo[i];
					}
				};
			});
			i=-1;
			while(++i<totalLen)d.total.push(0);
			d.colors=[];
			jr.foreach(d.devices,function(oo){
				for(key in oo.ratio){
					key=parseInt(key);
					if(d.colors.indexOf(key)<0) {
						d.colors.push(key);
					}
				};
			});
			d.colors.sort();
			jr.foreach(d.devices,function(o){
				i=-1;
				jr.foreach(o.total,function(cnt){
					d.total[++i]+=cnt;
				});
			});
		},
		farmMilkStat=function(d){
			var farm=getFarm(latestGraphGUID=d.vcGUID);
			if(d.ratio)
				prepareMilkStat(d.ratio);
			farm.graphData=d;
			if(popup){
				showGraph(farm);
				setDynPos();
			}
		},
		analyzeCleaning=function(d) {
			if(d){
				var min=0;
				if(d.length) {
					min=1000;
					jr.foreach(d,function(o){
						if(o.latest24Count<min)
							min=o.latest24Count;
						});
				}
				return min;
			}
			return null;
		},
		farmsOnLine= function(data){
			if(!data){
				window.alert(jr.translate("Sorry, you have no permission for this..."));
				navigateTo('/Delaval/mvc/Pages/Show/farm');
				return;
			}
			var d=data.farms;
			userName='&nbsp;&nbsp;- ' + data.user;
			var i=-1;
			while(++i<d.length){
				d[i].name=(d.length>1?(d[i].vcPreName.length?(d[i].vcPreName.length>3?d[i].vcPreName.substring(0,3):d[i].vcPreName)+'.':''):'')+d[i].vcName;
				d[i].state=(d[i].offLineTimeSec==null||d[i].offLineTimeSec>120)?1:0;
				d[i].nrCows=!d[i].nrCows?0:parseInt(d[i].nrCows);
				d[i].nrRedCows=!d[i].nrRedCows?0:parseInt(d[i].nrRedCows);
				d[i].nrYellowCows=!d[i].nrYellowCows?0:parseInt(d[i].nrYellowCows);
				d[i].nrWhiteCows=!d[i].nrWhiteCows?0:parseInt(d[i].nrWhiteCows);
				d[i].vcVersion=!d[i].vcVersion?0:d[i].vcVersion.substr(7);
				d[i].milkingCows=!d[i].nrRedCows?0:d[i].nrRedCows+d[i].nrYellowCows+d[i].nrWhiteCows;
				d[i].cleaning=analyzeCleaning(d[i].nrCleaingsLast24);
				if(d[i].nrCleaingsLast24)
					d[i].nrCleaingsLast24.sort(function( o1, o2 ) {
						return o1.vmsName.localeCompare( o2.vmsName );
					});
			}
			d.sort(sort);
			allFarms=d;
			i=-1;
			while(++i<d.length)
				d[i]['index']=i;
			render(myDiv);
			setPercent();
			updateSort();
			if(autoTime>0){
				clearTimeout(timer);
				timer=setTimeout(ajaxGetFarmsOnline,autoTime);
			}
			if(firstRender) {
				firstRender = false;
				typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
			}
		},
		onClickFarm= function(vcGUID){
			window.location='/i.vcx?id='+vcGUID+'&'+encodeURIComponent('page=/Delaval/mvc/Pages/Show/FarmSmall');
		},
		updateSort=	function(){
			var i=-1;
			while(++i<columns.length)
				document.getElementById(columns[i]).className='container styleRubber hdrHeight '+(i===sortCol?'headchoosen':'headlabel');
		},
		onSortCol= function(){
			var i=-1,oldCol=sortCol;
			while(++i<columns.length)
				if(columns[i]===this.id){
					sortCol=i;
					break;
				}
			if(sortCol===oldCol)
				sortDir*=-1;
			else
				sortDir=1;
			ajaxGetFarmsOnline();
		},
		sort= function(o1,o2) {
			if(o1.state!==2&&o2.state!==2)
				switch(sortCol){
					case  0:return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
					case  1:if(o1.state===o2.state)return o1.offLineTimeSec!=null&&o2.offLineTimeSec==null?1:o1.offLineTimeSec==null&&o2.offLineTimeSec!=null?-1:sortDir*(o1.vcName.toLowerCase().localeCompare(o2.vcName.toLowerCase()));
					case  2:return o1.state===o2.state?sortDir*(o2.nrCows-o1.nrCows):o2.state?-1000:1000;
					case  3:return o1.state===o2.state?sortDir*(o2.nrRedCows-o1.nrRedCows):o2.state?-1000:1000;
					case  4:return o1.state===o2.state?sortDir*(o2.nrYellowCows-o1.nrYellowCows):o2.state?-1000:1000;
					case  5:return o1.state===o2.state?sortDir*(o2.nrWhiteCows-o1.nrWhiteCows):o2.state?-1000:1000;
					case  6:return o1.state===o2.state?sortDir*(o2.nrRedCows/o2.milkingCows-o1.nrRedCows/o1.milkingCows):o2.state?-1000:1000;
					case  7:return sortDir*(o1.nrFatalAlarms===o2.nrFatalAlarms?(o1.nrUserNotAlarms===o2.nrUserNotAlarms?o1.vcName.toLowerCase().localeCompare(o2.vcName.toLowerCase()):o2.nrUserNotAlarms-o1.nrUserNotAlarms):o2.nrFatalAlarms-o1.nrFatalAlarms);
					case  8:return 0;
					case  9:return sortDir*(o1.vcVersion&&o2.vcVersion?(o2.vcVersion.localeCompare(o1.vcVersion)>0?1:-1):o1.vcVersion?-1000:1000);
				}
			return sortDir*(o1.state===2||o2.state===2?o1.state-o2.state:o1.state-o2.state);
		},
		getVal=	function(data,col){
			switch(col){
				case  0:return data.name.length>16?data.name.substr(0,13)+'...':data.name;
				case  1:return data.offLineTimeSec!=null?'<nobr>'+hr(data.offLineTimeSec)+'</nobr>':'&nbsp;';
				case  2:return data.nrCows?data.nrCows:'&nbsp;';
				case  3:return data.nrCows?data.nrRedCows.toString():'&nbsp;';
				case  4:return data.nrCows?data.nrYellowCows.toString():'&nbsp;';
				case  5:return data.nrCows?data.nrWhiteCows.toString():'&nbsp;';
				case  6:return data.nrCows?'<canvas id="RYW'+data.index+'" width="'+(canvasWidth+2)+'px" height="'+(canvasHeight+2)+'px">':'&nbsp;';
				case  7:return data.nrFatalAlarms+data.nrUserNotAlarms>0?
					data.nrFatalAlarms>0&&data.nrUserNotAlarms>0?data.nrFatalAlarms+'+'+data.nrUserNotAlarms:(data.nrFatalAlarms+data.nrUserNotAlarms).toString():'&nbsp;';
				case  8:return data.cleaning===null?'&nbsp;':data.cleaning;
				case  9:return data.vcVersion?data.vcVersion:'&nbsp;';
			}
		},
		fillRect= function(ctx,from,total,curr,fillStyle){
			curr=Math.floor(canvasWidth*parseInt(curr)/parseInt(total)+.5);
			if(curr>0){
				ctx.fillStyle=fillStyle;
				ctx.fillRect(from+1,1,curr-1,canvasHeight);
			}
			return from+curr;
		},
		getCleaningsStyle=function(level,def){
			return level===null?'styleGrey':level===0?'styleRed':level<2?'styleRed':level<3?'styleYellow':def;
		},
		setPercent= function() {
			var i=-1;
			while(++i<allFarms.length){
				var d=allFarms[i],t=d.nrCows,green=t-d.nrRedCows-d.nrYellowCows-d.nrWhiteCows,tr=document.getElementById('row'+d.index),ii;
				if(d.nrCows>0){
					var ctx=document.getElementById('RYW'+d.index).getContext("2d");
					ctx.fillRect(0,0,canvasWidth+2,canvasHeight+2);
					fillRect(ctx,fillRect(ctx,fillRect(ctx,fillRect(ctx,0,t,d.nrRedCows,"#ff1010"),t,d.nrYellowCows,"#ffff00"),t,d.nrWhiteCows,"#ffffff"),t,green,"#008000");
				}
				ii=-1;
				while(++ii<columns.length){
					var styleOk='styleWhite';
					if(ii===7&&!d.state&&(d.nrFatalAlarms+d.nrUserNotAlarms)>0)
						styleOk=d.nrFatalAlarms>0?'styleRed':'styleBlue';
					if(ii===8)
						styleOk=getCleaningsStyle(d.cleaning,styleOk);
					tr.children[ii].children[0].className='container '+(d.state===2?'styleGreen':d.state>0?'styleOrange':styleOk);
				}
			}
		},
		onClickUpdate=function() {
			ajaxGetFarmsOnline();
		},
		ajaxGetFarmGraph= function(vcGuid) {jr.ajax( 'FarmAdmin', 'getFarmMilkStat', vcGuid, 'getFarmMilkStat' );},
		ajaxGetFarmsOnline= function() {
			jr.ajax( 'FarmAdmin', 'getFarmsOnline', farmQuery, 'getFarmsOnline' );
		},
		onAuto= function(d){
			if(!timer){
				autoTime=d.offsetY>22?5000:120000;
				timer=setTimeout(ajaxGetFarmsOnline,autoTime);
				if(root)
					ajaxGetFarmsOnline();
			}
		},
		render=function(container){
			if(root)container.removeChild(root);
			var hd=[],vl=[],cl,i=-1,ii=-1;
			while(++i<columns.length)
				hd.push({td:{children:{div:{style:{height:'37px'},onclick:onSortCol,id:columns[i],actions:{translate:{innerHTML:columns[i]}}}}}});
			var btn=!autoTime?{div:{children:{'input':{onclick:onClickUpdate,type:'button',actions:{translate:{value:'Refresh'}}}}}}:{'div':{className:'topHeading',actions:{translate:{innerHTML:'Auto'}}}};
			vl.push({'tr':{className:'container',children:[
						{'td':{width:'95%',colSpan:columns.length-2,className:'topHeading',innerHTML:farms.texts.labFarmsOnline+userName}},
						{'td':{ondblclick:onAuto,colSpan:2,children:btn}}
					]}});
			vl.push({'tr':{className:'container',children:hd}});
			while(++ii<allFarms.length){
				cl=new Array();
				i=-1;
				while(++i<columns.length){
					var stl={height:'22px','text-align':!i?'left':'right'},acc=allFarms[ii].hasAccess,nptr=!acc&&!(i===7||i===8||i===9);
					var text=getVal(allFarms[ii],i);
					if(nptr){
						stl.cursor='default';
						stl.color='rgb(90,90,90)';
					}
					var gui=acc&&(i==0||i===7||i===8||i===9||(i===6&&!isMobile))?{onmousemove:setDynamic,onmouseover:setDynamic,onmouseout:offDynamic,style:stl,innerHTML:i==0?'<b>'+text+'</b>':getVal(allFarms[ii],i)}:{style:stl,innerHTML:text};
					cl.push({'td':{onclick:onClickColumn,width:'2%',col:i,children:{div:gui}}});
				}
				vl.push({'tr':{id:'row'+ii,data:allFarms[ii],children:cl}});
			}
			root=jr.ec('div',{parentNode:container,className:'styleBackground',children:{'div':{className:'background',children:{'table':{className:'styleTable',children:vl}}}}});
		},
		dynDivs={};
		this.show=function(farmQueryString){
			farmQuery=farmQueryString&&farmQueryString.length?farmQueryString.substr(1):null;
			ajaxGetFarmsOnline();
		};
		this.hide=function(){
			if(root)myDiv.removeChild(root);
			root=null;
		};

		dynamic=jr.ec('div',{parentNode:myDiv,className:'dynamicDiv',
							children:{table:{className:'dialogTable',children:{tr:{children:{td:{children:{div:{contextIdentity:'inner',className:'dynamicDivContent'}}}}}}}}},dynDivs);
		dynInner=dynDivs.inner;
		showDynamic(false);
		jr.eventManager.addListener('getFarmsOnline',jr.eventManager,function(data){farmsOnLine(data);});
		jr.eventManager.addListener('getFarmMilkStat',jr.eventManager,function(data){farmMilkStat(data);});
	}
};

