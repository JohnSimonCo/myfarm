if(typeof longPollManager == 'undefined'){
	var longPollManager = {
		pollParam: null,
		sessionId: null,
		ajaxError: null,
		pollDataReceived: function(data) {
			if( data ) {
				jr.eventManager.raiseEvent( 'contactUpdate', data.nrSecContact );
				if( data.alarm ) jr.eventManager.raiseEvent( 'alarmUpdate', data.alarm );
				if( data.chat ) jr.eventManager.raiseEvent( 'chatUpdate', data.chat );
				if( data.animal ) jr.eventManager.raiseEvent( 'cowqUpdate', data.animal );
				if( data.robotStatus ) jr.eventManager.raiseEvent( 'robotStatus', data.robotStatus );
				longPollManager.wait(1);
			}
			else {
				if(typeof longPollManager.ajaxError == 'function') {
					errorFunc('Got no data from waitEvent');
				} else {
					alert('Lost contact to server. Please reload page...');
				}
				longPollManager.wait(30);
			}
		},
		poll: function() {
			jr.ajax( 'PollEvent', 'waitEvent', longPollManager.pollParam, 'pollDataReceived', null, true, longPollManager.ajaxError );		
		},
		wait: function(sec) {
			setTimeout(longPollManager.poll, 1000*sec);
		},
		init: function(vcId, sessionId, ajaxError) {
			longPollManager.ajaxError = ajaxError;
			longPollManager.pollParam = vcId + ',' + (longPollManager.sessionId=sessionId);
			jr.eventManager.addListener( 'pollDataReceived', null, longPollManager.pollDataReceived);
			longPollManager.wait(5);
		}
	}
}
