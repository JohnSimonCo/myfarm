jr.include('/farms.js')
jr.init( function() {
    farms.init();
	document.body.style.backgroundColor='#103d82';
	var inst=new farms.instance(document.body,null);
	inst.hasMenu();
	inst.show();
} );
