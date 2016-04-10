jr.include('/util.js');
jr.include('/cli.css');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');
var users = {
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
		users=null,
		root,
		lastTipData,
		sm=0,
		sd=1,
		dialogIndNew=-1,
		dialogInd=-1,
		toffs=new Date(0).getHours()*3600000,
		ce={},
		now,nextDay,time24h,time7d,time1month,time3month,
		head=['#',labDate,labTime,labDays,labName,labDomain,labOnline,labPage,lab24h,lab7d,lab1month,lab3month,labTotal],
		onclickHead=function(){
			var nsm=parseInt(this.id);
			if (nsm > 0) {
				if (nsm===sm)
					sd=-sd;
				else {
					sm=nsm-1;
					sd=1;
				}
				render();
			}
		},
		updateSortHeader=function(){
			var i=-1;
			while(++i<head.length)
				ce.tblHead.childNodes[i].childNodes[0].className='styleRubber container '+(i===sm?'headchoosen':'headlabel');
		},
		sort=		function(o1,o2){
			switch(sm){
				case 0:
					return sd*(o2.ev[0].time-o1.ev[0].time);
				case 1:
					return sd*(o1.ev[0].sec-o2.ev[0].sec);
				case 2:
					return sd*(o1.nrDays-o2.nrDays);
				case 3:
					return sd*(o1.name.localeCompare(o2.name));
				case 4:
					return sd*(o1.domain.localeCompare(o2.domain));
				case 5:
					return sd*(o1.domain.localeCompare(o2.domain));
				case 6:
					return sd*(o1.page.localeCompare(o2.page));
				case 7:
					return sd*(o1.sum24h===o2.sum24h?o1.sum7d===o2.sum7d?o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.domain.localeCompare(o2.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month:o2.sum7d-o1.sum7d:o2.sum24h-o1.sum24h);
				case 8:
					return sd*(o1.sum7d===o2.sum7d?o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.domain.localeCompare(o2.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month:o2.sum7d-o1.sum7d);
				case 9:
					return sd*(o1.sum1month===o2.sum1month?o1.time3month===o2.time3month?o1.domain.localeCompare(o2.domain):o2.time3month-o1.time3month:o2.sum1month-o1.sum1month);
				case 10:
					return sd*(o1.time3month===o2.time3month?o1.ev[0].time-o2.ev[0].time:o2.time3month-o1.time3month);
				case 11:
					return sd*(o1.total===o2.total?o2.ev[0].time-o1.ev[0].time:o2.total-o1.total);
			}
		},
		makePopup=function(data,headLine){
			sGraph.Clear('#7395C9','#B2CDF7','d/m');
			sGraph.setFont('italic bold 20px sans-serif', 20);
			sGraph.addLine('#0000ff',3,"#ff00ff");
			var cc={},rVal=
				jr.ec('div',{className:'styleDialog',children:[
					{div:{className:'dialogTable graphHead',innerHTML:headLine}},
					{'canvas':{contextIdentity:'ratio',width:760,height:150}}
				]},cc),size=Object.keys(data.ev).length;
			for(var key in data.ev) {
				var o=data.ev[key],t=(o.time/3600000)*3600000;
				if(size<20||t>nextDay-1296000000)
					sGraph.addStaple(t,o.cnt>10?11:o.cnt,t+3600000);
			}
			sGraph.paint(cc.ratio);
			return rVal;
		},
		makePopupPage=function(data,headLine,arr){
			sGraph.Clear('#7395C9','#B2CDF7','d/m');
			sGraph.setFont('italic bold 20px sans-serif', 20);
			sGraph.addLine('#0000ff',3,"#ff00ff");
			var rows = [], i = arr.length, lastDayStr, ndays;
			while(--i >= 0) {
				var a = arr[i], t = a.time, tm=new Date(t), weekDay=tm.getDay(), printDate=tm.printdate(), printTime=tm.printhms(), nrDays=Math.floor((nextDay-t)/86400000);
				var dstr = printDate + ' ' + (nrDays < 1 ? labToday : labWeekDay[weekDay]);
				if (lastDayStr === dstr)
					dstr = '&nbsp;';
				else
					lastDayStr = dstr;
				var pp = a.page, pd = ' ' , pi = pp.indexOf(' ');
				ndays=nrDays;
				if (pi > 0) {
					pd = pp.substr(pi + 1);
					pp = pp.substr(0, pi);
				}
				rows.push({'tr':{children:[
					{'td':{className:'styleWhite container',children:{'div':{innerHTML:'<nobr>'+dstr+'</nobr>',onmousemove:onCellPage}}}},
					{'td':{className:'styleWhite container',children:{'div':{innerHTML:'<nobr>'+printTime+'</nobr>',onmousemove:onCellPage}}}},
					{'td':{className:'styleWhite container',innerHTML:pp+'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:pd+'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:arr[i].count}}
				]}});
			}
			var pp = {'table':{children:rows}};
			var rVal=
				jr.ec('div',{className:'styleDialog',children:[
					{div:{className:'dialogTable graphHead',innerHTML:headLine}},
					pp
				]});
			return rVal;
		},
		prepareDateTime=function(){
			jr.foreach(users,function(u){
				u.sum24h=u.sum7d=u.sum1month=u.time3month=0;
				u.nrDays=Math.floor((nextDay-u.ev[0].time)/86400000);
				if(u.ev[0].time<time3month)
					u.time3month=u.ev[0].time;
				else
					jr.foreach(u.ev,function(o){
						var t=o.time,cnt=o.cnt;
						if(t>time1month){
							u.sum1month+=cnt;
							if(t>time7d){
								u.sum7d+=cnt;
								if(t>time24h)
									u.sum24h+=cnt;
							}
						}
					});
			});
		},
		onCellMove = function() {
			var data=this.data;
			if(lastTipData!==data){
				lastTipData=data;
				mouseBox.show(makePopup(data,data.name));
				mouseBox.move();
				return;
			}
			mouseBox.move();
		},
		onCellPage = function() {
			var data=this.parentElement.parentElement.data;
			if(lastTipData!==data){
				lastTipData=data;
				var d = data.pages;
				if (typeof d === 'object') {
					var arr = [];
					for (var key in d)
						arr[key] = d[key];
				}
				mouseBox.show(arr.length?makePopupPage(data, data.name, arr):makePopup(data,data.name));
				mouseBox.move();
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
			users.sort(sort);
			var table=ce.tblHead.parentNode,wday=-1,wdayStr,nrDaysStr,nrDays=-1,ind=0,i=-1;
			while(table.childNodes.length>1)
				table.removeChild(table.childNodes[table.childNodes.length-1]);
			while (++i < users.length) {
				var u = users[i];
				wdayStr=!sm?wday===u.ev[0].weekDay?'':' '+labWeekDay[u.ev[0].weekDay]:'';
				wday=u.ev[0].weekDay;
				nrDaysStr=nrDays===u.nrDays?'':u.nrDays>0?u.nrDays:labToday;
				nrDays=u.nrDays;
				jr.ec('tr',{parentNode:table,data:u,onmouseout:onCellOut,onmousemove:onCellMove, style:{cursor:'default'},children:[
					{'td':{className:'styleWhite container',children:{'div':{innerHTML:'<nobr>'+(++ind)+(i+1===users.length?'&nbsp;':'')+'</nobr>'}}}},
					{'td':{className:'styleWhite container',children:{'div':{innerHTML:'<nobr>'+u.ev[0].printDate+wdayStr+'</nobr>',onmousemove:onCellPage}}}},
					{'td':{className:'styleWhite container',children:{'div':{innerHTML:'<nobr>'+u.ev[0].printTime+'</nobr>',onmousemove:onCellPage}}}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:'<nobr>'+nrDaysStr+'&nbsp;'+'</nobr>'}},
					{'td':{className:'styleWhite container',innerHTML:'<nobr>'+u.name+'</nobr>'}},
					{'td':{className:'styleWhite container',innerHTML:'<nobr>'+u.domain+'</nobr>'}},
					{'td':{className:'styleWhite container',innerHTML:u.secOnline?'<nobr>'+(u.secOnline>=86400?Math.floor(u.secOnline/86400).toString()+'d ':'')+new Date(u.secOnline*1000-toffs).printhms()+(u.nr>1?' ('+u.nr+(u.evOnline?','+u.evOnline:'')+')':'')+'</nobr>':'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:'<nobr>'+(u.page?u.page:u.pages&&u.pages.length?u.pages[u.pages.length-1].page+'('+u.pages[u.pages.length-1].count+')':'&nbsp;')+'</nobr>'}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:(u.sum24h?u.sum24h:'')+'&nbsp;'}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:(u.sum7d?u.sum7d:'')+'&nbsp;'}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:(u.sum1month?u.sum1month:'')+'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:u.time3month?new Date(u.time3month).printdate():'&nbsp;'}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:u.total+'&nbsp;'}}
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
			};
			onresize();
		},
		show=function(){
			var f=[],i=-1;
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{contextIdentity:'hd'+i,id:i,innerHTML:head[i],onclick:onclickHead}}},{'div':{className:'cellSpace'}}]}});
			root=jr.ec('div',{parentNode:myDiv,className:'styleBackground',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{className:'topHeading topHand',innerHTML:labUsage}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
					{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}}
			]}}},ce);
			render();
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		user=function(sd){
			this.name=sd.getString();
			this.domain=sd.getString();
			this.ev=[];
			this.evOnline=sd.getString();
			var o, cnt=sd.getInt(), tm, total=0;
			if ((this.nr=sd.getInt()) > 0){
				this.secOnline=sd.getInt();
				this.page=sd.getString();
			}
			while(--cnt>=0){
				this.ev.push(o={time:sd.getInt(),cnt:sd.getInt()});
				o.date=new Date(o.time);
				o.date.setHours(0,0,0,0);
				o.date=o.date.getTime();
				o.sec=o.time-o.date;
				tm=new Date(o.time);
				o.weekDay=tm.getDay();
				o.printDate=tm.printdate();
				o.printTime=tm.printhms();
				total+=o.cnt;
			}
			cnt = sd.getInt();
			this.pages = [];
			while (--cnt >= 0)
				this.pages.push({page:sd.getString(), time:sd.getInt(), count:sd.getInt()});
			this.total=total;
			this.ev.reverse();
		},
		makeDiv = function(text){
			return jr.ec('div',	{style:{'background-color':'#E3D8B6'},children:{table:{className:'mouseBoxTable',children:{tr:{children:{td:{children:{div:{className:'mouseBoxContent',innerHTML:text}}}}}}}}});
		},
		conf=function(d){
			var sd=new JsSerilz('$',d);
			users=[];
			while(sd.hasMore()) {
				users.push(new user(sd));
				if (users[user.length-1].ev.length === 0)
					users.length = user.length-1;
			}
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
		jr.ajax( 'Users', 'getUsage', typ, 'myConf' );
	}
};
jr.init( function() {
	new users.instance(document.body);
} );
