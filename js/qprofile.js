var pr={
	id:null,
	clear:	function(){
		pr.profiles=[];
		pr.profile=null;
		pr.fieldNames=null;
		pr.profileIndex=-1;
		if(pr.labCopy==null){
			pr.labSeparator=	jr.translate(' - ');
			pr.labCopy=			pr.labSeparator+jr.translate('aCopy');
			pr.labEdit=			jr.translate('Edit');
			pr.labCancel=		jr.translate('Cancel');
			pr.labNew=			jr.translate('New');
			pr.labSave=			jr.translate('Save');
			pr.labMakeCopy=		jr.translate('Make copy');
			pr.labShow=			jr.translate('Show');
			pr.labDelete=		jr.translate("Delete this profile"),
			pr.labDeleteSure=	jr.translate("Delete"),
			pr.labAreYouSure=	jr.translate("Are you sure?"),
			pr.labAnimals=		jr.translate('animals');
			pr.labPublish=		jr.translate('Publish');
			pr.labWaitAreaSpecial=jr.translate('Enable wait area button');
			pr.labNrAnimals=	jr.translate('Nr. animals in group');
			pr.labName=			jr.translate("Profile name");
			pr.labProfile=		jr.translate("Profile");
			pr.labNewProfile=	jr.translate("New profile");
			pr.labGroup=		jr.translate("Group");
			pr.labGroups=		jr.translate("Included animal groups (");
			pr.labGroupsEnd=	jr.translate("animals)");
			pr.labAllGroups=	jr.translate("All groups");
			pr.labSortCol=		jr.translate("Initial sort column");
			pr.labFieldContent=	jr.translate("Animal field content");
			pr.labAreas=		jr.translate("Animal location in...");
			pr.labAllAreas=		jr.translate("All locations");
			pr.labNotUsed=		jr.translate("-- Not used --");
			pr.labAtLeast=		jr.translate("at least");
			pr.labHour=			jr.translate("hour");
			pr.labHours=		jr.translate("hours");
			pr.labHasMilkPerm=	jr.translate("Since milk permission");
			pr.labSinceMilking=	jr.translate("Since milking");
			pr.labHSinceMilking=jr.translate("hours since milking");
			pr.labLactDay=		jr.translate("Days in milk");
			pr.labDay=			jr.translate("day 0-");
			pr.labSamePlace=	jr.translate("Has been in same location");
			pr.labExpYield=		jr.translate("Expected yield");
			pr.labKg=			jr.translate("kg");
			pr.labFilter=		jr.translate("More filter parameters...");
			pr.labIncomplete=	jr.translate("Incomplete milked, and");
			pr.labCells=		jr.translate("Cells");
			pr.labAction=		jr.translate("Action");
			pr.labMilking=		jr.translate("Milking animals");
			pr.labAllAnimals=	jr.translate("All animals");
			pr.labNotMilking=	jr.translate("Not milking");
			pr.labHighActivity=	jr.translate("High activity");
			pr.labInclAnimals=	jr.translate("Include those animals");
			pr.labAnd=			jr.translate("and");
			pr.labAtMilkPerm=	jr.translate("From milk permission");
			pr.labRobotArea=	jr.translate("Not in robot areas");
			pr.labWaitArea=		jr.translate("Not in wait areas");
			pr.labOtherArea=	jr.translate("Not in other areas");
			pr.labUnknownArea=	jr.translate("Not in unknown areas");
			pr.space='&nbsp;';
			pr.cellValues=		new Array(0,50,100,150,200,500,1000);
			pr.actionValues=	new Array(pr.labMilking,pr.labAllAnimals,pr.labNotMilking);
		}
	},
	setDefaultProfile: function(name) {
		var cookie=getSessCookie();
		cookie.profile=name;
		setSessCookie(cookie);
	},
	getDefaultProfile: function() {
		var cookie=getSessCookie();
		return cookie.profile;
	},
	init:	function(d,id){
		if(d){
			pr.id=id;
			pr.clear();
			if(d.myProfile!=null)
				pr.makeArray(d.myProfile,true);
			pr.makeArray(d.deLaval,false);
			pr.profiles.sort(pr.sort);
			var i=-1,profile=pr.getDefaultProfile();
			pr.profile=pr.profiles[pr.profileIndex=0];
			if(profile!=null){
				while(++i<pr.profiles.length&&pr.profiles[i].name!=profile);
				if(i<pr.profiles.length){
					pr.profile=pr.profiles[pr.profileIndex=i];
					pr.setDefaultProfile(pr.profiles[i].name);
				}
			}
			pr.fieldNames=d.fieldNames;
			return pr.profile;
		}
		return null;
	},
	getAll:	function() {return pr.profiles},
	sort:	function(o1,o2){
		return o1.isOwn==o2.isOwn?o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()):o1.isOwn?-1:1;
	},
	copyArr:	function(s){if(s==null)return[];var i=-1,rv=[];while(++i<s.length)rv[i]=s[i];return rv;},
	profileData:function(name,d,isOwn){
		this.isEqual=function(ref){
			if(this.name!=ref.name||this.publish!=ref.publish||this.groups.length!=ref.groups.length||this.indexes.length!=ref.indexes.length
				||this.sinceMilk!=ref.sinceMilk||this.milkPerm!=ref.milkPerm||this.lactDay!=ref.lactDay
				||this.expYield!=ref.expYield||this.samePlace!=ref.samePlace||this.incomplete!=ref.incomplete
				||this.action!=ref.action||this.cells!=ref.cells||this.activityAndAreaMask!=ref.activityAndAreaMask)return false;
			var i=-1;
			if(this.groups!=null){
				while(++i<this.groups.length&&this.groups[i]==ref.groups[i]);
				if(i<this.groups.length)return false;
				i=-1;
			}
			i=-1;
			if(this.areas.length!=ref.areas.length)
				return false;
			while(++i<this.areas.length&&this.areas[i]==ref.areas[i]);
			if(i<this.areas.length)
				return false;
			i=-1;
			while(++i<this.indexes.length&&this.indexes[i]==ref.indexes[i]);
			return i==this.indexes.length;
		}
		this.clone=function(){
			var rv={};
			rv.domainId=this.domainId;
			rv.isOwn=true;
			rv.name=this.name;
			rv.indexes=pr.copyArr(this.indexes);
			rv.groups=pr.copyArr(this.groups);
			rv.isEqual=this.isEqual;
			rv.clone=this.clone;
			rv.newProfile=this.newProfile;
			rv.publish=this.publish;
			rv.areas=this.areas;
			rv.sinceMilk=this.sinceMilk;
			rv.milkPerm=this.milkPerm;
			rv.lactDay=this.lactDay;
			rv.expYield=this.expYield;
			rv.samePlace=this.samePlace;
			rv.incomplete=this.incomplete;
			rv.action=this.action;
			rv.cells=this.cells;
			rv.activityAndAreaMask=this.activityAndAreaMask;
			return rv;
		}
		this.newProfile=function(){
			var rv=this.clone();
			rv.isOwn=true;
			rv.name='';
			rv.indexes=[1,2,0,0,0,0,0];
			rv.groups=[];
			rv.areas=[];
			rv.sinceMilk=
			rv.milkPerm=
			rv.lactDay=
			rv.expYield=
			rv.samePlace=
			rv.action=
			rv.incomplete=
			rv.cells=0;
			rv.activityAndAreaMask=0;
			return rv;
		}
		this.domainId=pr.id;
		this.isOwn=isOwn;
		this.name=name;
		this.indexes=d.profileIndex;
		this.groups=d.groups||[];
		this.areas=d.areas||[];
		this.sinceMilk=d.sinceMilk||0;
		this.milkPerm=d.milkPerm||0;
		this.lactDay=d.lactDay||0;
		this.incomplete=d.incomplete||0;
		this.expYield=d.expYield||0;
		this.samePlace=d.samePlace||0;
		this.action=d.action||0;
		this.cells=d.cells||0;
		this.activityAndAreaMask=d.activityAndAreaMask||0;
	},
	makeArray:function(p,isOwn){
		for(var o in p.profiles)
			pr.profiles.push(new pr.profileData(o,p.profiles[o],isOwn));
	},
	groupUpdate:function(profile,isHeading){
		var i=-1,cnt=0,p;
		if(profile.groups==null||profile.groups.length==0)
			cnt=pr.cows.length;
		else
			while(++i<profile.groups.length) {
				p=pr.animalGroups[profile.groups[i]];
				if(p)
					cnt+=p.count;
			}
		document.getElementById(isHeading?'includedAnimals':'groupCount').innerHTML=cnt;
	},
	sortGroup:function(o1,o2){return o1.count==o2.count?o1.name.toLowerCase().localeCompare(o2.name.toLowerCase()):o2.count-o1.count},
	group:	function(id,d){
		this.name=d.name;
		this.count=d.count;
		this.id=id;
		this.nr=d.nr;
	},
	sortOnName:function(o1,o2){
		return o1.name.toLowerCase().localeCompare(o2.name.toLowerCase());
	},
	area:	function(name,id){
		this.name=name;
		this.id=id;
		this.check=false;
	},
	allProfilesDlg:function(onCancel,onOk,myFarm,who,allCows,currentCows,animalGroups,cowImage,perm,areas){
		pr.masterCancel=onCancel;
		pr.masterOk=onOk;
		pr.myFarm=myFarm;
		pr.allCows=allCows;
		pr.cows=currentCows;
		pr.animalGroups=animalGroups;
		pr.cowImage=cowImage;
		pr.allGroups=[];
		pr.perm=perm;
		var btns=[],i=-1,n,ii;
		while(++i<pr.profiles.length) {
			var stl='dialogButton '+(i==pr.profileIndex?'styleRubber':pr.profiles[i].isOwn?'dialogButtonUnSelected':'systemProfile');
			btns.push({tr:{children:{td:{children:{div:{id:i,onclick:pr.onProfile,align:'center',className:stl,innerHTML:pr.profiles[i].name}}}}}});
		}
		pr.initDialog({'div':{className:'topHeading',children:[
			{div:{innerHTML:myFarm+pr.labSeparator+who}},
			{span:{id:'includedAnimals'}},
			{span:{innerHTML:'&nbsp;'+pr.labAnimals}},
			{div:{innerHTML:pr.labProfile+pr.labSeparator+pr.profile.name}},
			]}},pr.profile.isOwn?[pr.labEdit,pr.onEdit,pr.labCancel,pr.onCancel,pr.labMakeCopy,pr.onCopy,pr.labNew,pr.onNew]:[pr.labCancel,pr.onCancel,pr.labShow,pr.onShow,pr.labMakeCopy,pr.onCopy,pr.labNew,pr.onNew],
				{'table':{className:'dialogTable',children:btns}});
		for(var o in animalGroups)
			pr.allGroups.push(new pr.group(o,animalGroups[o]));
		pr.allGroups.sort(pr.sortGroup);
		pr.groupUpdate(pr.profile,true);
		pr.areas=[];
		for(o in areas)
			pr.areas.push(new pr.area(areas[o].name,areas[o].id));
		pr.areas.sort(pr.sortOnName);
		pr.areas.splice(0,0,new pr.area(pr.labAllAreas,null));
		if(pr.profile.areas!=null){
			i=-1;
			while(++i<pr.profile.areas.length){
				n=pr.profile.areas[i];
				ii=0;
				while(++ii<pr.areas.length&&pr.areas[ii].id!=n);
				if(ii<pr.areas.length)
					pr.areas[ii].check=true;
			}
		}
	},
	onCancel:	function(){
		document.body.removeChild(pr.dlg);
		pr.masterCancel();
	},
	master:	function(){
		document.body.removeChild(pr.dlg);
		pr.masterOk(pr.profile);
	},
	onSave:	function(){
		pr.editProfile.id=pr.id;
		jr.sendRequest('SrvProfile.saveProfile', pr.editProfile);
		pr.onCancel();
	},
	onDelete:	function(){
		if(confirm(pr.labDeleteSure+' "'+pr.editProfile.name+'"\n'+pr.labAreYouSure))
			jr.sendRequest('SrvProfile.deleteProfile', pr.id+','+pr.editProfile.name);
		pr.onCancel();
	},
	onEdit:	function(){
		pr.profileDlg(false);
	},
	onCopy:	function(){
		pr.profileDlg(true);
	},
	onShow:	function(){
		pr.profileDlg(false);
	},
	onNew:	function(){
		pr.profile=pr.profile.newProfile();
		pr.profileDlg(false);
	},
	onProfile:function(){
		if(this.id==pr.profileIndex)
			pr.onCancel();
		else{
			var cookie=getSessCookie();
			cookie.profile=(pr.profile=pr.profiles[pr.profileIndex=this.id]).name;
			setSessCookie(cookie);
			pr.master();
		}
	},
	onSelChange:function(){
		pr.editProfile.indexes[this.id]=parseInt(this.value);
		pr.selectOk();
	},
	checkbox:	function(id,isChecked,isBlack){
		var ctx=document.getElementById(id).getContext("2d");
		ctx.clearRect(0,0,45,45);
		if(isBlack)
			ctx.drawImage(pr.cowImage,40,597+(isChecked?45:0),45,45,0,0,45,45);
		else
			ctx.drawImage(pr.cowImage,(isChecked?42:0),400,42,45,0,0,42,45);
	},
	waitAreaSpecialCheck:function(){
		pr.checkbox('waitArea',pr.editProfile.activityAndAreaMask & 0x40,true);
	},
	onWaitAreaSpecialCheck:function(){
		pr.editProfile.activityAndAreaMask=pr.editProfile.activityAndAreaMask^0x40;
		pr.waitAreaSpecialCheck();
		pr.selectOk();
	},
	publishCheck:function(){
		pr.checkbox('publish',pr.editProfile.publish,true);
	},
	onPublishCheck:function(){
		pr.editProfile.publish=!pr.editProfile.publish;
		pr.publishCheck();
		pr.selectOk();
	},
	setOptions:function(id,sel,flds){
		var aa=[],i=-1;
		while(++i<flds.length)
			aa.push({option:{text:pr.fieldNames[flds[i]],value:flds[i],selected:sel==flds[i]?'selected':null}});
		return {select:{onchange:pr.onSelChange,className:'selectOption',id:id,children:aa}}
	},
	selectOk:function(){
		var i=-1,isChanged=true,s=pr.editProfile.name=pr.configName.value.trim();
		if(s!=pr.editProfileOrginal.name){
			while(++i<pr.profiles.length)
				if(pr.profiles[i].name==s){
					isChanged=false;
					break;
				}
		}
		else
			isChanged=pr.editProfile.publish||!pr.editProfile.isEqual(pr.editProfileOrginal);
		if(pr.okButton)
			pr.okButton.disabled=!isChanged;
	},
	groupCheck:	function(index){
		if(index==null){
			index='';
			var check=pr.editProfile.groups.length==0;
		}
		else{
			var i=-1,id=pr.allGroups[index].id;
			while(++i<pr.editProfile.groups.length&&pr.editProfile.groups[i]!=id);
			check=i<pr.editProfile.groups.length;
		}
		pr.checkbox('group'+index,check);
	},
	groupChange:function(){
		if(this.gindex==null){
			if(pr.editProfile.groups.length==null)
				return;
			pr.editProfile.groups=[];
			var i=-1;
			while(++i<pr.allGroups.length)pr.groupCheck(i);
		}
		else{
			var g=pr.allGroups[this.gindex],id=g.id;i=-1;
			while(++i<pr.editProfile.groups.length&&pr.editProfile.groups[i]!=id);
			if(i==pr.editProfile.groups.length){
				pr.editProfile.groups.push(id);
				pr.editProfile.groups.sort();
			}
			else
				pr.editProfile.groups.splice(i,1);
			pr.groupCheck(this.gindex);
		}
		pr.groupCheck();	// All groups
		pr.groupUpdate(pr.editProfile,false);
		pr.selectOk();
	},
	groupCreate:function(arr,index,g){
		arr.push({tr:{gindex:index,onclick:pr.groupChange,className:'groupHeading',children:[
			{td:{children:[{'canvas':{id:'group'+(index==null?'':index),width:43,height:43}},
				{span:{innerHTML:'&nbsp;'+(g==null?pr.labAllGroups:g.name+' ('+g.nr+')')}}]}},
			{td:{children:[{span:{innerHTML:g==null?pr.allCows.length:g.count}}]}}]}});
	},
	areaCheck:	function(index){
		pr.checkbox('area'+index,pr.areas[index].check);
	},
	areaChange:	function(){
		var index=this.gindex,a=pr.areas[index],cnt=0,i=0;
		a.check=!a.check;
		if(index==0)while(++i<pr.areas.length)pr.areas[i].check=false;i=0;
		pr.editProfile.areas=[];
		while(++i<pr.areas.length)
			if(pr.areas[i].check){
				cnt++;
				pr.editProfile.areas.push(pr.areas[i].id);
			}
		pr.areas[0].check=cnt==0;
		i=-1;while(++i<pr.areas.length)pr.areaCheck(i);
		pr.selectOk();
	},
	onMilkPermChange:function(){
		pr.editProfile.milkPerm=this.value;
		pr.selectOk();
	},
	onSinceMilkingChange:function(){
		pr.editProfile.sinceMilk=this.value;
		pr.selectOk();
	},
	lactDayUpdate:function(value){
		pr.editProfile.lactDay=value==0?0:pr.editProfile.lactDay&0xff00|value;
		if(value!=0&&(pr.editProfile.lactDay&0xff00)==0)
			pr.editProfile.lactDay|=0x800;
		document.getElementById('lactDay').value=pr.editProfile.lactDay>>8;
	},
	onLactDayChange:function(){
		pr.lactDayUpdate(this.value);
		pr.selectOk();
	},
	onLactHourChange:function(){
		if((pr.editProfile.lactDay&0xff)==0)
			pr.lactDayUpdate(0);
		else
			pr.editProfile.lactDay=(pr.editProfile.lactDay&0xff)|(this.value<<8);
		pr.selectOk();
	},
	onExpYieldChange:function(){
		pr.editProfile.expYield=this.value;
		pr.selectOk();
	},
	onSamePlaceChange:function(){
		pr.editProfile.samePlace=this.value;
		pr.selectOk();
	},
	onCellsChange:function(){
		pr.editProfile.cells=this.value;
		pr.selectOk();
	},
	onActionChange:function(){
		pr.editProfile.action=this.value;
		pr.selectOk();
	},
	onIncompleteChange:function(){
		pr.editProfile.incomplete=this.value;
		pr.selectOk();
	},
	onHighActivity:function(){
		pr.editProfile.activityAndAreaMask=(pr.editProfile.activityAndAreaMask&0xfffe)|((pr.editProfile.activityAndAreaMask&1)==0?1:0);
		pr.checkbox('activity',pr.editProfile.activityAndAreaMask&1);
		pr.selectOk();
	},
	onRobotArea:function(){
		pr.editProfile.activityAndAreaMask=(pr.editProfile.activityAndAreaMask&0xfffd)|((pr.editProfile.activityAndAreaMask&2)==0?2:0);
		pr.checkbox('robot',pr.editProfile.activityAndAreaMask&2);
		pr.selectOk();
	},
	onWaitArea:function(){
		pr.editProfile.activityAndAreaMask=(pr.editProfile.activityAndAreaMask&0xfffb)|((pr.editProfile.activityAndAreaMask&4)==0?4:0);
		pr.checkbox('wait',pr.editProfile.activityAndAreaMask&4);
		pr.selectOk();
	},
	onOtherArea:function(){
		pr.editProfile.activityAndAreaMask=(pr.editProfile.activityAndAreaMask&0xfff7)|((pr.editProfile.activityAndAreaMask&8)==0?8:0);
		pr.checkbox('other',pr.editProfile.activityAndAreaMask&8);
		pr.selectOk();
	},
	onUnknownArea:function(){
		pr.editProfile.activityAndAreaMask=(pr.editProfile.activityAndAreaMask&0xffef)|((pr.editProfile.activityAndAreaMask&0x10)==0?0x10:0);
		pr.checkbox('unknown',pr.editProfile.activityAndAreaMask&0x10);
		pr.selectOk();
	},
	addOption:	function(cc,head,fkn,stepfkn,iMax,selVal,changeFkn){
		var i=-1,ff=[];
//		gg.push({span:{innerHTML:head+pr.space}});
		while(++i<=iMax){
			var ii=stepfkn(i);
			ff.push({option:{text:fkn(ii),value:ii,selected:ii==selVal?'selected':null}});
		}
		cc.push({tr:{children:[{td:{align:'right',children:{div:{className:'groupHeading',innerHTML:head+pr.space}}}},
							   {td:{width:'70%',children:{div:{className:'groupHeading',children:{select:{onchange:changeFkn,className:'selectOption',children:ff}}}}}}]}});
	},
	makeCheckbox:	function(gg,name,evFkn,lab){
		gg.push({tr:{onclick:evFkn,children:[{td:{align:'right',children:{div:{className:'groupHeading',innerHTML:lab+pr.space}}}},
							   {td:{children:[{'canvas':{id:name,width:43,height:43}}]}}]}});
	},
	profileDlg:	function(isCopy){
		pr.editProfile=pr.profile.clone();
		pr.editProfile.oldName=pr.editProfile.name;
		pr.editProfile.publish=false;
		pr.editProfileOrginal=pr.editProfile.clone();
		if(isCopy||(!pr.profile.isOwn&&isCopy))pr.editProfile.name+=pr.labCopy;
		document.body.removeChild(pr.dlg);
		var cc=[],ff=[],gg=[],hh=[],nrGroups,displayGroups,i=-1,ii,a,selected;
		cc.push({div:{className:'dialogLabel',innerHTML:pr.labName}});
		cc.push({input:{id:'configName',onkeyup:pr.selectOk,className:'dialogText',type:'text',value:pr.editProfile.name}});
		hh.push({td:{width:'50%',children:[
				{div:{className:'dialogLabel',innerHTML:pr.labSortCol}},
				{div:{className:'container',children:[pr.setOptions(0,pr.editProfile.indexes[0],[1,15,2,4,14,8,9,11,12,13,7,6,5,10,3,16,17,18,20,21,22,23])]}}]}});
		if((pr.perm&0x20000080)!=0)
			hh.push({td:{onclick:pr.onPublishCheck,style:{cursor:'pointer'},children:[
					{div:{className:'dialogLabel',innerHTML:pr.labPublish}},
					{div:{className:'container',children:{'canvas':{id:'publish',width:43,height:43}}}}]}});
		if((pr.editProfile.activityAndAreaMask & 0x20)!=0)
			hh.push({td:{onclick:pr.onWaitAreaSpecialCheck,style:{cursor:'pointer'},children:[
					{div:{className:'dialogLabel',innerHTML:pr.labWaitAreaSpecial}},
					{div:{className:'container',children:{'canvas':{id:'waitArea',width:43,height:43}}}}]}});
		cc.push({table:{width:'95%',children:{tr:{children:hh}}}});
		cc.push({div:{className:'dialogHeightSpace',innerHTML:' '}});
		cc.push({div:{className:'dialogLabel',innerHTML:pr.labFieldContent}});
		var perm1=[19,2,4];
		var permFlds=[0,8,9,11,12,13,7,6,5,10,14,3,16,17,18,20,21,22,23];
		i=-1;
		while(++i<3)
			ff.push({tr:{children:[{td:{children:{div:{className:'container',children:[pr.setOptions(i+1,pr.editProfile.indexes[i+1],(i==0?perm1:permFlds))]}}}},{td:{children:{div:{className:'container',children:[pr.setOptions(i+4,pr.editProfile.indexes[i+4],permFlds)]}}}}]}});
		cc.push({div:{className:'dialogArea styleRubber',children:{'table':{className:'dialogTable',children:ff}}}});
		nrGroups=0;for(var o in pr.animalGroups)if(pr.animalGroups[o].count>0)nrGroups++;
		displayGroups=nrGroups>1||pr.editProfile.groups.length>0;
		if(displayGroups){
			gg.push({tr:{children:[{td:{colspan:'2',children:{div:{className:'groupHeading',innerHTML:pr.labGroup}}}},{td:{children:{div:{className:'groupHeading',innerHTML:pr.labNrAnimals}}}}]}});
			i=-1;
			pr.groupCreate(gg,null,null);
			while(++i<pr.allGroups.length)
				pr.groupCreate(gg,i,pr.allGroups[i]);
			cc.push({div:{className:'dialogLabel',children:[
				{span:{innerHTML:pr.labGroups}},
				{span:{id:'groupCount'}},
				{span:{innerHTML:pr.space+pr.labGroupsEnd}}]}});
			cc.push({div:{className:'dialogArea styleRubber',children:{'table':{className:'dialogTable',children:gg}}}});
		}
		cc.push({div:{className:'dialogLabel',innerHTML:pr.labAreas}});
		i=-1;
		gg=[];
		while(++i<pr.areas.length){
			a=pr.areas[i];
			gg.push({tr:{gindex:i,onclick:pr.areaChange,className:'groupHeading',children:[
				{td:{children:{'canvas':{id:'area'+i,width:43,height:43}}}},
				{td:{width:'98%',children:{div:{innerHTML:a.name}}}}]}});
		}
		cc.push({div:{className:'dialogArea styleRubber',children:{'table':{className:'dialogTable',children:gg}}}});

		cc.push({div:{className:'dialogLabel',innerHTML:pr.labAction}});
		gg=[];
		pr.addOption(gg,pr.labInclAnimals,function(i){return pr.actionValues[i]},function(i){return i},pr.actionValues.length-1,pr.editProfile.action,pr.onActionChange,'action');
		cc.push({div:{className:'dialogArea styleRubber',children:{'table':{className:'dialogTable',children:gg}}}});

		cc.push({div:{className:'dialogLabel',innerHTML:pr.labFilter}});
		gg=[];
		var hourFkn=function(i){return(i==0?pr.labNotUsed:pr.labAtLeast+' '+i+' '+(i>1?pr.labHours:pr.labHour))};
		var hourMilkPermFkn=function(i){return(i==1?pr.labAtMilkPerm:i==0?pr.labNotUsed:pr.labAtLeast+' '+(i-1)+' '+(i>2?pr.labHours:pr.labHour))};
		pr.addOption(gg,pr.labHasMilkPerm,hourMilkPermFkn,function(i){return i},9,pr.editProfile.milkPerm,pr.onMilkPermChange);
		pr.addOption(gg,pr.labSinceMilking,hourFkn,function(i){return i==0?0:i+2;},12,pr.editProfile.sinceMilk,pr.onSinceMilkingChange);
		pr.addOption(gg,pr.labSamePlace,hourFkn,function(i){return i==0?0:i+1;},10,pr.editProfile.samePlace,pr.onSamePlaceChange);
		i=-1;ff=[];hh=[];
		while(++i<=7){
			ii=i==0?0:15+i*5;
			selected=pr.editProfile.lactDay&0xff;
			ff.push({option:{text:i==0?pr.labNotUsed:pr.labDay+ii,value:ii,selected:ii==selected?'selected':null}});
		}
		i=-1;
		while(++i<=7){
			ii=i==0?0:i+4;
			selected=pr.editProfile.lactDay>>7;
			hh.push({option:{text:(i==0?pr.labNotUsed:pr.labAtLeast+' '+ii),value:ii,selected:ii==selected?'selected':null}});
		}
		gg.push({tr:{children:[{td:{align:'right',children:{div:{className:'groupHeading',innerHTML:pr.labLactDay+pr.space}}}},
							   {td:{width:'70%',children:{div:{className:'groupHeading',children:[
									{div:{children:{select:{onchange:pr.onLactDayChange,className:'selectOption',children:ff}}}},
									{div:{children:[{span:{innerHTML:pr.labAnd+pr.space}},{select:{id:'lactDay',onchange:pr.onLactHourChange,className:'selectOption',children:hh}}]}},
									{div:{innerHTML:pr.labHSinceMilking}}
								]}}}}]}});
		pr.addOption(gg,pr.labExpYield,function(i){return (i==0?pr.labNotUsed:pr.labAtLeast+' '+i+' '+pr.labKg)},function(i){return i==0?0:i+14;},16,pr.editProfile.expYield,pr.onExpYieldChange);
		pr.addOption(gg,pr.labCells,function(i){return (i==0?pr.labNotUsed:pr.labAtLeast+' '+i)},function(i){return pr.cellValues[i]},pr.cellValues.length-1,pr.editProfile.cells,pr.onCellsChange);
		pr.addOption(gg,pr.labIncomplete,function(i){return (i==0?pr.labNotUsed:pr.labAtLeast+' '+i+' '+pr.labHSinceMilking)},function(i){return i==0?0:i+1;},5,pr.editProfile.incomplete,pr.onIncompleteChange);
		pr.makeCheckbox(gg,'activity',pr.onHighActivity,pr.labHighActivity);
		pr.makeCheckbox(gg,'robot',pr.onRobotArea,pr.labRobotArea);
		pr.makeCheckbox(gg,'wait',pr.onWaitArea,pr.labWaitArea);
		pr.makeCheckbox(gg,'other',pr.onOtherArea,pr.labOtherArea);
		pr.makeCheckbox(gg,'unknown',pr.onUnknownArea,pr.labUnknownArea);
		cc.push({div:{className:'dialogArea styleRubber',children:{'table':{className:'dialogTable',children:gg}}}});

		var heading={'div':{className:'topHeading',innerHTML:pr.myFarm+pr.labSeparator+(pr.editProfile.name.length==0?pr.labNewProfile:pr.labProfile)}};
		pr.initDialog(heading,pr.profile.isOwn||isCopy?[pr.labSave,pr.onSave,pr.labCancel,pr.onCancel,pr.labDelete,pr.onDelete]:[pr.labCancel,pr.onCancel],{'div':{children:cc}});
		if(displayGroups){
			pr.groupCheck(null);
			i=-1;
			while(++i<pr.allGroups.length)pr.groupCheck(i);
			pr.groupUpdate(pr.editProfile,false);
		}
		pr.areas[0].check=pr.editProfile.areas.length==0;i=-1;while(++i<pr.areas.length)pr.areaCheck(i);
		(pr.configName=document.getElementById('configName')).focus();
		pr.okButton=pr.profile.isOwn||isCopy?document.getElementById('0'):null;
		if(pr.editProfile.indexes[1]==0)pr.editProfile.indexes[1]=19;
		document.getElementById('2').disabled=false;
		if((pr.perm&0x20000080)!=0)
			pr.publishCheck();
		if((pr.editProfile.activityAndAreaMask & 0x20)!=0)
			pr.waitAreaSpecialCheck();
		pr.lactDayUpdate(pr.editProfile.lactDay&0xff);
		pr.checkbox('activity',pr.editProfile.activityAndAreaMask&1);
		pr.checkbox('robot',pr.editProfile.activityAndAreaMask&2);
		pr.checkbox('wait',pr.editProfile.activityAndAreaMask&4);
		pr.checkbox('other',pr.editProfile.activityAndAreaMask&8);
		pr.checkbox('unknown',pr.editProfile.activityAndAreaMask&0x10);
		pr.selectOk();
	},
	initDialog:	function(heading,buttons,content){
		var btns=[],background,i=-1;
		btns.push(heading);
		while(++i<buttons.length){
			btns.push({span:{children:[
				{'input':{assignments:{id:i>>1,onclick:buttons[i+1],type:'button',className:'button',value:buttons[i++]}}},{'div':{className:'betweenSpace',innerHTML:' '}}]}});
		}
		pr.dlg=jr.ec('div',{parentNode:document.body,children:[
			{div:{children:{'div':{parentNode:document.body,className:'styleBackground',children:function(ip){background=jr.ec('div',{parentNode:ip,className:'background'})}}}}}
		]});
		jr.ec('div',{parentNode:background,className:'top',children:btns});
		jr.ec('div',{className:'styleDialog',parentNode:background,children:{div:{className:'dialogTable',children:content}}});
	}
}