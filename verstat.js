jr.include('/stat.js');
jr.include('/filter.js');
jr.init( function() {
	stat.init();
	filter.init();
	jr.eventManager.addListener('myConf', jr.eventManager, function(data) {
		if(data){
			document.body.style.width='1200px';
			new stat.instance(document.body).prepare(data);
		}});
	jr.ajax( 'Stat', 'getAll', null, 'myConf' );
} );
