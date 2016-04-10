jr.include( '/version.js' );
jr.init( function() {
    version.init();
	jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
		if(data)
			new version.instance(document.body,data).show();
	});
	jr.ajax( 'Versions', 'getVersions', jr.getUrlVar('id'), 'myConf' );
});
