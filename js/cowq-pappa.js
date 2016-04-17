'use strict';

jr.include('/Resources/info8.png');
angular.module('cowq-pappa', ['util', 'j$', 'translate'])
.factory('cowq.CowqData', ['j$SerilzFormat', 'cowq.Group', 'cowq.Area', 'cowq.deSerializeCow', 'util.getTime',
	function(createFormat, Group, Area, deSerializeCow, getTime) {
		return createFormat([
			{groups:		[Group]},
			{areas:			[Area]},
			{cows:			[function(sd) {
								if(sd.getInt() === 1)
									return deSerializeCow(sd, getTime());
							}, 'hasMore']}
		]);
	}
])
.factory('cowq.setCowsToGroups', ['util.getItem', function(getItem) {
	function getGroup(groups, key) {
		return getItem(groups, function(test) {
			return test.key === key;
		});
	}
	return function(data) {
		var groups = data.groups = {};
		data.cows.forEach(function(cow){
			if(!groups[cow.group]) {
				groups[cow.group] = $.extend(getGroup(data.groupsOrginal, cow.group), {cows: {}});
			}
			groups[cow.group].cows[cow.nr] = cow;
		});
		data.nrGroups = Object.keys(groups).length;

		data.groupsArray = data.groupsOrginal.filter(function(group) {
			return group.cows;
		});
	};
}])
.factory('cowq.deSerializeData', ['JsSerilz', 'cowq.CowqData', 'cowq.setCowsToGroups', 'util.getTime',
	function(JsSerilz, CowqData, setCowsToGroups, getTime) {
		return function(data, codeSets, writeMessagePermission) {
			var sd = new JsSerilz('$', data.serializedData),
				allData = new CowqData(sd);
			$.extend(data, {
				groupsOrginal:	allData.groups,
				areas:			allData.areas,
				cows:			allData.cows,
				waitAreas:		{},
				vmsAreas:		{},
				openGate:		{},
				fetchCows:		{}
			});
			data.oldOpenGate = null;
			data.codeSets={};
			var sd=new JsSerilz('$',codeSets), clen = sd.getInt(), o, ncols;
			while (--clen >= 0) {
				var cKey=sd.getString();
				data.codeSets[cKey]=sd.getString();
			}
			if(data.openGateSecLeft && data.openGateSecLeft > 0){
				data.oldOpenGate = data.openGateAnimalNr;
				data.waitAreaStateTime = getTime() + data.openGateSecLeft * 1000;
				if(data.oldOpenGate&&data.oldOpenGate.length)
					data.oldOpenGate.split(',').forEach(function(cowNr){data.openGate[+cowNr]=1;});
			}
			setCowsToGroups(data);
			var allAreas={};
			allData.areas.forEach(function(area) {
				var areaType=parseInt(area.type);
				if(areaType===0)
					data.waitAreas[area.id]=area;
				else if(areaType===1)
					data.vmsAreas[area.id]=area;
				allAreas[area.id]=area;
			});
			data.areas=allAreas;
			data.myName=(data.nameFirst&&data.nameFirst.length?data.nameFirst:'')+' '+(data.nameLast&&data.nameLast.length?data.nameLast:'');
			data.users={};
			data.userCols=[];
			data.email = {};
			if (data.delProUsers) {
				sd=new JsSerilz('#', data.delProUsers);
				clen = ncols = sd.getInt();
				while(--clen >= 0)
					data.userCols.push(sd.getString());
				clen = sd.getInt();
				while(--clen >= 0) {
					var i = -1, o = {};
					while (++i < ncols)
						o[data.userCols[i]] = sd.getString();
					data.users[o.UserId] = o;
					if (o.Email)
						data.email[o.Email] = o;
				}
			}
			data.permitEditNotification = writeMessagePermission;

			delete data.serializedData;
			return data;
		}
	}
])
.factory('cowq.Area', ['j$SerilzFormat', function(createFormat) {
	return createFormat([
		{id:			'string'},
		{type:			'string'},
		{name:			'string'}
	]);
}])
.factory('cowq.Group', ['j$SerilzFormat', function(createFormat) {
	return createFormat([
		{nr:			'int'},
		{name:			'string'},
		{key:			'int'}
	]);
}])
.factory('cowq.Cow', ['j$SerilzFormat', function(createFormat) {
	return createFormat([
		{nr:					'int'},
		{name:					'string'},
		{note:					'string'},
		{group:					'int'},
		{activity:				'int'},
		{action:				'int'},
		{markByUser:			'string'},
		{markBySign:			'string'},
		{notify:				'string'},
		{next:					'dateHex'},
		{prev:					'dateHex'},
		{over:					'int'},
		{lact:					'int'},
		{lactS:					'dateHex'},
		{maskOrginal:			'int'},
		{spd:					'int'},
		{cy:					'int'},
		{sevenDays:				'int'},
		{milkingsPerDay:		'int'},
		{sumMask:				'hex'},
		{areaId:				'string'},
		{inAreaSince:			'dateHex'},
		{expectedCalvingDate:	'hex'},
		{fetchCow:				'int'},
		{trapMask:				'int'},
		{trapStartTime:			'dateHex'},
		{trapEndTime:			'dateHex'},
		{trapString:			null},
		{expectedBuildupDate:	'hex'},
		{expectedDryOff:		'hex'},
		{expectedHeatDate:		'hex'},
		{expectedPregnancyCheck:'hex'},
		{lastHeatDate:			'hex'},
		{lastInseminationDate:	'hex'},
		{latestSCCDate:			'hex'},
		{breed:					'int'},
		{hoursSinceHighActivity:'int'},
		{latestSCC:				'int'},
		{expectedInseminationDue:'int'},
		{expectedInseminationDueDate:'dateHex'},
		{isDryingOff:			'int'},
		{toBeCulled:			'int'},
		{reproductionStatus:	'int'},
		{relativeActivity:		'int'},
		{occ:					['int']}
	]);
}])
.factory('cowq.getText', ['translatedTexts', function(createTexts) {
	return createTexts({
		'today':		'Today',
		'weekDay':		'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
		'blood_':		'B:',
		'mdi_':			'M:',
		'cells_':		'C:',
		'actions':		'Milk,FeedOnly,PassThrough,Unselected',
		'sureOpenWait':	'Are you sure you want to open to wait area?',
		'cancel':		'Cancel',
		'OpenWaitArea':	'OpenWaitArea',
		'search':		'Animal number?',
		'yes':			'Yes',
		'no':			'No',
		'save':			'Save',
		'remove':		'Remove',
		'djur':			'Animal',
		'confirmDelete':'Delete mark for animal',
		'markComment':	'Mark animal with optional comment',
		'markAnimal':	'Mark animal',
		'questionMark':	'?',
		'yesterday':	'yesterday',
		'minmin':		'min_min',
		'minsec':		'min_sec',
		'OpenWaitWrea':	'Open to wait area',
		'SureOpenWait':	'Are you sure you want to open to wait area?',
		'group':		'Group',
		'by':			'by'
	});
}])
.factory('cowq.deSerializeCow', ['cowq.Cow', 'cowq.getText', 'JsSerilz', 
	function(Cow, getText, JsSerilz) {
		var weekDay = getText('weekDay').split(',');
		return function(sd, time) {
			var cow = new Cow(sd),
				getDateString=function(d,from){
					var dt=new Date(time*1000),dd=new Date(d.getTime()),s=from?'':'-';
					dt.setHours(0,0,0,0);
					dd.setHours(0,0,0,0);
					dt=(dd.getTime()-dt.getTime())/86400000;
					if(from&&dt<1)
						return'';
					if(dt===0){
						var h=d.getHours(),m=d.getMinutes();
						return s+(h>=23?getText('today'):(h<10?'0'+h.toString():h.toString())+':'+(m<10?'0'+m.toString():m.toString()));
					}
					if(dt>0&&dt<7)return s+weekDay[dt];
					return s+(d.getDate().toString()+'/'+(d.getMonth()+1).toString());
				};
			if(!cow.expCalvDate)cow.expCalvDate=0;
			cow.mask=cow.maskOrginal&0xbbbb;
			cow.incompleteMask=cow.mask&0x9999;
			cow.over*=1000;
			cow.lastOcc=0;
			cow.occ = cow.occ.map(function(occval){return occval < 0 ? '-' : occval;});
			var i = -1;
			while(++i < cow.occ.length && cow.occ[i] === '-');
			cow.lastOcc = 0;
			i = -1;
			while(++i<cow.occ.length&&cow.occ[i]==='-');if(i<cow.occ.length)cow.lastOcc=parseInt(cow.occ[i]);
			if(cow.trapMask&1){
				if(cow.trapEndTime<time*1000)
					cow.trapMask&=0xfffe;
				else{
					cow.trapString=getDateString(new Date(cow.trapStartTime),1)+getDateString(new Date(cow.trapEndTime),0);
					if(cow.trapMask&2&&cow.trapMask&4092)
						cow.trapString+=' '+((cow.trapMask>>2)&31)+'-'+((cow.trapMask>>7)&31);
				}
			}
			if (cow.note) {
				var sdd = new JsSerilz('#', cow.note), cnt = sdd.getInt();
				cow.notes = {};
				while (--cnt >= 0) {
					var n = {}, type;
					n.objectGUID = sdd.getString();
					type = sdd.getInt();
					n.comment = sdd.getString();
					if (n.comment)
						n.comment = n.comment.trim();
					n.time = sdd.getInt();
					n.user = sdd.getString();
					cow.notes[type] = n;
				}
			}
			return cow;
		};
	}
])
.factory('cowq.renderIcon', ['util.setIncompleteImage', 'drawSprite',
	function(setIncompleteImage, drawSprite) {
		return function(data, index, cow, element) {
			if (index > 0) {
				if(cow.markBySign&&cow.markBySign.length){
					// Notation
					var index=(cow.notify?2:0)-(-(cow.markByUser===data.myName?1:0));
					drawSprite(element, 0,70+index*70,70,70,0,0,70,70);
				}
			} else if (index < 0) {
				setIncompleteImage(element, cow.mask & ~0x9999, 70, 70);
			} else {
				setIncompleteImage(element, cow.mask & ~0x2222, 70, 70);
			}
		};
	}
])
.factory('cowq.renderCell', ['util.formatDate', 'cowq.getText', 'util.cowNr', 'util.timeDiff', 'util.renderHelth', 'translate', 'drawSprite',
	function(formatDate, getText, cowNr, timeDiff, renderHelth, translate, drawSprite) {
		var reproduction = 	['Bred', 'Open', 'Fresh', 'Pregnant', 'Dry', 'Heifer'],
			actions = getText('actions').split(',');
		function renderUpDown(element,v,i){
			if(v=(v>>=i)&3) {
				var img = $('<img class="icon>').appendTo(element);
				drawSprite(img, 0,559+38*v,38,38,0,0,38,38);
			} else {
				$('<span></span>').text(' - ').appendTo(element);
			}
		}
		function renderBoolean(element,value){
			if(value) {
				var img = $('<img class="icon">').appendTo(element);
				drawSprite(img, 38,640,47,47,0,0,47,47);
			}
			else
				$('<span></span>').text('').appendTo(element);
		}
		function renderNote(element, index, note, lactS) {
			var d;
			if (note && (d=note[index])) {
				var text = d.comment ? d.comment : '!';
				if (d.time >= lactS)
					element[0].innerHTML = '<b>'+text+'</b>';
				else {
					
					element[0].innerHTML = '<font size="2">'+text+'</font>';
				}
			}
		}
		return function(data, profileIndex, time, cow, element) {
			element.empty();
			switch(profileIndex) {
				case 2:
					cowNr(data, cow, element);
					return;
				case 3:
					element.text(data.groups[cow.group].name+' ('+data.groups[cow.group].nr+')');
					return;
				case 4:
					cowNr(data, cow, element);
					$('<span></span>').text(' ('+data.groups[cow.group].name+')').appendTo(element);
					return;
				case 5:
					element.text(cow.lact);
					return;
				case 6:
					if(cow.lactS)
						element.text(Math.floor((time-cow.lactS)/86400000));
					return;
				case 7:
					if(cow.lactS){
						var t=Math.floor((time-cow.lactS)/86400000);
						element.text((t<0?'???':t)+' ('+cow.lact+')');
					}
					return;
				case 8:
					var td = timeDiff(time, cow.prev);
					if (td)
						element.text(td);
					return;
				case 9:
					var td = timeDiff(time, cow.next);
					if (td)
						element.text(td);
					return;
				case 10:
					var l=cow.occ.length, s=l<=0?'-':cow.occ[0]+(l<=1?'':' ('+cow.occ[1]+(l<=2?'':','+cow.occ[2])+(l<=3?'':','+cow.occ[3])+')');
					element.text(s);
					return;
				case 11:
					var t = Math.round((time-cow.prev)/1000), td = t>=86400?'':Math.round(t/3600*cow.spd+cow.cy);
					if (td)
						element.text(Math.round(td/10)/10);
					return;
				case 12:
					if(cow.sevenDays > 0){
						$('<span></span>').text((cow.sevenDays / 10)+' ').appendTo(element);
						renderUpDown(element, cow.sumMask, 0);
						$('<span></span>').text('(').appendTo(element);
						var i = -1;
						while(++i < 4)
							renderUpDown(element, cow.sumMask, i);
						$('<span></span>').text(')').appendTo(element);
					}
					return;
				case 13:
					if(cow.sevenDays > 0){
						$('<span></span>').text((cow.sevenDays / 10)+' ').appendTo(element);
						renderUpDown(element, cow.sumMask, 0);
					}
					return;
				case 14:
					if(cow.sumMask>>10)
						renderHelth(element, cow.sumMask);
					break;
				case 16:
					var s=cow.notify===null?'':cow.notify;
					s+=cow.markBySign===null?'':(cow.notify===null?'(':' (')+cow.markBySign+')';
					element.text(s);
					return;
				case 17:
					element.text(actions[cow.action]);
					return;
				case 18:
					if(cow.name && cow.name.length)
						element.text(actions[cow.name]);
					return;
				case 19:
					cowNr(data, cow, element);
					if(cow.name && cow.name.length)
						$('<span></span>').text(' ('+cow.name+')').appendTo(element);
					return;
				case 20:
					var area = data.areas[cow.areaId];
					if(area)
						element.text(area.name);
					return;
				case 21:
					var td = timeDiff(time, cow.inAreaSince);
					if (td)
						element.text(td);
					return;
				case 22:
					var area = data.areas[cow.areaId];
					if(area)
						element.text(area.name+' ('+timeDiff(time, cow.inAreaSince)+')');
					return;
				case 23:
					var at=cow.activity,i;
					s='';
					if(at>0){
						if((i=at)>3){
							s='(';
							i=at-3;
						}
						while(--i>=0)s+='+';
						if(at>3)
							s+=')';
						element.text(s);
					}
					return;
				case 24:
					if(cow.milkingsPerDay>0)
						element.text(cow.milkingsPerDay/10);
					return;
				case 25:
					if(cow.trapString)
						element.text('X');
					return;
				case 26:
					if(cow.trapString)
						element.text(cow.trapString);
					return;
				case 27:
					if(cow.expectedCalvingDate)
						element.text(new Date(cow.expectedCalvingDate).toLocaleDateString());
					return;
				case 28:
					if(cow.lastInseminationDate)
						element.text(new Date(cow.lastInseminationDate).toLocaleDateString());
					return;
				case 29:
					if(cow.expectedBuildupDate)
						element.text(new Date(cow.expectedBuildupDate).toLocaleDateString());
					return;
					break;
				case 30:
					if(cow.expectedDryOff)
						element.text(new Date(cow.expectedDryOff).toLocaleDateString());
					return;
					break;
				case 31:
					if(cow.expectedHeatDate)
						element.text(new Date(cow.expectedHeatDate).toLocaleDateString());
					return;
				case 32:
					if(cow.expectedInseminationDueDate)
						element.text(new Date(cow.expectedInseminationDueDate / 1000).toLocaleDateString());
					return;
				case 33:
					if(cow.expectedPregnancyCheck)
						element.text(new Date(cow.expectedPregnancyCheck).toLocaleDateString());
					break;
				case 34:
					if(cow.lastHeatDate)
						element.text(new Date(cow.lastHeatDate).toLocaleDateString());
					break;
				case 35:
					if(cow.latestSCCDate)
						element.text(new Date(cow.latestSCCDate).toLocaleDateString());
					break;
				case 36:
					if(cow.breed)
						element.text(data.codeSets['BreedTypes_'+cow.breed]);
					break;
				case 37:
					if(cow.hoursSinceHighActivity > 0)
						element.text(cow.hoursSinceHighActivity);
					break;
				case 38:
					if(cow.latestSCC > 0)
						element.text(cow.latestSCC);
					break;
				case 39:
					if (cow.isDryingOff)
						renderBoolean(element,cow.isDryingOff);
					break;
				case 40:
					if (cow.toBeCulled)
						renderBoolean(element,cow.toBeCulled);
					break;
				case 41:
					if(cow.relativeActivity)
						element.text(cow.relativeActivity);
					break;
				case 42:
					if(cow.reproductionStatus >= 0)
						element.text(translate('Reprod_'+reproduction[cow.reproductionStatus]));
					break;
				case 43: case 44: case 45: case 46: case 47: case 48: case 49:
					renderNote(element, profileIndex - 43, cow.notes, cow.lactS);
					break;
			}
		};
	}
])
.factory('cowq.sort', [function() {
	var smsk=[-1,0,5,9,-1,0,1,2,5,4,5,7,10,8,10,14],
		reproduction = 	['Bred', 'Open', 'Fresh', 'Pregnant', 'Dry', 'Heifer'],
		sm, sd, tNow, areas, cs;
	function redYelWhi(o1,o2){
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
	};
	function activity(o1,o2){
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
	};
	function dateInfo(o1,o2,o1Data,o2Data){
		if(o1Data&&o2Data)
			return sd*(o1Data-o2Data>0?1:o1Data===o2Data?0:-1);
		else if(o1Data||o2Data)
			return o1Data?-1:1;
		else
			return redYelWhi(o1,o2);
	};
	function booleanInfo(o1,o2,b1,b2){
		var notSame = b1^b2 ? (b1 ? -10 : 10) : 0;
			return notSame + sd*(o1.nr>o2.nr?-1:1);
	};
	function notes(o1,o2,ind) {
		var p1=o1.notes, p2=o2.notes;
		p1=p1&&p1[ind];
		p2=p2&&p2[ind];
		if (p1&&p2){
			p1=p1.comment;
			p2=p2.comment;
			if (p1&&p2){
				var cmp=sd*p2.localeCompare(p1);
				return cmp ? cmp : sd*(o2.nr-o1.nr);
			}
			else if (p1||p2)
				return p1 ? -1 : 1;
			else
				return sd*(o2.nr-o1.nr);
		}
		else if (p1||p2)
			return p1 ? -1 : 1;
		else
			return sd*(o2.nr-o1.nr);
	}
	function sort(o1,o2){
		if((sm>=25&&sm<=42)||((o1.action==0)&&(o2.action==0))||((o1.action!=0)&&(o2.action!=0)))
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
					var v1=tNow-o1.prev>=86400000?0:Math.round(((tNow-o1.prev)/3600000*o1.spd+o1.cy)/10+.5)/10;
					var v2=tNow-o2.prev>=86400000?0:Math.floor(((tNow-o2.prev)/3600000*o2.spd+o2.cy)/10+.5)/10;
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
						s1=(o1.notify==null?'':o1.notify)+(o1.markBySign==null?'':(o1.notify==null?'(':' (')+o1.markBySign+')');
						s2=(o2.notify==null?'':o2.notify)+(o2.markBySign==null?'':(o2.notify==null?'(':' (')+o2.markBySign+')');
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
					return dateInfo(o1,o2,o1.expectedCalvingDate,o2.expectedCalvingDate);
				case 28:
					return dateInfo(o1,o2,o1.lastInseminationDate,o2.lastInseminationDate);
				case 29:
					return dateInfo(o1,o2,o1.expectedBuildupDate,o2.expectedBuildupDate);
				case 30:
					return dateInfo(o1,o2,o1.expectedDryOff,o2.expectedDryOff);
				case 31:
					return dateInfo(o1,o2,o1.expectedHeatDate,o2.expectedHeatDate);
				case 32:
					var d1=o1.expectedInseminationDueDate,d2=o2.expectedInseminationDueDate;
					if(!d1||d1<1000000)d1=0;
					if(!d2||d2<1000000)d2=0;
					if(d1^d2){
						if(!d1)d1=9007199254740991;
						if(!d2)d2=9007199254740991;
					}
					else if((d1|d2)===0){
						var rr=o1.reproductionStatus-o2.reproductionStatus;
						return rr===0?o1.nr-o2.nr:rr;
					}
					return dateInfo(o1,o2,d2,d1);
				case 33:
					return dateInfo(o1,o2,o1.expectedPregnancyCheck,o2.expectedPregnancyCheck);
				case 34:
					return dateInfo(o1,o2,o1.lastHeatDate,o2.lastHeatDate);
				case 35:
					return dateInfo(o1,o2,o1.latestSCCDate,o2.latestSCCDate);
				case 36:
					p1=cs['BreedTypes_'+o1.breed];
					p2=cs['BreedTypes_'+o2.breed];
					return p1 === p2 ? redYelWhi(o1,o2) : p1.toLowerCase().localeCompare(p2.toLowerCase()) + 10;
				case 37:
					return o1.hoursSinceHighActivity === o2.hoursSinceHighActivity ? redYelWhi(o1,o2) : o1.hoursSinceHighActivity > o2.hoursSinceHighActivity ? 13 : 12;
				case 38:
					return o1.latestSCC === o2.latestSCC ? redYelWhi(o1,o2) : o1.latestSCC > o2.latestSCC ? 13 : 12;
				case 39:
					return booleanInfo(o1,o2,o1.isDryingOff,o2.isDryingOff);
				case 40:
					return booleanInfo(o1,o2,o1.toBeCulled,o2.toBeCulled);
				case 41:
					return o1.relativeActivity === o2.relativeActivity ? redYelWhi(o1,o2) : o1.relativeActivity > o2.relativeActivity ? 13 : 12;
				case 42:
					p1=translate('Reprod_'+reproduction[o1.reproductionStatus]);
					p2=translate('Reprod_'+reproduction[o2.reproductionStatus]);
					return p1 === p2 ? redYelWhi(o1,o2) : p1.toLowerCase().localeCompare(p2.toLowerCase()) + 10;
				case 43:
				case 44:
				case 45:
				case 46:
				case 47:
				case 48:
				case 49:
					return notes(o1,o2,sm-43);
			}
		else if (sm==23&&(o1.activity!=0||o2.activity!=0))
			return activity(o1,o2);
		else if (o1.action==0)
			return -1;
		else if (o2.action==0)
			return 1;
		else
			return sd*(o1.nr-o2.nr);

		}
	return function(cows, allAreas, timeNow, options, codeSets) {
		if(!options) return cows;
		sm = options.profileIndex;
		sd = options.reverse ? 1 : -1;
		cs = codeSets;
//		if([1,2,4,8,10,11,14,15,19,21,22,27].indexOf(sm) >= 0)	// Regexp något snabbare...
		if(/^(1|2|4|8|10|11|14|15|16|19|21|22|27|28|30|31|33)$/.test(sm))
			sd = -sd;
		areas = allAreas;
		tNow = timeNow;
		return cows.sort(sort);
	};
}])
.factory('cowq.selectCows', [function() {
	return function(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups) {
		var i=-1,p=profile,o,cow,ii,c,sinceMilk=p.sinceMilk*3600,milkPerm=p.milkPerm*3600,lactDay=p.lactDay&0xff,lactDayHour=(p.lactDay>>8)*3600,samePlace=p.samePlace*3600,
			expYield=p.expYield,incomplete=p.incomplete*3600,action=p.action,cells=p.cells,activity=p.activityAndAreaMask,includeTrap=p.profileIndex.indexOf(25)>=0,included,isCondition,group=Object.keys(data.groups).length>1?data.groups[groupChoosen]:null,
			cows=[],allCows=data.cows,areas=data.areas,tNow=timeNow,tNext,tPrev,fetchCows=p.activityAndAreaMask & 0x40;
		if (selectedGroups && selectedGroups.length < 1)
			selectedGroups = null;
		while(++i<allCows.length){
			included=false;
			cow=allCows[i];
			isCondition=!!searchPattern;
			if(searchPattern)
				included=cow.nr.toString().indexOf(searchPattern)>=0;
			else {
				if (selectedGroups) {
					var ii = -1, found = 0;
					while (!found && ++ii < selectedGroups.length) {
						found = selectedGroups[ii].cows[cow.nr];
						if (found)
							break;
					}
					if (!found)
						continue;
				}
				else {
					if(group&&!group.cows[cow.nr])
						continue;
				}
				if(p.groups&&p.groups.length>0){
					o=p.groups;
					c=cow.group;
					ii=-1;
					while(++ii<o.length&&o[ii]!=c);
					if(ii==o.length)
						continue;
				}
				if(activity===0x400){	// Notations
					included = true;
				}
				else if(activity===0x200){	// Exp. Insemination Due
					if(cow.toBeCulled)
						continue;
					isCondition=1;
					var rr = cow.reproductionStatus;
					included = ((timeNow-cow.lactS)/86400000)>=30 && ((rr===1||rr===2||rr===5) || cow.expectedInseminationDueDate && (cow.expectedInseminationDueDate > timeNow || cow.expectedInseminationDue));
				}
				else if(activity&0x380){
					isCondition=1;
					switch(activity>>7){
						case 1:
							included = cow.incompleteMask&&cow.prev>timeNow-86400000;
							break;
						case 2:
							included = cow.trapMask&1;
							break;
						case 3:
							included = cow.expectedCalvingDate>0;
							break;
						case 4:
							included = cow.expectedHeatDate>0;
							break;
						case 5:
							included = cow.expectedPregnancyCheck>0;
							break;
						case 6:
							included = cow.expectedDryOff>0;
							break;
						case 7:
							included = cow.toBeCulled;
							break;
					}
				}
				else if(cow.fetchCow&&fetchCows)
					included = true;
				else{
					if(p.areas&&p.areas.length>0){
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
						tPrev=(tNow-cow.prev)/1000;
						if(sinceMilk>0){isCondition=true;	included=tPrev>sinceMilk}
						if(lactDay>0){isCondition=true;		included|=tPrev>lactDayHour&&Math.floor((tNow-cow.lactS)/86400000)<lactDay}
						tNext=(tNow-cow.next)/1000;
						if(milkPerm>0){isCondition=true;	if(milkPerm==3600){if(tNext<0)continue;}else included|=tNext>milkPerm-3600}
						if(samePlace>0){isCondition=true;	included|=(tNow-cow.inAreaSince)>samePlace}
						if(incomplete>0){isCondition=true;	included|=(cow.mask&0x9999)!=0&&tPrev>incomplete}
						if(cells>0){isCondition=true;		included|=cow.lastOcc>cells}
						if(activity&1){isCondition=true;	included|=cow.activity!=0}
						if(expYield>0){isCondition=true;	included|=(tNow>cow.next)&&!(tPrev<86400&&Math.floor((tPrev/3600*cow.spd+cow.cy)/10+.5)/10<expYield)}
					}
				}
			}
			if(!isCondition||included)
				cows.push(cow);
		}
	return cows;
	};
}]);