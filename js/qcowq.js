jr.include('/buttons.css');
jr.include('/cowq.css');
jr.include('/js/qprofile.js');
jr.include('/js/qdelavalDialog.js');
jr.include('/js/qsimpleGraph.js');
jr.include('/js/qmilkings.js');
jr.include('/js/qutil.js');
jr.include('/modalContainer.css');
jr.include('/Resources/info6.png');
function CowQueue(container, id, myScreenPos) {
	var
	texts = {
		goToTop: jr.translate( 'Go to top' ),
		search: jr.translate( 'Search' ),
		stopSearch: jr.translate( 'Stop search' ),
		colon: jr.translate( ':' ),
		menu: jr.translate( 'Menu page' ),
		allGroups: jr.translate( 'All groups' ),
		search: jr.translate( 'Search number...' ),
		searchFor: jr.translate( 'Stop show' ),
		animalNr: jr.translate( 'Animal number?' ),
		markedBy: jr.translate( 'Marked by' ),
		nofication: jr.translate( 'Notification' ),
		confirmDelete: jr.translate( 'Delete mark for animal' ),
		markComment: jr.translate( 'Mark animal with optional comment' ),
		actions: jr.translate( 'Milk,FeedOnly,PassThrough,Unselected' ).split( ',' ),
		back: jr.translate( 'Back' ),
		space: jr.translate( ' - ' ),
		milkings: jr.translate( 'Milkings' ),
		graph: jr.translate( 'Graph' ),
		data: jr.translate( 'Data' ),
		letInToWait: jr.translate( 'Open to wait area' ),
		sureLetInToWait: jr.translate( 'Are you sure you want to open to wait area?' ),
		dontLetInToWait: jr.translate( 'Close' ),
		tryToOpenWaitArea: jr.translate( 'Try to open wait area...' ),
		tryToCloseWaitArea: jr.translate( 'Try to close wait area...' ),
		waitAreaOpen: jr.translate( 'Wait area open' ),
		waitAreaOpenTime: jr.translate( 'min' ),
		setup: jr.translate( 'Setup' ),
		yes: jr.translate( 'Yes' ),
		no: jr.translate( 'No' ),
		today: jr.translate('Today'),
		weekDay: jr.translate("Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"),
		questionMark: jr.translate( '?' )
	},
	getDate=	function(d){d=d.getString();return d==null?null:parseInt(d,16);},
	tm=			function(t){var df;return(df=tNow-t)<0?'-'+hr(-df):hr(df);},
	scls=		function(row,style){var clsn=row.children[0].children[0].className.split(' ')[0]+' '+style;var ii=-1;while(++ii<3)row.children[ii].children[0].className=clsn;},
	debug=function(str){
//		debugElement.innerHTML=n3(++debugLine)+': '+(new Date()).printd()+'  '+str+'<br/>'+debugElement.innerHTML;
	},
	cookie=getSessCookie(),
	div,
	table,
	topGUI,
	topCommandButtons,
	topCommand,
	isGroups,
	searchNr=null,
	searchIndex=-1,
	isTryingToOpenCloseWaitArea=0,
	onresize = function() {
		var width = $( container ).width();
		$( 'table.cowq' ).css( 'font-size', width * 0.04 );
		$( 'table.cowq td.imageCell img,table.cowq td.imageCell canvas' )
			.css( 'width', width * 0.08 )
			.css( 'height', width * 0.08 )
		$( 'table.cowq .arrows, div.delavalDialog .arrows, div.delavalDialog div.title canvas' )
			.css( 'width', width * 0.05 )
			.css( 'height', width * 0.05 )
		$( 'table.cowq td.infoCell div.cInfoCell' )
			.css( 'width', width * 0.42 );
		$( 'table.cowq div.buttons button' ).css( 'font-size', Math.max( width / 30, 10 ) );
		$( 'table.cowq div.buttons select' ).css( 'font-size', Math.max( width / 20, 10 ) );
		fontHeight = width * 0.03;
		$( '.groupSelect, .profileSelect' ).css( 'font-size', fontHeight );
		$( '.groupSelect, .profileSelect' ).css( 'height', (fontHeight * 2.5) + 'px' );
		$( 'table.cowq .info' ).css( 'font-size', Math.max( width / 40, 10 ) );
		$( 'table.cowq .hinfo' ).css( 'font-size', Math.max( width / 20, 10 ) );
		$( 'table.cowq div.buttons' ).css( 'height', width * 0.04 * 2 );
		$( 'table.cowq button' ).css( 'font-size', fontHeight );
		$( 'table.cowq button' ).css( 'height', (fontHeight * 2.5) + 'px' );
		$( 'table.cowq button img' ).css( 'height', fontHeight * 0.9 + 'px' );
		$( 'table.cowq button img' ).css( 'width', fontHeight * 0.9 * 0.625 + 'px' );
		$( 'table.cowq button img' ).css( 'margin-top', fontHeight / 8 + 'px' );
		$( 'table.cowq button img' ).css( 'right', $( 'table.cowq' ).width() * 0.3 * 0.015 + 10 + 'px' );
		var table_height = $( 'table.cowq' ).height();
		if( table_height < $( container ).height() * 0.99 ) {
			$( 'div.cowq' ).css( 'height', $( container ).height() * 0.99 );
		} else {
			$( 'div.cowq' ).css( 'height', $( 'table.cowq' ).height() );
		}
	},
	onSelectProfile=function(){
		var all=pr.getAll(),nr;
		if(this.selectedIndex<all.length){
			searchIndex=this.selectedIndex;
			searchNr=null;
			var p=all[this.selectedIndex];
			cookieProfiles.profiles[cookieProfiles.selectedIndex].name = p.name;
			cookieProfiles.profiles[cookieProfiles.selectedIndex].sortCol = p.indexes[0];
			cookieProfiles.profiles[cookieProfiles.selectedIndex].sortDir = 1;
			saveCookieProfile(cookieProfiles);
			rerender();
		}
		else if(((nr=window.prompt(texts.animalNr)).length>0&&((nr=parseInt(nr))>0))){
			searchNr=nr.toString();
			rerender();
		}
		else{
			this.selectedIndex=searchIndex;
			rerender();
		}
	},
	onClickSetup=function(){
		alert('Setup...');
	},
	changeGroup=function(){
		setCookieProfile(this.value, cookieProfiles.selectedIndex, cookieProfiles.profiles);
		rerender();
	},
	searchClick=function(){
		if(searchNr!==null){
			searchNr=null;
			rerender();
		}
	},
	renderTopCommand=function(){
		var i=-1,ce={},grps=[],options=[],ii=-1,v;
		for(var grp in animalGroups)
			if(animalGroups[grp].cows.length)
				grps.push(grp)
		isGroups=grps.length>1;
		grps.sort(function(o1,o2){return animalGroups[o1].name.localeCompare(animalGroups[o2].name)});
		topCommand=[];
//	openGateAnimals
		var openArea=[],groups = [];
		var waitAreaOpen=openGateUntil&&(i=openGateUntil.getTime()-new Date().getTime())>0;
		if(!waitAreaOpen)
			openGateAnimals=null;
		if(searchNr===null){
			if(!isTryingToOpenCloseWaitArea&&waitAreaOpen){
				openArea.push({'div':{ ClassName: 'isOpen', children:[
					{'button':{className:'unselectedButton', style:{'float': 'right'}, 
						innerHTML:texts.dontLetInToWait, onclick:onCloseWaitArea}},
					{'div':{ ClassName: 'isOpen', children:[
						{'span':{className:'info',innerHTML:texts.waitAreaOpen+' '}},
						{'span':{className:'hinfo',innerHTML:Math.floor(i/60000)}},
						{'span':{className:'info',innerHTML:' '+texts.waitAreaOpenTime+' '}},
					]}}]}});
			}
			else if(isTryingToOpenCloseWaitArea)
				openArea.push({'div':{ children:[
					{'div':{className:'info',style:{width: '50%', position: 'absolute'},innerHTML:waitAreaOpen&&isTryingToOpenCloseWaitArea==2?texts.tryToCloseWaitArea:texts.tryToOpenWaitArea}},
					{'button':{className:'unselectedButton',style:{width: '50%', position: 'absolute', right: '0px'},
						innerHTML:texts.dontLetInToWait, onclick:onCloseWaitArea}}]}});
			else if(perm&0x100&&profile.activityAndAreaMask&0x40)
				openArea.push({'div':{ children:[
					{'button':{className:'unselectedButton buttonSelect',
						innerHTML:texts.letInToWait, onclick:onOpenToWaitArea}}]}});
			if(isGroups){
				options.push({option:{text:texts.allGroups,value:''}});
				while(++ii<grps.length)
					options.push({option:{className:'groupSelect',text:animalGroups[grps[ii]].name,value:v=grps[ii],selected:v==cookieProfiles.groupIndex}});
				var select=[];
				select.push({select:{className:'groupSelect',onchange:changeGroup,children:options}});
				if (cookieProfiles.groupIndex>=1 && !animalGroups[cookieProfiles.groupIndex]) {
					cookieProfiles.groupIndex = 0;
				}
				groups.push({ 'button': { className:'unselectedButton buttonSelect', children: [
								{ 'span': { className: 'drop-down-text', innerHTML: cookieProfiles.groupIndex<1?texts.allGroups:animalGroups[cookieProfiles.groupIndex].name } } ,
								{ 'img': { src: jr.getResource('arrows.png') } },
							] } },
							{ 'div': { className: 'buttonSelect', children: select } });
			}
		}
		var all=pr.getAll();
		topCommand.push(jr.ec( 'tr', {style:{}, children: [
			{ 'td': { colSpan:'3', children: [
				{ 'div': { contextIdentity: 'btns', className: 'buttons', children: [
					{ 'div': { className: 'left', onclick:searchClick, children: [
						{ 'button': { className:'unselectedButton buttonSelect', children: [
							{ 'span': { className: 'drop-down-text', innerHTML: searchNr!==null?texts.searchFor+' "'+searchNr+'"':cookieProfiles.profiles[cookieProfiles.selectedIndex].name } } ,
							searchNr===null ? { 'img': { src: jr.getResource('arrows.png') } } : {},
						] } },
						{ 'div': { className: 'buttonSelect', children: [
							{'select': { className: 'profileSelect', contextIdentity: 'sel', onchange: onSelectProfile, children: function(p){
								jr.foreach( all, function(o) {
									jr.ec('option', {parentNode:p, text: o.name, selected: searchNr===null&&o.name==cookieProfiles.profiles[cookieProfiles.selectedIndex].name?'selected':null});
								} );
								jr.ec('option', {parentNode:p, text: texts.search});
							}}}
						]} },
					] } },
					{ 'div': {  className: 'center', children: groups } },
					{ 'div': {  className: 'right', children: openArea } },
				] } },
			] } } ] }, ce ));
		if(searchIndex===null)
			searchIndex=ce.sel.selectedIndex;
		topCommandButtons=[];
		for (i in ce.btns.childNodes)
			topCommandButtons[i] = ce.btns.childNodes[i];
		return topCommandButtons;
	},
	onCloseWaitArea=function(){
		jr.sendRequest('Animal.closeOpenWaitingArea', id);
//console.log("Closing: "+(openGateUntil==null?'null':openGateUntil.toString()));
		isTryingToOpenCloseWaitArea=openGateUntil==null?0:2;
		rerender();
	},
	onOpenToWaitArea=function() {
		var id=jr.getUrlVar( 'id' );
		if(	!isTryingToOpenCloseWaitArea &&!(openGateUntil&&(i=openGateUntil.getTime()-new Date().getTime())>0) ){
			confirm(texts.sureLetInToWait, texts.letInToWait, jr.translate('Cancel'), doOpenToWaitArea);
		}
	},
	doOpenToWaitArea=function() {
		var s=null;
		jr.foreach(cows, function(cow){if(!s)s='';else s+=',';s+=cow.nr});
		jr.sendRequest('Animal.setOpenWaitingArea', id+' '+s);
		isTryingToOpenCloseWaitArea=1;
		rerender();
	},
	confirm=function(text,okText,notOkText, onOk) {
		var ce = {modalContainer: null};
		jr.ec( document.body, {children: [
			{'div': {className: cookie.isApp?'modalBlocker':'modalDimmer', contextIdentity: 'modalDimmer'}},
			{'div': {className: 'modalMainContainer', contextIdentity: 'modalContainer', children: [
				{'p': {className: 'modalOuterContainer', children: [
					{'p': {className: 'modalInnerContainer', children: [
						{'p': {className: 'modalContainer', children: [
							{'div': {className: 'title', children: [
								{'span': {innerHTML: text}}
							]}},
							{'div': {className: 'title', children: [
								{'b': {className: 'buttonSpacer'}},
								{'button': {className: 'save', style: {'margin-right': '40px'}, innerHTML: notOkText, onclick: function() {jr.remove( ce.modalContainer ); jr.remove( ce.modalDimmer ); }}},
								{'button': {className: 'save', innerHTML: okText, onclick: function() { onOk(); jr.remove( ce.modalContainer ); jr.remove( ce.modalDimmer ); }}},
							]}},
						]}},
					]}},
					{'b': {}},
				]}},
			]}},
		]}, ce );
	},

	updateHeader=function() {
		var i=0;
		while(++i<flds.length)
			topGUI.cells[i-1].className=flds[i]==sm?'headchoosen':'';
	},
	onSelectCowClick=function(obj, index) {
		if(index<0){
			if(obj.rowData.markBySign==null){
				var comment=prompt(texts.markComment,'');
				if(comment!=null)
					jr.sendRequest('Animal.makeNotification', {targetId:id, animalNr:obj.rowData.nr.toString(), notification:comment});
			}
			else {
				confirm(texts.confirmDelete+' '+obj.rowData.nr + texts.questionMark, texts.yes, texts.no, function() {
						jr.sendRequest('Animal.deleteNotification', {targetId:id, animalNr:obj.rowData.nr.toString()})
					}
				);
			}
		}
		else {
			var i=-1;
			while(++i<cows.length&&cows[i].nr!=obj.rowData.nr){}
			cowDetails(i);
		}
	},
	onSortClick=function(index) {
		if(index!=null){
			var smNew=index==-1?1:index==-2?15:flds[index+1];
			if(smNew==sm)
				sd=-sd;
			else{
				sm=smNew;
				sd=1;
			}
			cookieProfiles.profiles[cookieProfiles.selectedIndex].sortCol = sm
			cookieProfiles.profiles[cookieProfiles.selectedIndex].sortDir = sd;
			saveCookieProfile(cookieProfiles);
			updateHeader();
			renderCows();
		}
	},
	renderImage=function(canvas,x,y) {
		canvas.getContext("2d").drawImage(cowImage,x,y,70,70,0,0,70,70);
	},
	renderHeader= function() {
		var ce={}, i=-1,
			createCell = function( td ) { jr.ec('div', {parentNode:td, assignments:{pos:++i}, innerHTML:pr.fieldNames[flds[i+1]]}); },
			getCells = function(p,a) { i=-1; while(++i<3) a.push(p.childNodes[0].childNodes[i]) };
		jr.ec( 'tr', { contextIdentity: 'row', className: 'topHeading',
			onclick: function( e ) { onSortClick( e.srcElement.pos ); },
			children: [
				{ 'td': { className: 'imageCell', children: [
					{ 'div': { children: [
						{ 'canvas': {contextIdentity: 'status', width:70, height:70, assignments: { pos: -1 } } }
					] } },
					{ 'div': { children: [
						{ 'canvas': {contextIdentity: 'udder', width:70, height:70, assignments: { pos: -2 } } }
					] } }
				] } },
				{ 'td': { className: 'infoCell', children: [
					{ 'div': { className: 'cInfoCell', children: function( parent ) {
						createCell( parent ); createCell( parent ); createCell( parent );
					} } }
				] } },
				{ 'td': { className: 'infoCell lastCell', children: [
					{ 'div': { className: 'cInfoCell', children: function( parent ) {
						createCell( parent ); createCell( parent ); createCell( parent );
					} } }
				] } }
		] }, ce );
		renderImage(ce.status,70,140);
		renderImage(ce.udder,70,210);
		ce.cells=[];
		getCells(ce.row.childNodes[1],ce.cells);
		getCells(ce.row.childNodes[2],ce.cells);
		return topGUI=ce;
    },
	rerender=function(){
		isChangingProfile=false;
		setNewProfile(cookieProfiles.selectedIndex);
		renderTopCommand();
		topGUI=renderHeader();
		updateHeader();
		tNow=Math.floor((new Date()).getTime()/1000-diff);
		selectCows();
	},
	getCheck=function(cow,innerParent){
		var canvas=jr.ec('canvas',{className:'imageContainer',assignments:{pos:-2},parentNode:innerParent,width:74,height:70}),ctx=canvas.getContext("2d");
		if(cow.markBySign!=null){
			var index=(cow.notifi==null?0:2)+(cow.markBySign==who?0:1);
			ctx.drawImage(cowImage,0,70+index*70,70,70,0,0,70,70);
		}
	},
	getClassName = function(cow) {
		var a=cow.action;
		return a==1?'stylePassThrough':a==2?'styleFeedOnly':cow.next==null?'styleNeverMilked':tNow>=cow.next?tNow-cow.prev>=cow.over&&cow.over>=0?cow.prev==0?'styleNeverMilked':'styleOverdue':'stylePermission':'styleNopermission';
	},
	clearTable=function(){
		while(table.childNodes[0])
			table.removeChild(table.childNodes[0]);
	},
	getDateString=function(d,from){
		var dt=new Date(tNow*1000),dd=new Date(d.getTime()),s=from?'':'-';
		dt.setHours(0,0,0,0);
		dd.setHours(0,0,0,0);
		dt=(dd.getTime()-dt.getTime())/86400000;
		if(from&&dt<1)
			return'';
		if(dt===0){
			var h=d.getHours(),m=d.getMinutes();
			return s+(h>=23?texts.today:(h<10?'0'+h.toString():h.toString())+':'+(m<10?'0'+m.toString():m.toString()));
		}
		if(dt>0&&dt<7)return s+texts.weekDay[dt];
		return s+(d.getDate().toString()+'/'+(d.getMonth()+1).toString());
	},
//	counter,
	renderCows=function(){
//counter=-1;
		if(!isChangingProfile){
			tNow=Math.floor((new Date()).getTime()/1000-diff);
			clearTable();
			renderTopCommand();
			jr.foreach(topCommand, function(obj){table.appendChild(obj)});
			table.appendChild(topGUI.row);
			cows.sort(sort);
			jr.foreach( cows, function( cow ) {	table.appendChild(cow.GUI.row); updateCowGUI(cow);	} );
			onresize();
		}
		clearTimeout(timer);
		// Comment out row below to stop cow queue from constantly update
		timer=setTimeout(renderCows,10000);
	},
	updateCowGUI = function(cow){
		var	i=0;
		while(++i<flds.length)
			setVal(cow,flds[i],cow.GUI.cells[i-1]);
		cow.GUI.row.className=getClassName(cow);
	},
	renderCow = function( rowData ) {
		var ce={}, i=-1,
			createCell = function( td ) { jr.ec('div', {parentNode:td, assignments:{pos:++i}}); },
			getCells = function(p,a) { i=-1; while(++i<3) a.push(p.childNodes[0].childNodes[i]) };
		jr.ec( 'tr', { contextIdentity: 'row',
			assignments: { rowData: rowData },
			onclick: function( e ) { onSelectCowClick( this, e.srcElement.pos ); },
			children: [
				{ 'td': { className: 'imageCell', children: [
					{div:{children:function(innerParent){getIncompletePict(rowData,innerParent,70,cowImage,'imageContainer',{pos:-1})}}},
					{div:{children:function(innerParent){getCheck(rowData,innerParent)}}}
					] } },
				{ 'td': { className: 'infoCell', children: [
					{ 'div': { className: 'cInfoCell', children: function( parent ) {
						createCell( parent ); createCell( parent ); createCell( parent );
					} } }
				] } },
				{ 'td': { className: 'infoCell lastCell', children: [
					{ 'div': { className: 'cInfoCell', children: function( parent ) {
						createCell( parent ); createCell( parent ); createCell( parent );
					} } }
				] } }
		] }, ce );
		ce.cells=[];
		getCells(ce.row.childNodes[1],ce.cells);
		getCells(ce.row.childNodes[2],ce.cells);
		return ce;
    },
	renderMilkUpDn=function(d,parent,arrows,count){
		while(parent.childNodes.length>0)
			parent.removeChild(parent.childNodes[0]);
		parent.appendChild(jr.ec('span',{innerHTML:d.sevenDays/10}));
		if(arrows){
			parent.appendChild(jr.ec('span',{innerHTML:' '}));
			renderUpDown(d.sumMask,0,parent,cowImage);
			parent.appendChild(jr.ec('span',{innerHTML:'('}));
			var i=-1;
			while(++i<count)
				renderUpDown(d.sumMask,2*(i+1),parent,cowImage);
			parent.appendChild(jr.ec('span',{innerHTML:')'}));
		}
	},
	getNr=function(nr){
		var isOpen=openGateAnimals&&openGateAnimals.indexOf(nr)>=0;
		return (isOpen?'*':'')+nr+(isOpen?'*':'');
	},
	setVal=function(c,t,e){
		switch(t){
			case 0: e.innerHTML='';break;
			case 2:	e.innerHTML='<b>'+getNr(c.nr)+'</b>';break;
			case 3:	e.innerHTML=animalGroups[c.group.toString()].name+' ('+animalGroups[c.group.toString()].nr+')';break;
			case 4:	e.innerHTML='<b>'+getNr(c.nr)+'</b> ('+animalGroups[c.group.toString()].name+')';break;
			case 5:	e.innerHTML=c.lact;break;
			case 6:	e.innerHTML=c.lactS==null?'':Math.floor((tNow-c.lactS)/86400);break;
			case 7:	t=Math.floor((tNow-c.lactS)/86400);e.innerHTML=c.lactS==null?'':(t<0?'???':t)+' ('+c.lact+')';break;
			case 8:	e.innerHTML=tm(c.prev);break;
			case 9:	e.innerHTML=tm(c.next);break;
			case 10: var l=c.occ.length;e.innerHTML=l<=0?'-':c.occ[0]+(l<=1?'':' ('+c.occ[1]+(l<=2?'':','+c.occ[2])+(l<=3?'':','+c.occ[3])+')');break;
			case 11:e.innerHTML=tNow-c.prev>=86400?'':Math.floor(((tNow-c.prev)/3600*c.spd+c.cy)/10+.5)/10;break;
			case 12:if(c.sevenDays>0){renderMilkUpDn(c,e,true,4);}break;
			case 13:if(c.sevenDays>0){renderMilkUpDn(c,e,false,4);}break;
			case 14:if(c.sumMask>>10)getLevels(c.sumMask,e,cowImage);break;
			case 16:
				var s=c.notifi==null?'':c.notifi;
				s+=c.markBySign==null?'':(c.notifi==null?'(':' (')+c.markBySign+')';
				if(s.length>18)s=s.substr(0,16)+'...';
				e.innerHTML=s;break;
			case 17:e.innerHTML=texts.actions[c.action];break;
			case 18:e.innerHTML=c.name==null?'':c.name;break;
			case 19:e.innerHTML=getNr(c.nr)+(c.name==null?'':' ('+c.name+')');break;
			case 20:e.innerHTML=areas[c.areaId]==null?'':areas[c.areaId].name;break;
			case 21:e.innerHTML=tm(c.inAreaSince);break;
			case 22:e.innerHTML=areas[c.areaId]==null?'':areas[c.areaId].name+' ('+tm(c.inAreaSince)+')';break;
			case 23:
				var at=c.activity,i;
				s='';
				if(at>0){
					if((i=at)>3){
						s='(';
						i=at-3;
					}
					while(--i>=0)s+='+';
					if(at>3)
						s+=')';
				}
				e.innerHTML=s; break;
			case 24:e.innerHTML=c.milkingsPerDay>0?c.milkingsPerDay/10:'';break;
			case 25:e.innerHTML=c.trapString?'X':'';break;
			case 26:e.innerHTML=c.trapString?c.trapString:'';break;
			case 27:e.innerHTML=c.expCalvDate?new Date(c.expCalvDate).toLocaleDateString():'';break;
		}
		if( e.innerHTML.length===0 )
			e.innerHTML = '<br />';
	},
	activity=function(o1,o2){
		var a1,a2;
		if((a1=o1.activity)==(a2=o2.activity))
			return redYelWhi(o1,o2);
		else if(a1==0)return 1;
		else if(a2==0)return -1;
		else{
			if(a1>0&&a1<=3)a1+=6;
			if(a2>0&&a2<=3)a2+=6;
			return sm*(a2-a1);
		}
	},
	redYelWhi=function(o1,o2){
		var a1=o1.action==0;
		var a2=o2.action==0;
		if(a1&&a2){
			var t1=tNow>=o1.next?tNow-o1.prev>=o1.over&&o1.over>=0?o1.prev==0?1:4:3:2;
			var t2=tNow>=o2.next?tNow-o2.prev>=o2.over&&o2.over>=0?o2.prev==0?1:4:3:2;
			if(t1==t2){
				var s1=o1.next==null?1:tNow>o1.next?tNow-o1.prev>o1.over?4:3:2;
				var s2=o2.next==null?1:tNow>o2.next?tNow-o2.prev>o2.over?4:3:2;
				return sd*(o1.next==o2.next?o1.nr-o2.nr:s1==s2?o1.next-o2.next:s1<s2?1:-1);
			}
			return sd*(t2-t1);
		}
		else
			return sd*(o1.nr-o2.nr);
	},
	sort=function(o1,o2){
		if((sm>=25&&sm<=27)||((o1.action==0)&&(o2.action==0))||((o1.action!=0)&&(o2.action!=0)))
			switch(sm) {
				case 0:
					return 0;
				case 15:
					var s1=(o1.mask&0x9999)!=0;
					var s2=(o2.mask&0x9999)!=0;
					if((s1&&!s2)||(!s1&&s2)){
						return s1?-100:100;
					}
				case 1:
					return redYelWhi(o1,o2);
				case 25:
				case 26:
					if((o1.trapString===null)^(o2.trapString===null))
						return o1.trapString?-1:1;
					// Fall through to animal number
				case 2:
				case 4:
				case 19:
					return sd*(o1.nr-o2.nr);
				case 3:
					return sd*(o1.group==o2.group?o1.nr-o2.nr:o2.group<o1.group?1:-1);
				case 5:
					return sd*(o1.lact==o2.lact?(o1.lactS==o2.lactS?o1.nr-o2.nr:o1.lactS-o2.lactS):o2.lact-o1.lact);
				case 6:
				case 7:
					return sd*(o1.lactS==o2.lactS?o1.nr-o2.nr:o2.lactS-o1.lactS);
				case 8:
					return sd*(o1.prev-o2.prev);
				case 9:
					return sd*(o1.next-o2.next);
				case 11:
					var v1=tNow-o1.prev>=86400?0:Math.floor(((tNow-o1.prev)/3600*o1.spd+o1.cy)/10+.5)/10;
					var v2=tNow-o2.prev>=86400?0:Math.floor(((tNow-o2.prev)/3600*o2.spd+o2.cy)/10+.5)/10;
					return sd*(v2==v1?o1.nr-o2.nr:v2-v1);
				case 12:
				case 13:
					return sd*(o1.sevenDays==o2.sevenDays?o1.nr-o2.nr:o1.sevenDays-o2.sevenDays);
				case 14:
					v1=o1.sumMask,v2=o2.sumMask;
					v1=smsk[v1>>10&15]+smsk[v1>>14&15]+smsk[v1>>18&15];
					v2=smsk[v2>>10&15]+smsk[v2>>14&15]+smsk[v2>>18&15];
					if(v1!=v2)
						return sd*(v2-v1);
					// Fall through
				case 10:
					return sd*(o1.occ.length>0?o2.occ.length>0?(o2.lastOcc==o1.lastOcc?o1.nr-o2.nr:o2.lastOcc-o1.lastOcc):-1:o2.occ.length>0?1:-1);
				case 16:
					if((o1.markBySign==null&&o2.markBySign!=null)||(o1.markBySign!=null&&o2.markBySign==null)){
						s1=(o1.notifi==null?'':o1.notifi)+(o1.markBySign==null?'':(o1.notifi==null?'(':' (')+o1.markBySign+')');
						s2=(o2.notifi==null?'':o2.notifi)+(o2.markBySign==null?'':(o2.notifi==null?'(':' (')+o2.markBySign+')');
						return s2.localeCompare(s1)*100;
					}
					return redYelWhi(o1,o2);
				case 17:
					return sd*(o1.nr-o2.nr);
				case 18:
					var n1=o1.name,n2=o2.name;
					if(n1==n2)
						return redYelWhi(o1,o2);
					return sd*(n1==null?1:n2==null?-1:n1.toLowerCase().localeCompare(n2.toLowerCase())*100);
				case 21:
					if(o1.areaId!=null&&o1.areaId!=null&&areas[o1.areaId]!=null&&areas[o1.areaId]!=null&&o1.inAreaSince!=null&&o2.inAreaSince!=null)
						return sd*(o1.inAreaSince>o2.inAreaSince?1000:-1000);
				case 20:
				case 22:
					var p1=areas[o1.areaId]==null?null:areas[o1.areaId].name;
					var p2=areas[o2.areaId]==null?null:areas[o2.areaId].name;
					if(p1!=null&&p2!=null)
						return p1==p2?redYelWhi(o1,o2):sd*(p1.toLowerCase().localeCompare(p2.toLowerCase())*100);
					if(p1==null&&p2==null)
						return redYelWhi(o1,o2);
					return sd*(p1==null?1:-1);
				case 23:
					return activity(o1,o2);
				case 24:
					return sd*(o1.milkingsPerDay===o2.milkingsPerDay?o1.nr-o2.nr:o1.milkingsPerDay-o2.milkingsPerDay);
				case 27:
					var r;
					if(o1.expCalvDate&&o2.expCalvDate)
						return sd*(o1.expCalvDate-o2.expCalvDate>0?1:o1.expCalvDate===o2.expCalvDate?0:-1);
					else if(o1.expCalvDate||o2.expCalvDate)
						return o1.expCalvDate?-1:1;
					else
						return redYelWhi(o1,o2);
//	console.log(++counter+" "+r+" "+o1.nr+':'+o1.expCalvDate+" "+o2.nr+':'+o2.expCalvDate);
//					return r;
			}
		else if (sm==23&&(o1.activity!=0||o2.activity!=0))
			return activity(o1,o2);
		else if (o1.action==0)
			return -1;
		else if (o2.action==0)
			return 1;
		else
			return sd*(o1.nr-o2.nr);
	},
	selectCows=function(){
		cows=[];
		var i=-1,p=profile,o,cow,ii,c,sinceMilk=p.sinceMilk*3600,milkPerm=p.milkPerm*3600,lactDay=p.lactDay&0xff,lactDayHour=(p.lactDay>>8)*3600,samePlace=p.samePlace*3600,
			expYield=p.expYield,incomplete=p.incomplete*3600,action=p.action,cells=p.cells,activity=p.activityAndAreaMask,includeTrap=p.indexes.indexOf(25)>=0,included,isCondition,group=isGroups?animalGroups[cookieProfiles.groupIndex]:null,isTrap;
		while(++i<allCows.length){
			included=false;
			isCondition=searchNr!==null;
			cow=allCows[i];
			if(searchNr===null){
				if(group&&group.cows.indexOf(cow.nr)<0)
					continue;
				if(p.groups.length>0){
					o=p.groups;
					c=cow.group;
					ii=-1;
					while(++ii<o.length&&o[ii]!=c);
					if(ii==o.length)
						continue;
				}
				if(p.areas.length>0){
					o=p.areas;
					c=cow.areaId;
					ii=-1;
					while(++ii<o.length&&o[ii]!=c);
					if(ii==o.length)
						continue;
				}
				if(!(included=includeTrap&&(cow.trapMask&1))){
					if(activity&0x1e){
						var ar=cow.areaId&&cow.areaId.length>3?areas[cow.areaId]:null,typ=ar&&ar.type?ar.type:null;
						if((activity&2)&&typ==1)continue;
						if((activity&4)&&typ==0)continue;
						if((activity&8)&&typ==2)continue;
						if((activity&0x10)&&typ==null)continue;
					}
					if(action==0){if(cow.action!=0)continue;}
					else if(action==2&&cow.action==0)
						continue;
					if(sinceMilk>0){isCondition=true;	included=(tNow-cow.prev)>sinceMilk}
					if(lactDay>0){isCondition=true;		included|=(tNow-cow.prev)>lactDayHour&&Math.floor((tNow-cow.lactS)/86400)<lactDay}
					if(milkPerm>0){isCondition=true;	if(milkPerm==3600){if(tNow-cow.next<0)continue;}else included|=tNow-cow.next>milkPerm-3600}
					if(samePlace>0){isCondition=true;	included|=(tNow-cow.inAreaSince)>samePlace}
					if(incomplete>0){isCondition=true;	included|=(cow.mask&0x9999)!=0&&(tNow-cow.prev)>incomplete}
					if(cells>0){isCondition=true;		included|=cow.lastOcc>cells}
					if(activity&1){isCondition=true;	included|=cow.activity!=0}
					if(expYield>0){isCondition=true;	included|=(tNow>cow.next)&&!((tNow-cow.prev)<86400&&Math.floor(((tNow-cow.prev)/3600*cow.spd+cow.cy)/10+.5)/10<expYield)}
				}
			}
			else
				included=cow.nr.toString().indexOf(searchNr)>=0;
			if(!isCondition||included){
				cows.push(cow);
				updateCowGUI(cow);
			}
		}
		renderCows();
	},
	cow=function(d){
		this.nr=d.getInt();
		this.name=d.getString();
		this.group=d.getInt();
		this.activity=d.getInt();
		this.action=d.getInt();
		this.markByUser=d.getString();
		this.markBySign=d.getString();
		this.notifi=d.getString();
		this.next=getDate(d);
		this.prev=getDate(d);
		this.over=d.getInt();
		this.lact=d.getInt();
		this.lactS=getDate(d);
		this.mask=d.getInt();
		this.spd=d.getInt();
		this.cy=d.getInt();
		this.sevenDays=d.getInt();
		this.milkingsPerDay=d.getInt();
		this.sumMask=parseInt(d.getString(),16);
		this.areaId=d.getString();
		this.inAreaSince=getDate(d);
		if(!(this.expCalvDate=getDate(d)))this.expCalvDate=0;
		this.trapMask=d.getInt();
		this.trapStartTime=getDate(d);
		this.trapEndTime=getDate(d);
		this.trapString=null;
		if(this.trapMask&1){
			if(this.trapEndTime<tNow*1000)
				this.trapMask&=0xfffe;
			else{
				this.trapString=getDateString(new Date(this.trapStartTime),1)+getDateString(new Date(this.trapEndTime),0);
				if(this.trapMask&2&&this.trapMask&4092)
					this.trapString+=' '+((this.trapMask>>2)&31)+'-'+((this.trapMask>>7)&31);
			}
		}
		this.occ=[];var s,i=-1,cnt=d.getInt();while(++i<cnt)this.occ.push((s=d.getInt())<=0?'-':s);
		this.lastOcc=0;i=-1;while(++i<cnt&&this.occ[i]==='-');if(i<cnt)this.lastOcc=parseInt(this.occ[i]);
		this.GUI=renderCow(this);
	},
	animalGroup=function(d){
		this.nr=		d.getInt();
		this.name=		d.getString();
		this.key=		d.getInt();
		this.cowCount=	0;
	},
	area=function(d){
		this.id=	d.getString();
		this.type=	d.getString();
		this.name=	d.getString();
	},
	parseHead=function(d){
		var cnt=d.getInt(),i=-1,o;
		while(++i<cnt){
			o=new animalGroup(d);
			animalGroups[o.key==-1?o.nr:o.key]={name:o.name,cows:[],nr:o.nr};
		}
		cnt=d.getInt();
		i=-1;
		while(++i<cnt){
			o=new area(d);
			areas[o.id]=o;
			if(o.type==0)
				waitAreas[o.id]=o;
			else if(o.type==1)
				vmsAreas[o.id]=o;
		}
		i=-1;
		while(d.hasMore())
			if(d.getInt()==1){
				var cw=new cow(d),cowgrp=cw.group,grp=animalGroups[cowgrp];
//if(++i<20)
				if(grp){
					grp.cows.push(cw.nr);
					allCows.push(cw);
				}
			}
	},
	openNrTimeToInt=function(animalNr){
		var i=-1;
		if((openGateAnimals=animalNr==null?null:animalNr.split(',')))
			while(++i<openGateAnimals.length)
				openGateAnimals[i]=parseInt(openGateAnimals[i]);
	},
	onNewData=function(data){
		debug('poll answer '+data);
		var d=new JsSerilz('$',data),newCow,i=-1,seq,f=false,bigUpdate=false,s;
		while(d.hasMore()){
			var cmd=d.getInt();
			if(cmd==1){
				f=true;
				newCow=new cow(d);
				while(++i<allCows.length&&allCows[i].nr!=newCow.nr){}
				if(i<allCows.length)
					allCows[i]=newCow;
				else
					bigUpdate|=true;
			}
			else if(cmd==0){
//				bigUpdate|=true;
//				pg.allCows.splice(i,1);
			}
			else if(cmd==2){	// Open/Close wait area
				var sec=d.getInt();
				openGateUntil=sec?new Date(new Date().getTime()+sec*1000):null;
				openNrTimeToInt(d.getString());
				isTryingToOpenCloseWaitArea=0;
				renderCows();
			}
		}
		if(f){
			if(!searchMode)
				selectCows();
			else
				update();
		}
	},
	setNewProfile=function(index){
		var i=-1,all=pr.getAll(),ok=false,sel;
		profile=all[0];
		if(index < cookieProfiles.profiles.length){
			sel=cookieProfiles.profiles[cookieProfiles.selectedIndex = index];
			while(++i<all.length&&all[i].name!=sel.name){}
			if((ok=i<all.length))
				profile=all[i];
		}
		flds=[];
		var ind=profile.indexes;
		i=-1;
		while(++i<ind.length)
			flds.push(ind[i]);
		while(++i<=7)
			flds.push(0);
		sm=flds[0];
		if(ok){
			sm=sel.sortCol;
			sd=sel.sortDir;
		}
	},
	profileServerUpdate=function(d){
		if(d){
			var all,i=-1,changed=false;
			profile=pr.init(d,id);
			getCookieProfiles(myScreenPos);
			if((all=pr.getAll())){
				if((changed=cookieProfiles==null)){
					var a=[];
					while(++i<3)
						a.push({name:all[i].name,sortCol:all[i].indexes[0],sortDir:1});
					setCookieProfile(null,0,a);
				}
				i=-1;
				while(++i<cookieProfiles.profiles.length){
					var ii=-1;
					while(++ii<all.length&&all[ii].name!=cookieProfiles.profiles[i].name){}
					if(ii==all.length)
						cookieProfiles.profiles.splice(i,1);
				}
				i=cookieProfiles.profiles.length;
				ii=all.length;
				changed=i<4;
				if(i<4)
					while(cookieProfiles.profiles.length<4&&--ii>0)
						if(!all[ii].isOwn)
							cookieProfiles.profiles.push({name:all[ii].name,sortCol:all[ii].indexes[0],sortDir:1});
				if(changed)
					saveCookieProfile(cookieProfiles);
				rerender();
			}
		}
	},
	getCookieProfiles=function(){
		var i=-1,myCookie=getCookie(cookieName),d=null,cnt,ind,p,cookie={};
		cookieProfiles=null;
		if(myCookie!=null){
			d=new JsSerilz('$',myCookie);
			cnt=d.getInt();
			while(--cnt>=0){
				ind=d.getString();
				p={};
				p.groupIndex=d.getString();
				p.selectedIndex=d.getInt();
				p.profiles=[];
				i=4;
				while((--i>=0)&&d.hasMore())
					p.profiles.push({name:d.getString(),sortCol:d.getInt(),sortDir:d.getInt()});
				cookie[ind]=p;
				if(ind===myScreenPos)
					cookieProfiles=p;
			}
		}
		return cookie;
	},
	setCookieProfile=function(groupKey,selectedIndex,profileArray){
		var newProfile=function(){
			this.groupIndex=groupKey;			// null=all groups
			this.selectedIndex=selectedIndex;	// in profileNameArray
			this.profiles=profileArray;			// profile names & sort info
		};
		saveCookieProfile(new newProfile());
		return cookieProfiles;
	},
	saveCookieProfile=function(cookieProfile){
		var saveNewCookieProfile=cookieProfile, cookie=getCookieProfiles();
		cookie[myScreenPos]=cookieProfiles=saveNewCookieProfile;
		var d=new JsSerilz('$');
		d.serialize(Object.keys(cookie).length);
		for(var ind in cookie){
			var c=cookie[ind];
			d.serialize(ind,c.groupIndex,c.selectedIndex);
			jr.foreach(c.profiles,function(val){d.serialize(val.name,val.sortCol,val.sortDir)});
		}
		setCookie(cookieName,d.getData());
	},
	cowDetails=function(index){
		var saveBody=getBodyContent(container),
			tPad=function(t){return t.length>4?t:'&nbsp;'+(t.length===1?'&nbsp;'+t+'&nbsp;':t)+'&nbsp;';},
			showCowDetails=function(){
				var cow=cows[index],heading;
				if((cow.mask&0x9999)!==0)
					heading=[{'span':{id:'incomplPic'}},{'span':{innerHTML:'&nbsp;&nbsp;'+cow.nr+(cow.name==null?'':texts.space+cow.name)}}];
				else
					heading=cow.nr+(cow.name==null?'':texts.space+cow.name);
				container.innerHTML='';
				var isNext=index!==cows.length-1,
					isPrev=index>0;
					dialog = new delavalDialog.Dialog(container, heading, cow.GUI.row.className, [
						{ text: texts.back, onclick: function() {
									container.innerHTML='';
									jr.foreach(saveBody, function(node){container.appendChild(node);});
									dialog=null;
									container.scrollTop = container.childNodes[0].childNodes[0].childNodes[isPrev?index+1:index].offsetTop-10;
									onresize();} },
						{ text: tPad(isPrev?cows[index-1].nr:texts.space), className:isPrev?'':'disabled', disabled: !isPrev,
							onclick: function() {if(isPrev){index--;showCowDetails();}}},
						{ text: tPad(isNext?cows[index+1].nr:texts.space), className:isNext?'':'disabled', disabled: !isNext,
							onclick: function() {if(isNext){index++;showCowDetails();}}},
						{ text: viewMode===0?texts.milkings:viewMode===1?texts.graph:texts.data, onclick: function() {if(++viewMode===3)viewMode=0;showCowDetails();}}
					] );
				if(viewMode===0){
					var showFields=[11,8,9,12,24,3,5,6,27,10,14,17,22,23,26],
					arr=[];
					jr.foreach(showFields, function a(i){ arr.push( { 'tr': { children: [
						{ 'td': { className: 'left', innerHTML: pr.fieldNames[i] } },
						{ 'td': { className: 'right' } } ]
					} } ); } );
					var table=jr.ec( 'table', { parentNode: dialog.getContentContainer(), children: arr } ).childNodes[0],i=-1;
					jr.foreach(table.childNodes, function a(n){
						setVal(cow,showFields[++i],n.childNodes[1]);
					} );
					if(cow.markByUser)
						table.appendChild(jr.ec( 'tr', { children: [
							{ 'td': { className: 'left', innerHTML: texts.markedBy } },
							{ 'td': { className: 'right', innerHTML: cow.markByUser } } ] } ) );
					if(cow.notifi)
						table.appendChild(jr.ec( 'tr', { children: [
							{ 'td': { className: 'left', innerHTML: texts.nofication } },
							{ 'td': { className: 'right', innerHTML: cow.notifi } } ] } ) );
					if(cow.mask&0x9999)
						getIncompletePict(cow,document.getElementById('incomplPic'),70,cowImage);
					onresize();
				}
				else{
					if(!cowDetail||cowDetail.nr!==cow.nr){
						detailCow=cow;
						jr.sendRequest('Animal.getAnimalData', id+','+cow.nr, function(data){onCowDetailUpdate(data);});
					}
				}
			};
		showCowDetails();
	},
	getMilkingsInstance=function(){
		return milkingsList;
	},
	onCowDetailUpdate=function(d){
		this.bitMake=function(val,prev,warn,alarm,bitPos){
			if(val!=null&&val>0){
				var s=0,df;
				s=val>warn?val>alarm?12:8:4;
				if(prev!=null&&prev!=0){
					df=(val-prev)/prev;
					s+=Math.abs(df)>0.02?df>0?3:1:2;
				}
				return s<<bitPos;
			}
			return 0;
		};
		detailData=d;
		var i=-1,o,d,ot,b,m=null,c,df,y24cmp=detailCow.sevenDays==null?null:detailCow.sevenDays/10,dt,lastTime;
		sum7=[];
		if(d.mlk.length>1){
			o=new Date(parseInt(d.mlk[0].milkingTimeHex,16));
			o=new Date(o.getFullYear(),o.getMonth(),o.getDate(),0,0,0,0).getTime();
			ot=new Date(parseInt(d.mlk[d.mlk.length-1].milkingTimeHex,16));
			ot=new Date(ot.getFullYear(),ot.getMonth(),ot.getDate(),0,0,0,0).getTime();
			while(o<=ot){
				sum7.push(new calc7days(o));
				o+=86400000;
			}
		}
		while(++i<d.mlk.length){
			o=d.mlk[i];
			o.time=parseInt(o.milkingTimeHex,16);
			if(!i)lastTime=o.time;
			else{
				var ii=-1,delta=o.time-lastTime;
				while(++ii<sum7.length)
					sum7[ii].event(o.time,o.yield,delta);
			}
			lastTime=o.time;
			o.flow=o.yield/o.secMilkingTime*60;
			o.hour24=i==0?null:Math.floor(o.yield/(dt=((o.time-ot)/3600000))*240+0.5)/10;
			o.mask=parseInt(o.sumMaskHex,16);
			ot=o.time;
			o.bmcMask=this.bitMake(o.blood,b,bw,ba,10)+this.bitMake(o.mdi,m,mw,ma,14)+this.bitMake(o.occ,c,cw,ca,18);
			if(y24cmp!=null&&i>0&&dt>5){
				df=(o.hour24-y24cmp)/y24cmp;
				o.bmcMask|=Math.abs(df)>0.02?df>0?3:1:2;
			}
			b=o.blood;
			m=o.mdi;
			c=o.occ;
		}
		if(viewMode===1){
			o=milkingsList?milkingsList.getSortCol():0;
			d=milkingsList?milkingsList.getSortDir():1;
			milkingsList=new milkings(detailData.mlk,dialog.getContentContainer(),getMilkingsInstance,cowImage,o,d,onresize);
		}
		else{
			setGraph(dialog.getContentContainer());
		}
	},
	setGraph=function(graphDiv){
		jr.css.addClassName( graphDiv, 'milkGraph' );
		var parent = graphDiv.parentElement.parentElement.parentElement,
			height = (parent.parentElement.childNodes.length===1 ? document.body.scrollHeight : parent.offsetHeight) - (graphDiv.offsetTop + 10);
		var view=jr.ec('canvas',{parentNode:graphDiv,className:'',width:graphDiv.clientWidth-20,height: height });
		sGraph.Clear('#07D2E0','#f4f4f4','d/m');
		sGraph.setFont('italic bold 20px sans-serif', 20);
		var i=0,detm=detailData.mlk,sevenDays=detailCow.sevenDays==null?null:detailCow.sevenDays/10,yld;
		sGraph.addLine("#3366ff",1,"#C9D7FF");
		i=-1;
		while(++i<sum7.length&&sum7[i].getDayYield()==0);
		var ii=i-1;
		while(++ii<sum7.length)
			sGraph.addStaple(sum7[ii].beTime,sum7[ii].getDayYield(),sum7[ii].beTime+86400000);
		sGraph.addLine("#ff00ff",1,"#888888");
		ii=0;
		while(++ii<detm.length){
			var m=detm[ii],t=m.time,dt=t-detm[ii-1].time;
			if(dt<86400000)
				sGraph.addStaple(t-dt,m.yield,t);
		}
		sGraph.addLine("#111111",2);
		if(sevenDays>0){
			sGraph.addPoint(detm[0].time,sevenDays);
			sGraph.addPoint(detm[detm.length-1].time,sevenDays);
		}
		sGraph.addLine("#3366ff",5);
		ii=i-1;
		while(++ii<sum7.length)
			if((yld=sum7[ii].getDayYield())>0)
				sGraph.addPoint(sum7[ii].beTime+43200000,yld);
		sGraph.paint(view);
	},
	offsetFirstAnimal=	0,
	cookieName=			'_VcAppProfile',
	profile=			null,
	flds=				null,
	sm=					1,
	sd=					1,
	diff=				0,
	tNow=				0,
	viewMode=			0,
	perm=				0,
	debugLine=			0,
	detailPage=			0,
	cw,ca,bw,ba,mw,ma,
	cows=				[],
	cowsGUI=			[],
	animalGroups=		[],
	areas=				[],
	waitAreas=			[],
	vmsAreas=			[],
	allCows=			[],
	cowDetail=			null,
	dialog=				null,
	cookieProfiles=		null,
	isChangingProfile=	false,
	tableParent=		null,
	topCmd=				null,
	me=					null,
	name=				null,
	myFarm=				null,
	who=				null,
	debugElement=		null,
	searchField=		null,
	menuBtn=			null,
	timer=				null,
	detailData=			null,
	detailCow=			null,
	sum7=				null,
	milkingsList=		null,
	cowImage=			jr.getImage('/Resources/info6.png'),
	openGateUntil=		null,
	openGateAnimals=	null,
	searchMode=			false,
	isToa=				false,
	isAndroid=			false,
	isIE=				false;
	this.resize=function(){onresize()};
	this.setFarmId=function(farmId){id=farmId};
	this.initData=function(cowQueueData,profileData){
		me=cowQueueData.sessId;
		cw=cowQueueData.cellsWarning;
		ca=cowQueueData.cellsAlarm;
		bw=cowQueueData.bloodWarning;
		ba=cowQueueData.bloodAlarm;
		mw=cowQueueData.mdiWarning;
		ma=cowQueueData.mdiAlarm;
		if(cowQueueData.openGateSecLeft>0){
			openGateUntil=new Date(new Date().getTime()+cowQueueData.openGateSecLeft*1000);
			openNrTimeToInt(cowQueueData.openGateAnimalNr);
		}
		Date.prototype.tmf=cowQueueData.dateFormat;
		diff=Math.floor((new Date()).getTime()/1000)-cowQueueData.nowSec;
		name=(myFarm=cowQueueData.vcName)+texts.colon+' '+(who=cowQueueData.nameFirst+' '+cowQueueData.nameLast);
		perm=cowQueueData.perm;
		tNow=Math.floor((new Date()).getTime()/1000-diff);
		parseHead(new JsSerilz('$',cowQueueData.serializedData));
		profileServerUpdate(profileData);
//		offsetFirstAnimal=cows[0].gui.offsetTop;
	}

	texts.weekDay=texts.weekDay.split(',');
	myScreenPos=myScreenPos.toString();
	container = container || document.body;
	container.innerHTML = '';
	div = jr.ec( 'div', { parentNode: container, className: 'cowq' } );
	(table = (tableParent = jr.ec( 'table', { parentNode: div, className: 'cowq', children:[
			{tr:{children:[]}}]})).childNodes[0]).innerHTML = '';
//	$( window ).resize( onresize );
	jr.onBroadcast(id, 'queue', function(data) { onNewData(data);});
	isIE=navigator.appName!=null&&navigator.appName.toLowerCase().indexOf('internet explorer')>0;
	isAndroid=navigator.userAgent.toLowerCase().indexOf('android')>=0;
	toa();
	isToa=typeof toaq!='undefined';
};
