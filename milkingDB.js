jr.include('/cli.css');
jr.include('/util.js');
jr.include('/buttons.css');
jr.include('/common.css');
jr.include('/myGraph.js');
jr.include('/Resources/info6.png');
jr.include('//code.jquery.com/ui/1.11.4/jquery-ui.js');
jr.include('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');
var test = {
	init: function() {
		test.texts = {
		};
		test.Teats=["LF", "LR", "RF", "RR"];
		test.MilkingYield =		jr.translate("Milking yield. Width of staple is time interval since last milking");
		test.DailyMilkProd =	jr.translate("Daily milk production (24h)");
		test.MilkProdPerMilking=jr.translate("Milk production per milking compared to 24 hour");
		test.LastSevenDays =	jr.translate("Last week");
		test.Milkings =			jr.translate("Milkings");
		test.AnimalNr =			jr.translate("Animal nr");
		test.Occ =				jr.translate("Occ");
		test.RobotProd =		jr.translate("Milk production") + ' (* 100 kg)';
		test.MoreInfo =			jr.translate("Click for more info");
	},
	instance:	function(){
		var 
		ce={},
		ceh={},
		ceo={},
		imgIcons=new Image(),
		vcId,
		buf,
		bufInd,
		bufLen,
		allData,
		weeksToFetch,
		weeksToFetchIndex,
		dynDivs,
		dynamic,
		dynInner,
		beginTime,
		intermediateTime,
		head,
		root,
		otherGraphDiv,
		stl,
		infoLabel='',
		nrWeeks=3,
		fromDate,
		toDate,
		fromDateStr,
		toDateStr,
		downloadInfo,
		animal,
		milkings,
		animalIndex = 0,
		keyTimer = 0,
		dynamicId,
		totalCnt = 0,
		incompleteCnt = 0,
		corrIncompleteCnt = 0,
		occMax,
		mdiMax,
		bloodMax,
		secMilkingTimeMax,
		occMaxTime,
		mdiMaxTime,
		bloodMaxTime,
		secMilkingTimeMaxTime,
		showInGraph,
		robotMilkings,
		occIntervalFrom,
		occIntervalTo,
		guidMilkingMap,
		markMilking,
		farmName,
		viewCmnd=['BtnMilkings','BtnOcc','BtnRobotProd'],
		viewLables=[test.Milkings,test.Occ,test.RobotProd],
		viewCmndIndex=0,
		months = jr.translate('January February March April May June July August September October November December'),
		getFileIndexFromTime=function(time) {
			return Math.floor((time - 1415318400000) / 604800000) - 60;
		},
		milking=function(fixLen) {
			var indBefore = bufInd, len = getBufShort(),
				aver=function(arr) {
					var sum = 0, count = 0, i = -1;
					while (++i < arr.length)
						if (arr[i] > 0) {
							sum += arr[i];
							count++;
						}
					return count ? Math.round(sum / count * 100) / 100 : 0;
				};
			this.endOfMilkingTime =	getBufLong();
			this.guidHash =			getBufInt();
			this.animalNumber =		getBufInt();
			var version =			getBufByte();
			if (version === 1) {
				var combinedMap0 =	getBufInt();
				this.activity =		getBufByte();	if (this.activity === 255) this.activity = -1;
//if(this.activity>0)console.log(this.animalNumber+'('+new Date(this.endOfMilkingTime).toString()+'): '+this.activity);
				this.lactation =	getBufByte();
				var combinedMap1h =	getBufInt();
				var combinedMap1l =	getBufInt();
				var combinedMap2h =	getBufInt();
				var combinedMap2l =	getBufInt();
				var combinedMap3 =	getBufInt();
				var combinedMap4 =	getBufInt();
				var combinedMap5=	getBufShort();
				this.expectedYieldPercentDiff =	(((combinedMap1h & 0x7FF00000) >> 20) - 1200) / 20;
				this.averageFlow =				(((combinedMap1h & 0x7F) << 2) + (combinedMap1l >> 30)) * 10;
				this.averageConductivity =		((combinedMap1l & 0xFFE00) >> 9) / 100;
				if (combinedMap0 !== -1) {
					this.conductivityLF=		this.averageConductivity;
					this.conductivityLR=		(combinedMap0 & 0x000003ff) / 100;
					this.conductivityRF=		((combinedMap0 & 0x000FFC00) >> 10) / 100;
					this.conductivityRR=		((combinedMap0 & 0x3FF00000) >> 20) / 100;
					this.averageConductivity =	aver([this.conductivityLF, this.conductivityLR, this.conductivityRF, this.conductivityRR]);
					if (combinedMap3 !== -1) {
						this.averageFlowLF =	this.averageFlow;
						this.averageFlowLR =	(combinedMap3 & 0x000003ff) * 10;
						this.averageFlowRF =	((combinedMap3 >> 10) & 0x000003ff) * 10;
						this.averageFlowRR =	((combinedMap3 >> 20) & 0x000003ff) * 10;
						this.averageFlow =		aver([this.averageFlowLF, this.averageFlowLR, this.averageFlowRF, this.averageFlowRR]);
						this.peakFlowLF =		(combinedMap5 & 0x000003ff) * 10;
						this.peakFlowLR =		(combinedMap4 & 0x000003ff) * 10;
						this.peakFlowRF =		((combinedMap4 >> 10) & 0x000003ff) * 10;
						this.peakFlowRR =		((combinedMap4 >> 20) & 0x000003ff) * 10;
					}
				}
					var value =					(combinedMap1h & 0xFFF80) >> 7;
				this.occ =						value === 0x1fff ? -1 : value;
					value =						(combinedMap1l & 0x3FF00000) >> 20;
				this.mdi =						value === 0x3FF ? -1 : (value / 100);
					value =						(combinedMap1l & 0x1FF);
				this.performance =				value === 0x1FF ? -1 : value;

				this.totalYieldUdder =			(combinedMap2l &		0x1FFF) * 0.01;
				this.expectedSpeed =			((combinedMap2l &		0x3FFE000) >> 13) / 1000;
				this.carryOver =				(((combinedMap2h &		0x3F) << 6) + (combinedMap2l >> 26)) / 100;
				this.pulsationRatio =			((combinedMap2h &		0x1FC0) >> 6);
				this.cleaningProgramNr =		(combinedMap2h &		0x1E000000) >> 25;
					value =						(combinedMap2h &		0x1FFE000) >> 13;
				this.blood =					value === 0xFFF? -1 : (value * 4);

				this.lactationDay =				getBufLong();
				this.secMilkingTime =			getBufShort();
					value =						getBufByte();
				this.breed =					value === 255 ? -1 : value;
				this.flags =					getBufShort();
				this.totalYield =				[];
				this.totalYield.push(			getBufFloat100());
				this.totalYield.push(			getBufFloat100());
				this.totalYield.push(			getBufFloat100());
				this.totalYield.push(			getBufFloat100());
				this.expectedYieldLF =			getBufFloat100();
				this.expectedYieldLR =			getBufFloat100();
				this.expectedYieldRF =			getBufFloat100();
				this.expectedYieldRR =			getBufFloat100();
				this.carryoverYieldLF =			getBufFloat100();
				this.carryoverYieldLR =			getBufFloat100();
				this.carryoverYieldRF =			getBufFloat100();
				this.carryoverYieldRR =			getBufFloat100();
				this.expectedSpeedLF =			getBufFloat1000();
				this.expectedSpeedLR =			getBufFloat1000();
				this.expectedSpeedRF =			getBufFloat1000();
				this.expectedSpeedRR =			getBufFloat1000();
				this.bloodLF =					getBufShort0();
				this.bloodLR =					getBufShort0();
				this.bloodRF =					getBufShort0();
				this.bloodRR =					getBufShort0();
				var s='', i=len-(bufInd-indBefore), ch;
				while(--i>=0 && (ch=getBufByte()))
					s+=String.fromCharCode(ch);
				this.robot =					s;
				s='';
				while(--i>=0 && (ch=getBufByte()))
					s+=String.fromCharCode(ch);
				this.milkDestination =			s;
				s='';
				while(--i>=0 && (ch=getBufByte()))
					s+=String.fromCharCode(ch);
				this.events=s;
				if ((this.flags&0x1111)!==0) {
					incompleteCnt++;
					if ((this.expectedYieldPercentDiff > 5 || (this.expectedYieldPercentDiff > -10 && this.expectedYieldLF !== -1
						&& (chYl(this.totalYield[0], this.expectedYieldLF) || chYl(this.totalYield[1], this.expectedYieldLR) || chYl(this.totalYield[2], this.expectedYieldRF) || chYl(this.totalYield[3], this.expectedYieldRR)))))
					corrIncompleteCnt++;
				}
			}
			totalCnt++;
			bufInd = indBefore + (fixLen ? fixLen : len);
		},
		milkData=function(data) {
			var animal=function(animalNr,nrMilkings) {
				this.animalNr =		animalNr;
				this.nrMilkings =	nrMilkings;
				this.milkings =		[];
				this.addMilkingsAtEnd = function(other) {
					var nrNewMilkings = other.nrMilkings, i = -1;
					while (++i < nrNewMilkings)
						this.milkings.push(other.milkings[i]);
					this.nrMilkings += nrNewMilkings;
				};
			};
			setBuf(data);
			this.totalFixSize =		getBufInt();
			this.milkingFixSize =	getBufInt();
			this.nrAnimals =		getBufInt();
			this.animals =			[];
			this.getNrMilkings = function() {
				var sum=0, i=-1, len=this.nrAnimals;
				while (++i < len)
					sum += this.animals[i].nrMilkings;
				return sum;
			},
			this.getAnimal = function(animalNr) {
				if (this.nrAnimals) {
					var iLeft = 0, iRight = this.nrAnimals - 1, i = Math.floor(this.nrAnimals / 2);
					while (true) {
						var an = this.animals[i];
						if (an.animalNr === animalNr)
							return an;
						if (animalNr < an.animalNr)
							iRight = i - 1;
						else
							iLeft = i + 1;
						if (iRight < iLeft)
							return null;
						else if (iRight === iLeft)
							i = iLeft;
						else
							i = iLeft +  Math.floor((iRight - iLeft) / 2) + 1;
					}
				}
				return null;
			},
			this.mergeWithLaterWeek = function(laterWeek) {
				var i = -1;
				while (++i < laterWeek.nrAnimals) {
					var newAnimal = laterWeek.animals[i];
					var myAnimal = this.getAnimal(newAnimal.animalNr);
					if (myAnimal)
						myAnimal.addMilkingsAtEnd(newAnimal);
					else {
						this.animals.push(newAnimal);
						this.nrAnimals++;
						this.animals.sort(function(a, b){return a.animalNr-b.animalNr;});
					}
				}
			};
			var i=-1;
			while (++i < this.nrAnimals) {
				var animalNr = getBufInt();
				var nrMilkings = getBufShort();
				this.animals.push(new animal(animalNr, nrMilkings));
			}
			i = -1;
			while (++i < this.nrAnimals) {
				var ii = -1, a = this.animals[i];
				while (++ii < a.nrMilkings)
					a.milkings.push(new milking(this.milkingFixSize));
			}
			while (bufInd < bufLen) {
				var extraMilking = new milking();
				var newAnimal = this.getAnimal(extraMilking.animalNumber);
				if (newAnimal) {
					i = newAnimal.nrMilkings;
					while (--i >= 0 && newAnimal.milkings[i].endOfMilkingTime > extraMilking.endOfMilkingTime) {}
					if (i >= 0 && (newAnimal.milkings[i].endOfMilkingTime === extraMilking.endOfMilkingTime || newAnimal.milkings[i].guidHash === extraMilking.guidHash))
						newAnimal.milkings[i] = extraMilking;
					else {
						newAnimal.milkings.splice(i + 1, 0, extraMilking);
						newAnimal.nrMilkings++;
					}
				}
				else {
					newAnimal = new animal(extraMilking.animalNumber, 1);
					newAnimal.milkings.push(extraMilking);
					this.animals.push(newAnimal);
					this.nrAnimals++;
					this.animals.sort(function(a, b){return a.animalNr-b.animalNr;});
				}
			}
		},
		setBuf=function(bytearr) {
			buf = bytearr;
			bufInd = 0;
			bufLen = bytearr.byteLength;
		},
		getBufByte=function() {
			return buf[bufInd++];
		},
		getBufShort=function() {
			bufInd += 2;
			return	  ((buf[bufInd-2] & 0xFF) << 8)
					| ((buf[bufInd-1] & 0xFF));
		},
		getBufShort0=function() {
			bufInd += 2;
			var val = ((buf[bufInd-2] & 0xFF) << 8)
					| ((buf[bufInd-1] & 0xFF));
			return val === 65535 ? -1 : val;
		},
		getBufFloat100=function() {
			bufInd += 2;
			var val = ((buf[bufInd-2] & 0xFF) << 8)
					| ((buf[bufInd-1] & 0xFF));
			return val === 65535 ? -1 : val / 100;
		},
		getBufFloat1000=function() {
			bufInd += 2;
			var val = ((buf[bufInd-2] & 0xFF) << 8)
					| ((buf[bufInd-1] & 0xFF));
			return val === 65535 ? -1 : val / 1000;
		},
		getBufInt=function() {
			bufInd += 4;
			return	  ((buf[bufInd-4] & 0xFF) << 24)
					| ((buf[bufInd-3] & 0xFF) << 16)
					| ((buf[bufInd-2] & 0xFF) << 8)
					| ((buf[bufInd-1] & 0xFF));
		},
		getBufLong=function() {
			var result, i=8;
			while(--i >= 0) {
				var b=buf[bufInd++];
				if(result)
					result+=b?(b>=16?'':'0')+b.toString(16):'00';
				else if (b)
					result=b.toString(16);
			}
			return result?parseInt(result,16):0;
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
			var y = 21+window.event.clientY+window.pageYOffset;
			var x = window.event.clientX-tbl.clientWidth/2;
			if(y+tbl.clientHeight>window.innerHeight+window.pageYOffset){
				y=window.event.clientY-tbl.clientHeight-10+window.pageYOffset;
				if(y<0){
					y=0;
					x=window.event.clientX;
					if(y+tbl.clientHeight>window.event.clientY){
						x=window.event.clientX-tbl.clientWidth-10;
						y=window.event.clientY-tbl.clientHeight/2;
						if(y<0)y=0;
					}
				}
			}
			if(x+tbl.clientWidth>window.innerWidth-3)x=window.innerWidth-tbl.clientWidth-3;
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
			setDynPos();
			return rVal;
		},
		showDynamic=function(show){if(!show){infoLabel='';clearDynPos();};dynamic.style.visibility=show?"visible":"hidden";},
		back=function(){
			window.history.back();
		},
		setButtons=function(paintMain, doPaintOther) {
			animal = allData.animals[animalIndex];
			if (animalIndex === 0) {
				ceh.PrevAnimal.disabled = true;
				ceh.PrevAnimal.value = '';
			}
			else {
				ceh.PrevAnimal.disabled = false;
				ceh.PrevAnimal.value = allData.animals[animalIndex-1].animalNr;
			}
			if (animalIndex + 1 >= allData.animals.length) {
				ceh.NextAnimal.disabled = true;
				ceh.NextAnimal.value = '';
			}
			else {
				ceh.NextAnimal.disabled = false;
				ceh.NextAnimal.value = allData.animals[animalIndex+1].animalNr;
			}
			if (animalIndex >= allData.animals.length) {
				ceh.ThisAnimal.disabled = true;
				ceh.ThisAnimal.innerHTML = 'No animals';
			}
			else {
				ceh.ThisAnimal.disabled = false;
				ceh.ThisAnimal.innerHTML = allData.animals[animalIndex].animalNr;
			}
			window.localStorage.setItem("testAnimalNr", allData.animals[animalIndex].animalNr);
			paintMain && paint();
			doPaintOther && paintOther();
		},
		prevAnimal=function() {
			if (animalIndex > 0) {
				--animalIndex;
				setButtons(true, true);
			}
		},
		nextAnimal=function() {
			if (animalIndex + 1 < allData.animals.length) {
				++animalIndex;
				setButtons(true, true);
			}
		},
		showDownloadInfo=function() {
			infoLabel='';
			showInfo(downloadInfo);
		},
		cmnd=function(fkn) {
			var i = -1;
			viewCmndIndex = fkn;
			while (++i < viewCmnd.length) {
				var btn = ceh[viewCmnd[i]];
				btn.disabled = viewCmndIndex === i;
				btn.value = viewLables[i];
			}
			ceh['headLabel'].innerHTML = '<nobr>' + viewLables[viewCmndIndex] + (farmName ? ' - ' + farmName : '') + '</nobr>';
			paint();
			paintOther();
		},
		render=function(){
			var hd=[],vl=[],vh=[],i=-1;
			ceh={};
			farmName = atob(jr.getUrlVar('name'));
			vh.push({'tr':{className:'container',children:[
						{'td':{width:'1%',align:'left',className:'topHeading',onmouseover:showDownloadInfo,onmouseout:function(){showDynamic(false);},onmousemove:setDynPos,children:[
							{ 'img': {src: jr.getResource('../Resources/logo.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading',children:[
							{ 'img': {onclick:back, style:true?{cursor:'pointer'}:{}, src: jr.getResource('../Resources/arrow_white.png') } }	
						]}},
						{'td':{width:'1%',align:'left',className:'topHeading'}},
						{'td':{width:'40%',className:'topHeading',children:[
							{'span': {style:{'font-size':'x-large'}, contextIdentity:'headLabel'}}
						]}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'div':{children:[
								{'input':{style:{width:'100px'},assignments:{type:'button',className:'button',onclick:function(){cmnd(0);}},	contextIdentity:viewCmnd[0]}},
								{'input':{style:{width:'100px'},assignments:{type:'button',className:'button',onclick:function(){cmnd(1);}},	contextIdentity:viewCmnd[1]}},
								{'input':{style:{width:'100px'},assignments:{type:'button',className:'button',onclick:function(){cmnd(2);}},	contextIdentity:viewCmnd[2]}}
							]}}
						]}},
						{'td':{width:'1%',children:[
							{'div':{children:[
								{'table':{className:'styleTable scrollbarY',children:[
									{'tr':{className:'container',children:[
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},children:[
											{'span': {innerHTML:'<nobr>'+jr.translate("From date:")+'</nobr>'}}
										]}},
										{'td':{width:'1%'}},
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},width:'1%',children:[
											{'input':{id:'FromDate',value:fromDateStr,size:5,assignments:{type:'text'},contextIdentity:'fromDate'}}
										]}}
									]}},
									{'tr':{className:'container',children:[
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},children:[
											{'span': {innerHTML:'<nobr>'+jr.translate("To date:")+'</nobr>'}}
										]}},
										{'td':{width:'1%'}},
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},width:'1%',children:[
											{'input':{id:'ToDate',value:toDateStr,size:5,assignments:{type:'text'},contextIdentity:'toDate'}}
										]}}
									]}},
									{'tr':{className:'container',children:[
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},children:[
											{'input':{id:'LatestWeeks',value:'Latest ' + nrWeeks + ' weeks',size:10,assignments:{type:'text'},contextIdentity:'LatestWeeks'}},
										]}},
										{'td':{width:'1%'}},
										{'td':{style:{'font-size':'larger','font-weight':'bold','color':'#ffffff'},children:[
											{'input':{style:{width:'100%'},assignments:{type:'button',className:'button',onclick:setWeeks,value:jr.translate('Get data')}}},
										]}}
									]}}
								]}}
							]}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'span': {innerHTML:'<nobr>'+test.AnimalNr+'</nobr>'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{style:{width:'60px'},assignments:{type:'button',className:'button',onclick:prevAnimal},contextIdentity:'PrevAnimal'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'span': {innerHTML:'',contextIdentity:'ThisAnimal'}}
						]}},
						{'td':{width:'1%',className:'topHeading'}},
						{'td':{width:'1%',className:'topHeading',children:[
							{'input':{style:{width:'60px'},assignments:{type:'button',className:'button',onclick:nextAnimal},contextIdentity:'NextAnimal'}}
						]}},
						{'td':{width:'3%',children:[
							{ 'span': { contextIdentity: 'menu', className: 'menu', children: [
								{ 'div': { contextIdentity: 'menuImage', className: 'menuImage'} },
								{ 'div': { contextIdentity: 'menuSelect', className: 'menuSelect'} }
							] } }
						]}}
					]}});
			vl.push({'tr':{className:'container',children:hd}});
			if(false){
				stl.cursor='default';
				stl.color='rgb(90,90,90)';
			}
			var width=null;
			document.body.style.backgroundColor='#103d82';
			if(root){
				document.body.removeChild(root);
				document.body.removeChild(head);
			}
			head=jr.ec('div',{parentNode:document.body,className:'styleBackground',style:{width:(width?width:null)}, children:{'div':{className:'background',children:{'table':{className:'styleTable scrollbarY',children:vh}}}}}, ceh);
			root=jr.ec('div',{parentNode:document.body,className:'styleDiagram',style:{width:(width?width:null)}}, ce);
			otherGraphDiv=jr.ec('div',{parentNode:document.body,className:'styleDiagram',style:{width:(width?width:null)}}, ceo);
			$(function() {$('#FromDate').datepicker();});
			$(function() {$('#ToDate').datepicker();});
			var menuCanvas = jr.ec('canvas',{parentNode:ceh['menuImage'], className: 'menuImage', width:38, height:40});
			var ctxx=menuCanvas.getContext("2d");
			ctxx.drawImage(imgIcons,1,949,38,40,0,0,38,40);
			setButtons(false, false);
			cmnd(0);
		},
		animalData=function(animal){
			this.days = [];
			var mm = animal.milkings;
			if (mm.length > 0) {
				this.startTime = new Date(mm[0].endOfMilkingTime);
				this.endTime = new Date(mm[mm.length - 1].endOfMilkingTime);
				this.startTime.setHours(0,0,0,0);
				this.endTime.setHours(0,0,0,0);
				this.startTime = this.startTime.getTime();
				this.endTime = this.endTime.getTime();
				var nrDays = (this.endTime - this.startTime) / 86400000 + 1, day=[];
				this.days.length = Math.round(nrDays);
				var m=[], prevTime = 0, pt, i = -1;
				while (++i < mm.length) {
					var  mo = mm[i], o = {o:mo};
					m.push(o);
					if (prevTime && (pt = mo.endOfMilkingTime - prevTime) < 129600000) {
						o.prodTime = pt / 3600000;
						o.prodPerDay = mo.totalYieldUdder / o.prodTime * 24;
						var dayInd = Math.floor((mo.endOfMilkingTime - this.startTime) / 86400000), d;
						if (!(d=this.days[dayInd]))
							d=this.days[dayInd]={mlk:[], kg:0, time:0};
						d.mlk.push(o);
					}
					prevTime = mo.endOfMilkingTime;
				}
				i = -1;
				while (++i < this.days.length) {
					var o = this.days[i], op = 0 ? null : this.days[i - 1], ii = 0;
					if (o) {
						var td = o.mlk[0], tm = (td.o.endOfMilkingTime - this.startTime - (i * 86400000)) / 3600000, f = tm / td.prodTime;
						if (f > 1)
							f = 1;
						o.kg = f * o.mlk[0].o.totalYieldUdder;
						o.time = f *o.mlk[0].prodTime;
						if (op) {
							f = 1 - f;
							op.kg += f * o.mlk[0].o.totalYieldUdder;
							op.time += f * o.mlk[0].prodTime;
							op.prodPerDay = op.kg / (op.time / 24);
						}
						while (++ii < o.mlk.length) {
							o.kg += o.mlk[ii].o.totalYieldUdder;
							o.time += o.mlk[ii].prodTime;
						}
						o.prodPerDay = o.kg / (o.time / 24);
					}
				}
				i = 0;
				this.maxProd = 0;
				while (++i < this.days.length - 1) {
					var o = this.days[i];
					if (o) {
						o.prodPerDay = o.kg / (o.time / 24);
						if (o.prodPerDay > this.maxProd)
							this.maxProd = o.prodPerDay;
					}
				}
				ii = 8;
				var sum = 0, cnt = 0;
				while (--ii >=0 && --i >= 0)
					if (this.days[i]) {
						sum += this.days[i].prodPerDay;
						cnt++;
					}
				this.prod7d = cnt ? sum / cnt : 0;
				this.startDate = this.startTime;
				this.endDate = this.endTime + 86400000 - 1;
				var oo=0;
				oo++;
			}
		},
		addDynamicEntry = function(pp, lab, val) {
			pp.push({tr:{children:[
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+lab+'</nobr>'}}}},
						{td:{align:'left',children:{div:{innerHTML:'&nbsp;&nbsp;'}}}},
						{td:{align:'left',children:{div:{innerHTML:'<nobr>'+val+'</nobr>'}}}}]}});
		},
		MilkingDBStatistics = function(s) {
			this.kickOff = [];
			this.nrTries = [];
			this.failClean = [];
			this.failAttach = [];
			this.timeAttachTeatLast = [];
			this.timeAttachTeatTotal = [];
			var	sd = new JsSerilz('#', s),
				getInt = function() {
					var str = sd.getString();
					if (str && str.length)
						return parseInt(str);
					return 0;
				};
			this.timeVc =			getInt();
			this.timeClean =		getInt();
			this.timeAttach =		getInt();
			this.timeMilking =		getInt();
			this.timeSpray =		getInt();
			this.timeOutOfStall=	getInt();
			this.failSpray =		getInt() > 0;
			var i = -1;
			while (++i < 4)
				if ((this.nrTries[i] = getInt()) > 0) {
					this.timeAttachTeatTotal[i]=	getInt();
					var timeLast =					getInt();
					this.timeAttachTeatLast[i] =	timeLast ? this.timeAttachTeatTotal[i] : timeLast;
					this.kickOff[i] =				getInt();
					this.failClean[i] =				getInt();
					this.failAttach[i] =			getInt();
					}
		},
		analyzeFlags=function(f){
			var i = -1, str=null;
			while (++i < 4) {
				if (f&1) {
					if (str)
						str += ' ';
					else
						str = '';
					str += test.Teats[i];
				}
				f >>= 4;
			}
			return str;
		},
		dispYield=function(pp, label, yld, expected) {
			addDynamicEntry(pp, 'Yield ' + label, yld + 'kg' + (expected ? ' (' + (!yld && expected ? expected + 'kg was expected)' : Math.round(yld / expected * 100) + '% of expected)') : ''));
		},
		onMouseOver=function(id) {
			if (dynamicId)
				setDynPos();
			else {
				var mo = milkings[id], milking = mo.o, pp=[], date = new Date(milking.endOfMilkingTime), stat;
				if (milking.events)
					stat = new MilkingDBStatistics(milking.events);
				pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},innerHTML:'<nobr>'+date.printiso()+'</nobr>'}}]}}]}});
				addDynamicEntry(pp, 'Total yield', Math.round(milking.totalYieldUdder*10)/10 + 'kg');
				addDynamicEntry(pp, 'Prod / 24h', Math.round(mo.prodPerDay*10)/10 + 'kg');
				var prodH = Math.floor(mo.prodTime), prodMinu = Math.floor((mo.prodTime - prodH) * 60);
				addDynamicEntry(pp, 'Milking interval', prodH + 'h' + ' ' + prodMinu + 'min');
				if (milking.activity > 0) {
					var act = milking.activity - (milking.activity > 3 ? 3 : 0), s = '';
					while (--act >= 0) s += '+';
					if (milking.activity > 3)
						s = '(' + s + ')';
					addDynamicEntry(pp, 'Activity', s);
				}
				addDynamicEntry(pp, '% of expected', milking.expectedYieldPercentDiff === -60 ? '< 40' : Math.round(100+milking.expectedYieldPercentDiff));
				if (milking.mdi !== -1)
					addDynamicEntry(pp, 'mdi', milking.mdi);
				if (milking.averageConductivity) {
					if (milking.conductivityLF) {
						addDynamicEntry(pp, 'ConductivityLF', milking.conductivityLF);
						addDynamicEntry(pp, 'ConductivityLR', milking.conductivityLR);
						addDynamicEntry(pp, 'ConductivityRF', milking.conductivityRF);
						addDynamicEntry(pp, 'ConductivityRR', milking.conductivityRR);
					}
					else
						addDynamicEntry(pp, 'Conductivity', milking.averageConductivity);
				}
				if (milking.blood)
					addDynamicEntry(pp, 'Blood', milking.blood);
				addDynamicEntry(pp, 'Day in milk', Math.floor((milking.endOfMilkingTime - milking.lactationDay) / 86400000));
				addDynamicEntry(pp, 'Robot', milking.robot);
				var milkTime = milking.secMilkingTime, mmin = Math.floor(milkTime / 60), msec = milkTime - mmin * 60;
				addDynamicEntry(pp, 'Milking time', mmin + 'min' + ' ' + msec + 'sec');
				addDynamicEntry(pp, 'Milk dest', milking.milkDestination);
				if (milking.occ !== -1)
					addDynamicEntry(pp, 'occ', milking.occ);
				if (milking.flags & 0x1111)
					addDynamicEntry(pp, 'Incomplete', analyzeFlags(milking.flags & 0x1111));
				if (milking.flags & 0x2222)
					addDynamicEntry(pp, 'Kick off', analyzeFlags((milking.flags >> 1) & 0x1111));
				if (milking.totalYield[0] !== -1) {
					dispYield(pp, "LF", milking.totalYield[0], milking.expectedYieldLF);
					dispYield(pp, "LR", milking.totalYield[1], milking.expectedYieldLR);
					dispYield(pp, "RF", milking.totalYield[2], milking.expectedYieldRF);
					dispYield(pp, "RR", milking.totalYield[3], milking.expectedYieldRR);
				}
				if (milking.peakFlowLF) {
					addDynamicEntry(pp, 'PeakFlowLF ', milking.peakFlowLF);
					addDynamicEntry(pp, 'PeakFlowLR ', milking.peakFlowLR);
					addDynamicEntry(pp, 'PeakFlowRF ', milking.peakFlowRF);
					addDynamicEntry(pp, 'PeakFlowRR ', milking.peakFlowRR);
				}
				showDynTbl(pp,dynInner);
				dynamicId = id;
			}
		},
		onMouseStop = function() {
			showDynamic(false);
			dynamicId = null;
		},
		chYl=function(yld, expected) {
			return expected > 0 && ((yld / expected) > 1.3);
		},
		addLine=function(graph, color, thickness, values, onMouseOver, circleRadius) {
			graph.addLine(color, thickness, null, onMouseOver, circleRadius);
			var i = -1;
			while (++i < values.length) {
				var v = values[i];
				graph.addPoint(v.x, v.y, v.id, v.col, v.mark);
			}
		},
		selectClickOcc=function(id) {
			showInGraph.occ[id] = showInGraph.occ[id] === undefined || showInGraph.occ[id] ? 0 : 1;
			window.localStorage.setItem("testShowGraphOcc", JSON.stringify(showInGraph.occ));
			paint();
		},
		selectClickMain=function(id) {
			showInGraphClick(showInGraph.main, id);
			paint();
		},
		selectClickOther=function(id) {
			showInGraphClick(showInGraph.other, id);
			paintOther();
		},
		onMouseOtherClick=function(graph, time, value){
			if (viewCmndIndex === 1) {	// Show occ
				if (time === undefined) {
				}
				else {
					var o = guidMilkingMap[time];
					markMilking = o.guidHash;
					time = new Date(o.endOfMilkingTime);
					time.setHours(0,0,0,0);
					occIntervalFrom = time.getTime();
					occIntervalTo = occIntervalFrom + 86400000;
					paint();
					paintOther();
				}
			}
		},
		paintOther=function() {
			showDynamic(false);
			while (otherGraphDiv.firstChild)
				otherGraphDiv.removeChild(otherGraphDiv.firstChild);
			var otherGraph = new myGraph.instance(onMouseStop, months);
			var graphHeight = window.innerHeight-root.offsetTop-50;
			var viewOther=jr.ec('canvas',{parentNode:otherGraphDiv,id:"myGraphOther",className:'',width:root.clientWidth-4,height:Math.round(graphHeight * 1 / 3),
										  onmouseover:otherGraph.mouseTargetStart,onmouseout:otherGraph.mouseTargetStop,onmousemove:otherGraph.mouseTargetMove});
			otherGraph.setCanvas(viewOther);
			otherGraph.clear('#848484','#f4f4f4','d','#575757', '#DBDBDB', '#E5E5E5');
			otherGraph.setFont('bold 17px sans-serif', 15);
			otherGraph.mouseClickSetCallback(onMouseOtherClick);
			var i = -1;
			var occVal=[], mdiVal=[], bloodVal=[], secMilkingTimeVal=[];
			while (++i < animal.milkings.length) {
//	final Double MdiWarningDefault = 1.4D;
//	final Double MdiAlarmDefault = 2D;
//	final Double BloodWarningDefault = 600.D;
//	final Double BloodAlarmDefault = 1000.D;
//	final Double CellsWarningDefault = 250.D;
//	final Double CellsAlarmDefault = 500.D;
//	var color =  normal ? "#0000FF" : incomp ? kickoff ? "#9C0000" : "#FF2020" : "#F6CA07";
				var mm = animal.milkings[i];
				if (occMax)				occVal.push(			{x:mm.endOfMilkingTime,y:Math.max(mm.occ,0)/occMax*100,id:mm.occ > 250 ? mm.guidHash : null,col:mm.occ > 500 ? "#FF7770" : "#F6CA07", mark:mm.guidHash === markMilking ? '#ffffff' : null});
				if (mdiMax)				mdiVal.push(			{x:mm.endOfMilkingTime,y:Math.max(mm.mdi,0)/mdiMax*100,id:mm.mdi > 1.4 ? mm.guidHash : null,col:mm.mdi > 2 ? "#FF7770" : "#F6CA07"});
				if (bloodMax)			bloodVal.push(			{x:mm.endOfMilkingTime,y:Math.max(mm.blood,0)/bloodMax*100,id:mm.blood > 600 ? mm.guidHash : null,col:mm.blood > 1000 ? "#FF7770" : "#F6CA07"});
				if (secMilkingTimeMax)	secMilkingTimeVal.push(	{x:mm.endOfMilkingTime,y:mm.secMilkingTime/secMilkingTimeMax*100});
			}
			otherGraph.addLine("#111111", 1);
			var isOn = showInGraph.other.isOn;
			if (isOn[0])	addLine(otherGraph, "#54B9F7", 4, occVal,	onMouseOccOver, 6);		// Blue
			if (isOn[1])	addLine(otherGraph, "#5AF754", 4, mdiVal,	onMouseOccOver, 3);		// Green
			if (isOn[2])	addLine(otherGraph, "#F76A54", 2, bloodVal,	onMouseOccOver, 4);		// Red
			if (isOn[3])	addLine(otherGraph, "#FAFA14", 1, secMilkingTimeVal);				// Yellow
			otherGraph.setLimits(100, allData.minTime, allData.maxTime);
			var info = [];
			if (occMax)					info.push({color: "#54B9F7", id:0,	isOn: isOn[0],	text:"occ % of max: " + occMax});
			if (mdiMax)					info.push({color: "#5AF754", id:1,	isOn: isOn[1],	text:"mdi % of max: " + mdiMax});
			if (bloodMax)				info.push({color: "#F76A54", id:2,	isOn: isOn[2],	text:"blood % of max: " + bloodMax});
			var minutes = Math.floor(secMilkingTimeMax / 60), seconds = secMilkingTimeMax - minutes * 60;
			if (secMilkingTimeMaxTime)	info.push({color: "#FAFA14", id:3,	isOn: isOn[3],	text:"Milking time % of max: " + minutes + 'min ' + seconds + 'sec'});
			otherGraph.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"}, selectClickOther);
			otherGraph.paint();
		},
		onMouseOccOver=function(id){
			if (dynamicId)
				setDynPos();
			else {
				var milking = guidMilkingMap[id], pp=[], date = new Date(milking.endOfMilkingTime), stat;
				if (milking.events)
					stat = new MilkingDBStatistics(milking.events);
				pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},innerHTML:'<nobr>'+date.printiso()+'</nobr>'}}]}}]}});
				addDynamicEntry(pp, 'Animal nr.', milking.animalNumber);
				addDynamicEntry(pp, 'Robot', milking.robot);
				addDynamicEntry(pp, 'Milk dest.', milking.milkDestination);
				if (milking.mdi !== -1)
					addDynamicEntry(pp, 'mdi', milking.mdi);
				addDynamicEntry(pp, 'Conductivity', milking.averageConductivity);
				if (milking.blood)
					addDynamicEntry(pp, 'Blood', milking.blood);
				if (milking.occ !== -1)
					addDynamicEntry(pp, 'occ', milking.occ);
				if (milking.flags & 0x1111)
					addDynamicEntry(pp, 'Incomplete', analyzeFlags(milking.flags & 0x1111));
				if (milking.flags & 0x2222)
					addDynamicEntry(pp, 'Kick off', analyzeFlags((milking.flags >> 1) & 0x1111));
				if (milking.totalYield[0] !== -1) {
					dispYield(pp, "LF", milking.totalYield[0], milking.expectedYieldLF);
					dispYield(pp, "LR", milking.totalYield[1], milking.expectedYieldLR);
					dispYield(pp, "RF", milking.totalYield[2], milking.expectedYieldRF);
					dispYield(pp, "RR", milking.totalYield[3], milking.expectedYieldRR);
				}
				pp.push({tr:{children:[{td:{align:'center',colSpan:3,children:[{div:{style:{'font-weight':'bold'},innerHTML:'<nobr>'+test.MoreInfo+'</nobr>'}}]}}]}});
				showDynTbl(pp,dynInner);
				dynamicId = id;
			}
		},
		onMouseOccClick=function(graph, time, value){
			if (value === undefined) {
				var milking = guidMilkingMap[time], i = -1;
				markMilking = milking.guidHash;
				while (++i < allData.animals.length && allData.animals[i].animalNr !== milking.animalNumber) {}
				if (i !== allData.animals.length) {
					animal = allData.animals[animalIndex = i];
					setMaxValues();
					setButtons(true, true);
				}
			}
			else {
				if (occIntervalFrom) {
					occIntervalFrom = 0;
					occIntervalTo = new Date().getTime() + 86400000;
				}
				else {
					time = new Date(time);
					time.setHours(0,0,0,0);
					occIntervalFrom = time.getTime();
					occIntervalTo = occIntervalFrom + 86400000;
				}
				paint();
			}
		},
		paintOcc=function(mainGraph){
			mainGraph.mouseClickSetCallback(onMouseOccClick);
			var robotsLength = Object.keys(robotMilkings).length, ii = -1, colors=[], info = [], isOnSomeone = false;
			mainGraph.addLine("#111111", 1);
			for (var key in robotMilkings) {
				var m = robotMilkings[key], name = m[0].robot, col, fullName = farmName + '.' + name, isOn = showInGraph.occ && showInGraph.occ[fullName], i = -1;
				isOn = isOn === undefined || isOn;
				colors.push(col = jr.rainbowColor(++ii,robotsLength));
				info.push({color: col, id:fullName,	isOn: isOn, text:name});
				mainGraph.addLine(col, 2, null, onMouseOccOver, 4);
				if (isOn)
					while (++i < m.length) {
						var mm = m[i];
						if (mm.occ !== -1 && occIntervalFrom < mm.endOfMilkingTime && occIntervalTo > mm.endOfMilkingTime) {
							isOnSomeone = true;
							mainGraph.addPoint(mm.endOfMilkingTime, mm.occ, mm.guidHash, col, mm.guidHash === markMilking ? '#ffffff' : null);
						}
					}
			}
			if (!isOnSomeone)
				mainGraph.setLimits(100, allData.minTime, allData.maxTime);
			mainGraph.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"}, selectClickOcc);
		},
		paintQuearters=function(mainGraph, isOn, color, index){
		},
		setMaxValues=function() {
			occMax = mdiMax = bloodMax = secMilkingTimeMax = 0;
			var data = animal.milkings, i = -1;
			while (++i < data.length) {
				var mm = data[i];
				if (mm.occ > occMax)						{occMax =			mm.occ;				occMaxTime =			mm.endOfMilkingTime;}
				if (mm.mdi > mdiMax)						{mdiMax =			mm.mdi;				mdiMaxTime =			mm.endOfMilkingTime;}
				if (mm.blood > bloodMax)					{bloodMax =			mm.blood;			bloodMaxTime =			mm.endOfMilkingTime;}
				if (mm.secMilkingTime > secMilkingTimeMax)	{secMilkingTimeMax=	mm.secMilkingTime;	secMilkingTimeMaxTime =	mm.endOfMilkingTime;}
			}
		},
		ProdDay=function() {
			this.nrMilkings = 0;
			this.kg = 0;
			this.milkTime = 0;
		},
		onMouseProdOver=function(id) {
			
		},
		paintProd=function(mainGraph) {
			var total = [], perDay = {}, nrDays = Math.ceil((allData.maxTime - allData.minTime) / 86400000), i = -1, lastTime = 0, robotsLength = Object.keys(robotMilkings).length - 1;
			if (robotsLength) {
				while (++i < nrDays)
					total[i] = new ProdDay();
			}
			for (var key in robotMilkings) {
				var day = perDay[key] = [], milkings = robotMilkings[key];
				i = -1;
				while (++i < nrDays)
					day[i] = new ProdDay();
				i = -1;
				while (++i < milkings.length) {
					var mm = milkings[i], ind = Math.floor((mm.endOfMilkingTime - allData.minTime) / 86400000), d = day[ind];
					d.nrMilkings++;
					d.kg += mm.totalYieldUdder;
					d.milkTime += mm.secMilkingTime;
					if (robotsLength) {
						var t = total[ind];
						t.nrMilkings++;
						t.kg += mm.totalYieldUdder;
						t.milkTime += mm.secMilkingTime;
					}
				}
				if (milkings.length && lastTime < milkings[milkings.length - 1].endOfMilkingTime)
					lastTime = milkings[milkings.length - 1].endOfMilkingTime;
			}
			if (robotsLength) {
				++robotsLength;
				var aver = perDay.Average = [], d;
				i = -1;
				while (++i < total.length) {
					aver[i] = d = new ProdDay(), t = total[i];
					d.nrMilkings = t.nrMilkings / robotsLength;
					d.milkTime = t.milkTime / robotsLength;
					d.kg = t.kg / robotsLength;
				}
				++robotsLength;
				perDay.Total = total;
			}
			lastTime = (86400000 - allData.maxTime + lastTime) / 86400000;
			var ii = -1, colors=[], info = [], isOnSomeone = false;
			mainGraph.addLine("#111111", 1);
			var data = [];
			for (var name in perDay)
				data.push({name:name, data:perDay[name]});
			data.sort(function(o1,o2){return o1.name.localeCompare(o2.name);});
			var io = -1;
			while (++io < data.length) {
				var name = data[io].name, col, fullName = farmName + '.' + name, isOn = showInGraph.occ && showInGraph.occ[fullName], i = -1, m = data[io].data, time = allData.minTime + 43200000;
				isOn = isOn === undefined || isOn;
				colors.push(col = jr.rainbowColor(++ii,robotsLength + 1));
				info.push({color: col, id:fullName,	isOn: isOn, text:name});
				mainGraph.addLine(col, 2, null, onMouseProdOver, 4);
				if (isOn)
					while (++i < m.length) {
						var mm = m[i];
						isOnSomeone = true;
						mainGraph.addPoint(time, (i+1===m.length ? mm.kg / lastTime : mm.kg));
						time += 86400000;
					}
			}
			if (!isOnSomeone)
				mainGraph.setLimits(100, allData.minTime, allData.maxTime);
			mainGraph.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"}, selectClickOcc);
		},
		paint=function(){
			showDynamic(false);
			while (root.firstChild)
				root.removeChild(root.firstChild);
			var mainGraph = new myGraph.instance(onMouseStop, months),
				data = animal.production,
				isOn = showInGraph.main.isOn;
			var graphHeight = window.innerHeight-root.offsetTop-50;
			var view=jr.ec('canvas',{parentNode:root,id:"myGraph",className:'',width:root.clientWidth-4,height:Math.round(graphHeight * 2 / 3),
									 onmouseover:mainGraph.mouseTargetStart,onmouseout:mainGraph.mouseTargetStop,onmousemove:mainGraph.mouseTargetMove});
			mainGraph.setCanvas(view);
			mainGraph.clear('#848484','#f4f4f4','d','#575757', '#DBDBDB', '#E5E5E5');
			mainGraph.setFont('bold 25px sans-serif', 20);
			milkings = {};
			setMaxValues();
			if (viewCmndIndex === 1) {	// Show occ
				mainGraph.setCursor(occIntervalFrom ? 'zoom-out' : 'zoom-in');
				paintOcc(mainGraph);
			}
			else if (viewCmndIndex === 2) {	// Show milk prod
//				mainGraph.setCursor(occIntervalFrom ? 'zoom-out' : 'zoom-in');
				paintProd(mainGraph);
			}
			else {
				occIntervalFrom = 0;
				occIntervalTo = new Date().getTime() + 86400000;
				if(isOn[2] && data.prod7d){
					mainGraph.addLine("#000000", 1);
					mainGraph.addPoint(data.startDate, data.prod7d);
					mainGraph.addPoint(data.endDate, data.prod7d);
				}
				var i = -1, dt = 0;
				if (isOn[3]) {
					mainGraph.addLine("#ff00ff",1,"#bbbbbb");
					while (++i < animal.milkings.length) {
						var mm = animal.milkings[i], delta = mm.endOfMilkingTime - dt;
						if (delta > 86400000)
							delta = 86400000;
						delta = mm.endOfMilkingTime - delta;
						if (delta < allData.minTime)
							delta = allData.minTime;
						mainGraph.addStaple(delta, mm.totalYieldUdder, mm.endOfMilkingTime);
						dt = mm.endOfMilkingTime;
					}
//					mainGraph.addLine('#bbbbbb', 1);
//					while (++i < data.days.length) {
//						var dd = data.days[i] ? data.days[i].mlk : null;
//						if (dd) {
//							var ii = -1;
//							while (++ii < dd.length)
//								mainGraph.addPoint(dd[ii].o.endOfMilkingTime, dd[ii].o.totalYieldUdder);
//						}
//					}
				}
				mainGraph.addLine("#099FF4",4);
				if (isOn[0]) {
					var time = data.startDate + 43200000;
					i = -1;
					while (++i < data.days.length) {
						if (data.days[i])
							mainGraph.addPoint(time, data.days[i].prodPerDay);
						time += 86400000;
					}
				}
				mainGraph.addLine('#2D518D', 2, null, onMouseOver, 4);
				i = -1, lastTime = 0;
				while (++i < data.days.length) {
					var dd = data.days[i] ? data.days[i].mlk : null;
					if (dd) {
						var ii = -1, lastTime;
						while (++ii < dd.length) {
							var mm = dd[ii].o, incomp = (mm.flags & 0x1111) !== 0, kickoff = (mm.flags & 0x2222) !== 0, normal = !incomp && !kickoff;
							var prod = dd[ii].prodPerDay > allData.maxProd ? allData.maxProd : dd[ii].prodPerDay;
							var color =  normal ? "#0000FF" : incomp ? kickoff ? "#9C0000" : "#FF2020" : "#F6CA07";
							if (incomp && (mm.expectedYieldPercentDiff > 5 || (mm.expectedYieldPercentDiff > -10 && mm.expectedYieldLF !== -1
								&& (chYl(mm.totalYield[0], mm.expectedYieldLF) || chYl(mm.totalYield[1], mm.expectedYieldLR) || chYl(mm.totalYield[2], mm.expectedYieldRF) || chYl(mm.totalYield[3], mm.expectedYieldRR)))))
									color = "#00FF62";
//							if (lastTime)
//								mainGraph.addPoint(lastTime, prod);
							milkings[mm.guidHash] = dd[ii];
							if (isOn[1])
								mainGraph.addPoint(lastTime=mm.endOfMilkingTime, prod, mm.guidHash, color, null, (mm.activity > 0 ? 1 : 0) + (mm.milkDestination==='Tank'?0:2));
						}
					}
				}
				mainGraph.setLimits(allData.maxProd, allData.minTime, allData.maxTime);
				var info = [];
				info.push({color: "#bbbbbb", id:3,	isOn: isOn[3],	text:test.MilkingYield});
				info.push({color: "#099FF4", id:0,	isOn: isOn[0],	text:test.DailyMilkProd});
				info.push({color: "#2D518D", id:1,	isOn: isOn[1],	text:test.MilkProdPerMilking});
				info.push({color: "#6E6E6E", id:2,	isOn: isOn[2],	text:test.LastSevenDays});
				mainGraph.addInfo(info, {font:'15px sans-serif', size:17, color:"#000000"}, selectClickMain);
			}
			mainGraph.paint();
		},
		fetchDone=function() {
			var nrFull = 0, minTime = new Date().getTime(), maxTime = 0, maxProd = 0;
			for (var key in allData.animals) {
				var o = allData.animals[key], i = -1;
				while (++i < o.milkings.length) {
					var m = o.milkings[i];
					if (m.expectedYieldLF !== -1)
						nrFull++;
				}
			}
			showInfo('Total milkings: ' + totalCnt + '. Full milkings: ' + nrFull + " (" + Math.round((nrFull / totalCnt) * 1000) / 10 + "%)");
			showInfo('Incomplete: ' + incompleteCnt + ' (' + Math.round(incompleteCnt/totalCnt*1000)/10 + "%)  False incomplete: "
					 + corrIncompleteCnt + ' (' + (Math.round(corrIncompleteCnt/incompleteCnt*1000)/10) + '% of incomplete, ' + (Math.round(corrIncompleteCnt/totalCnt*1000)/10) + '% of all)');
			downloadInfo = infoLabel;
			intermediateTime=new Date().getTime();
			allData.animals.forEach(function(a){
				var p = a.production = new animalData(a);
				if (p.startDate < minTime)
					minTime = p.startDate;
				if (p.endDate > maxTime)
					maxTime = p.endDate;
				if (p.maxProd > maxProd)
					maxProd = p.maxProd;
			});
			allData.maxProd = maxProd;
			allData.minTime = minTime;
			allData.maxTime = maxTime;
			var ii = -1;
			robotMilkings = {};
			guidMilkingMap = {};
			while (++ii < allData.animals.length) {
				var i = -1, animal = allData.animals[ii];
				while (++i < animal.milkings.length) {
					var mm = animal.milkings[i];
					guidMilkingMap[mm.guidHash] = mm;
					if (!robotMilkings[mm.robot])
						robotMilkings[mm.robot] = [];
					robotMilkings[mm.robot].push(mm);
				}
			}
			for (var key in robotMilkings) {
				robotMilkings[key].sort(function(o1,o2){
					return o1.endOfMilkingTime > o2.endOfMilkingTime ? 1 : -1;
				});
			}
			showInfo('Max production = ' + maxProd + '. Calculation of production took ' + (new Date().getTime() - intermediateTime) + ' ms');
			render();
		},
		fetchData=function(spec) {
			var oReq = new XMLHttpRequest();
			oReq.open("GET", "/GetWeekMilkings.vcx?"+(vcId ? "vcId=" + vcId + '&' : '') + "index=" + spec.index + "&a=1" + (spec.fromCache ? '' : '&time='+new Date().getTime()), true);
			if (spec.fromCache)
				oReq.setRequestHeader('Cache-Control', 'max-age=25920000');
			oReq.responseType = "arraybuffer";
			oReq.onload = function(oEvent) {
				gotData(new Uint8Array(oReq.response));
			};
			oReq.send(null);	
		},
		getData=function(toDate, nrWeeks){
			var indexToDate = getFileIndexFromTime(toDate), twoDaysAgo = getFileIndexFromTime(toDate - 172800000), i = indexToDate + 1, ii = nrWeeks;
			weeksToFetch=[];
			while (i > 0 && --ii >= 0)
				weeksToFetch.push({index:--i, fromCache:indexToDate > twoDaysAgo});
			weeksToFetchIndex=weeksToFetch.length;
			allData=[];
			corrIncompleteCnt = incompleteCnt = 0;
			clearDynPos();
			showInfo('Fetch data from server...');
			showDynamic(true);
			beginTime=new Date();
			i = weeksToFetch.length;
			while (--i >= 0)
				fetchData(weeksToFetch[i]);
		},
		gotData=function(data){
			showInfo('Got ' + data.byteLength / 1000 + ' Kb from server in ' + (new Date().getTime() - beginTime) + ' ms');
			intermediateTime=new Date().getTime();
			var md = new milkData(data);
			showInfo('Unpack ' + md.nrAnimals + ' animals in ' + md.getNrMilkings() + ' milkings took ' + (new Date().getTime() - intermediateTime) + ' ms');
			--weeksToFetchIndex;
			if (md.animals.length)
				allData.push({data:md,time:md.animals[0].milkings[0].endOfMilkingTime});
			if (!weeksToFetchIndex) {
				allData.sort(function(o1,o2){return o1.time > o2.time ? 1 : -1;});
				var a = allData, i = 0;
				allData = a[0].data;
				intermediateTime=new Date().getTime();
				while (++i < a.length)
					allData.mergeWithLaterWeek(a[i].data);
				showInfo('Merge to ' + allData.nrAnimals + ' animals and ' + allData.getNrMilkings() + ' milkings took ' + (new Date().getTime() - intermediateTime) + ' ms');
				showInfo('Total time ' + (new Date().getTime() - beginTime.getTime()) + ' ms');
				var aNr = window.localStorage.getItem("testAnimalNr");
				if (aNr) {
					var i = -1;
					while (++i < allData.animals.length && aNr !== allData.animals[i].animalNr) {}
					if (i < allData.animals.length)
						animalIndex = i;
				}
				fetchDone();
			}
		},
		showInfo=function(info) {
			infoLabel += '<nobr>' + info + '</nobr><br/>';
			showDynTbl({div:{innerHTML:infoLabel}},dynInner);
		},
		keyNotBefore = 0,
		pressedKey=function(key) {
			var noww=new Date().getTime();
			if (keyNotBefore < noww) {
				keyNotBefore = noww + 70;
				if (key === 33)
					prevAnimal();
				else if (key === 34)
					nextAnimal();
			}
		},
		parseDate=function(str){
			str = str.split('/');
			if (str.length === 3) {
				var month = parseInt(str[0]), day = parseInt(str[1]), year = parseInt(str[2]);
				return new Date(year, month - 1, day);
			}
		},
		setWeeks=function(){
			setTimePeriod(parseDate(ceh['fromDate'].value).getTime(), parseDate(ceh['toDate'].value).getTime());
		},
		showInGraphClick=function(part, id){
			part.isOn[id] = part.isOn[id] ? 0 : 1;
			window.localStorage.setItem(part.lsid, JSON.stringify(part));
		},
		initShowInGraph=function() {
			var init = function(lsId) {
				var part =	window.localStorage.getItem(lsId);
				if (part)
					part = JSON.parse(part);
				else {
					part = {isOn:Array(20).fill(1)};
					window.localStorage.setItem("lsId", JSON.stringify(part));
				}
				part.lsid = lsId;
				return part;
			};
			showInGraph = {main:init('testShowGraphMain'), other:init('testShowGraphOther'), occ:{}};
			var occPart = window.localStorage.getItem('testShowGraphOcc');
			if (occPart)
				showInGraph.occ = JSON.parse(occPart);
		},
		setTimePeriod=function(fromDate_, untilDate) {
			var indexFromDate = getFileIndexFromTime(fromDate_), indexUntilDate = getFileIndexFromTime(untilDate), indexNow = getFileIndexFromTime(new Date().getTime());
			if (indexFromDate < 0)
				indexFromDate = 0;
			if (indexUntilDate > indexNow)
				indexUntilDate = indexNow;
			if (indexFromDate <= indexUntilDate && indexFromDate <= indexNow) {
				nrWeeks = indexUntilDate - indexFromDate + 1;
				if (nrWeeks <= 8)
					window.localStorage.setItem("testNrOfWeeks", nrWeeks.toString());
				fromDate = new Date(fromDate_);
				fromDateStr = (1+fromDate.getMonth())+'/'+fromDate.getDate()+'/'+fromDate.getFullYear();
				toDate = new Date(untilDate);
				toDateStr = (1+toDate.getMonth())+'/'+toDate.getDate()+'/'+toDate.getFullYear();
				window.localStorage.setItem("testFromWeek", fromDateStr);
				window.localStorage.setItem("testToWeek", toDateStr);
				var dynNode = document.body.firstChild;
				while (document.body.firstChild)
					document.body.removeChild(document.body.firstChild);
				document.body.appendChild(dynNode);
				clearDynPos();
				root = null;
				getData(untilDate, nrWeeks);
			}
		},
		onKeyDown=function() {
			var key = event.which;
			if (key === 33 || key === 34)
				pressedKey(key);
		};
		dynDivs={};
		dynamic=jr.ec('div',{parentNode:document.body,className:'dynamicDiv',
							children:{table:{className:'dialogTable',children:{tr:{children:{td:{children:{div:{contextIdentity:'inner',className:'dynamicDivContent'}}}}}}}}},dynDivs);
		dynInner=dynDivs.inner;
		vcId=jr.getUrlVar('id');
		jr.eventManager.addListener('milkingData', jr.eventManager, function(data){
			if(data)setTimeout(function(){ gotData(data);}, 0);else document.body.innerHTML=jr.translate("Sorry, you have no permission for this...");});
		document.onkeydown=onKeyDown;
		imgIcons=jr.getImage('/Resources/info6.png');
		initShowInGraph();
		$('.datepicker').datepicker({
			dateFormat: 'dd-mm-yy',
			numberOfMonths: 5,
			onSelect: function(selected,evnt) {
				 updateAb(selected);
			}
		});

		fromDateStr = window.localStorage.getItem("testFromWeek");
		toDateStr = window.localStorage.getItem("testToWeek");
		if (fromDateStr) {
			var now = new Date().getDate();
			fromDate = parseDate(fromDateStr);
			toDate = parseDate(toDateStr);
			if (toDate > now)
				toDate = now;
			var indexToDate = getFileIndexFromTime(toDate), indexFromDate = getFileIndexFromTime(fromDate);
			nrWeeks = indexToDate - indexFromDate;
			if (nrWeeks >= 0) {
				getData(toDate, nrWeeks);
				return;
			}
		}
		var ss = window.localStorage.getItem("testNrOfWeeks");
		if (ss && ss.length) {
			ss = parseInt(ss);
			if (ss > 0)
				nrWeeks = ss + 1;
		}
		var now = new Date().getTime(), indexNow = getFileIndexFromTime(now), firstIndex = indexNow - nrWeeks, firstDateInWeek = now - nrWeeks * 604800000;
		while (getFileIndexFromTime(firstDateInWeek - 86400000) === firstIndex)
			firstDateInWeek -= 86400000;
		fromDate = new Date(firstDateInWeek);
		fromDateStr = (1+fromDate.getMonth())+'/'+fromDate.getDate()+'/'+fromDate.getFullYear();
		toDate = new Date(now);
		toDateStr = (1+toDate.getMonth())+'/'+toDate.getDate()+'/'+toDate.getFullYear();
		getData(new Date().getTime(), nrWeeks);
	}
};
jr.init( function() {
    test.init();
	new test.instance();
} );
