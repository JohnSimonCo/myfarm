jr.include('/util.js');
jr.include('/setup.css');
var version = {
	init: function() {
		version.texts = {
			systemVersion:		jr.translate('App server'),
			version:			jr.translate('Version'),
			vc:					jr.translate('VC'),
			ddmVersion:			jr.translate('DelPro'),
			robot:				jr.translate('Robot'),
			changeDate:			jr.translate('Date'),
			back:				jr.translate('Back'),
			show:				jr.translate('Show'),
			hide:				jr.translate('Hide')
		};
		firstRender = true;
	},
	instance:	function(myDiv,data,backFkn){
	var
		onresize = function() {
			var width = $( 'div.background' ).width();
			$( 'div.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.heading' ).css( 'font-size', Math.max( width / 24, 25 ) );
			$( 'span.elabel' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'input.button' ).css( 'font-size', Math.max( width / 45, 13 ) );
			$( 'select.selector' ).css( 'font-size', Math.max( width / 40, 15 ) );
			$( 'div.version' ).css( 'font-size', Math.max( width / 45, 13 ) );
		},
		conf=function(){
			var d=data;
			d.ddm.sort(function(o1,o2){return o1.id.localeCompare(o2.id);});
			jr.foreach(d.ddm, function(d){
				d.ver.sort(function(o1,o2){return o2.time-o1.time;});
			});
			d.vms.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
			jr.foreach(d.vms, function(d){
				d.ver.sort(function(o1,o2){return o2.time-o1.time;});
				d.timeStatus=[];
				var i=-1,cnt;
				while(++i<d.ver.length){
					var sd=new JsSerilz('$',d.ver[i].value),s='';
					cnt=2;
					while(sd.hasMore()){
						var ss=sd.getString();
						if(ss&&ss.length){
							s+=ss.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'<br/>';
							if(--cnt===0)
								d.ver[i].short=s;
						}
					}
					// Todo: remove when it is not used any more!
					if(s.indexOf("Remote parameters has not been assigned!")>0) {
						s=s.replace(/Status VMS tunnel:.*$/,'');
					} else if(s.indexOf("Status VMS tunnel:")>0) {
						s=s.replace(/Status VMS tunnel:.*(REMOTE PORT:  ([0-9]*<br\/>)).*$/,'$2');
					}
					// to here
					s=s.replace(/&lt;END&gt;<br\/>([0-9]+)/,'&lt;END&gt;<br/><span class="specialNumber">$1</span>');
					d.ver[i].value=s;
					d.timeStatus=0;
				}
				showStatus.push(0);
			});
			if(doShow){
				doShow=false;
				show();
			}
			if(firstRender) {
				firstRender = false;
				typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
			}
		},
		onSelectChange=function(){
			data.vms[this.index].timeStatus=parseInt(this.value);
			var top=myDiv.scrollTop;
			hide();
			show();
			myDiv.scrollTop=top;
		},
		onDdmChange=function(){
			selectedDDMindex=parseInt(this.value);
			var top=myDiv.scrollTop;
			hide();
			show();
			myDiv.scrollTop=top;
		},
		selectedDDMindex=0,
		doShow=false,
		showStatus=[],
		dlg,
		ce={},
		showHide=function(){
			showStatus[this.id]=!showStatus[this.id];
			var top=myDiv.scrollTop;
			hide();
			show();
			myDiv.scrollTop=top;
		},
		show=function(){
			if(data){
				var ddm=[],i=-1,o,a=[],ddmVer=[];
				a.push({'div':{className:'part', children:[
							{'table':{width:'99%',children:
								{tr:{children:[
									{td:{children:{'input':{className:'button', assignments:{type:'button',value:version.texts.back,onclick:function(){backFkn?backFkn():window.history.back();}}}}}},
									{td:{width:'90%',align:'center',children:{'div':{className:'heading', innerHTML:data.name}}}}
						]}}}}]}});
				if(data.ddm && data.ddm.length){
					var dm=data.ddm[0].ver;
					var opt=[];
					while(++i<dm.length)
						opt.push({'option':{value:i, text:new Date(dm[i].time).printiso()}});
					var ddmHead = 
						{tr:{children:[
								{td:{width:'90%',align:'center',children:{'span':{className:'heading', innerHTML:version.texts.ddmVersion}}}},
								{td:{children:{'span':{className:'elabel', innerHTML:version.texts.changeDate}}}},
								{td:{children:[
									{span:{children:{'select':{contextIdentity:'ddm', index:i, className:'selector', onchange:onDdmChange, children:opt}}}}]}}]}};
					var sd=new JsSerilz('$',dm[selectedDDMindex].value);
					while(sd.hasMore())
						ddm.push({tr:{children:[
							{td:{innerHTML:sd.getString()}},
							{td:{innerHTML:'&nbsp;&nbsp;'}},
							{td:{width:'90%',innerHTML:sd.getString()}}
						]}});
				}
				a.push({'div':{className:'part', children:[
						{'div':{className:'version', children:{'table':{width:'99%',children:ddmHead}}}},
						{'div':{className:'version', children:{'table':{width:'99%',children:ddm}}}}]}});
				a.push({'div':{className:'part', children:[
						{'div':{className:'heading', innerHTML:version.texts.vc}},
						{'div':{className:'version', innerHTML:version.texts.version+'&nbsp;&nbsp;'+data.vc}}]}});
				i=-1;
				while(++i<data.vms.length){
					o=data.vms[i];
					var opt=[],ii=-1,sel=data.vms[i].timeStatus;
					while(++ii<data.vms[i].ver.length)
						opt.push({'option':{value:ii, text:new Date(data.vms[i].ver[ii].time).printiso()}});
					a.push({'div':{className:'part', children:[
						{'table':{width:'99%',children:
							{tr:{children:[
								{td:{children:{'input':{contextIdentity:'show'+i, id:i, show:0, dateIndex:0, className:'button', assignments:{type:'button',value:showStatus[i]?version.texts.hide:version.texts.show,onclick:showHide}}}}},
								{td:{width:'90%',align:'center',children:{'span':{className:'heading', innerHTML:version.texts.robot+' '+o.name}}}},
								{td:{children:{'span':{className:'elabel', innerHTML:version.texts.changeDate}}}},
								{td:{children:[
									{span:{children:{'select': {contextIdentity: 'date'+i, index:i, className: 'selector', onchange: onSelectChange, children: opt}}}}]}}]}}}},
						{'div':{className:'version', innerHTML:showStatus[i]?data.vms[i].ver[sel].value:data.vms[i].ver[sel].short}}
					]}});
				};
				a.push({'div':{className:'part', children:[
						{'div':{className:'heading', innerHTML:version.texts.systemVersion}},
						{'div':{className:'version', innerHTML:version.texts.version+'&nbsp;&nbsp;'+data.appServerBuildName+'&nbsp;('+jr.version+')'}}
						]}});
				dlg=jr.ec('div', {parentNode:myDiv,className:'background',children:a}, ce);
				i=-1;
				while(++i<data.vms.length)
					ce['date'+i].selectedIndex=data.vms[i].timeStatus;
				if(ce['ddm'])
					ce['ddm'].selectedIndex=selectedDDMindex;
				onresize();
			}
			else
				doShow=true;
		},
		hide=function(){
			if(dlg)
				myDiv.removeChild(dlg);
			dlg=null;
		};
		this.resize=function(){onresize();};
		this.hide=function(){
			hide();
		};
		this.show=function(){
			show();
		};
		if(!version.texts)
			version.init();
		conf();
		$( window ).resize( onresize );
	}
};
