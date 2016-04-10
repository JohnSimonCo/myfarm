var usageAll = {
    init: function() {
		usageAll.texts = {
		};
		firstRender = true;
	},
	instance:  function(myDiv,width){
		var
		dlg,
		startTime,
		statCallLatest,
		statCallCount,
		info,

		showGraph=	function(d){
//				var g=new graphData(d);
//					if(dynInner.hasChildNodes())dynInner.removeChild(dynInner.firstChild);
//				var s=farms.texts.labMilkingsPerDay,ss,o=d.graphData.data;
//				if(g.nrRobots>1)
//					s=jr.translate('Milk production per robot per day ($numRobots robots)', {numRobots: g.nrRobots})
//				else
//					for(var dd in o)
//						if(dd!=='*'){
//							ss=dd;
//							break;
//						}
//				var allDlg=addGraph(d.graphData,isDialog?g.nrRobots>1?farms.texts.labAllRobots:ss:s,g,g.tsum,g.l24,g.t,g.nrRobots,'graph');
//				if(isDialog){
//					var dlg,oo,i=-1,ii=-1;
//					dlg=initDialog(d.vcName+farms.texts.labColon+'&nbsp;'+s, [farms.texts.labBack,onCancel], null, allDlg);
//					if(g.nrRobots>1){
//						o=[];
//						for(var dd in d.graphData.data){
//							d.graphData.data[dd].name=dd;
//							o.push(d.graphData.data[dd]);
//						}
//						o.sort(function(o1,o2){return o1.name.localeCompare(o2.name)});
//						while(++ii<o.length){
//							oo=o[ii];
//							if(oo.name&&oo.name!=='*')
//								jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addGraph(d.graphData,oo.name,g,oo.tsum,oo.l24,oo.t,1,'graph'+(++i))}}});
//						}
//					}
//					var ratio=d.ratio?d.graphData.ratio:null;
//					if(ratio){
//						jr.ec('div',{parentNode:dlg,className:'top',children:{div:{className:'topHeading',innerHTML:farms.texts.milkingRatio}}});
//						jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addRatio(ratio,ratio,farms.texts.labAllRobots,dlg)}}});
//						if(ratio.devices.length>1)
//							jr.foreach(ratio.devices,function(d){
//								jr.ec('div',{className:'styleDialog',parentNode:dlg,children:{div:{className:'dialogTable',children:addRatio(ratio,d,d.name,dlg)}}});
//							});
//					}
//					isDialog=false;
//				}
//				else
//					dynInner.appendChild(allDlg);
		};
		this.prepare=function(data){
			var arr=data.split('$'), index=-1, all={},
			parseTime=function(i,a){
				var d=[];
				a.push(d);
				d.push(parseInt(arr[i]));	// totalCallTime
				d.push(parseInt(arr[++i]));	// time10ms
				d.push(parseInt(arr[++i]));	// time20ms
				d.push(parseInt(arr[++i]));	// time50ms
				d.push(parseInt(arr[++i]));	// time150ms
				d.push(parseInt(arr[++i]));	// time500ms
				d.push(parseInt(arr[++i]));	// timeMore
			},
			parseTime=function(i,a,cnt){
				var d=[];
				a.push(d);
				while(--cnt>=0){
					d.push(parseInt(arr[i]));
					i+=2;
				}
			};
			all.startTime = parseInt(arr[0]);
			all.statCallLatest = parseInt(arr[1]);
			all.statCallCount = parseInt(arr[2]);
			all.maxMemory = parseInt(arr[3]);
			all.mvc=[];
			all.vcx=[];
			all.totalCallCount=[];
			all.totalCallTime=[];
			all.freeMemory=[];
			all.totalMemory=[];
			while (++index*32 < arr.length) {
				var i=index*32+4;
				parseTime(i,all.mvc);
				parseTime(i+7,all.vcx);
				all.totalCallCount.push(parseInt(arr[i+14]));
				all.totalCallTime.push(parseInt(arr[i+15]));
				parseTime(i+18,all.freeMemory,5);
				parseTime(i+19,all.totalMemory,5);
			}
			if (statCallCount >= 0) {
				var len = arr.length-3, ind = statCallCount & 0xfff, i = -1;
				if (len > statCallCount)
					len = statCallCount + 1;
				info = [];
				while (--len > 0) {
					info[i] = parseInt(arr[ind]);
					if (--ind < 0)
						ind = statCallCount - 1;
				}
				alert('Funkar?');
			}
		};
	}
	};
jr.init( function() {
	jr.eventManager.addListener('conf', jr.eventManager, function(data) {
		if(data){
			document.body.style.width='1200px';
			new usageAll.instance(document.body).prepare(data);
		}});
	jr.ajax( 'SyStat', 'getSystemUsage', null, 'conf' );
} );
