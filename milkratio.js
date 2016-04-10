jr.include('/util.js');
jr.include('/mouseBox.js');
jr.include('/setup.css');
jr.include('/simpleGraph.js');
var milkratio = {
	init: function() {
		milkratio.texts = {
			milkingRatio:		jr.translate('Milking ratio'),
			back:				jr.translate('Back'),
		};
	},
	instance:	function(targetId,myDiv){
	var
		onresize = function() {
			var width=myDiv.clientWidth;
			width=Math.min(width,1000);
			ce.background.style.width=width+'px';
			$( 'div.heading' ).css( 'font-size', Math.max(width/20,28));
			$( 'td.heading' ).css( 'font-size', Math.max(width/20,28));
			$( 'td.label' ).css( 'font-size', Math.max(width/27,18));
			$( 'td.info' ).css( 'font-size', Math.max(width/36,13));
			$( 'input.field' ).css('font-size',Math.max(width/30,18));
			$( 'select.field' ).css('font-size',Math.max(width/30,18));
			$( 'span.field' ).css('font-size',Math.max(width/30,18));
			$( 'select.hourmin' ).css('font-size',Math.max(width/30,18));
			$( 'span.message' ).css('font-size',Math.max(width/27,18));
			$( 'input.button' ).css('font-size',Math.max(width/24,18));
		},
		dataConf=function(d){
			var totalLen=-1,i;
			d.devices.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
			d.total=[];
			jr.foreach(d.devices,function(o){
				o.ratio.sort(function(o1,o2){return o1.ratio-o2.ratio;});
				o.total=[];
				var len=-1;
				i=-1;
				while(++i<o.ratio.length)
					if(len<o.ratio[i].counters.length)
						len=o.ratio[i].counters.length;
				if(totalLen<len)
					totalLen=len;
				i=-1;
				while(++i<len)o.total.push(0);
				jr.foreach(o.ratio,function(d){
					i=-1;
					jr.foreach(d.counters,function(cnt){
						o.total[++i]+=cnt;
					});
				})
			});
			i=-1;
			while(++i<totalLen)d.total.push(0);
			jr.foreach(d.devices,function(o){
				i=-1;
				jr.foreach(o.total,function(cnt){
					d.total[++i]+=cnt;
				});
			})

			
			show();
		},
		addGraph=function(data,headLine,g,tsum,l24,t,nrRobots,id){
			var pp=[],i=-1,time=data.lastIndexDate,ii,sum=0;
			pp.push({tr:{children:[{td:{align:'center',children:[{div:{style:{'font-weight':'bold','font-size':'x-large'},innerHTML:headLine}}]}}]}});
			pp.push({tr:{children:[{td:{align:'center',children:{'canvas':{id:id,width:760,height:300}}}}]}});
			rVal=jr.ec('table',{parentNode:ce.background,className:'styleTable',children:[{tr:{children:[{td:{align:'center',children:[{div:{children:pp}}]}}]}}]});
			sGraph.Clear('#7395C9','#B2CDF7','d/m');
			sGraph.setFont('italic bold 20px sans-serif', 20);
			sGraph.addLine('#ff77ff',1);
			ii=i=g.lastMultFactor>3?0:-1;
			if(i==0)time-=3600000;
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
				if(ii==24){
					sGraph.addPoint(time,sum/nrRobots);
					sum=0;
					time-=86400000;
					ii=0;
				}
			}
			if(ii>0){
				time+=43200000;
				time-=ii/2*3600000
				sGraph.addPoint(time,sum*24/ii/nrRobots);
			}
			sGraph.paint(getNodeWithId(rVal,id));
			return rVal;
		},
		ce={},
		back=function(){
			history.back();
		},
		hide=function(){
			while (myDiv.hasChildNodes())
				myDiv.removeChild(myDiv.lastChild);
		},
		show=function(){
			hide();
			var rows=[
				{tr:{children:[
					{td:{align:'left',children:{'input':{contextIdentity:'back', className:'button',assignments:{type:'button',value:milkratio.texts.back,onclick:back}}}}},
				]}},
				{tr:{contextIdentity:'last'}}];
			jr.ec(myDiv, {children:{div:{contextIdentity:'background', className:'background',children:[
				{div:{className:'heading', innerHTML:milkratio.texts.milkingRatio}},
				{table:{width:'100%', children:rows}}
			]}}},ce);
			onresize();
		};
		this.resize=function(){onresize();};
		this.hide=function(){hide();};
		this.show=function(){show();};
		$( window ).resize( onresize );
		jr.eventManager.addListener('myDataConf', jr.eventManager, function(data){
			if(data)dataConf(data);});
		jr.ajax( 'SrvAnimal', 'milkingRatio', {farmId:targetId}, 'myDataConf' );
	}
}
jr.init( function() {
    milkratio.init();
	new milkratio.instance(jr.getUrlVar('id'),document.body);
} );
