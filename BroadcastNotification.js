jr.include( '/mouseBox.js' );
jr.include( '/tree.js' );
jr.include('/cli.css');
jr.include('/buttons.css');
var broadcastNotification = {
	init: function() {
	},
	imgIconPos:	[[1,0],[3,2],[3,2],[3,2],	[4,0],[4,0],[7,0],[7,0],	[2,0],[3,2],[3,2],[3,2],	[5,0],[5,0],[8,0],[8,0],
				 [3,0],[3,2],[3,2],[3,2],	[6,0],[3,2],[9,0],[3,2],	[3,0],[3,2],[3,2],[3,2],	[6,0],[6,0],[9,0],[9,0]],
	instance:	function(){
		var 
		ce={},
		data = null,
		loadCount=2,
		treeInstance,
		selectedDomain=null,
		domainData,
		imgIconWidth=19,
		imgIconHeight=20,
		imgIcons=new Image(),
		root=jr.ec('div',{parentNode:document.body,width:'100%',children:[
			{div:{contextIdentity: 'left',style:{display:'inline-block','vertical-align':'top'}}},
			{div:{contextIdentity: 'right',style:{display:'inline-block','vertical-align':'top'}}}
		]},ce),
		send=function() {
			ce['save'].innerHTML = jr.translate("Sending...");
			ce['save'].disabled = true;
			var message = {};
			message.title = ce['title'].value;
			message.text = ce['text'].value;
			message.type = ce['type'].value;
			message.domain = selectedDomain;
			jr.ajax('BroadcastNotification', 'send', message, 'returnSend' );
		},
		returnSend=function(data) {
			if(!data) {
				alert(jr.translate("Could not send message!"));
			} else if(!data.numDevices) {
				alert(jr.translate("No users to send message to!"));
			} else {
				alert(jr.translate("Message sent to $numDevices devices!", {numDevices: data.numSent}));
			}
			ce['save'].innerHTML = jr.translate("Send");
			isChanged();
		},
		isChanged=function isChanged() {
			var allChanged = false;
			if(ce['title'].value.length > 0 && ce['text'].value.length > 0) {
				allChanged = true;
			}
			if(selectedDomain == null) {
				allChanged = false;
			}
			ce['save'].disabled = !allChanged;
		},
		onTreeClick=function(id,name){
			var type=treeInstance.getType(id);
			var status=treeInstance.getStatus(id);
			if(status==1) {
				if(type>=0){
					var parents = getParents(domainData,id);
					var parentsString = '';
					var domain;
					if(parents) {
						while((domain = parents.shift())) {
							parentsString+= domain.name + '->';
						}
					}
					if(type==1) {
						ce.selectedDomain.innerHTML = parentsString + name;
						selectedDomain = id;
					} else if(type==2) {
						ce.selectedDomain.innerHTML = parentsString + name;
						selectedDomain = id;
					} else
						ce.selectedDomain.innerHTML = parentsString + name;
						selectedDomain = id;
					isChanged();
					jr.ajax('BroadcastNotification', 'countUsers', id, 'returnCountUsers', id );
				}
			}
		},
		returnCountUsers=function(data, id){
			if(data != undefined) {
				ce.selectedDomain.innerHTML+= jr.translate(' ($numUsers users)',{numUsers: data});
			}
		},
//		onTreeRightClick=function(){},
		onTreeRightClick,
		onTreeDrag=function(){},
//		onChangeTree=function(){},
		onChangeTree,
		onMoreData=function(id){
			jr.ajax( 'Domains', 'getDomains', {topNode:id, nrLevels:1}, 'moreDomains', null, false );
		},
//		getNode=function(node,id){
//			if(node.id===id)
//				return node;
//			else if(node.children){
//				var i=-1,res;
//				while(++i<node.children.length)
//					if((res=getNode(node.children[i],id)))
//						return res;
//			}
//			return null;
//		},
		getParents=function(node,id,parents){
			if(node.id===id)
				return parents;
			else if(node.children){
				var i=-1,res;
				var newParents = [];
				if(parents) {
					newParents = parents;
				}
				newParents.push(node);
				while(++i<node.children.length) {
					if((res=getParents(node.children[i],id,newParents)))
						return res;
				}
				var i;
				if((i=newParents.indexOf(node))) {
					// This should not be needed I think, but it does in reality (javascript bug regaring closures perhaps?)
					newParents.splice(i,1);
				}
			}
			return null;
		},
		show=function() {
			if(--loadCount<=0){
				var a=[], rows=[];
				rows.push({'tr': {style:{height:'20px'},children:[
					{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:jr.translate('Title')}}}},
					{td:{style:{padding:'5px'}, align:'left',children:{'input':{contextIdentity:'title', type: 'input', size: '40', value: 'Planerat driftstopp'}}}},
				]}});
				rows.push({'tr': {style:{height:'20px'},children:[
					{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:jr.translate('Text')}}}},
					{td:{style:{padding:'5px'}, align:'left',children:{'textarea':{contextIdentity:'text', cols: '30', rows: '6', value: 'Den 11:e och 12:e juli kommer MyFarm-servern att vara nere för underhåll. Detta betyder att du inte kommer att få några larm från MyFarm eller kommer kunna titta på din gård i MyFarm under denna period.'}}}},
				]}});
				rows.push({'tr': {style:{height:'20px'},children:[
					{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:jr.translate('Users')}}}},
					{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{contextIdentity:'selectedDomain', style:{'white-space': 'nowrap'},innerHTML:jr.translate('None')}}}},
				]}});
				rows.push({'tr': {style:{height:'20px'},children:[
					{td:{style:{padding:'5px'}, width: '200px', align:'left',children:{'span':{innerHTML:jr.translate('Type')}}}},
					{td:{style:{padding:'5px'}, align:'left',children:{'select':{contextIdentity:'type', children:[{option: {text: jr.translate('Alert'),value: 0}},{option: {text: jr.translate('Info'),value: 1}}]}}}},
				]}});
				rows.push({'tr': {style:{height:'20px'},children:[
					{td:{style:{padding:'5px'}, colSpan: 2, align:'center', children:{'button':{style:{'font-size':'18px','padding-left':'10px','padding-right':'10px'},disabled:'true',contextIdentity:'save',onclick:send,innerHTML:jr.translate('Send')}}}},
				]}});
				a.push({'div':{children:[
					{'table':{style:{'border-spacing':'0px'},children: rows}}
				]}});
				jr.ec('div', {parentNode:ce.right, children:a, actions: {clearParent: true}},ce);
				$(root).css('background-color', domainData.backgroundColor);
	//			$('input[type=checkbox]').click(isChanged);
				$('input[type=input]').keyup(isChanged);
				$('textarea').keyup(isChanged);
				$('tr:first-of-type td:first-of-type').css('border-top-left-radius', '6px');
				$('tr:first-of-type td:last-of-type').css('border-top-right-radius', '6px');
				$('tr:last-of-type td:last-of-type').css('border-bottom-right-radius', '6px');
				$('tr:last-of-type td:first-of-type').css('border-bottom-left-radius', '6px');

				treeInstance=new jsTree(ce.left,domainData,imgIcons,broadcastNotification.imgIconPos,imgIconWidth,imgIconHeight,
										onMoreData,jr.translate('...fetching...'),onTreeClick,onTreeDrag,onTreeRightClick,onChangeTree);
				isChanged();
			}
		};
		imgIcons.onload=show;
		imgIcons.src="/Delaval/Resources/tree.png";
		jr.eventManager.addListener('moreDomains', jr.eventManager, function(data) {
			treeInstance.onMoreData(data.domain);
		});
		jr.eventManager.addListener('returnSend', jr.eventManager, function(data) {returnSend(data)});
		jr.eventManager.addListener('returnCountUsers', jr.eventManager, function(data,id) {returnCountUsers(data,id)});
		jr.eventManager.addListener('getDomains', jr.eventManager, function(data) {
			if(data){
				domainData = data.domain;
				show();
			}
		});
		jr.ajax( 'Domains', 'getDomains', null, 'getDomains', null, false );
	}
}
jr.init( function() {
    broadcastNotification.init();
	new broadcastNotification.instance();
} );
