jr.include( '/chat.css' );
jr.include( '/4.css' );
jr.include( '/js/qutil.js' );
jr.include( '/Resources/plus.png' );
jr.include( '/Resources/cross.png' );
var delavalChat = {
	Chat: function( container, messages, ajaxError ) {
		var onresize = function() {
				var width = $( 'div.chat' ).width();
				var height = $( 'div.chat' ).height();
				$( 'div.chat' ).css( 'font-size', height / 20 );
				$( 'div.chat div.message div.name' ).css( 'font-size', width / 40 );
				$( 'div.chat div.message div.time' ).css( 'font-size', width / 40 );
				$( 'div.chat div.message div.newMessage' ).css( 'font-size', width / 40 );
				$( 'div.chat div.message div.text' ).css( 'font-size', width / 25 );
				$( 'div.chat button' ).css( 'font-size', height / 20 );
				$( 'div.chat button.change' ).css( 'font-size', height / 40 );
				$( 'div.chat div.change' ).css( 'width', width / 25 );
				$( 'div.chat div.change' ).css( 'height', width / 25 );
				$( 'div.chat textarea' ).css( 'font-size', width / 20 );
			},
			ce = {},
			selectedMessage,
			newMessage,
			clearSelected = function() {
				$('div.message.selected div.change').css("background-image", "url("+jr.getResource("plus.png")+")");
				ce.sendButton.innerHTML=jr.translate( 'Send' );
				$('div.message.selected').removeClass('selected');
				$('button.delete').hide();
				ce.newMessage.value="";
				selectedMessage=null;
			},
			myAjaxError = function(button) {
				ce[button].disabled=false;
				ajaxError();
			},
			insertMessage = function( message ) {
				if(messages.permissionMask&0x10 || message.fromId == messages.userId) {
					newMessage = 
						jr.ec( 'div', { className: 'message', id: 'message_' + message.id, children: [
							{ 'div': { className: message.isNew ? 'newMessage' : 'time', innerHTML:new Date(message.time).print() } },
							{ 'div': { className: 'name', innerHTML: message.fromName } },
							{ 'div': { className: 'change', style: {"background-image": "url("+jr.getResource("plus.png")+")", "background-size": "100%, 100%"}, onclick: function() {
									if($(this).parent().hasClass('selected')) {
										clearSelected();
									} else {
										clearSelected();
										ce.sendButton.innerHTML=jr.translate( 'Change' );
										$(this).css("background-image", "url("+jr.getResource("cross.png")+")");
										$('button.delete').show();
										$(this).parent().addClass('selected');
										ce.newMessage.value=message.text;
										selectedMessage=message.id;
									}
									OnKeyUp();
							} } },
							{ 'div': { className: 'text', innerHTML: message.text } }
						] }, ce);
				} else {
					newMessage = 
						jr.ec( 'div', { className: 'message', id: 'message_' + message.id, children: [
							{ 'div': { className: message.isNew ? 'newMessage' : 'time', innerHTML:new Date(message.time).print() } },
							{ 'div': { className: 'name', innerHTML: message.fromName } },
							{ 'div': { className: 'text', innerHTML: message.text } }
						] }, ce);
				}
				if(message.isChanged) {
					$('#message_'+message.id).replaceWith(newMessage);
				} else if(message.isDeleted) {
					$('#message_'+message.id).remove();
				} else {
					$( ce.messages ).prepend( $( newMessage ) ); 
				}
			},
			show=function(){
				jr.ec( 'div', { parentNode: container, className: 'chat', children: [
					{ 'div': { className: 'title', innerHTML: messages.userName } },
					{ 'div': { className: 'messagesContainer', children: [
						{ 'div': { className: 'messages', contextIdentity: 'messages', children: function( div ) {
							jr.foreach( messages.list, insertMessage );
						} } }
					] } },
					{ 'textarea': { className: 'newMessageContainer', onkeyup:OnKeyUp, onpaste:OnPaste, contextIdentity: 'newMessage',
						actions: { addListener: [{ typeName: 'addMessage', method: function(d) {
							if(d) {
								this.value = '';
							}
							OnKeyUp();
						} }, { typeName: 'changeMessage', method: function(d) {
							if(d) {
								clearSelected();
								this.value = '';
							}
							OnKeyUp();
						} }] }
					} },
					{ 'button': { className:'delete', contextIdentity: 'deleteButton', innerHTML: jr.translate( 'Delete' ), onclick: function() {
							if(selectedMessage) {
								this.disabled=true;
								jr.sendRequest('Chat.deleteMessage', {vcId:jr.meId, id:selectedMessage}, function(success){
									jr.eventManager.raiseEvent('deleteMessage',success);
								});
							} else {
								OnKeyUp();
							}
						}, actions: { addListener: { typeName: 'deleteMessage', method: function(d) {
							if(d) {
								clearSelected();
								this.disabled=false;
							}
						} } }
					} },
					{ 'button': { disabled:true, className:'disabled', contextIdentity: 'sendButton', innerHTML: jr.translate( 'Send' ), onclick: function() {
						ce.newMessage.value=$('<div>'+trim(ce.newMessage.value)+'</div>').text();
						if(ce.newMessage.value.length) {
							if(selectedMessage) {
								this.disabled=true;
								jr.sendRequest('Chat.changeMessage', {vcId:jr.meId, text:ce.newMessage.value, id:selectedMessage}, function(success){if(success)clearSelected();});
							} else {
								this.disabled=true;
								jr.sendRequest( 'Chat.addMessage', {vcId:jr.meId, text:ce.newMessage.value}, function(data){
									jr.eventManager.raiseEvent('addMessage',data);
								});
							}
						} else
							OnKeyUp();
					} } }
				] }, ce );
				$('button.delete').hide();
			},
			setDisabled=function(isDisabled){	ce.sendButton.className=(ce.sendButton.disabled=isDisabled)?'disabled':'enabled';},
			OnKeyUp=function(){					setDisabled(!ce.newMessage.value.length);},
			OnPaste=function(){					setDisabled(false);},
			trim=function(s){					return s.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');},
			selectedMessage=null;

		this.show=function(){show();};
		this.resize=function(){onresize();};
		Date.prototype.tmf="y-m-d H:M";
//		for (var i=0; i<document.styleSheets.length;i++) {//Loop through all styles
//			if(document.styleSheets[i].href.indexOf("chat.js") !== -1) {
//				var cssRuleCode = document.all ? 'rules' : 'cssRules'; //account for IE and FF
//				for (var j=0; j<document.styleSheets[i][cssRuleCode].length;j++) {
//					var rule = document.styleSheets[i][cssRuleCode][j];
//					alert(rule);
//					if(rule.value.indexOf('background:url("/Delaval/Resources/info6.png")') !== -1) {
////							background:url("/Delaval/Resources/info6.png") 42px -1017px;
//						rule.value = rule.value.replace('background:url("/Delaval/Resources/info6.png")', 'background:url("' + jr.getResource('info6.png') + ')"');
//					}
//				}
//			}
//		}
		jr.touch.attachTouchScroll( ce.messages );
		jr.onBroadcast(jr.meId, 'chat', function(update){
			insertMessage(update);
			onresize();
		});
//		var tryAgainTimer = null,
//			disconnected = function() {
//				tryAgainTimer = setTimeout(tryAgain, 5000);
//console.log('Disconnected. Set 5 sec for tryAgain...');
//			},
//			tryAgain = function() {
//				setupBroadcast();
//			},
//			setupBroadcast = function() {
//console.log('setup Broadcast for chat!');
//				jr.onBroadcast(jr.meId, 'chat', function(update){ insertMessage(update); onresize();}, disconnected);
//		};
//		setupBroadcast();
	}
};
