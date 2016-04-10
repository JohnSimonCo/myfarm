jr.include('/util.js');
jr.include('/cli.css');
jr.include('/mouseBox.js');
jr.include('/simpleGraph.js');
var lchat = {
    init: function() {
		lchat.texts = {
			chat:			jr.translate('All Chat'),
			weekdays:		jr.translate('Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday').split(','),
			back:			jr.translate('Back'),
			delete:			jr.translate('Delete'),
			sure:			jr.translate('Are you sure?')
		};
	},
	instance:	function(myDiv){
	var
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1300);
			ce.background.style.width=width+'px';
			updateSortHeader();
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		head=['date','time','day','vc','delete','!vc','user','text'],
		allVc, allUsers, allData, allChat,
		root,
		sm=0,
		sd=1,
		ce={},
		now,nextDay,
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
				case 1:
				case 2:
					return sd*(o2.time-o1.time);
				case 3:
					var rv = o1.vc.name.localeCompare(o2.vc.name);
					if (!rv)
						rv = o2.time-o1.time;
					return sd*rv;
				case 4:
					var f1=document.getElementById(o1.id).checked, f2=document.getElementById(o2.id).checked;
					return sd*(f1===f2?o2.time-o1.time:f1?-1:1);
				case 5:
					var f1=o1.vc.existVc, f2=o2.vc.existVc;
					return sd*(f1===f2?o2.time-o1.time:f1?1:-1);
				case 6:
					var f1=o1.user, f2=o2.user;
					if(f1!==f2){
						if(f1&&f2)
							return sd*(f1.name&&f2.name?f1.name.localeCompare(f2.name):f1.name?1:-1);
						else
							return(f1?-1:1);
					}
					return sd*(o2.time-o1.time);
				case 7:
					return sd*(o1.text===o2.text?o2.time-o1.time:o1.text.localeCompare(o2.text));
			}
		},
		gotoFarm=function(){
			navigateTo('/jr-myfarm/index.html#/chat?id='+allChat[this.parentNode.data].vc.guid);
		},
		render=function(){
			updateSortHeader();
			nextDay=new Date();
			now=nextDay.getTime();
			nextDay.setHours(0,0,0,0);
			nextDay=nextDay.getTime()+86400000;
			allData.sort(sort);
			var table=ce.tblHead.parentNode;
			while(table.childNodes.length>1)
				table.removeChild(table.childNodes[table.childNodes.length-1]);
			var lastDate = '', lastDay = '';
			allData.forEach(function(c){
				var nrDays=Math.floor((nextDay-c.time)/86400000);
				jr.ec('tr',{parentNode:table,data:c.id,children:[
					{'td':{className:'styleWhite container',innerHTML:(lastDate===c.printDate?'':'<nobr>'+c.printDate+'</nobr>')+'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:c.printTime+'&nbsp;'}},
					{'td':{className:'styleWhite container leftJustify',innerHTML:(nrDays===lastDay?'':nrDays)+'&nbsp;'}},
					{'td':{className:'styleWhite container topHand',onclick:gotoFarm,innerHTML:'<nobr>'+c.vc.name+'&nbsp;</nobr>'}},
					{'td':{className:'styleWhite container',
							children:[{input:{id:c.id,type:'checkbox',checked:!c.vc.existDomain}}]}},
					{'td':{className:'styleWhite container',innerHTML:(c.vc.existVc?'&nbsp;':'X')+'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:c.user?'<nobr>'+c.user.name+'&nbsp;</nobr>':'&nbsp;'}},
					{'td':{className:'styleWhite container',innerHTML:c.text}}
				]});
				lastDate=c.printDate;
				lastDay=nrDays;
			});
			onresize();
		},
		onDelete=function(){
			var cnt=0,vcs={},vc;
			allData.forEach(function(d){
				if(document.getElementById(d.id).checked){
					cnt++;
					if(!(vc=vcs[d.vc.guid]))
						vc=vcs[d.vc.guid]=[];
					vc.push(d.id);
				}
			});
			if(cnt&&confirm(lchat.texts.sure+' '+cnt)){
				var rv=[];
				for(var id in vcs)
					rv.push({vcId:id,ids:vcs[id]});
				jr.ajax( 'SrvChat', 'deleteMessages', {vcIds:rv}, 'myConf' );
			}
		},
		show=function(){
			var f=[],i=-1;
			while(++i<head.length)f.push({'td':{children:[{'div':{assignments:{contextIdentity:'hd'+i,id:i,innerHTML:head[i],onclick:onclickHead}}},{'div':{className:'cellSpace'}}]}});
			var checks=[];
			checks.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:lchat.texts.back,onclick:function(){window.history.back();}}}}}});
			checks.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:lchat.texts.chat}});
			checks.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',assignments:{type:'button',value:lchat.texts.delete,onclick:onDelete}}}}});
			root=jr.ec('div',{parentNode:myDiv,className:'styleBackground',contextIdentity:'background',children:{'div':{className:'background',children:[
					{'div':{contextIdentity:'hd'}},
					{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
						{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}}
				]}}},ce);
			jr.ec('div',{parentNode:ce.hd,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:checks}}}}}}]}}});
			render();
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		_vc = function(sd) {
			this.guid = sd.getString();
			this.existDomain = sd.getInt();
			this.existVc = sd.getInt();
			this.fullName = sd.getString();
			if (!this.fullName)
				this.name = this.guid.substr(0,6)+'...';
			else {
				var i = this.fullName.length, ii;
				while (--i > 0 && this.fullName.charAt(i) !== '.');
				ii = i;
				while (--i > 0 && this.fullName.charAt(i) !== '.');
				this.name = this.fullName.substr(0,3)+this.fullName.substring(i, ii);
			}
			this.chat = [];
			allVc[this.guid] = this;
		},
		_chat = function(sd, vc) {
			(this.vc=vc).chat.push(this);
			allChat[this.id = sd.getString()] = this;
			this.user = sd.getString();
			var tm=new Date(this.time = sd.getInt());
			this.printDate=tm.printdate() + ' ' + lchat.texts.weekdays[this.weekDay=tm.getDay()];
			this.printTime=tm.printhms();
			this.text = sd.getString();
		},
		_user = function(sd) {
			allUsers[sd.getString()] = this;
			this.name = sd.getString();
			this.mail = sd.getString();
			this.chat = [];
		},
		conf=function(d){
			allVc = {};
			allUsers = {};
			allData = [];
			allChat = {};
			if(sm===4)
				sm=0;
			document.body.innerHTML = '';
			var sd=new JsSerilz('$',d), vc, cc, u;
			while (sd.hasMore() && sd.getInt()) {
				vc = new _vc(sd);
				cc = sd.getInt();
				while (--cc >= 0)
					allData.push(new _chat(sd, vc));
			}
			while (sd.hasMore())
				new _user(sd);
			allData.forEach(function(d) {
				u = allUsers[d.user];
				if (u) {
					u.chat.push(d);
					d.user = u;
				}
				else
					d.user = null;
			});
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
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)conf(data);});
		jr.ajax( 'SrvChat', 'getAll', null, 'myConf' );
	}
};
jr.init( function() {
	lchat.init();
	new lchat.instance(document.body);
} );
