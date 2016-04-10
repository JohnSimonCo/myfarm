jr.include( '/chat.css' );
jr.include( '/util.js' );
jr.include( '/longPollManager.js' );
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
			clearSelected = function() {
				$('div.message.selected div.change').css("background-image", "url("+jr.getResource("plus.png")+")");
				ce.sendButton.innerHTML=jr.translate( 'Send' );
				$('div.message.selected').removeClass('selected');
				$('button.delete').hide();
				ce.newMessage.value="";
				selectedMessage=null;
			},
			perm = 0,
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
			setDisabled=function(isDisabled){	ce.sendButton.className=(ce.sendButton.disabled=isDisabled)?'disabled':'enabled';},
			OnKeyUp=function(){					setDisabled(ce.newMessage.value.length==0);},
			OnPaste=function(){					setDisabled(false);},
			trim=function(s){					return s.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');},
			selectedMessage=null;
			this.resize=function(){onresize()},

		Date.prototype.tmf="y-m-d H:M";
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
					if(selectedMessage != null) {
						this.disabled=true;
						jr.ajax( 'SrvChat', 'deleteMessage', {session:longPollManager.sessionId, id:selectedMessage}, 'deleteMessage', null, null, function() {myAjaxError('deleteButton')} );
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
					if(selectedMessage != null) {
						this.disabled=true;
						jr.ajax( 'SrvChat', 'changeMessage', {session:longPollManager.sessionId, text:ce.newMessage.value, id:selectedMessage}, 'changeMessage', null, null, function() {myAjaxError('sendButton')} );
					} else {
						this.disabled=true;
						jr.ajax( 'SrvChat', 'addMessage', {session:longPollManager.sessionId, text:ce.newMessage.value}, 'addMessage', null, null, function() {myAjaxError('sendButton')} );
					}
				} else
					OnKeyUp();
			} } }
		] }, ce );
		$('button.delete').hide();
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
		jr.eventManager.addListener( 'chatUpdate', null, function( update ) {
			jr.foreach( update, insertMessage );
			onresize();
		} );
	}
}
