jr.include('/util.js');
jr.include('/cli.css');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');
var phones = {
	instance:	function(myDiv){
	var
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1700);
			ce.background.style.width=width+'px';
			updateSortHeader();
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		typ=0,
		users,
		phones,
		oldestInactivePhoneDays,
		root,
		lastTipData,
		sm=0,
		sd=1,
		lastInd=-1,
		ce={},
		now,nextDay,time24h,time7d,time1month,time3month,
		head=[labDate,labTime,labDays,labName,labDomain,labPhone,labOsVer,labAppVer,lab24h,lab7d,lab1month,lab3month,labTotal,labDelete],
		onclickHead=function(){
			var nsm=parseInt(this.id);
			if (nsm===sm)
				sd=-sd;
			else {
				sm=nsm;
				sd=1;
			}
			render();
		},
		updateSortHeader=function(){
			var i=-1;
			while(++i<head.length)
				ce.tblHead.childNodes[i].childNodes[0].className='styleRubber container '+(i===sm?'headchoosen':'headlabel');
		},
		sort=		function(o1,o2){
			switch(sm){
				case 0:
					return sd*(o2.ev.time-o1.ev.time);
				case 1:
					return sd*(o1.ev.sec-o2.ev.sec);
				case 2:
					return sd*(o1.nrDays-o2.nrDays);
				case 3:
					return sd*(o1.user.name===o2.user.name?o2.ev.time-o1.ev.time:o1.user.name.localeCompare(o2.user.name));
				case 4:
					return sd*(o1.user.domain.localeCompare(o2.user.domain));
				case 5:
					return sd*(o1.model?o1.model.localeCompare(o2.model):o2.model?1:o2.ev.time-o1.ev.time);
				case 6:
					var l1=o1.osVersion.length,l2=o2.osVersion.length;
					return !!l1^!!l2?l1?-1:1:sd*(o2.osVersion===o1.osVersion?o2.appVersion===o1.appVersion?sd*(o2.ev.time-o1.ev.time):o2.appVersion.localeCompare(o1.appVersion):o2.osVersion.localeCompare(o1.osVersion));
				case 7:
					var l1=o1.osVersion.length,l2=o2.osVersion.length;
					return !!l1^!!l2?l1?-1:1:sd*(o2.appVersion===o1.appVersion?o2.osVersion===o1.osVersion?sd*(o2.ev.time-o1.ev.time):o2.osVersion.localeCompare(o1.osVersion):o2.appVersion.localeCompare(o1.appVersion));
				case 8:
					return sd*(o1.sum24h===o2.sum24h?o1.sum7d===o2.sum7d?o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.user.domain.localeCompare(o2.user.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month:o2.sum7d-o1.sum7d:o2.sum24h-o1.sum24h);
				case 9:
					return sd*(o1.sum7d===o2.sum7d?o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.user.domain.localeCompare(o2.user.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month:o2.sum7d-o1.sum7d);
				case 10:
					return sd*(o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.user.domain.localeCompare(o2.user.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month);
				case 11:
					return sd*(o1.time3month===o2.time3month?o1.ev.time-o2.ev.time:o2.time3month-o1.time3month);
				case 12:
					return sd*(o1.total===o2.total?o2.ev.time-o1.ev.time:o2.total-o1.total);
			}
		},
		makePopup=function(data,headLine){
			if (data.contact) {
				sGraph.Clear('#7395C9','#B2CDF7','d/m');
				sGraph.setFont('italic bold 20px sans-serif', 20);
				sGraph.addLine('#0000ff',3,"#ff00ff");
				var cc={},rVal=
					jr.ec('div',{className:'styleDialog',children:[
						{div:{className:'dialogTable graphHead',innerHTML:headLine}},
						{'canvas':{contextIdentity:'ratio',width:760,height:150}}
					]},cc),size=Object.keys(data.ev).length;
				for(var key in data.contact) {
					var o=data.contact[key],t=(o.time/3600000)*3600000;
					if(size<20||t>nextDay-1296000000)
						sGraph.addStaple(t,o.cnt>10?11:o.cnt,t+3600000);
				}
				sGraph.paint(cc.ratio);
				return rVal;
			}
			return null;
		},
		prepareDateTime=function(){
			jr.foreach(phones,function(phn){
				phn.sum24h=phn.sum7d=phn.sum1month=phn.time3month=0;
				phn.nrDays=Math.floor((nextDay-phn.ev.time)/86400000);
				if(phn.ev.time<time3month)
					phn.time3month=phn.ev.time;
				else
					jr.foreach(phn.contact,function(o){
						var t=o.time,cnt=o.cnt;
						if(t>time1month){
							phn.sum1month+=cnt;
							if(t>time7d){
								phn.sum7d+=cnt;
								if(t>time24h)
									phn.sum24h+=cnt;
							}
						}
					});
			});
		},
		onCellMove = function() {
			var data=this.parentNode.data;
			if(lastTipData!==data){
				lastTipData=data;
				var d = makePopup(data,data.name);
				if (d) {
					mouseBox.show(d);
					mouseBox.move();
				}
				return;
			}
			mouseBox.move();
		},
		onCellOut = function() {
			if(lastTipData){
				lastTipData=null;
				mouseBox.hide();
			}
		},
		doCheck=function() {
			var chkbox = document.getElementById(this.data.id),i=-1,isShift=!!event.shiftKey;
			while(++i<phones.length&&phones[i].id!==this.data.id){}
			chkbox.checked=phones[i].checked=!phones[i].checked;
			this.className=chkbox.checked?'styleYellow container':'styleWhite container';
			if(isShift&&lastInd!==i){
				var step=lastInd>i?1:-1,node=this;
				do{
					i+=step;
					var p=phones[i];
					node=step>0?node.nextSibling:node.previousSibling;
					if(p.checked>=0) {
						document.getElementById(p.id).checked=p.checked=chkbox.checked;
						node.className=chkbox.checked?'styleYellow container':'styleWhite container';
					}
				} while(lastInd!==i);
			}
			lastInd=i;
			checkDeleteBtn();
		},
		render=function(){
			updateSortHeader();
			nextDay=new Date();
			now=nextDay.getTime();
			nextDay.setHours(0,0,0,0);
			nextDay=nextDay.getTime()+86400000;
			time24h=now-86400000;
			time7d=now-604800000;
			time1month=now-2635200000;
			time3month=now-7905600000;
			prepareDateTime();
			phones.sort(sort);
			var table=ce.tblHead.parentNode,wday=-1,wdayStr,nrDaysStr,nrDays=-1;
			while(table.childNodes.length>1)
				table.removeChild(table.childNodes[table.childNodes.length-1]);
			jr.foreach(phones,function(phn){
				wdayStr=!sm?wday===phn.ev.weekDay?'':' '+(phn.lastContact?labWeekDay[phn.ev.weekDay]:'Never'):'';
				wday=phn.ev.weekDay;
				nrDaysStr=nrDays===phn.nrDays?'':phn.lastContact?phn.nrDays>0?phn.nrDays:labToday:'';
				nrDays=phn.nrDays;
				jr.ec('tr',{className:phn.checked>0?'styleYellow container':'styleWhite container',parentNode:table,data:phn,onclick:phn.checked>=0?doCheck:null,children:[
					{'td':{innerHTML:'<nobr>'+phn.ev.printDate+wdayStr+'&nbsp;</nobr>'}},
					{'td':{innerHTML:phn.ev.printTime+'&nbsp;'}},
					{'td':{className:'leftJustify',innerHTML:nrDaysStr+'&nbsp;'}},
					{'td':{onmouseout:onCellOut,onmousemove:onCellMove,innerHTML:'<nobr>'+phn.user.name+'&nbsp;</nobr>'}},
					{'td':{onmouseout:onCellOut,onmousemove:onCellMove,innerHTML:'<nobr>'+phn.user.domain+'&nbsp;</nobr>'}},
					{'td':{onmouseout:onCellOut,onmousemove:onCellMove,innerHTML:'<nobr>'+(phn.model?phn.model:'')+(phn.name===phn.model?'':' ('+phn.name+')')+'&nbsp;</nobr>'}},
					{'td':{innerHTML:phn.osVersion?('<nobr>'+phn.osVersion+'&nbsp;</nobr>'):''}},
					{'td':{innerHTML:phn.appVersion?('<nobr>'+phn.appVersion+'&nbsp;</nobr>'):''}},
					{'td':{className:'leftJustify',innerHTML:(phn.sum24h?phn.sum24h:'')+'&nbsp;'}},
					{'td':{className:'leftJustify',innerHTML:(phn.sum7d?phn.sum7d:'')+'&nbsp;'}},
					{'td':{className:'leftJustify',innerHTML:(phn.sum1month?phn.sum1month:'')+'&nbsp;'}},
					{'td':{innerHTML:phn.time3month?'<nobr>'+new Date(phn.time3month).printdate()+'</nobr>&nbsp;':''}},
					{'td':{className:'leftJustify',innerHTML:phn.total?phn.total+'&nbsp;':''}},
					{'td':{width:'1%',children:phn.checked>=0?[{input:{id:phn.id,style:{'text-align':'center'},type:'checkbox',checked:phn.checked}}]:{}}}
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.ev[0].printDate+wdayStr}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.ev[0].printTime}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.name}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.domain}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.sum24h?u.sum24h:'&nbsp;'}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.sum7d?u.sum7d:'&nbsp;'}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.sum1month?u.sum1month:'&nbsp;'}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.time3month?new Date(u.time3month).printdate():'&nbsp;'}}}},
//					{'td':{children:{'div':{className:'styleWhite container',innerHTML:u.total}}}}
				]});
			});
			checkDeleteBtn();
			onresize();
		},
		deleteChecked=function(){
			if (window.confirm(labSureDelete.replace('$label',checkDeleteBtn()))){
				var ph=[],i=-1;
				while(++i<phones.length)
					if(phones[i].checked>0)
						ph.push(phones[i].id);
				jr.ajax( 'SrvUser', 'deletePhones', {deleteIds:ph}, 'myConf' );
			}
		},
		back=function() {
			window.history.back();
		},
		checkDeleteBtn=function() {
			var i=-1,sum=0,node=document.getElementById('deleteButton');
			while(++i<phones.length)
				sum+=phones[i].checked>0?1:0;
			node.disabled=!sum;
			node.value=labDelete+(sum?' '+sum:'');
			return sum;
		},
		show=function(){
			var f=[],i=-1,vh=[];
			vh.push({'tr':{className:'container',children:[
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {src: jr.getResource('../Resources/logo.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {onclick:back, style:{cursor:'pointer'}, src: jr.getResource('../Resources/arrow_white.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading'}},
						{'td':{width:'99%',className:'topHeading',children:[
							{'span': {style:{'font-size':'x-large'},innerHTML:'<nobr>'+labPhoneUsage+'</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{assignments:{id:'deleteButton',type:'button',className:'button',value:labDelete,onclick:deleteChecked}}}
						]}}
					]}});
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{contextIdentity:'hd'+i,id:i,innerHTML:head[i],onclick:onclickHead}}},{'div':{className:'cellSpace'}}]}});
			if (root)
				document.body.removeChild(root);
			root=jr.ec('div',{parentNode:myDiv,className:'styleBackground',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vh}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
					{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}}
			]}}},ce);
			render();
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		makeDiv = function(text){
			return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
		},
		addEvent=function(time) {
			this.time = time;
			this.lastContact = time;
			this.date=new Date(time);
			this.date.setHours(0,0,0,0);
			this.date=this.date.getTime();
			this.sec=time-this.date;
			var tm=new Date(time);
			this.weekDay=tm.getDay();
			if(tm.getTime()) {
				this.printDate=tm.printdate();
				this.printTime=tm.printhms();
			}
			else
				this.printDate=this.printTime='';
		},
		user=function(sd) {
			var id=sd.getString();
			this.name=sd.getString();
			this.domain=sd.getString();
			this.lastContact=sd.getInt();
			this.ev=new addEvent(this.lastContact);
			this.hasPhone=0;
			users[id]=this;
		},
		phone=function(sd,id) {
			this.userId=id;
			this.id=sd.getString();
			this.name=sd.getString();
			this.model=sd.getString();
			this.appVersion=sd.getString();
			this.osVersion=sd.getString();
			this.creTime=sd.getInt();
			this.manufacturer=sd.getInt();
			this.total=0;
			var cnt=sd.getInt();
			this.contact=[];
			while(--cnt>=0){
				var ct=sd.getInt();
				this.total+=ct;
				this.contact.push({cnt:ct,time:sd.getInt()});
			}
			this.lastContact=this.contact[this.contact.length-1].time;
			this.ev=new addEvent(this.lastContact);
			this.checked=0;
		},
		conf=function(d){
			var sd=new JsSerilz('$',d),next,u;
			oldestInactivePhoneDays=sd.getInt();
			users={};
			phones=[];
			while((next=sd.getString()))
				phones.push(new phone(sd,next));
			next=sd.getInt();
			while(--next>=0)
				new user(sd);
			jr.foreach(phones,function(p){
				(p.user=users[p.userId]).hasPhone=1;
			});
			for(var u in users)
				if (!users[u].hasPhone)
					phones.push({user:users[u],lastContact:users[u].lastContact,ev:users[u].ev,total:0,appVersion:'',osVersion:'',checked:-1});
			show();
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		this.setData=function(d){conf(d);};
		labWeekDay=labWeekDay.split(',');
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)conf(data);});
		jr.ajax( 'SrvUser', 'getPhoneUsage', 0, 'myConf' );
	}
};
jr.init( function() {
	new phones.instance(document.body);
} );
