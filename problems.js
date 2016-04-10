jr.include('/cli.css');
jr.include('/simpleGraph.js');
jr.include('/util.js');
jr.include('/buttons.css');
jr.include('/common.css');
var problems = {
	init: function() {
		problems.texts = {
		};
	},
	instance:	function(){
		var 
		ce={},
		ceh={},
		root,
		head,
		problems=[],
		colNames,
		dynamic,
		dynDivs,
		dynInner,
		sortCol=-1,
		sortDir=1,
		infoLabel='',
		beginTime,
		vcId,
		dayIndex,
		viewTreated = 0,
		lastClick = -1,
		lastTransIndex = -1,
		lastTransData,
		mailingList,
		problem=function(sd) {
			this.id =			sd.getString();
			this.dateCreated =	sd.getInt();
			this.dateTreated =	sd.getInt();
			this.userTreated =	sd.getString();
			this.treatedComment=sd.getString();
			this.vcId =			sd.getString();
			this.deviceId =		sd.getString();
			this.highLevel =	sd.getInt();
			this.heading =		sd.getString();
			this.level = this.heading.indexOf('DeadLock') === 0 ? 2 : this.heading.indexOf('Error') === 0 ? 1 : 0;
			this.data =			sd.getString();
			sd.getString(); sd.getString(); sd.getString(); sd.getString();
		},
		problemSort=function(o1,o2) {
			switch(sortCol){
				case 0:
					return sortDir * (o1.checked ^ o2.checked ? o1.checked ? 1 : -1 : o1.dateCreated > o2.dateCreated ? -1 : 1);
				case 1:
					return sortDir * (o1.dateCreated > o2.dateCreated ? -1 : 1);
			}
			return o1.dateCreated > o2.dateCreated ? -1 : 1;
		},
		problemsData=function(data) {
			if (!data || !data.allSerialized) {
				showInfo('No permission or no data from this date');
				return;
			}
			showInfo('Deserializing data...');
			var sd = new JsSerilz('$', data.allSerialized),mListCnt=sd.getInt();
			mailingList=[];
			while (--mListCnt >= 0)
				mailingList.push(sd.getString());
			problems=[];
			while(sd.hasMore()) {
				var p=new problem(sd);
				p.vcName=data.vcNames[p.vcId];
				problems.push(p);
			}
			problems.sort(problemSort);
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
		back=function(){
			window.history.back();
		},
		treadChecked=function() {
			var delId=[],i=-1;
			while(++i<problems.length)
				if((viewTreated^(problems[i].dateTreated===0))&&problems[i].checked)
					delId.push(problems[i].id);
			beginTime=new Date();
			lastClick = lastTransIndex = -1;
			jr.ajax('SrvVersion', 'deleteProblems', {'deleteIds':delId, vcId:vcId, fromDate:0, nrDays:0, delete:viewTreated}, 'problemsData');
		},
		onClickRow=function() {
			var chkBox=this.children[0].children[0],isShift=!!event.shiftKey,isCtrl=!!event.ctrlKey,index=this.myIndex,entry=problems[index],chkInd=-1,elements=this.parentElement.children,i=-1;
			while(++chkInd<problems.length&&!((viewTreated^(problems[chkInd].dateTreated===0))&&problems[chkInd].checked)){}
			entry.checked = chkBox.checked = !entry.checked;
			if(!isCtrl){
				if(isShift){
					if (lastClick >= 0) {
						var iFrom = lastClick, iTo = index;
						if (iFrom > iTo) {
							iFrom = index;
							iTo = lastClick;
						}
						i = 1;
						while (++iFrom < iTo)
							if (viewTreated^(problems[iFrom].dateTreated===0))
								elements[++i].children[0].children[0].checked=problems[iFrom].checked=true;
					}
				}
				else if (chkInd<problems.length){
					var chked = entry.checked;
					while(++i<problems.length)
						if (viewTreated^(problems[i].dateTreated===0))
							elements[i+1].children[0].children[0].checked=problems[i].checked = 0;
					entry.checked = chkBox.checked = chked;
				}
			}
			lastClick = entry.checked ? index : -1;
			checkButtons();
		},
		showTrans=function() {
			if (lastTransIndex !== this.myIndex) {
				var p=problems[this.myIndex];
				var pp=[],str=p.data;
				str=str.replace(/\n/g,'<br/>');
				lastTransIndex = this.myIndex;
				lastTransData = '<nobr>File data: '+ '</nobr><br/>';
				pp.push({tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold'},innerHTML:lastTransData}}]}}]}});
				pp.push({tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold'},innerHTML:str}}]}}]}});
				lastTransData = pp;
			}
			showDynTbl(lastTransData,dynInner,{'border-collapse':'collapse','font-size':'xx-small'});
			setDynPos();
		},
		hideTrans=function() {
			showDynamic(false);
		},
		renderArray=function(vl,arr) {
			var rowIndex = -1,hd;
			arr.forEach(function(p) {
				++rowIndex;
				if ((viewTreated?1:0) ^ ((p.dateTreated === 0)?1:0)) {
					var dt=new Date(p.dateCreated);
					hd=[];
					hd.push({'td':{width:'1%',children:[{input:{style:{'text-align':'center'},type:'checkbox',checked:p.checked}}]}});
					hd.push({'td':{width:'1%',col:i,children:{div:{style:{'text-align':'center'},innerHTML:'<nobr>&nbsp;'+dt.printdate()+'&nbsp;</nobr>'}}}});
					hd.push({'td':{width:'1%',col:i,children:{div:{style:{'text-align':'center'},innerHTML:'<nobr>&nbsp;'+dt.printhms()+'&nbsp;</nobr>'}}}});
					hd.push({'td':{width:'1%',col:i,children:{div:{style:{'text-align':'left'},innerHTML:'<nobr>&nbsp;'+p.vcName+'&nbsp;</nobr>'}}}});
					var i = p.heading.indexOf(' ');
					hd.push({'td':{width:'1%',col:i,children:{div:{style:{'text-align':'left'},innerHTML:'<nobr>&nbsp;'+p.heading.substr(0,i)+'&nbsp;</nobr>'}}}});
					hd.push({'td':{style:'4px',col:i,children:{div:{style:{'text-align':'left'},innerHTML:'<nobr>&nbsp;'+p.heading.substr(i+1)+'</nobr>'}}}});
					vl.push({'tr':{onmousemove:showTrans,onmouseover:showTrans,onmouseout:hideTrans,className:'container topHand selector ' + (p.level === 1 ? 'styleRed' : p.level === 2 ? 'styleBlue' : 'styleYellow'),style:{'font-size':'small'},children:hd,myIndex:rowIndex,onclick:onClickRow}});
				}
			});
		},
		checkButtons=function() {
			var i=-1;
			while ((++i < problems.length) && !((viewTreated^(problems[i].dateTreated===0))&&problems[i].checked)) {}
			ceh['markedProblems'].disabled = i === problems.length;
		},
		changeView=function() {
			viewTreated = !viewTreated;
			render();
			ceh['changeView'].checked = viewTreated;
			lastClick = -1;
		},
		setMailingList=function() {
			var old, newMailingList = prompt(jr.translate('Set problem mailing list separated by comma'), old = mailingList.join());
			if (newMailingList !== null && old !== newMailingList)
				jr.ajax('SrvVersion', 'setProblemMailingList', {'deleteIds':newMailingList.split(','), vcId:vcId, fromDate:0, nrDays:0, delete:viewTreated}, 'problemsData');
		},
		render=function(){
			colNames=['Mark','Date','Time','Vc on farm','Type','Info'];
			var hd=[],vl=[],vh=[],i=-1;
			ceh={};
			while(++i<colNames.length)
				hd.push({td:{children:{div:{style:{height:'23px','text-align':'left'},onclick:onSortCol,id:'col'+i,innerHTML:(i?'&nbsp;':'')+colNames[i]}}}});

			vh.push({'tr':{className:'container',children:[
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {src: jr.getResource('../Resources/logo.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {onclick:back, style:dayIndex?{cursor:'pointer'}:{}, src: jr.getResource('../Resources/arrow_white.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading'}},
						{'td':{width:'40%',className:'topHeading',children:[
							{'span': {style:{'font-size':'x-large'},innerHTML:'<nobr>Deviations</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{assignments:{type:'button',className:'button',value:jr.translate(viewTreated?"Delete checked":"Set checked as treated"),onclick:treadChecked},contextIdentity:'markedProblems'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',onclick:changeView,children:[
							{'input':{assignments:{type:'checkbox',className:'button'},contextIdentity:'changeView'}}
						]}},
						{'td':{width:'1%',className:'topHeading',style:{cursor:'pointer'},onclick:changeView,children:[
							{'span': {innerHTML:'<nobr>'+jr.translate("View treated deviations")+'</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{assignments:{type:'button',className:'button',value:jr.translate('Set mailing list'),onclick:setMailingList}}}
						]}}
					]}});
			vl.push({'tr':{className:'container',children:hd}});
			if(false){
				stl.cursor='default';
				stl.color='rgb(90,90,90)';
			}
			renderArray(vl,problems,0);
			var width=null;
			document.body.style.backgroundColor='#103d82';
			if(root){
				document.body.removeChild(root);
				document.body.removeChild(head);
			}
			head=jr.ec('div',{parentNode:document.body,className:'styleBackground',style:{width:(width?width:null)}, children:{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vh}}}}}, ceh);
			root=jr.ec('div',{parentNode:document.body,className:'styleBackground',style:{width:(width?width:null)}, children:{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vl}}}}}, ce);
			checkButtons();
			updateSort();
			hidePopup();
		},
		hidePopup=function() {
			showDynamic(false);
		},
		getData=function(){
			clearDynPos();
			showInfo('Fetch data from server...');
			showDynamic(true);
			beginTime=new Date();
			jr.ajax('SrvVersion', 'getProblems', {vcId:vcId, fromDate:0, nrDays:0}, 'problemsData' );
		},
		gotData=function(data){
			showInfo('Got data from server in ' + (new Date().getTime() - beginTime.getTime()) + ' ms');
			setTimeout(function(){ problemsData(data); }, 1);
		},
		showInfo=function(info) {
			infoLabel += '<nobr>' + info + '</nobr><br/>';
			showDynTbl({div:{innerHTML:infoLabel}},dynInner);
		};
		dynDivs={};
		dynamic=jr.ec('div',{parentNode:document.body,className:'dynamicDiv',
							children:{table:{className:'dialogTable',children:{tr:{children:{td:{children:{div:{contextIdentity:'inner',className:'dynamicDivContent'}}}}}}}}},dynDivs);
		dynInner=dynDivs.inner;
		vcId=jr.getUrlVar('id');
		jr.eventManager.addListener('problemsData', jr.eventManager, function(data){
			if(data)setTimeout(function(){ gotData(data);}, 0);else document.body.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		jr.onBroadcast(vcId, 'Problem', function(data) {
		});
		getData();
	}
};
jr.init( function() {
    problems.init();
	new problems.instance();
} );
