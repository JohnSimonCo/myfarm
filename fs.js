jr.include('/fm.js')
jr.init( function() {
    farms.init();
	document.body.style.width='900px';
	document.body.style.backgroundColor='#103d82';
	var inst=new farms.instance(document.body);
	inst.show();
} );
