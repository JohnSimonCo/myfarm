if(typeof hr=='undefined'){function hr(n){if(n<120)return n==0?fs.labNow:(n<60?n+'s':'1m '+((n-60)+'s'));var t=Math.floor(n/60);return t>1440?(Math.floor(t/1440)+'d '+nt(Math.floor(t)%1440)):nt(t)}function n0(n){return n<10?'0'+n:n}function n3(n){return n<100?'0'+n0(n):n}function nt(n){return n0(Math.floor(n/60))+':'+n0(Math.floor(n%60))}}
jr.include('/cli.css');
var systat = {
    init: function() {
		systat.texts = {
			systemStatus:		jr.translate('System status'),
			refresh:			jr.translate('Refresh'),
			overview:			jr.translate('Geographic overview'),
			back:				jr.translate('Back'),
			parameter:			jr.translate('Parameter'),
			value:				jr.translate('Value'),
			country:			jr.translate('Country'),
			vcOk:				jr.translate('Vc with licence'),
			vcCommunicating:	jr.translate('Vc without licence'),
		};
	},
	instance:	function(myDiv){
	var
		timer,
		refreshCount=21;
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
		addParam=function(table,val,key,stl){
			val=val[key];
			if(key.indexOf('upTime')>=0)
				val=hr(val);
			jr.ec('tr',{parentNode:table,children:[
				{'td':{algn:'right',className:stl,innerHTML:key+'&nbsp;'}},
				{'td':{colSpan:2,className:stl,innerHTML:val}}]});
		},
		overview=function(){
			window.location='/geoInfo.html';
		},
		render=function(d){
			var a=[],i=-1,ce={},hd=[systat.texts.parameter,systat.texts.value],f=[],table,stl='styleWhite container',ctry=[],sping=0;
			for (var e in d.countyStat) {
				var v=d.countyStat[e];
				ctry.push({name:e,ok:v.count[0],nok:v.count[1]});
				sping+=v.count[1];
			}
			ctry.sort(function(o1,o2){return o1.ok===o2.ok&&o1.nok===o2.nok?o1.name.localeCompare(o2.name):o2.ok===o1.ok?o2.nok-o1.nok:o2.ok-o1.ok;});
			hide();
			a.push({'td':{width:'1%',align:'left',children:{'input':{className:'button',assignments:{type:'button',value:systat.texts.back,onclick:back}}}}});
			a.push({'td':{className:'topHeading',width:'90%',align:'center',innerHTML:systat.texts.systemStatus}});
			a.push({'td':{width:'1%',align:'right',children:{'input':{className:'button',assignments:{type:'button',value:systat.texts.overview,onclick:overview}}}}});
			while(++i<hd.length)f.push({'td':{'width':(i?'95%':'5%'),colSpan:(i?2:1),children:[{'div':{className:'styleRubber container',assignments:{innerHTML:hd[i]}}},{'div':{className:'cellSpace'}}]}});
			jr.ec('div',{parentNode:myDiv,className:'styleBackground styleCleanTop',contextIdentity:'background',children:{'div':{className:'background',children:[
				{'div':{children:{'table':{width:'100%',children:{'tr':{children:a}}}}}},
				{'div':{className:'content',children:{'table':{contextIdentity:'content',className:'styleTable',children:
					{'tr':{contextIdentity:'tblHead',className:'container',children:f}}}}}}
			]}}},ce);
			jr.ec('div',{parentNode:myDiv,className:'content',innerHTML:'&nbsp;'});
			table=ce.tblHead.parentNode;
			for(var k in d)
				if(k!='countyStat')
					addParam(table,d,k,stl);
			jr.ec('tr',{style:{},parentNode:table,children:[
				{'td':{algn:'right',className:stl,innerHTML:systat.texts.vcCommunicating+'&nbsp;'}},
				{'td':{colSpan:2,className:stl,innerHTML:sping}}]});
			jr.ec('tr',{style:{'font-weight':'bold'},parentNode:table,children:[
				{'td':{algn:'right',className:stl,innerHTML:systat.texts.country+'&nbsp;'}},
				{'td':{className:stl,innerHTML:systat.texts.vcOk}},
				{'td':{className:stl,innerHTML:systat.texts.vcCommunicating}}]});
			ctry.forEach(function(d){
				jr.ec('tr',{parentNode:table,children:[
					{'td':{algn:'right',className:stl,innerHTML:d.name+'&nbsp;'}},
					{'td':{className:stl,innerHTML:d.ok}},
					{'td':{className:stl,innerHTML:d.nok}}]});
			});
			onresize();
			timer=setTimeout(refresh,180000);
		},
		back=function(){
			window.history.back();
		},
		printTime=function(t){
			var m=Math.floor(t/60),s=t%60;
			return (m?m.toString():'0')+':'+(s<10?'0'+s:s);
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		refresh=function(){
			if(--refreshCount>=0)
				jr.ajax('SyStat','getStatus',null,'myConf' );
			else
				clearTimeout(timer);
		};
		this.refresh=function(){
			refresh();
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
			if(data)render(data);else jr.ec('div',{parentNode:myDiv,innerHTML:'No access'});});
	}
};
jr.init( function() {
    systat.init();
	var myselft='/systat',path=window.location.pathname;
	if(path.indexOf(myselft,path.length-myselft.length)!==-1){
		document.body.style.width='800px';
		new systat.instance(document.body).refresh();
	}
} );
