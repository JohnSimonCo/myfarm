jr.include('/util.js');
jr.include('/simpleGraph.js');
jr.include('/milkings.js');
jr.include('/profile.js');
jr.include('/jrp.css');
function Queue(container,data){
var
	imageLoaded=function(){cowImageLoaded=true;initiated();},
	getDate=	function(d){d=d.getString();return d==null?null:parseInt(d,16);},
	tm=			function(t){var df;return(df=tNow-t)<0?'-'+hr(-df):hr(df);},
	scls=		function(row,style){var clsn=row.children[0].children[0].className.split(' ')[0]+' '+style;var ii=-1;while(++ii<3)row.children[ii].children[0].className=clsn;},
	initiated=function(){
		if(cowImageLoaded&&profile!=null&&!initDone){
			initDone=true;
			onProfileOk(profile);
			offsetFirstAnimal=cows[0].gui.offsetTop;
			debug('Started '+document.location.href);
		}
	},
	renderTopCommand=function(){
		if(isToa){
			toa('title;'+myFarm+lab_colon+' '+profile.name);
			searchField={};
			searchField.value='';
		}
		else{
			var tbl={table:{width:'96%',children:{tr:{children:[
					{td:{align:'left',children:{div:{children:[
						{'div':{children:{img:{id:'status',style:{cursor:'pointer'},onclick:onclickStus,src:"/Delaval/Resources/delavall.png"}}}},
						{'div':{style:{'font-size':'20px'},innerHTML:'<br />'}},
						{'div':{children:{'input':{id:'menuBtn',type:'button',onclick:menu,className:'button',style:{width:'100%'},value:lab_menu}}}},
					]}}}},
					{td:{align:'center',style:{cursor:'pointer'},onclick:onClickSelectProfile,children:{div:{innerHTML:myFarm+'<br/>'+profile.name}}}},
					{td:{align:'left',width:'25%',children:{div:{children:[
						{'div':{children:{'input':{type:'button',onclick:goToTop,className:'button',style:{width:'100%'},value:lab_top}}}},
						{'div':{children:{'input':{id:'searchField',type:isIE?'text':'tel',style:{width:'98%'},onkeyup:searchKey,onfocus:searchFocus,className:'button',value:lab_search}}}},
					]}}}}
				]}}}};
			topCmd=jr.ec('div',{parentNode:document.body,className:'topCmd',children:[{'table':{parentNode:document.body,className:'cowTable',children:[
				{tr:{className:'container',children:[
					{td:{colSpan:3,children:[{div:{className:'container topCmdBackground',children:tbl}}]}}]}}]}}]});
			topCmdPos();
			parentSearchField=(searchField=document.getElementById('searchField')).parentNode;
			menuBtn=document.getElementById('menuBtn');
			window.onscroll=topCmdPos;
			window.onresize=topCmdPos;
		}
	},
	topCmdPos=function(){
		topCmd.style.top=window.pageYOffset+'px';
		topCmd.style.left='0px';
	},
	renderAll=function(){
		while(document.body.childNodes[0])
			document.body.removeChild(document.body.childNodes[0]);
		table=jr.ec('table',{parentNode:document.body,className:'cowTable',children:[
			(isToa?{}:{tr:{id:'tblcmnd',className:'container',children:[
				{td:{colSpan:3,children:[{div:{className:'container styleWhite'}}]}}]}})]});
		if(debugElement==null){
			debugElement=jr.ec('div',{parentNode:document.body,className:'command'});
			document.body.removeChild(debugElement);
		}
		renderTopCommand();
		tableParent=table.childNodes[0];
		renderHead(tableParent);
		renderAllCows();
	},
	creFlds=function(ip,cl){
		var i=-1,cnt=cl==1?colCnt1:colCnt2,r=[];
		while(++i<cnt)r.push({'div':{}});
		jr.ec(ip,{children:r});
	},
	renderCow=function(cow){
		cow.gui=jr.ec('tr',{style:{cursor:'pointer'},children:[
			{'td':{onclick:onclickDoCheck,cow:cow,align:'center',children:[{'div':{className:'container',children:[
				{div:{children:function(innerParent){getIncompletePict(cow,innerParent,70,cowImage)}}},
				{div:{children:function(innerParent){getCheck(cow,innerParent)}}}]}}]}},
			{'td':{onclick:onclickCow,cow:cow,children:[{'div':{className:'container',style:{overflow:'hidden',whiteSpace:'nowrap'},children:function(ip){creFlds(ip,1)}}}]}},
			{'td':{onclick:onclickCow,cow:cow,children:[{'div':{className:'container',style:{overflow:'hidden',whiteSpace:'nowrap'},children:function(ip){creFlds(ip,2)}}}]}}]});
	},
	renderAllCows=function(){
					var i=-1;
					while(++i<allCows.length)
						renderCow(allCows[i]);
				},
	showDebug=function(){
		if((dbg=!dbg)){
			document.body.appendChild(debugElement);
		}
		else{
			document.body.removeChild(debugElement);
		}
	},
	renderHead=function(parent) {
		jr.ec('tr',{parentNode:parent,id:'tblHead',className:'container',children:[
				{td:{align:'center',children:[
					{div:{className:'container',children:[
						{img:{id:'status',style:{cursor:'pointer'},onclick:onclickStus,src:"/Delaval/Resources/status1.png"}},
						{img:{id:'search',style:{cursor:'pointer'},onclick:onclickUdder,src:"/Delaval/Resources/cow/udderQW.png"}}]}}]}},
				function(ip){jr.ec(ip,{children:creHead()})}]});
		scls(document.getElementById('tblHead'),'styleRubber');
//document.body.appendChild(debugElement);
	},
	addChild=function(root,index,child){root[index].td.children[0].div.children.push(child);},
	creCols=function(nr){var i=-1,a=[];while(++i<nr)a.push({'td':{children:[{'div':{className:'container',children:[]}}]}});return a;},
	creHead=function(){
		var i=-1,r=creCols(2);
		while(++i<colCnt1)addChild(r,0,{'div':{id:'hd'+i,style:{overflow:'hidden',whiteSpace:'nowrap'},onclick:onclickHdr,innerHTML:flds[i+1]==0?'<br />':pr.fieldNames[flds[i+1]]}});
		i=-1;while(++i<colCnt2)addChild(r,1,{'div':{id:'hd'+(i+colCnt1),style:{overflow:'hidden',whiteSpace:'nowrap'},onclick:onclickHdr,innerHTML:flds[i+colCnt1+1]==0?'<br />':pr.fieldNames[flds[i+colCnt1+1]]}});
		return r;
	},
	getCheck=function(cow,innerParent){
		if(cow.markBySign!=null){
			var index=(cow.notifi==null?0:2)+(cow.markBySign==who?0:1);
			var canvas=jr.ec('canvas',{parentNode:innerParent,width:100,height:70}),ctx=canvas.getContext("2d");
			ctx.drawImage(cowImage,0,70+index*70,100,70,0,0,100,70);
		}
	},
	redYelWhi=function(o1,o2){
		if(o1.next==o2.next)
			return sd*(o1.nr-o2.nr);
		var s1=o1.next==null?1:tNow>o1.next?tNow-o1.prev>o1.over?4:3:2;
		var s2=o2.next==null?1:tNow>o2.next?tNow-o2.prev>o2.over?4:3:2;
		return sd*(s1==s2?o1.next-o2.next:s1<s2?1:-1);
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
	sort=function(o1,o2){
		if(((o1.action==0)&&(o2.action==0))||((o1.action!=0)&&(o2.action!=0)))
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
	setVal=function(c,t,e){
		switch(t){
			case 2:	e.innerHTML=c.nr;break;
			case 3:	e.innerHTML=animalGroups[c.group.toString()].name+' ('+c.group+')';break;
			case 4:	e.innerHTML=c.nr+' ('+animalGroups[c.group.toString()].name+')';break;
			case 5:	e.innerHTML=c.lact;break;
			case 6:	e.innerHTML=c.lactS==null?'':Math.floor((tNow-c.lactS)/86400);break;
			case 7:	t=Math.floor((tNow-c.lactS)/86400);e.innerHTML=c.lactS==null?'':(t<0?'???':t)+' ('+c.lact+')';break;
			case 8:	e.innerHTML=tm(c.prev);break;
			case 9:	e.innerHTML=tm(c.next);break;
			case 10: var l=c.occ.length;e.innerHTML=l==0?'-':c.occ[0]+(l<=1?'':' ('+c.occ[1]+(l<=2?'':','+c.occ[2])+(l<=3?'':','+c.occ[3])+')');break;
			case 11:e.innerHTML=tNow-c.prev>=86400?'':Math.floor(((tNow-c.prev)/3600*c.spd+c.cy)/10+.5)/10;break;
			case 12:if(c.sevenDays>0){renderMilkUpDn(c,e,true);}break;
			case 13:if(c.sevenDays>0){renderMilkUpDn(c,e,false);}break;
			case 14:if(c.sumMask>>10)getLevels(c.sumMask,e,cowImage);break;
			case 16:
				var s=c.notifi==null?'':c.notifi;
				s+=c.markBySign==null?'':(c.notifi==null?'(':' (')+c.markBySign+')';
				if(s.length>17)s=s.substr(0,15)+'...';
				e.innerHTML=s;break;
			case 17:e.innerHTML=actions[c.action];break;
			case 18:e.innerHTML=c.name==null?'':c.name;break;
			case 19:e.innerHTML=c.nr+(c.name==null?'':' ('+c.name+')');break;
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
		}
		if( e.innerHTML.length == 0 )
			e.innerHTML = '<br />';
	},
	reRender=function(){
		unDisplayCows();
		cows.sort(sort);
		displayCows();
		update();
		updateSort();
	},
	selectCows=function(){
		unDisplayCows();
		cows=[];
		var i=-1,p=profile,o,cow,ii,c,sinceMilk=p.sinceMilk*3600,milkPerm=p.milkPerm*3600,lactDay=p.lactDay&0xff,lactDayHour=(p.lactDay>>8)*3600,samePlace=p.samePlace*3600,
			expYield=p.expYield,incomplete=p.incomplete*3600,action=p.action,cells=p.cells,activity=p.activityAndAreaMask,included,isCondition;
		while(++i<allCows.length){
			included=isCondition=false;
			cow=allCows[i];
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
			if(!isCondition||included)
				cows.push(cow);
		}
		cows.sort(sort);
		displayCows();
	},
	update=function(){
		tNow=Math.floor((new Date()).getTime()/1000-diff);
		setColors();
		for(var i in cows) {
			var cow=cows[i],c=0;
			while(++c<flds.length)
				setVal(cow,flds[c],cow.gui.children[Math.floor((c-1)/colCnt1)+1].children[0].children[(c-1)%colCnt1]);
		}
		clearTimeout(timer);
		timer=setTimeout(update,10000);
	},
	debug=function(str){
		debugElement.innerHTML=n3(++debugLine)+': '+(new Date()).printd()+'  '+str+'<br/>'+debugElement.innerHTML;
	},
	updateSort=function() {
		var i=0;
		while(++i<flds.length)
			document.getElementById('hd'+(i-1)).className=flds[i]==sm?'headchoosen':'headlabel';
	},
	getStyle=function(cow){
		var a=cow.action;
		return a==1?'styleLGreen':a==2?'styleGreen':cow.next==null?'styleOrange':tNow>=cow.next?tNow-cow.prev>=cow.over&&cow.over>=0?cow.prev==0?'styleOrange':'styleRed':'styleYellow':'styleWhite';
	},
	setColors=function() {
		for(var cw in cows){
			var cow=cows[cw];
			scls(cow.gui,getStyle(cow));
		}
	},
	unDisplayCows=function(){
		for(var i in cows)
			tableParent.removeChild(cows[i].gui);
	},
	displayCows=function(){
		for(var i in cows)
			tableParent.appendChild(cows[i].gui);
	},
	updateProfileFields=function(){
		flds=[];
		var ind=pr.profile.indexes, i=-1;
		while(++i<ind.length)flds.push(ind[i]);
		while(++i<=7)flds.push(0);
		sm=flds[0];
		colCnt2=Math.max(0,flds.length-1-(colCnt1=Math.floor((flds.length)/2)));
	},
	bigUpdate=function(){
		tNow=Math.floor((new Date()).getTime()/1000-diff);
		unDisplayCows();
		cows=[];
		renderAll();
		selectCows();
		update();
		updateSort();
	},
	onProfileOk=function(newProfile){
		profile=newProfile;
		updateProfileFields();
		bigUpdate();
	},
	disableQueueView=function(){
		setSearchMode(false);
		goToTop();
		unlinkAll();
	},
	enableQueueView=function(){
		document.body.appendChild(table);
		if(!isToa)
			document.body.appendChild(topCmd);
	},
	onClickSelectProfile=function(){
		disableQueueView();
		var i=-1;
		for(var g in animalGroups)
			animalGroups[g].count=0;
		while(++i<allCows.length)
			animalGroups[allCows[i].group].count++;
		pr.allProfilesDlg(enableQueueView,onProfileOk,myFarm,who,allCows,cows,animalGroups,cowImage,perm,areas);
	},
	onclickStus=function(){
		if (sm==1)
			sd=-sd;
		else{
			sm=1;
			sd=1;
		}
		reRender();
	},
	onclickCow=function() {
		if(this.cow!=null){
			goToTop();
			document.body.removeChild(table);
			if(topCmd!=null)
				document.body.removeChild(topCmd);
			if(detailPage==0)
				details(this.cow.nr);
			else
				jr.ajax('SrvAnimal', 'getAnimalData', this.cow.nr, 'getAnimalData');
		}
	},
	onclickHdr=function() {
		var smNew=flds[parseInt(this.id.substring(2))+1];
		if (smNew==sm)
			sd=-sd;
		else {
			sm=smNew;
			sd=1;
		}
		reRender();
	},
	onclickUdder=function(){
		if(sm==15)
			sd=-sd;
		else{
			sm=15;
			sd=1;
		}
		reRender();
	},
	onclickDoCheck=function(){
		if(this.cow.markBySign==null){
			var comment=prompt(lab_markComment,'');
			if(comment!=null)
				jr.ajax('SrvAnimal', 'makeNotification', this.cow.nr.toString()+' '+encodeURIComponent(comment), null);
		}
		else if (confirm(lab_sureDelMark+' '+this.cow.nr))
			jr.ajax('SrvAnimal', 'deleteNotification', this.cow.nr.toString(), null);
	},
	menu=function(){
		if(searchMode)
			setSearchMode(false);
		else
			navigateTo('/app.vcx');
	},
	profileUpdate=function(d){
		if(d){
			var firstTime=profile==null;
			profile=pr.init(d);
			if(firstTime){
				updateProfileFields();
				unlinkAll();
				initiated();
			}
			else
				onProfileOk(profile);
		}
	},
	getAnimalData=function(d){
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
		}
		detailData=d;
		var i=-1,o,d,ot,b,m=null,c,df,y24cmp=detailCow.curr.sevenDays==null?null:detailCow.curr.sevenDays/10,dt,lastTime;
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
		var cw=data.cellsWarning,ca=data.cellsAlarm,bw=data.bloodWarning,ba=data.bloodAlarm,mw=data.mdiWarning,ma=data.mdiAlarm;
		while(++i<d.mlk.length){
			o=d.mlk[i];
			o.time=parseInt(o.milkingTimeHex,16);
			if(i==0)lastTime=o.time;
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
		var listDiv=detailHeader(detailCow.curr),empty=milkingsList==null;
		if(viewMode==1){
			o=empty?0:milkingsList.sortCol;
			d=empty?1:milkingsList.sortDirection;
			milkingsList=new milkings(detailCow.curr,detailData.mlk,listDiv,getMilkingsInstance,cowImage);
			milkingsList.sortDirection=empty?-1:-d;
			milkingsList.sortCol=o;
			milkingsList.setSortCol(o);
		}
		else{
			setGraph(listDiv);
		}
	},
	getMilkingsInstance=function(){
		return milkingsList;
	},
	changeDetails=function(){
		document.body.removeChild(dlg);
		viewMode=(++viewMode)%3;
		details();
	},
	detailEnd=	function(){},
	detailNext=	function(){
		document.body.removeChild(dlg);
		details(this.value);
	},
	detailReturn=function(){
		document.body.removeChild(dlg);
		document.body.appendChild(table);
		if(!isToa)
			document.body.appendChild(topCmd);
		window.scroll(0,detailCow.curr.gui.offsetTop-offsetFirstAnimal/2);
		detailCow = null;
	},
	renderMilkUpDn=function(d,parent,arrows){
		while(parent.childNodes.length>0)
			parent.removeChild(parent.childNodes[0]);
		parent.appendChild(jr.ec('span',{innerHTML:d.sevenDays/10}));
		if(arrows){
			parent.appendChild(jr.ec('span',{innerHTML:' '}));
			renderUpDown(d.sumMask,0,parent,cowImage);
			parent.appendChild(jr.ec('span',{innerHTML:'('}));
			renderUpDown(d.sumMask,2,parent,cowImage);
			renderUpDown(d.sumMask,4,parent,cowImage);
			renderUpDown(d.sumMask,6,parent,cowImage);
			renderUpDown(d.sumMask,8,parent,cowImage);
			parent.appendChild(jr.ec('span',{innerHTML:')'}));
		}
	},
	detail=function(cowNr) {
		var i=-1;
		while(++i<cows.length&&cows[i].nr!=cowNr);
		this.curr=cows[i];
		this.currInd=i;
		this.next=function(){this.curr=cows[++this.currInd];}
		this.prev=function(){this.curr=cows[--this.currInd];}
	},
	addDetail=function(cc,lab,val){
		cc.push({tr:{className:'container',children:[
				{td:{align:'right',children:{div:{className:'detailLabel',innerHTML:lab+'&nbsp;&nbsp;'}}}},
				{td:{children:{div:{className:'detailValue',innerHTML:val}}}}
			]}});
	},
	detailHeader=function(cow){
		var heading,ind=detailCow.currInd;
		if((cow.mask&0x9999)!=0)
			heading={'div':{className:'topHeading '+getStyle(cow),children:[{'span':{id:'incomplPic'}},{'span':{innerHTML:'&nbsp;&nbsp;'+cow.nr+(cow.name==null?'':lab_space+cow.name)}}]}};
		else
			heading={'div':{className:'topHeading '+getStyle(cow),innerHTML:cow.nr+(cow.name==null?'':lab_space+cow.name)}};
		var btns=[],next=lab_space,prev=lab_space,nextFkn=detailEnd,prevFkn=detailEnd;
		if(cows.length>1){
			if(ind+1<cows.length){
				next=cows[ind+1].nr.toString();
				nextFkn=detailNext;
			}
			if(ind>0){
				prev=cows[ind-1].nr.toString();
				prevFkn=detailNext;
			}
		}
		btns.push(btn_queue);
		btns.push(detailReturn);
		btns.push(next);
		btns.push(nextFkn);
		btns.push(prev);
		btns.push(prevFkn);
		btns.push(jr.translate(viewMode==0?'Milkings':viewMode==1?'Graph':'Data'));
		btns.push(changeDetails);
		var contentDiv=jr.ec('div',{});
		dlg=initDialog(document.body,heading,btns,contentDiv);
		return contentDiv;
	},
	fieldDetails=function(){
		var cc=[],flds=[11,8,12,3,5,6,10,14,17,22,23],cow=detailCow.curr;
		var i=-1;
		while(++i<flds.length)
			cc.push({tr:{className:'container',children:[
					{td:{align:'right',children:{div:{className:'detailLabel',innerHTML:pr.fieldNames[flds[i]]+'&nbsp;&nbsp;'}}}},
					{td:{children:{div:{className:'detailValue',id:'fld'+i}}}}
				]}});
		if(cow.markByUser!=null)
			addDetail(cc,lab_nofiedBy,cow.markByUser);
		if(cow.notifi!=null)
			addDetail(cc,lab_nofication,cow.notifi);
		detailHeader(cow).appendChild(jr.ec('table',{children:cc}));
		if((cow.mask&0x9999)!=0)
			getIncompletePict(cow,document.getElementById('incomplPic'),45,cowImage);
		i=-1;
		cow.sevenDays=Math.abs(cow.sevenDays);
		while(++i<flds.length)
			setVal(cow,flds[i],document.getElementById('fld'+i));
	},
	details=function(cowNr){
		if(cowNr!=null)
			detailCow=new detail(cowNr);
		if(viewMode==0)
			fieldDetails();
		else
			jr.ajax('SrvAnimal', 'getAnimalData', detailCow.curr.nr, 'getAnimalData');
	},
	setGraph=function(graphDiv){
		var view=jr.ec('canvas',{parentNode:graphDiv,id:"myGraph",className:'',width:graphDiv.clientWidth-60,height:(window.innerHeight-graphDiv.offsetTop-50)});
		sGraph.Clear('#07D2E0','#f4f4f4','d/m');
		sGraph.setFont('italic bold 20px sans-serif', 20);
		var i=0,detm=detailData.mlk,sevenDays=detailCow.curr.sevenDays==null?null:detailCow.curr.sevenDays/10,yld;
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
	searchSelect=function(){
		unDisplayCows();
		cows=[];
		var nr=searchField.value.trim().toLowerCase();
		for(var i in allCows){
			var b=nr.length==0,cw=allCows[i];
			if(!b&&(!(b=cw.nr.toString().indexOf(nr)>=0))&&(cw.name!=null))
				b=cw.name.toLowerCase().indexOf(nr)>=0;
			if(b)
				cows.push(cw);
			}
		displayCows();
	},
	setSearchMode=function(isOn){
		if(isOn!=searchMode){
			if((searchMode=isOn)){
				if(!isToa)
					menuBtn.value=lab_stopSearch;
				goToTop();
				unDisplayCows();
				cows=allCows;
				cows.sort(sort);
				displayCows();
				update();
			}
			else{
				if(!isToa){
					menuBtn.value=lab_menu;
					searchField.value=lab_search;
				}
				goToTop();
				selectCows();
			}
		}
	},
	searchFocus=function(){
		if(isAndroid){
			searchField.blur();
			var s=prompt(lab_search);
			if(s!=null){
				s=s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				if(s.length>0){
					searchField.value=s;
					searchKey();
				}
			}
		}
		else if(searchField.value==lab_search)
			searchField.value='';
		setSearchMode(true);
	},
	searchKey=function(){
		setSearchMode(true);
		searchSelect();
	},
	brSearch=function(val){
		setSearchMode(true);
		searchField.value=val;
		searchKey();
	},
	goToTop=function(){
		window.scroll(0,0);
	},
	unlinkAll=function(){
		if(table!=null){
			document.body.removeChild(table);
			document.body.removeChild(topCmd);
		}
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
		this.sumMask=parseInt(d.getString(),16);
		this.areaId=d.getString();
		this.inAreaSince=getDate(d);
		this.occ=[];var s,i=-1,cnt=d.getInt();while(++i<cnt)this.occ.push((s=d.getString())==null?'-':s);
		this.lastOcc=0;i=-1;while(++i<cnt&&this.occ[i]=='-');if(i<cnt)this.lastOcc=parseInt(this.occ[i]);
	},
	animalGroup=function(d){
		this.nr=		d.getInt();
		this.name=		d.getString();
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
			animalGroups[o.nr]={name:o.name};
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
			if(d.getInt()==1)
				allCows.push(new cow(d));
		initiated();
	},
	onNewData=function(data){
		debug('poll answer '+data);
		var d=new JsSerilz('$',data),newCow,i,seq,f=false,bigUpdate=false;
		while(d.hasMore()){
			f=true;
			var cmd=d.getInt();
			if(cmd==1){
				newCow=new cow(d);
				i=-1;
				while(++i<allCows.length&&allCows[i].nr!=newCow.nr){}
				if(i<allCows.length)
					allCows[i]=newCow;
				else
					bigUpdate|=true;
				renderCow(newCow);
			}
			else if(cmd==0){
//				bigUpdate|=true;
//				pg.allCows.splice(i,1);
			}
		}
		if(f){
			if(!searchMode){
				if(bigUpdate)
					bigUpdate();
				else{
					selectCows();
					update();
				}
			}
			else
				update();
		}
	},
	lab_top=			jr.translate("Go to top"),
	lab_search=			jr.translate("Search"),
	lab_stopSearch=		jr.translate("Stop search"),
	lab_colon=			jr.translate(":"),
	lab_menu=			jr.translate("Menu page"),
	lab_nofiedBy=		jr.translate("Marked by"),
	lab_nofication=		jr.translate("Notification"),
	lab_noficationDate=	jr.translate("Mark time"),
	btn_queue=			jr.translate("Back"),
	lab_sureDelMark=	jr.translate("Delete mark for animal"),
	lab_markComment=	jr.translate("Mark animal with optional comment"),
	lab_space=			jr.translate(" - "),
	actions=			jr.translate("Milk,FeedOnly,PassThrough,Unselected").split(','),
	offsetFirstAnimal=	0,
	initDone=			false,
	profile=			null,
	flds=				null,
	sm=					1,
	sd=					1,
	colCnt1=			0,
	colCnt2=			0,
	diff=				0,
	tNow=				0,
	perm=				0,
	debugLine=			0,
	detailPage=			0,
	viewMode=			0,
	cows=				[],
	animalGroups=		[],
	areas=				[],
	waitAreas=			[],
	vmsAreas=			[],
	allCows=			[],
	table=				null,
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
	dlg=				null,
	cowImageLoaded=		false,
	cowImage=			new Image(),
	searchMode=			false,
	isToa=				false,
	isAndroid=			false,
	isIE=				false;

	jr.eventManager.addListener('profileUpdate', jr.eventManager, function(data) {profileUpdate(data);});
	jr.eventManager.addListener('pollResult', this, function(data) { onNewData(data);});
	jr.ajax('Profile','getProfiles',null,'profileUpdate');
	cowImage.onload=imageLoaded;
	cowImage.src="/Delaval/Resources/info.png";
	isIE=navigator.appName!=null&&navigator.appName.toLowerCase().indexOf('internet explorer')>0;
	isAndroid=navigator.userAgent.toLowerCase().indexOf('android')>=0;
	toa();
	isToa=typeof toaq!='undefined';
	me=data.sessId;
	Date.prototype.tmf=data.dateFormat;
	diff=Math.floor((new Date()).getTime()/1000)-data.nowSec;
	name=(myFarm=data.vcName)+lab_colon+' '+(who=data.nameFirst+' '+data.nameLast);
	perm=data.perm;
	parseHead(new JsSerilz('$',data.serializedData));
	data.serializedData=null;
	jr.eventManager.addListener('getAnimalData',jr.eventManager,function(data){getAnimalData(data);});
	jr.eventManager.addListener('animalUpdate',null,function(data){onNewData(data)});
}
jr.init( function() {
    jr.ec( document.body, { children: [
	{ 'div': { style: { width: '99.5%', height: '99.5%', position: 'absolute', left: '0.5%', top: '0.5%', overflow: 'auto' },
		actions: { addListener: { typeName: 'getCowQueue', method: function( messages ) {
			new Queue(this,messages);
		} } }
	} },
    ] } );
	var i,param=null;
	if((i=window.location.href.indexOf('='))>0)
		param=window.location.href.substr(i+1);
	jr.ajax('SrvAnimal','getCowQueue',param,'getCowQueue');
	
	jr.eventManager.addListener( 'pollResult', null, function( data ) {
		if( data && data.animal )
			jr.eventManager.raiseEvent( 'animalUpdate', data.animal );
		jr.ajax('PollEvent', 'waitEvent', param, 'pollResult', null, true);
	} );
	jr.ajax('PollEvent', 'waitEvent', param, 'pollResult', null, true);
} );
