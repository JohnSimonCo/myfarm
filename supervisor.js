jr.include('/cli.css');
jr.include('/simpleGraph.js');
jr.include('/util.js');
jr.include('/buttons.css');
jr.include('/common.css');
jr.include('/Resources/info6.png');
var supervisor = {
	init: function() {
		supervisor.texts = {
		};
	},
	instance:	function(){
		var 
		ce={},
		root,
		head,
		allProc = null,
		allTrans,
		imgIcons=new Image(),
		colNames,
		dynamic,
		dynDivs,
		dynInner,
		sortCol=0,
		canvasWidth=160,
		canvasHeight=14,
		lastTransIndex=-1,
		lastTransData,
		infoLabel='',
		beginTime,
		vcId,
		days=0,
		farms,
		farmsIndex,
		dayIndex,
		showImages=function(){
			var menuCanvas = jr.ec('canvas',{parentNode:ce['menuImage'], className: 'menuImage', width:38, height:40});
			ctx=menuCanvas.getContext("2d");
			ctx.drawImage(imgIcons,1,949,38,40,0,0,38,40);
		},
		event=function(sd, indexSize, columnSize) {
			this.time = new Date(sd.getInt());
			this.averageLoad = sd.getString();
			this.data = [];	// First index is belongs to superviseNames index
			this.transInd = -1;
			var i = -1;
			while (++i < indexSize) {
				var d = this.data[i] = [], j = -1;
				while (++j < columnSize)
					d.push(sd.getString());
				if (i == 0)
					this.mem = parseInt(d[0])*1000;
			}
		},
		superviseColumn = function(sd) {
			this.name = sd.getString();
			this.columnType = sd.getString();
		},
		supervisorProc=function(sd, count) {
			var namesLen = sd.getInt(), colLen = sd.getInt();
			this.events = [];
			this.superviseNames = [];
			this.superviseColumns = [];
			var i = -1;
			while (++i < namesLen)
				this.superviseNames.push(sd.getString());
			i = -1;
			while (++i < colLen)
				this.superviseColumns.push(new superviseColumn(sd));
			i = -1;
			while (++i < count)
				this.events.push(new event(sd, this.superviseNames.length, this.superviseColumns.length));
		},
		trans=function(sd) {
			this.transCount = sd.getInt();
			this.transTotalTimeMs = sd.getInt();
			this.transMaxTimeMs = sd.getInt();
		}
		supervisorTrans=function(sd, count) {
			this.time = new Date(sd.getInt());
			this.periodTimeMs = sd.getInt();
			this.transInfo = {};
			while (--count >= 0) {
				var key = sd.getString();
				this.transInfo[key] = new trans(sd);
			}
		},
		pack=function(data) {
			allProc={};
			allProc.columns=data[0].superviseColumns;
			allProc.procNames=data[0].superviseNames;
			allProc.events=[];
			var lastTime = 0;
			data.forEach(function(entry) {
				entry.events.forEach(function(o){
					if (o.time > lastTime) {
						allProc.events.push(o);
						lastTime = o.time.getTime();
					}
				});
			});
			var it = 0, ip = -1, t;
			while (++ip < allProc.events.length && it < allTrans.length) {
				var time = allProc.events[ip].time, found = false;
				while (!found && it < allTrans.length) {
					var tTo = allTrans[it].time, tFrom = new Date(tTo.getTime() - allTrans[it].periodTimeMs);
					if (time.getTime() < tFrom.getTime())
						break;
					if (tTo.getTime() < (time.getTime() - 30000))
						it++;
					found = ((t=time.getTime()) >= tFrom.getTime() && (t <= tTo.getTime()))
							|| (t-30000 >= tFrom.getTime() && t-30000 <= tTo.getTime())
							|| (t > tTo.getTime() && (t-30000 < tFrom.getTime()));
				}
				if (it < allTrans.length)
					 allProc.events[ip].transInd = it;
			}
			allProc.events.reverse();
			
		},
		supervisorData=function(arr) {
			if (!arr || !arr.length) {
				showInfo('No permission or no data from this date');
				return;
			}
			showInfo('Deserializing data...');
			var cnt = arr.length, i = -1, supProc=[], currProc, currTrans;
			allTrans=[];
			var lastLog = null;
			while (++i < cnt) {
				var sd = new JsSerilz('$', arr[i]), procCount = sd.getInt();
				currProc = null;
				if (procCount)
					supProc.push(currProc = new supervisorProc(sd, procCount));
				var transCount=sd.getInt();
				if (transCount) {
					allTrans.push(currTrans=new supervisorTrans(sd, transCount));
					var logInfo = currTrans.transInfo['Log'];
					if (logInfo) {
						logInfo.id = logInfo.transCount;
						logInfo.byteCount = logInfo.transMaxTimeMs;
						logInfo.lastLog = lastLog;
						if (lastLog)
							lastLog.nextLog = logInfo;
						lastLog = logInfo;
					}
					if (currProc)
						currTrans.procData = currProc;
				}
			}
			if (!supProc.length)
				for (var tr in allTrans){
					var eve = [];
					eve.push({time:allTrans[tr].time,averageLoad:0,data:[],transInd:-1});
					supProc.push({events:eve,superviseNames:[],superviseColumns:[]});
			}
			pack(supProc);
			showInfo('Creating table...');
			setTimeout(function(){ render(); }, 10);
		},
		onSortCol=function(){
			
		},
		updateSort=	function(){
			var i=-1;
			while(++i<colNames.length)
				document.getElementById('col'+i).className='container styleRubber hdrHeight '+(i===sortCol?'headchoosen':'headlabel');
		},
		fillRect= function(ctx,from,total,curr,fillStyle){
			curr=Math.floor((canvasWidth+1)*curr/total+1);
			if(curr>0){
				ctx.fillStyle=fillStyle;
				ctx.fillRect(from+1,1,curr-1,canvasHeight);
			}
			return from+curr;
		},
		setPercent= function() {
			var i=-1;
			while(++i<allProc.events.length){
				var d=allProc.events[i],ctx=document.getElementById('RYW'+i),pc;
				if (ctx) {
					ctx = ctx.getContext("2d");
					pc=d.data[0][2];
					pc=parseFloat(pc);
					var col=pc>40?"#ff1010":pc>10?"#FFFF00":"#008000";
					ctx.fillStyle="#f0f0f0";
					ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
					fillRect(ctx,0,100,pc,col);
					ctx=document.getElementById('LOD'+i).getContext("2d");
					pc = parseFloat(d.averageLoad.substr(0,4));
					var col=pc>1?"#ff1010":pc>0.5?"#FFFF00":"#008000";
					ctx.fillStyle="#f0f0f0";
					ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
					fillRect(ctx,0,5,pc,col);
				}
				ctx=document.getElementById('SVC'+i).getContext("2d");
				ctx.fillStyle="#f0f0f0";
				ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
				if ((pc=d.responseMax) > 0) {
					var col=pc>10000?"#ff1010":pc>2000?"#FFFF00":"#008000";
					fillRect(ctx,0,25000,pc,col);
				}
				ctx=document.getElementById('TRS'+i).getContext("2d");
				ctx.fillStyle="#f0f0f0";
				ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
				if ((pc=d.lockCacheMax) > 0) {
					var col=pc>5000?"#ff1010":pc>1500?"#FFFF00":"#008000";
					fillRect(ctx,0,25000,pc,col);
				}
				ctx=document.getElementById('TRW'+i).getContext("2d");
				ctx.fillStyle="#f0f0f0";
				ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
				if ((pc=d.waitCacheMax) > 0) {
					var col=pc>5000?"#ff1010":pc>1500?"#FFFF00":"#008000";
					fillRect(ctx,0,25000,pc,col);
				}
				ctx=document.getElementById('MEM'+i).getContext("2d");
				ctx.fillStyle="#f0f0f0";
				ctx.fillRect(1,1,canvasWidth-1,canvasHeight-1);
				if ((pc=d.memInfo) > 0) {
					var col=pc>80?"#ff1010":pc>60?"#FFFF80":"#66B366";
					fillRect(ctx,0,100,pc,col);
				}
			}
			hideTrans();
		},
		clearDynPos=function(){
			var stl = dynamic.style;
			var tbl = dynamic.childNodes[0];
			var y = window.pageYOffset+10;
			var x = 10;
			stl.left = ""+x+"px";
			stl.top = ""+y+"px";
		},
		setDynPos=	function(){
			var stl = dynamic.style;
			var tbl = dynamic.childNodes[0];
			var y = window.event.clientY+window.pageYOffset-tbl.clientHeight/2;
			var x = window.event.clientX+10;
			if(y-window.pageYOffset+tbl.clientHeight>window.innerHeight)
				y=window.pageYOffset+window.innerHeight-tbl.clientHeight;
			if(y<window.pageYOffset)
				y=window.pageYOffset;
			if(x+tbl.clientWidth>window.innerWidth-30)x=window.innerWidth-tbl.clientWidth-30;
			if(x<0)x=0;
			stl.left = ""+x+"px";
			stl.top = ""+y+"px";
			showDynamic(true);
		},
		showDynTbl=	function(d,parent,style){
			var rVal=null;
			if(parent)
				if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.childNodes[0]);
			rVal=jr.ec('table',{border:style?1:0,style:style,className:'tblOrd',children:[{tr:{children:[{td:{styele:{padding:0},align:'center',children:[{div:{children:d}}]}}]}}]});
			if(parent)
				parent.appendChild(rVal);
			return rVal;
		},
		showDynamic=function(show){if(!show){infoLabel='';clearDynPos();};dynamic.style.visibility=show?"visible":"hidden";},
		displayTrans=function(pp, arr) {
			arr.sort(function(o1,o2){
				return o1.name.localeCompare(o2.name);
			});
			arr.forEach(function(o){
				var style=o.name==='Log'||o.name==='Memory'?{'background-color':'rgb(255,239,213)'}:o.max>10000?{'background-color':'red','color':'white'}:o.max>1000?{'background-color':'yellow'}:{};
				pp.push({tr:{style:style,children:[
							{td:{align:'left',children:{div:{innerHTML:'<nobr>'+o.name+'</nobr>'}}}},
							{td:{align:'right',children:{div:{innerHTML:o.aver}}}},
							{td:{align:'right',children:{div:{innerHTML:o.averMmax}}}},
							{td:{align:'right',children:{div:{innerHTML:o.max.toLocaleString()}}}},
							{td:{align:'right',children:{div:{innerHTML:o.total.toLocaleString()}}}},
							{td:{align:'right',children:{div:{innerHTML:o.totPercent.toLocaleString()}}}},
							{td:{align:'right',children:{div:{innerHTML:o.cnt}}}}
						]}});
			});
		},
		showTrans=function() {
			var index = this.parentNode.parentNode.myIndex;
			if (lastTransIndex !== index) {
				lastTransIndex = index;
				var d=allTrans[allProc.events[index].transInd];
				var timeTo = d.time, timeFrom = new Date(timeTo.getTime() - d.periodTimeMs);
				lastTransData = '<nobr>Time period: '+ timeFrom.printhms() + ' - ' + timeTo.printhms() + ' (time in ms)</nobr><br/>';
				var pp=[],head,ti=[];
				pp.push({tr:{children:[{td:{align:'center',colSpan:7,children:[{div:{style:{'font-weight':'bold'},innerHTML:lastTransData}}]}}]}});
				pp.push(head={tr:{children:[
							{td:{align:'left',children:{div:{innerHTML:'Transaction'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Average time'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Average '+ '<nobr>without max</nobr>'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Max time'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Total time'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Total %'}}}},
							{td:{align:'center',children:{div:{innerHTML:'Nr trans'}}}}
						]}});
				var a='a'.charCodeAt(0);
				for(var r in d.transInfo)
					if (r.charCodeAt(0) < a) {
						var o=d.transInfo[r],aver=Math.round(o.transTotalTimeMs/o.transCount);
						if (r==='Log'){
							var prev=o,next=o,curr=o.transCount,arr=[];
							arr.push(prev.transCount);
							prev=prev.lastLog&&prev.lastLog.transCount<curr?prev.lastLog:prev;
							arr.push(prev.transCount);
							curr=prev.transCount;
							prev=prev.lastLog&&prev.lastLog.transCount<curr?prev.lastLog:prev;
							arr.push(prev.transCount);
							next=next.nextLog?next.nextLog:next;
							arr.push(next.transCount);
							o.ids=[arr[2],arr[1],arr[0],arr[3]];
							aver=next.transMaxTimeMs - prev.transMaxTimeMs;
						}
						ti.push({name:r,total:o.transTotalTimeMs,totPercent:Math.round(o.transTotalTimeMs/d.periodTimeMs*100),max:o.transMaxTimeMs,cnt:o.transCount.toLocaleString(),aver:aver.toLocaleString(),averMmax:o.transCount>1?Math.round((aver*o.transCount-o.transMaxTimeMs)/(o.transCount-1)).toLocaleString():''});
					}
				if (ti.length > 0) {
					lastTransData = '<nobr>Vc internal</nobr><br/>';
					pp.push({tr:{children:[{td:{align:'center',colSpan:7,children:[{div:{style:{'font-weight':'bold'},innerHTML:lastTransData}}]}}]}});
					displayTrans(pp,ti);
					ti=[];
				}
				for(var r in d.transInfo)
					if (r.charCodeAt(0) >= a) {
						var o=d.transInfo[r];
						aver=Math.round(o.transTotalTimeMs/o.transCount);
						ti.push({name:r,total:o.transTotalTimeMs,totPercent:Math.round(o.transTotalTimeMs/d.periodTimeMs*100),max:o.transMaxTimeMs.toLocaleString(),cnt:o.transCount.toLocaleString(),aver:aver.toLocaleString(),averMmax:o.transCount>1?Math.round((aver*o.transCount-o.transMaxTimeMs)/(o.transCount-1)).toLocaleString():''});
					}
				if (ti.length > 0) {
					lastTransData = '<nobr>MyFarm interaction</nobr><br/>';
					pp.push({tr:{children:[{td:{align:'center',colSpan:7,children:[{div:{style:{'font-weight':'bold'},innerHTML:lastTransData}}]}}]}});
					displayTrans(pp,ti);
				}
				lastTransData = pp;
			}
			showDynTbl(lastTransData,dynInner,{'border-collapse':'collapse','font-size':'xx-small'});
			setDynPos();
		},
		hideTrans=function() {
			showDynamic(false);
		},
		onSelectMenu=function(){
			farms[farmsIndex].selected=0;
			var item=farms[farmsIndex=this.selectedIndex];
			item.selected=1;
			vcId = item.id;
			this.selectedIndex=-1;
			getDays();
		},
		renderMenu=function() {
			if(farms){
				jr.ec(ce['menuSelect'], {children: [
					{'select': {contextIdentity: 'sel', className: 'menu', onchange: onSelectMenu, children: function(p){
						var i=-1;
						jr.foreach( farms, function(o) {
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
		gotLogs=function(logs) {
			alert('Got Logs');
		},
		getLogs=function() {
			var index = this.parentNode.parentNode.myIndex;
			var d=allTrans[allProc.events[index].transInd];
			jr.ajax('SrvVersion', 'getLogsFromVc', {vcId:vcId, date:d.time.getTime(), ids:d.transInfo['Log'].ids, modules:1});
		},
		refresh=function() {
			getData();
		},
		back=function(){
			window.history.back();
		},
		oldLogFiles=function() {
			jr.ajax('SrvVersion', 'getOldLogsFromVc', vcId);
		},
		switchLogFile=function() {
			jr.ajax('SrvVersion', 'switchLogFileInVc', vcId);
		},
		render=function(){
			var ctp=-1;
			colNames=['Time','Max respons time ms','Milk','Max cache lock time ms','Max cache wait time ms','Limousine mem %','Average load'];
			if (allProc)
				allProc.procNames.forEach(function(name){
//					var i=-1;
//					while (++i < allProc.columns.length)
					var i=0;
						colNames.push((i === 0 ? name : '&nbsp') + '<br/>' + allProc.columns[allProc.columns.length - i - 1].name);
				});
			var hd=[],vl=[],vh=[],i=-1;
			while(++i<colNames.length)
				hd.push({td:{children:{div:{style:{height:'23px','text-align':'center'},onclick:onSortCol,id:'col'+i,innerHTML:colNames[i]}}}});
			var btn={},thisDay = days[dayIndex];
			
			vh.push({'tr':{className:'container',children:[
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {src: jr.getResource('../Resources/logo.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {onclick:back, style:dayIndex?{cursor:'pointer'}:{}, src: jr.getResource('../Resources/arrow_white.png') } }	
						]}},
						{'td':{width:'40%',align:'left',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',style:{'font-size':'small'},children:[
							{'span': {innerHTML:'<nobr>vc load at&nbsp;</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading',style:{'font-size':'xx-large'},children:[
							{'span': {innerHTML:'<nobr>' + farms[farmsIndex].name + '</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading',style:{'font-size':'small'},children:[
							{'span': {innerHTML:'<nobr>&nbsp;during date </nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading',children:[
							{ 'img': {onclick:prevDay, style:dayIndex?{cursor:'pointer'}:{}, src: jr.getResource('../Resources/arrowleft'+ (dayIndex ? '' : 'Disabled') + '.png') } }	
						]}},
						{'td':{width:'2%',className:'topHeading',children:[
							{'span': {innerHTML:"<nobr>" + thisDay.printdate() + '</nobr>'}}
						]}},
						dayIndex===days.length - 1 ? {'td':{width:'1%',className:'topHeading',children:[
							{ 'img': {onclick:refresh, style:{cursor:'pointer'}, src: jr.getResource('../Resources/reload-05.png') } }	
						]}} : {},
						{'td':{width:'1%',className:'topHeading',children:[
							{ 'img': {onclick:nextDay, style:dayIndex < days.length - 1?{cursor:'pointer'}:{}, src: jr.getResource('../Resources/arrowright'+ (dayIndex === days.length - 1 ? 'Disabled' : '') + '.png') } }	
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{assignments:{type:'button',className:'button',value:jr.translate("View old log files"),onclick:oldLogFiles}}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{assignments:{type:'button',className:'button',value:jr.translate("Switch log file"),onclick:switchLogFile}}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'48%',children:[
							btn,
							{ 'span': { contextIdentity: 'menu', className: 'menu', children: [
								{ 'div': { contextIdentity: 'menuImage', className: 'menuImage'} },
								{ 'div': { contextIdentity: 'menuSelect', className: 'menuSelect'} }
							] } }
						]}}
					]}});
			vl.push({'tr':{className:'container',children:hd}});
			var stl={height:'22px','text-align':!i?'left':'right'};
			if(false){
				stl.cursor='default';
				stl.color='rgb(90,90,90)';
			}
			var rowIndex=-1,lastTransInd=-1;
			if (allProc)
				allProc.events.forEach(function(d){
					var gui={style:stl,innerHTML:'<nobr>'+d.time.printhms()+'</nobr>'} ,trans=null, responseMax = -1, lockCacheMax = -1, waitCacheMax = -1, nrMilkings = 0, v, sameTrans = lastTransInd === d.transInd, fCol = sameTrans ? '9E9E9E' : '000000';
					lastTransInd = d.transInd;
					++rowIndex;
					if (d.transInd >= 0) {
						trans = allTrans[d.transInd].transInfo;
						for (var k in trans) {
							if (k.indexOf('SvcRsp') === 0) {
								v = trans[k].transMaxTimeMs;
								if (v > responseMax)
									responseMax = v;
							}
							if (k.indexOf('LockCache') === 0) {
								v = trans[k].transMaxTimeMs;
								if (v > lockCacheMax)
									lockCacheMax = v;
							}
							else if (k.indexOf('WaitCache') === 0) {
								v = trans[k].transMaxTimeMs;
								if (v > waitCacheMax)
									waitCacheMax = v;
							}
							else if (k.indexOf('Milking_') === 0)
								nrMilkings++;
						}
					}
					hd=[];
					hd.push({'td':{style:'4px',col:i,children:{div:gui}}});
					d.responseMax = responseMax;
					d.lockCacheMax = lockCacheMax;
					d.waitCacheMax = waitCacheMax;
					d.nrMilkings = nrMilkings;
					gui={onclick:getLogs,onmousemove:showTrans,onmouseover:showTrans,onmouseout:hideTrans,style:{'text-align':'right',cursor:'pointer'},innerHTML:'<nobr><font color="#'+fCol+'">&nbsp;'+(responseMax>0?responseMax:'')+'</font>&nbsp;<canvas id="SVC'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{col:i,children:{div:gui}}});
					gui={onclick:getLogs,onmousemove:showTrans,onmouseover:showTrans,onmouseout:hideTrans,style:{'text-align':'right',cursor:'pointer'},innerHTML:'<nobr><font color="#'+(sameTrans?'D6ADFF':'8000ff')+'">&nbsp;'+(nrMilkings>0?nrMilkings:'')+'</font>&nbsp;<canvas id="SVC'+rowIndex+'" width=1%" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{col:i,children:{div:gui}}});
					gui={onclick:getLogs,onmousemove:showTrans,onmouseover:showTrans,onmouseout:hideTrans,style:{'text-align':'right',cursor:'pointer'},innerHTML:'<nobr><font color="#'+fCol+'">&nbsp;'+(lockCacheMax>0?lockCacheMax:'')+'</font>&nbsp;<canvas id="TRS'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{col:i,children:{div:gui}}});
					gui={style:stl,innerHTML:'<nobr><font color="#'+fCol+'">&nbsp;'+(waitCacheMax>0?waitCacheMax:'')+'</font>&nbsp;<canvas id="TRW'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{style:'',col:i,children:{div:gui}}});
					var dd = allTrans[allProc.events[rowIndex].transInd];
					if (dd && dd.transInfo && dd.transInfo.Memory)
						d.memInfo = Math.round(dd.transInfo.Memory.transMaxTimeMs / d.mem * 100);
					gui={style:stl,innerHTML:'<nobr><font color="#'+fCol+'">&nbsp;'+(d.memInfo?d.memInfo:'')+'</font>&nbsp;<canvas id="MEM'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{style:'',col:i,children:{div:gui}}});
					gui={style:stl,innerHTML:'<nobr>&nbsp;'+d.averageLoad+'&nbsp;<canvas id="LOD'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
					hd.push({'td':{style:'',col:i,children:{div:gui}}});
					ctp=-1;
					d.data.forEach(function(o){
						var ii = o.length;
						ii--;
//						while (--ii >= 0) {
							var oo = o[ii];
							if (!++ctp)
								gui={style:stl,innerHTML:'<nobr>&nbsp;'+oo+'&nbsp;<canvas id="RYW'+rowIndex+'" width="'+(canvasWidth+3)+'px" height="'+(canvasHeight+2)+'px"></nobr>'};
							else
								gui={style:stl,innerHTML:'<nobr>&nbsp;'+oo+'</nobr>'};
							hd.push({'td':{style:'4px',col:i,children:{div:gui}}});
//						};
					});
					vl.push({'tr':{className:'container styleWhite selector',children:hd,myIndex:rowIndex}});
				});
			var width=null;
			document.body.style.backgroundColor='#103d82';
			if(root){
				document.body.removeChild(root);
				document.body.removeChild(head);
			}
			head=jr.ec('div',{parentNode:document.body,className:'styleBackground',style:{width:(width?width:null)}, children:{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vh}}}}}, ce);
			root=jr.ec('div',{parentNode:document.body,className:'styleBackground',style:{width:(width?width:null)}, children:{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vl}}}}});
			showImages();
			updateSort();
			showInfo('Updating graphics...');
			if (allProc)
				setTimeout(function(){setPercent(); }, 0);
			else
				hideTrans();
			renderMenu();
		},
		getData=function(){
			clearDynPos();
			showInfo('Fetch data from server...');
			showDynamic(true);
			beginTime=new Date();
			var day = days[dayIndex];
			jr.ajax('SrvVersion', 'getSupervisorData', {vcId:vcId, date:day.getTime(), fkn:'data'}, 'supervisorData' );
		},
		gotData=function(data){
			showInfo('Got data from server in ' + (new Date().getTime() - beginTime.getTime()) + ' ms');
			setTimeout(function(){ supervisorData(data); }, 1);
		},
		getDays=function() {
			showInfo('Fetch days from server...');
			showDynamic(true);
			beginTime=new Date();
			jr.ajax('SrvVersion', 'getSupervisorData', {vcId:vcId, fkn:'days'}, 'supervisorDays' );
		},
		gotDays=function(data){
			if (!data || !data.length) {
				showInfo('No permission or no data from this farm');
				return;
			}
			showInfo('Got days from server in ' + (new Date().getTime() - beginTime.getTime()) + ' ms');
			days=[]; 
			data.forEach(function(d){
				var date = new Date();
				d = d.split('-');
				date.setYear(20+d[0]);
				date.setMonth(parseInt(d[1]) - 1);
				date.setDate(parseInt(d[2]));
				days.push(date);
			});
			days.sort(function(o1,o2){return o1.getTime()-o2.getTime();});
			dayIndex=days.length - 1;
			getData();
		},
		getFarms=function() {
			showInfo('Fetch farms from server...');
			showDynamic(true);
			beginTime=new Date();
			jr.ajax('SrvVersion', 'getSupervisorData', {fkn:'farms'}, 'supervisorFarms' );
		},
		gotFarms=function(data){
			if (!data || !data.length) {
				showInfo('No permission or no data from this farm');
				return;
			}
			showInfo('Got farms from server in ' + (new Date().getTime() - beginTime.getTime()) + ' ms');
			farms=[]; 
			data.forEach(function(d){
				farms.push({id:d.substr(d.length-36),selected:0,name:d.substr(0,d.length-39).replace('_','.')});
			});
			farms.sort(function(o1,o2){
				return o1.name.localeCompare(o2.name);
			});
			var cookie = getSessCookie();
			if (!vcId && cookie && cookie.farm)
				vcId = cookie.farm;
			var i = -1;
			while (++i < farms.length && farms[i].id !== vcId) {}
			farmsIndex = i < farms.length ? i : 0;
			farms[farmsIndex].selected=1;
			getDays();
		},
		prevDay=function(){
			if (dayIndex) {
				dayIndex--;
				getData();
			}
		},
		nextDay=function(){
			if (dayIndex + 1 < days.length) {
				dayIndex++;
				getData();
			}
		},
		showInfo=function(info) {
			infoLabel += '<nobr>' + info + '</nobr><br/>';
			showDynTbl({div:{innerHTML:infoLabel}},dynInner);
		};
		dynDivs={};
		dynamic=jr.ec('div',{parentNode:document.body,className:'dynamicDiv',
							children:{table:{className:'dialogTable',children:{tr:{children:{td:{children:{div:{contextIdentity:'inner',className:'dynamicDivContent'}}}}}}}}},dynDivs);
		dynInner=dynDivs.inner;
		imgIcons=jr.getImage('/Resources/info6.png');
		vcId=jr.getUrlVar('id');
		jr.eventManager.addListener('supervisorData', jr.eventManager, function(data){
			if(data)setTimeout(function(){ gotData(data);}, 0);else document.body.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		jr.eventManager.addListener('supervisorDays', jr.eventManager, function(data){
			if(data)setTimeout(function(){ gotDays(data);}, 0);else document.body.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		jr.eventManager.addListener('supervisorFarms', jr.eventManager, function(data){
			if(data)setTimeout(function(){ gotFarms(data);}, 0);else document.body.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		jr.eventManager.addListener('gotLogs', jr.eventManager, function(data){gotLogs(data);});
		jr.onBroadcast(vcId, 'vcLog', function(file) {
			var fl = parseInt(file);
			if (fl)
				window.open('/Delaval/WebLog/'+(fl > 0 ? 'vcLogs.htm?file=' + file : 'vcLogsOld.htm?file='+(-fl)+'&vc='+vcId), '_blank').focus();
		});
		getFarms();
	}
};
jr.init( function() {
    supervisor.init();
	new supervisor.instance();
} );
