jr.include( '/Alarms.js' );
jr.include( '/1.css' );
jr.include( '/buttons.css' );
jr.init( function() {
	var winAlarms,
	onresize = function() {
		var w=window.innerWidth,h=window.innerHeight,nh,i=0;
		document.body.style.top=Math.floor(71+(nh=(h-77)/2))+'px';
		winAlarms.resize();
	};
	$( window ).resize( onresize );
	var id=jr.getUrlVar( 'id' );
	jr.eventManager.addListener( 'getAlarms', document.body, function( alarmData ) {
		winAlarms=new delavalAlarms.Alarms( this, id, alarmData );
		winAlarms.resize();
		var div;
		try {
			div = document.childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
			var button = "<button onclick=\"javascript:window.history.back()\">"+jr.translate("Back")+"</button>";
			var tr = "<tr class=\"back\"><td colspan=\"2\">"+button+"</td></tr>";
			$(tr).insertBefore(div);
			var fontSize = $('table.alarms').css('font-size');
			$('button').css('font-size',fontSize).css('width','initial');
			winAlarms.resize();
		} catch(err) {}
		typeof window.android !='undefined' && typeof window.android.renderCompleted == 'function' && window.android.renderCompleted();
	} );
    jr.ajax( 'SrvAlarms', 'getAlarms', id, 'getAlarms', null, true);
} );

