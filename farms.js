jr.include('/cli.css');
jr.include('/myGraph.js');
jr.include('/util.js');
jr.include('/buttons.css');
jr.include('/Resources/info6.png');
if(typeof hr2==='undefined'){function hr2(n){if(n<120)return n<1?farms.texts.labNow:(n<60?n:'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?t>7200?"":(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t);};function n0(n){return n<10?'0'+n:n;};function n3(n){return n<100?'0'+n0(n):n;};function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60));};};
var farms = {
    init: function() {
		farms.texts = {
			labNow:					jr.translate('-Now-'),
			labFetchData:			jr.translate('Fetching data from server...'),
			labSevenDays:			jr.translate('Day average (last 7d):'),
			labLatest24:			jr.translate('Latest 24h:'),
			labBack:				jr.translate('Back'),
			labMilkingsPerDay:		jr.translate('Milk production per day'),
			labTotal:				jr.translate('in total'),
			labPerHour:				jr.translate('in detail'),
			labColon:				jr.translate(':'),
			labPerCountMilkingsDay:	jr.translate('Number of milkings per day'),
			labAllRobots:			jr.translate('Average for all robots'),
			labShowMilkProduction:	jr.translate('Show milking production instead'),
			labShowMilkingsPerHour:	jr.translate('Show number of milkings instead'),
			milkingRatio:			jr.translate('Milking pulsation ratio (percent)'),
			labFarmsOnline:			jr.translate('Farms online'),
			labRobot:				jr.translate('Robot'),
			labNrCleaningsLast24:	'<nobr>'+jr.translate('Nr cleanings')+'</nobr>',
			labCleanings:			'<nobr>'+jr.translate('Nr cleanings last 24h')+'</nobr>',
			farms:					jr.translate('Farms'),
			settings:				jr.translate('Settings'),
			mySettings:				jr.translate('My settings'),
			adminUsers:				jr.translate('Administrate users'),
			logout:					jr.translate('Logout'),
			status:					jr.translate('Status'),
			unActivatedVC:			jr.translate('This farm is not activated'),
			overview:				jr.translate('Overview'),
			time:					jr.translate('Time'),
			VMSMode:				jr.translate('VMS mode'),
			VcBootData:				jr.translate('VC'),
			VcLastRestart:			jr.translate('Last restart'),
			VcLastFullsync:			jr.translate('Last fullsync'),
			VcFullsyncCount:		jr.translate('Fullsync count')
		};
	},
	instance:  function(myDiv,width){
		var
		showMenu=false,
		imgIcons=new Image(),
		logoImageDisplayed=false,
		ce={},
		cookie=getSessCookie(),
		settings,
		menu,
		canvasWidth=160,
		canvasHeight=20,
		isMobile=navigator.userAgent.toLowerCase().indexOf('mobile')>=0,
		root,
		allFarms,
		adminUsers=false,
		superUser=false,
		sonOfGod=false,
		systatUser=false,
		firstRender=true,
		dynCol=null,
		dynClient=null,
		dlg,
		timer,
		latestGraphGUID=null,
		autoTime=0,
		sortCol=0,
		sortDir=1,
		userName,
		beginningOfDay,
		earliestTime,
		isMilkingsPerHour,
		isDialog,
		timeDiff=0,
		colPic=['#00ff00','#0000ff','#ff00ff','#00ffff','#ff0000'],
		dynamic,
		dynInner,
		farmQuery='',
		months,
		columns=cookie.isApp ? 
			['Farm','Red','Red/Yel/Whi percent','Alarms','Cleaning','VC version']:
			['Farm','Last call','Cows','Red','Yel','Whi','Red/Yel/Whi percent','Alarms','Clea- ning','VC version','Received','!Auto'],
		columnMap=cookie.isApp ?
			[0,3,6,7,8,9]:
			[0,1,2,3,4,5,6,7,8,9,11],
		lastComStatus=0,	// Ok, 1=Warning, 2=Err
		popup=false,
		onCancel=	function(){
			dynClient=null;
			myDiv.removeChild(dlg);
			myDiv.appendChild(root);
		},
		ajaxError = function() {
			if(0==lastComStatus) {
				if(ce['comErr'].childNodes.length>0)
					ce['comErr'].removeChild(ce['comErr'].childNodes[0]);
				if((lastComStatus=1)){
					var canvas=
						jr.ec('canvas',{parentNode:ce['comErr'],className: 'comErr',width:70,height:53}),
						ctx=canvas.getContext("2d");
						ctx.drawImage(imgIcons,70,872,70,53,0,0,70,53);
				}
			}
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
			jr.ec('div',{parentNode:background,className:'top',children:[{div:{className:'topHeading',innerHTML:heading}},{table:{className:'dialogTable',children:{tr:{children:bb}}}}]});
			jr.ec('div',{className:'styleDialog',actions:{attachContextElements:true},parentNode:background,children:{div:{className:'dialogTable',children:content}}});
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
		showRobotStateInfo= function(d) {
			var pp=[],rr=[];
			pp.push({tr:{children:[{td:{align:'center',colSpan:5,children:[{div:{style:{'font-weight':'bold'},actions:{translate:{innerHTML:farms.texts.VMSMode}}}}]}}]}});
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:farms.texts.labRobot}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+farms.texts.VMSMode+'</nobr>'}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:farms.texts.time}}}}
					]}});
			d.vmsMode.forEach(function(robot){rr.push(robot)});
			rr.sort(function(o1,o2){return o1.name.localeCompare(o2.name)});
			rr.forEach(function(robot){
				var m=robot.state,mode= m===1?'Error':m===2?'Auto':m===3?'Manual':m===4?'Test':'Undefined',now=parseInt(new Date().getTime()/1000),t=robot.timeSec?hr2(now-robot.timeSec):'';
				var cl=m===2?'':'styleYellow';
				pp.push({tr:{className:cl,children:[
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+robot.name+'</nobr>'}}}},
							{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+mode+'</nobr>'}}}},
							{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+t+'</nobr>'}}}}]}});
			})
			showDynTbl(pp,dynInner);
		},
		showVcBoot= function(d) {
			var pp=[],now=new Date().getTime();
			now += (now - d.nowMyFarm);
			pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},actions:{translate:{innerHTML:farms.texts.VcBootData}}}}]}}]}});
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+farms.texts.VcLastRestart+'</nobr>'}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+hr2((now-d.vcBootDate)/1000)+'</nobr>'}}}}]}});
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+farms.texts.VcLastFullsync+'</nobr>'}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+hr2((now-d.vcFullSyncDate)/1000)+'</nobr>'}}}}]}});
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+farms.texts.VcFullsyncCount+'</nobr>'}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+d.vcFullSyncCount+'</nobr>'}}}}]}});
			showDynTbl(pp,dynInner);
		}
		showDynTbl=	function(d,parent){
			var rVal=null;
			if(parent)
				if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.childNodes[0]);
			rVal=jr.ec('table',{className:'styleTable',children:[{tr:{children:[{td:{align:'center',children:[{div:{children:d}}]}}]}}]});
			if(parent)
				parent.appendChild(rVal);
			return rVal;
		},
		hourData=function(data,time){
			var i=-1,d=data.hourYield,m=data.hourNrMilkings,a=[];
			while(++i<d.length){
				a.push({t:time,y:d[i],m:m[i]});
				time-=3600000;
			}
			return a;
		},
		devData=function(arr,name,l7,l24,type){
			var i=-1, day=[], aver=0, nw=0, ymax=0;
			while (arr[++i].t > beginningOfDay)
				nw+=arr[i].y;
			if(i)
				nw=nw/i*24;
			var count=7;
			while (--count>=0){
				var ii=24,sum=0,mlk=0;
				while(--ii>=0){
					var y=arr[++i].y;
					if (y>ymax)
						ymax=y;
					sum+=y;
					mlk+=arr[i].m;
				}
				day.push({sum:Math.round(sum),mlk:mlk});
				aver+=sum;
			}
			return {name:name,data:day,aver:Math.round(aver/7),l7:Math.round(l7),l24:Math.round(l24),now:Math.round(nw),arr:arr,yMax:ymax*24,type:type};
		},
		graphDataPrepare=function(d){
			if(d.jsGroups)
				d.jsGroups.sort(function(o1,o2){return o1.name.localeCompare(o2.name)});
			beginningOfDay=new Date();
			beginningOfDay.setHours(0,0,0,0);
			earliestTime=beginningOfDay-7*86400000;
			var prodData=[];
			prodData.push(devData(hourData(d.jsVcMilkData,d.lastHourTime),d.jsVcMilkData.name,d.jsVcMilkData.lastSeven,d.jsVcMilkData.last24h,0));
			if(d.jsRobots){
				d.jsRobots.sort(function(o1,o2){return o1.name.localeCompare(o2.name)});
				var i=-1;
				while(++i<d.jsRobots.length) {
					var r=d.jsRobots[i], curr=devData(hourData(r,d.lastHourTime),r.name,r.lastSeven,r.last24h,1);
					if(!curr.name.startsWith("Unknown device"))
						prodData.push(curr);
				}
			}
			return prodData;
		},
		getNodeWithId=function(n,id){
			if(n.id===id)return n;
			if(!n)return null;
			var i=-1,rVal;
			while(++i<n.childNodes.length&&!(rVal=getNodeWithId(n.childNodes[i],id)));
			return rVal;
		},
		addRatio=function(ratio,data,headLine,myDiv){
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
		prepareGraph=function(d,headLine,index){
			var pp=[],id='graph_'+index;
			pp.push({tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold','font-size':'x-large'},innerHTML:headLine}}]}}]}});
			var s=farms.texts.labSevenDays+'&nbsp;'+d[index].l7+'&nbsp;&nbsp;&nbsp;'+farms.texts.labLatest24+'&nbsp;'+d[index].l24;
			pp.push({tr:{children:[{td:{children:[{div:{style:{'font-weight':'bold'},innerHTML:s}}]}}]}});
			pp.push({tr:{children:[{td:{align:'center',children:{'canvas':{id:id,width:760,height:300}}}}]}});
			var graph = new myGraph.instance(null, months);
			var dlg=showDynTbl(pp,null);
			graph.setCanvas(getNodeWithId(dlg,id));
			graph.clear('#848484','#f4f4f4','d','#575757', '#E5E5E5', '#DBDBDB');
			graph.setFont('bold 17px sans-serif', 15);
			graph.addLine('#ff77ff',1);
			return {dlg:dlg, graph:graph};
		},
		begOfDay=function(t){
			var tm=new Date(t);
			tm.setHours(0,0,0,0);
			return tm.getTime();
		},
		addGraph=	function(data,headLine,index,nrRobots){
			var p=prepareGraph(data,headLine,index), g=p.graph, d=data[index].arr, i = -1, ts=beginningOfDay.getTime()-43200000, t=ts, last=d[0].t, l=begOfDay(last), nowVal=data[index].now, lastIndex=d.length;
			while(d[--lastIndex].t<earliestTime){}
			var f=d[lastIndex].t;
			while(++i<lastIndex){
				var o=d[i];
				g.addPoint(o.t,o.y*24);
			}
			g.addLine('#002CBD',3);
			i=-1;
			d=data[index].data;
			if(last!==l)
				g.addPoint((last-l)/2+l,nowVal);
			while(++i<d.length){
				var o=d[i];
				g.addPoint(t,o.sum);
				t-=86400000;
			}
			if(nrRobots>1){
				t=ts;
				g.addLine('#609E96',3);
				i=-1;
				d=data[index].data;
				if(last!==l)
					g.addPoint((last-l)/2+l,nowVal/nrRobots);
				while(++i<d.length){
					var o=d[i];
					g.addPoint(t,o.sum/nrRobots);
					t-=86400000;
				}
			}
			g.setLimits(data[index].yMax, f, l);
			var info = [];
			info.push({color: "#002CBD", id:1,	isOn: true,	text:data[index].name+ ", "+farms.texts.labTotal});
			info.push({color: "#ff77ff", id:1,	isOn: true,	text:data[index].name+ ", "+farms.texts.labPerHour});
			if(nrRobots>1)
				info.push({color: "#609E96", id:0,	isOn: true,	text:farms.texts.labAllRobots});
			g.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"}, null);
			g.paint();
			return p.dlg;
		},
		showGraph=	function(d){
			if(!d.graphData){
				ajaxGetFarmGraph(d.vcGUID);
				showDynTbl({div:{innerHTML:'<nobr>'+farms.texts.labFetchData+'</nobr>'}},dynInner);
			}
			else{
				if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.firstChild);
				var s=farms.texts.labMilkingsPerDay,o=d.prodData,nRobots=0;
				o.forEach(function(oo){if(oo.type===1)nRobots++;});
				var headLine = nRobots>1 ? jr.translate('Milk production per day ($numRobots robots)', {numRobots: nRobots}) : farms.texts.labMilkingsPerDay;
				var allDlg=addGraph(o,headLine,0,nRobots);
				if(isDialog){
					isDialog=false;
					var dlg,i=0;
					dlg=initDialog(d.vcName+farms.texts.labColon+'&nbsp;'+s, [farms.texts.labBack,onCancel], null, allDlg);
					if(nRobots>1)
						while(++i<o.length)
							if(o[i].type===1)
								jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addGraph(o,o[i].name,i,1)}}});
				}
				else
					dynInner.appendChild(allDlg);
			}
		},
		onClickColumn=function(){
			var vcGUID,data=getFarm(vcGUID=this.parentNode.data.vcGUID),type=this.col;
			var status=data.status;
			if(status==1) {
				if(columnMap[type]===3) {
					if (superUser)		
						window.location='/jr-myfarm/index.html#/?id='+vcGUID;
				}
				else if(columnMap[type]===1) {
					if (superUser)		
						window.location='/Delaval/mvc/Pages/Show/supervisor?id='+vcGUID;
				}
				else if(columnMap[type]===8)
					window.location='/Delaval/mvc/Pages/Show/cleanings?id='+vcGUID;
				else if(columnMap[type]===9){
					if(!data.ddmInfo)return;
					window.location='/Delaval/mvc/Pages/Show/ver?id='+vcGUID;
				}
				else if(columnMap[type]===7)
					window.location='/Delaval/mvc/Pages/Show/a?id='+vcGUID;
				else if(columnMap[type]===11 && sonOfGod) {
					if (confirm('Are you sure you want to force a MyFarm full sync with ' + data.name + '?')) {
						jr.ajax( 'FarmAdmin', 'forceFullSync', data.vcGUID);
					}
				}
				else if(columnMap[type]===2 && superUser)
					window.location='/Delaval/mvc/Pages/Show/milkingDB?id='+vcGUID+'&name='+btoa(data.vcPreName+'.'+data.vcName);
				else if (data.hasAccess) {
					if((isDialog=(columnMap[type]===6))){
						if(data!==null)
							showGraph(data);
					}
					else if(columnMap[type]===0)
						window.location='/Delaval/mvc/Pages/Show/farm?id='+vcGUID;
					else if(columnMap[type]===5) {
						if (data.ipAddress)
							window.open('http://whatismyipaddress.com/ip/'+data.ipAddress, '_blank').focus();
					}
					else if(!cookie.isApp)
						onClickFarm(vcGUID);
				}
			}
			else if ((columnMap[type]===5 || status===3 || status===0) && data.ipAddress)
				window.open('http://whatismyipaddress.com/ip/'+data.ipAddress, '_blank').focus();
		},
		ipGeoInfo=function(d){
			var rv='';
			d=d.ipGeo;
			if(d){
				if(d.country)
					rv+='  -- '+d.country;
				if(d.region)
					rv+=', '+d.region;
			};
			return rv;
		},
		setDynamic=	function(){
			var data=getFarm(this.parentNode.parentNode.data.vcGUID),type=this.parentNode.col;
			if(data.status===0) {
				dynClient=data;
				showDynTbl({tr:{children:[{td:{align:'center',children:{div:{style:{'font-weight':'bold'},innerHTML:data.vcFullName + '  - ' + farms.texts.unActivatedVC}}}}]}},dynInner)
			} else if(columnMap[type]===0){
				showDynTbl([{tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold'},innerHTML:'<nobr>'+data.vcFullName+ipGeoInfo(data)+'</nobr>'}}]}}]}}],dynInner);
			} else if(columnMap[type]===6){
				if(data.nrCows===0)return;
				if(latestGraphGUID!==data.vcGUID&&(dynClient!==data||dynCol!==columnMap[type]))
					showGraph(dynClient=data);
				else if (latestGraphGUID==data.vcGUID){
					setDynPos();
					return;
				}
			} else if(columnMap[type]===7){
				if (data.vcBootDate)
					showVcBoot(dynClient=data);
				else
					return;
			} else if(columnMap[type]===8){
				if(data.cleaning===null)return;
				if(dynClient!==data||dynCol!==columnMap[type])
					showCleanings(dynClient=data);
				else {
					setDynPos();
					return;
				}
			} else if(columnMap[type]===9){
	//			VC version
				if(!data.ddmInfo)return;
				if(dynClient!==data||dynCol!==columnMap[type])
					showDdmInfo(dynClient=data);
				else {
					setDynPos();
					return;
				}
			} else if(columnMap[type]===11){
				if(data.vmsMode&&data.vmsMode.length&&(dynClient!==data||dynCol!==columnMap[type]))
					showRobotStateInfo(dynClient=data);
				else {
					if (data.vmsMode)
						setDynPos();
					return;
				}
			}
			dynCol=columnMap[type];
			setDynPos();
			popup=true;
			return;
		},
		setDynPos=	function(){
			var stl = dynamic.style;
			var tbl = dynamic.childNodes[0];
			var y = 21+window.event.clientY+window.pageYOffset;
			var x = window.event.clientX-tbl.clientWidth/2;
			if(y+tbl.clientHeight>window.innerHeight+window.pageYOffset){
				y=window.event.clientY-tbl.clientHeight-10+window.pageYOffset;
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
			if(x+tbl.clientWidth>window.innerWidth-30)x=window.innerWidth-tbl.clientWidth-30;
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
			if(d){
				var farm=getFarm(latestGraphGUID=d.vcGUID);
				farm.prodData=graphDataPrepare(farm.graphData=d);
				if(d.ratio)
					prepareMilkStat(d.ratio);
				if(popup){
					showGraph(farm);
					setDynPos();
				}
			}
			else
				offDynamic();
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
		ipGeo=function(d){
			d = new JsSerilz('$', d);
			this.ipAddress=	d.getString();
			this.country=	d.getString();
			this.region=	d.getString();
			this.city=		d.getString();
			this.ISP=		d.getString();
			this.ipType=	d.getString();
			this.latitude=	d.getString();
			this.longitude=	d.getString();
		},
		farmsOnLine= function(data){
			if(!data){
				if(jr.getUrlVar('redirect') != '1') {
					navigateTo('/Delaval/mvc/Pages/Show/farm?redirect=1');
				} else {
					window.alert(jr.translate("Sorry, you have no permission for this..."));
				}
				return;
			}
			var d=data.farms;
			adminUsers=data.adminUsers;
			systatUser=data.systatUser;
			superUser=data.superUser;
			userName='&nbsp;&nbsp;- ' + data.user;
			var i=-1,f;
			while(++i<d.length){
				if(!(f=d[i]).ipAddress&&f.ipGeoInfo){
					f.ipGeo=new ipGeo(f.ipGeoInfo);
					f.ipAddress=f.ipGeo.ipAddress;
				};
				if (f.status < 3) {
					f.nrRobotNotAuto=f.nrRobot=0;
					if(f.vmsMode)
						f.vmsMode.forEach(function(m){
							f.nrRobot++;
							if(m.state!=2)
								f.nrRobotNotAuto++;
						});
					f.name=(d.length>1?(f.vcPreName.length?(f.vcPreName.length>3?f.vcPreName.substring(0,3):f.vcPreName)+'.':''):'')+f.vcName;
					f.state=(f.offLineTimeSec==null||f.offLineTimeSec>120)?1:0;
					f.nrCows=!f.nrCows?0:parseInt(f.nrCows);
					f.nrRedCows=!f.nrRedCows?0:parseInt(f.nrRedCows);
					f.nrYellowCows=!f.nrYellowCows?0:parseInt(f.nrYellowCows);
					f.nrWhiteCows=!f.nrWhiteCows?0:parseInt(f.nrWhiteCows);
					f.vcVersion=!f.vcVersion?0:f.vcVersion.substr(7);
					f.milkingCows=!f.nrRedCows?0:f.nrRedCows+f.nrYellowCows+f.nrWhiteCows;
					f.cleaning=analyzeCleaning(f.nrCleaingsLast24);
					f.active=f.status===1;
					if(f.nrCleaingsLast24)
						f.nrCleaingsLast24.sort(function( o1, o2 ) {
							return o1.vmsName.localeCompare( o2.vmsName );
						});
				}
				else
					f.name=f.vcGUID + ' - ' + f.vcName;
			}
			d.sort(sort);
			allFarms=d;
			timeDiff=new Date().getTime()-data.serverTime;
			i=-1;
			while(++i<d.length)
				d[i]['index']=i;
			render(myDiv);
			if(data.backgroundColor) {
				$('div.styleBackground').css('backgroundColor',data.backgroundColor);
				$('div.styleBackground').css('background','-webkit-gradient(linear,0 0,0 100%,from('+data.backgroundColor+'),to('+data.backgroundColor+'))');
			}
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
			showImages();
			if(showMenu)
				renderMenu();
		},
		sortMenu=function(o1,o2){return o1.name.localeCompare(o2.name);},
		onSelectMenu=function(){
			var item=getMenuObject(this.selectedIndex);
			this.selectedIndex=-1;
			if (item.empty) {
				// do nothing!
			} else if(!item.cmd&&!item.id){	//logout
				logoutSessCookie();
				location.reload();
			} else if (item.cmd) {
				navigateTo(item.cmd);
			} else {
				navigateTo('/Delaval/mvc/Pages/Show/farm?id='+item.id);
			}
		},
		getMenuObject=function(index){
			var i=-1;
			for(var o in menu) {
				o=menu[o];
				if(o.optgroup) {
					for(var o2 in o.optgroup.data) {
						if(++i===index) {
							return o.optgroup.data[o2];
						}
					}
				} else {
					if(++i===index) {
						return o;
					}
				}
			}
		},
		getMenuLength=function(){
			var i=-1;
			for(var o in menu) {
				o=menu[o];
				if(o.optgroup) {
					for(var o2 in o.optgroup.data) {
						i++;
					}
				} else {
					i++;
				}
			}
			return i;
		},
		renderMenu=function() {
			if(allFarms){
				var data=[];
				jr.foreach(allFarms, function(o) {
					if(o.status!==0&&o.hasAccess) {
						data.push({name:o.vcName,id:o.vcGUID})
					}
				});
				data.sort(sortMenu);
				menu=[];
				settings=[];
				var myfarms=[];
				var isAndroidKitKat = navigator.userAgent.match('Android 4\.4.*Chrome/30.0.0.0') !== null;
				if(isAndroidKitKat) {
					settings = menu;
					myfarms = menu;
				}	
//				settings.push({name:farms.texts.mySettings,cmd:'/Delaval/mvc/Pages/Show/jr-myfarm#/settings'});
				settings.push({name:farms.texts.mySettings,cmd:'/Delaval/mvc/Pages/Show/setup'});
				if(adminUsers && !cookie.isApp)
					settings.push({name:farms.texts.adminUsers,cmd:'/Delaval/mvc/Pages/Show/domain'});
				if(systatUser)
					settings.push({name:farms.texts.status,cmd:'/Delaval/mvc/Pages/Show/systat'});
				settings.push({name:farms.texts.logout});
				if(isAndroidKitKat) {
					myfarms.push({name:'',empty:true});
				}
				myfarms.push({name:farms.texts.overview,cmd:'/Delaval/mvc/Pages/Show/FarmSmall',selected:true});
				jr.foreach(data, function(o) {
					myfarms.push(o)
				});
				if(!isAndroidKitKat) {
					menu.push( { optgroup: {name: farms.texts.settings.toUpperCase(), data: settings } } );
					menu.push( { optgroup: {name: farms.texts.farms.toUpperCase(), data: myfarms } } );
				}
				l = getMenuLength();
				jr.ec(ce['menuSelect'], {children: [
					{'select': {contextIdentity: 'sel', className: 'menu', onchange: onSelectMenu, children: function(p){
						var i=-1;
						jr.foreach( menu, function(o) {
							if(o.optgroup) {
								jr.ec('optgroup', {parentNode:p, label:o.optgroup.name, children: function(p){
									jr.foreach(o.optgroup.data, function(o) {
										jr.ec('option', {parentNode:p, id:'menu'+i, text:o.name, selected:o.selected, contextIdentity: 'menu'+i});
									}, ce);
								}});
							} else
								jr.ec('option', {parentNode:p, id:'menu'+i, text:o.name, selected:o.selected, contextIdentity: 'menu'+i}, ce);
						} ); }}}
				]}, ce);
			}
		},
		onClickFarm= function(vcGUID){
			window.location='/i.vcx?id='+vcGUID+'&'+encodeURIComponent('page=/Delaval/mvc/Pages/Show/FarmSmall');
		},
		updateSort=	function(){
			var i=-1;
			while(++i<columnMap.length)
				document.getElementById('col'+i).className='container styleRubber hdrHeight '+(i===sortCol?'headchoosen':'headlabel');
		},
		onSortCol= function(){
			var i=-1,oldCol=sortCol;
			while(++i<columnMap.length)
				if('col'+i===this.id){
					sortCol=i;
					break;
				}
			if(sortCol===oldCol)
				sortDir*=-1;
			else
				sortDir=1;
			allFarms.sort(sort);
			render(myDiv);
			setPercent();
			updateSort();
//			ajaxGetFarmsOnline();
		},
		sort= function(o1,o2) {
			if(columnMap[sortCol]===1){
				if(o2.state===o1.state&&o1.offLineTimeSec!=null&&o2.offLineTimeSec!=null)
					return sortDir*(o2.offLineTimeSec-o1.offLineTimeSec);
				else if((o1.state<3)^(o2.state<3))
					return o1.state<3 ? -1 : 1;
				else if ((o1.offLineTimeSec!=null)^(o2.offLineTimeSec!=null))
					return o1.offLineTimeSec!=null ? -1 : 1;
				else
					return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
			}
			if(o1.state<3&&o2.state<3) {
				switch(columnMap[sortCol]){
					case  0:return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
					case  2:return o1.state===o2.state?sortDir*(o2.nrCows-o1.nrCows):o2.state?-1000:1000;
					case  3:return o1.state===o2.state?sortDir*(o2.nrRedCows-o1.nrRedCows):o2.state?-1000:1000;
					case  4:return o1.state===o2.state?sortDir*(o2.nrYellowCows-o1.nrYellowCows):o2.state?-1000:1000;
					case  5:return o1.state===o2.state?sortDir*(o2.nrWhiteCows-o1.nrWhiteCows):o2.state?-1000:1000;
					case  6:return o1.state===o2.state?sortDir*(o2.nrRedCows/o2.milkingCows-o1.nrRedCows/o1.milkingCows):o2.state?-1000:1000;
					case  7:return sortDir*(o1.nrFatalAlarms===o2.nrFatalAlarms?(o1.nrUserNotAlarms===o2.nrUserNotAlarms?o1.vcName.toLowerCase().localeCompare(o2.vcName.toLowerCase()):o2.nrUserNotAlarms-o1.nrUserNotAlarms):o2.nrFatalAlarms-o1.nrFatalAlarms);
					case  8:return sortDir*(o1.cleaning-o2.cleaning);
					case  9:return sortDir*(o1.vcVersion&&o2.vcVersion?(o2.vcVersion.localeCompare(o1.vcVersion)>0?1:-1):o1.vcVersion?-1000:1000);
					case 10:return sortDir*(o2.nrCharReceived-o1.nrCharReceived);
					case 11:return sortDir*(o2.nrRobotNotAuto===o1.nrRobotNotAuto?o2.nrCows-o1.nrCows:o2.nrRobotNotAuto-o1.nrRobotNotAuto);
				}
				return sortDir*(o1.state===2||o2.state===2?o1.state-o2.state:o1.state-o2.state);
			}
			else if (o1.status===3&&o2.status===3)
				if (columnMap[sortCol] === 0)
					return sortDir*(o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()));
				else if (columnMap[sortCol] === 8){
					var v1=o1.ipGeo&&o1.ipGeo.country?o1.ipGeo.country:'',v2=o2.ipGeo&&o2.ipGeo.country?o2.ipGeo.country:'';
					return sortDir*(v1.toLowerCase().localeCompare(v2.toLowerCase()));
				}
				else
					return sortDir*(o1.ipAddress.localeCompare(o2.ipAddress));
			else
				return o1.status===3 ? 1 : -1;
		},
		getVal=	function(data,col){
			switch(columnMap[col]){
				case -1:return null;
				case  0:return data.name.length > 25 && data.status !== 3 ? data.name.substr(0,23)+'...' : data.name;
				case  1:
					var lastPoll = data.lastPollByVC, lastEvent = data.lastAccessedByVC;
					
					
					
					return data.offLineTimeSec!=null?'<nobr>'+hr2(data.lastAccessedByVC)+(data.lastPollByVC!=null&&(data.lastPollByVC<0)?' ('+(-data.lastPollByVC)+' s)':'')+'</nobr>':'&nbsp;';
				case  2:return data.nrCows?data.nrCows:'&nbsp;';
				case  3:return data.nrCows?data.nrRedCows.toString():'&nbsp;';
				case  4:return data.nrCows?data.nrYellowCows.toString():'&nbsp;';
				case  5:return data.nrCows?data.nrWhiteCows.toString():'&nbsp;';
				case  6:return data.status===3?data.ipAddress:data.nrCows?'<canvas id="RYW'+data.index+'" width="'+(canvasWidth+2)+'px" height="'+(canvasHeight+2)+'px">':'&nbsp;';
				case  7:return data.nrFatalAlarms+data.nrUserNotAlarms>0?
					data.nrFatalAlarms>0&&data.nrUserNotAlarms>0?data.nrFatalAlarms+'+'+data.nrUserNotAlarms:(data.nrFatalAlarms+data.nrUserNotAlarms).toString():'&nbsp;';
				case  8:return data.status===3?data.ipGeo&&data.ipGeo.country?data.ipGeo.country:'&nbsp;':data.cleaning?data.cleaning:'&nbsp;';
				case  9:return data.vcVersion?data.vcVersion:'&nbsp;';
				case 10:return data.nrCharReceived?data.nrCharReceived:'&nbsp;';
				case 11:return data.nrRobotNotAuto?data.nrRobotNotAuto+' ('+data.nrRobot+')':'&nbsp;';
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
				var d=allFarms[i],t=d.nrCows,green=t-d.nrRedCows-d.nrYellowCows-d.nrWhiteCows,tr=document.getElementById('row'+i),ii;
				if(d.nrCows>0){
					var ctx=document.getElementById('RYW'+d.index).getContext("2d");
					ctx.fillRect(0,0,canvasWidth+2,canvasHeight+2);
					fillRect(ctx,fillRect(ctx,fillRect(ctx,fillRect(ctx,0,t,d.nrRedCows,"#ff1010"),t,d.nrYellowCows,"#ffff00"),t,d.nrWhiteCows,"#ffffff"),t,green,"#008000");
				}
				ii=-1;
				while(++ii<columnMap.length){
					var styleOk='styleWhite';
					if(columnMap[ii]===7&&!d.state&&(d.nrFatalAlarms+d.nrUserNotAlarms)>0)
						styleOk=d.nrFatalAlarms>0?'styleRed':'styleBlue';
					if(columnMap[ii]===8)
						styleOk=getCleaningsStyle(d.cleaning,styleOk);
					var colorStyle = styleOk;
					if(new Date(d.offlineUntil) > new Date()) {
						// should be offline
						colorStyle = 'styleGrey';
					} else {
						if(d.state === 1) {
							// has been offline for more then 2 minutes
							colorStyle = 'styleOrange';
						}
						if(d.status!==1) {
							// not activated
							colorStyle = 'styleLightBlue';
						}
						if (d.status===3) {
							colorStyle = d.vcGUID!=null && d.vcGUID.length === 0 ? 'styleRed' : 'styleYellow';
						}
						else if(!d.hasLicense) {
							colorStyle = 'styleRed';
						}
					}
					tr.children[ii].children[0].className='container '+colorStyle;
				}
			}
		},
		onClickUpdate=function() {
			ajaxGetFarmsOnline();
		},
		ajaxGetFarmGraph= function(vcGuid) {jr.ajax( 'SrvMyFarm', 'getFarmMilkStat', vcGuid, 'getFarmMilkStat', null, null, ajaxError );},
		ajaxGetFarmsOnline= function() {
			jr.ajax( 'FarmAdmin', 'getFarmsOnline', farmQuery, 'getFarmsOnline', null, null, ajaxError );
		},
		onAuto= function(d){
			if(!timer){
//				autoTime=d.offsetY>22?5000:120000;
				autoTime=60000;
				timer=setTimeout(ajaxGetFarmsOnline,autoTime);
				if(root)
					ajaxGetFarmsOnline();
			}
		},
		showStatus=function(){
			navigateTo('/Delaval/mvc/Pages/Show/systat');
		},
		showImages=function(){
			if(!logoImageDisplayed) {
				logoImageDisplayed=true;
				var logoCanvas = jr.ec('canvas',{parentNode:ce['logo'], className: 'logo', width:120, height:23, onclick:systatUser?showStatus:null});
				var ctx=logoCanvas.getContext("2d");
				ctx.drawImage(imgIcons,1,925,120,23,0,0,120,23);
				var menuCanvas = jr.ec('canvas',{parentNode:ce['menuImage'], className: 'menuImage', width:38, height:40});
				ctx=menuCanvas.getContext("2d");
				ctx.drawImage(imgIcons,1,949,38,40,0,0,38,40);
			}
		},
		render=function(container){
			if(root)container.removeChild(root);
			logoImageDisplayed = false;
			var hd=[],vl=[],cl,i=-1,ii=-1;
			while(++i<columnMap.length)
				hd.push({td:{children:{div:{style:{height:'37px'},onclick:onSortCol,id:'col'+i,actions:{translate:{innerHTML:columns[columnMap[i]]}}}}}});
			var btn=!autoTime?{span:{style: showMenu?{position: 'absolute', top: '15px'}:{}, children:{'button':{style:{'font-size':'large',padding:'5px'},ondblclick:onAuto,onclick:onClickUpdate,innerHTML:jr.translate('Refresh')}}}}:{'span':{style: {position: 'absolute', top: '15px'}, className:'topHeading',actions:{translate:{innerHTML:'Auto'}}}};
			vl.push({'tr':{className:'container',children:[
						{'td':{width:'95%',colSpan:columnMap.length-2,className:'topHeading',children:[
							{'span': { contextIdentity: 'logo', className: 'logo'} },
							{'span': {innerHTML:farms.texts.labFarmsOnline+userName}},
							{'span': { contextIdentity: 'comErr', className: 'comErrDiv' } },
						]}},
						{'td':{colSpan:2,children:[
							btn,
							{ 'span': { contextIdentity: 'menu', className: 'menu', children: [
								{ 'div': { contextIdentity: 'menuImage', className: 'menuImage'} },
								{ 'div': { contextIdentity: 'menuSelect', className: 'menuSelect'} }
							] } }
						]}}
					]}});
			vl.push({'tr':{className:'container',children:hd}});
			while(++ii<allFarms.length){
				cl=new Array();
				i=-1;
				while(++i<columnMap.length){
					var stl=cookie.isApp?{height:'22px','text-align':!i?'left':'right','font-size':'x-large'}:{height:'22px','text-align':!i?'left':'right'},acc=allFarms[ii].hasAccess,nptr=!acc&&!(columnMap[i]===7||columnMap[i]===8||columnMap[i]===9);
					var gui,text=getVal(allFarms[ii],i);
					if(nptr){
						stl.cursor='default';
						stl.color='rgb(90,90,90)';
					}
					if(allFarms[ii].status!==0) {
						gui=(columnMap[i]===6&&!isMobile&&acc)||columnMap[i]===0||columnMap[i]===7||columnMap[i]===8||columnMap[i]===9||columnMap[i]===11?{onmousemove:setDynamic,onmouseover:setDynamic,onmouseout:offDynamic,style:stl,innerHTML:i==0?'<b>'+text+'</b>':getVal(allFarms[ii],i)}:{style:stl,innerHTML:text};
					} else {
						gui={style:stl,innerHTML:'<nobr>'+text+'</nobr>'};
					}
					var stl2=cookie.isApp?{'padding-bottom':'4px'}:{};
					cl.push({'td':{style:stl2,onclick:onClickColumn,width:columnMap[i]===0?'10%':'1%',col:i,children:{div:gui}}});
				}
				vl.push({'tr':{id:'row'+ii,data:allFarms[ii],children:cl}});
			}
			root=jr.ec('div',{parentNode:container,className:'styleBackground',style:{width:(width==null?null:width)}, children:{'div':{className:'background',children:{'table':{className:'styleTable',children:vl}}}}}, ce);
		},
		dynDivs={};
		this.show=function(farmQueryString){
			farmQuery=farmQueryString&&farmQueryString.length?farmQueryString.substr(1):null;
			ajaxGetFarmsOnline();
		};
		this.hasMenu=function() {
			showMenu=true;
		}
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
		if(cookie.isApp) {
			document.body.style.width=null;
		}
		imgIcons=jr.getImage('/Resources/info6.png');
		months = jr.translate('January February March April May June July August September October November December');
	}
};
