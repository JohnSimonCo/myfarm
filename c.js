jr.include( '/chat.js' );
jr.include( '/1.css' );
jr.init( function() {
	jr.eventManager.addListener( 'getChatMessages', document.body, function( messages ) {
		new delavalChat.Chat( this, messages );
	} );
	jr.ajax( 'SrvChat', 'getMessages', jr.getUrlVar( 'id' ), 'getChatMessages' );
} );

