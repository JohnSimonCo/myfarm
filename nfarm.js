jr.include('/js/qfarm.js');
jr.init( function() {
	(function(){
		jr.meId=jr.getUrlVar('id');
		if(!jr.meId)jr.meId=jr.me.myFarm;
		jr.meInitData={};
		var initVar=6,
			checkInit=function(){
				if(--initVar===0)
					new farm.instance(jr.meId,document.body);
			};
		jr.sendRequest( 'Profile.getProfiles',		jr.meId,	function(data){jr.meInitData['p']=data;checkInit();} );
		jr.sendRequest( 'SrvAlarms.getAlarms',			jr.meId,	function(data){jr.meInitData['a']=data;checkInit();} );
		jr.sendRequest( 'SrvChat.getMessages',			jr.meId,	function(data){jr.meInitData['m']=data;checkInit();} );
		jr.sendRequest( 'FarmAdmin.getCanData',		jr.meId,	function(data){jr.meInitData['c']=data;checkInit();} );
		jr.sendRequest( 'FarmAdmin.getLastContact',	jr.meId,	function(data){jr.meInitData['l']=data;checkInit();} );
		jr.sendRequest( 'Animal.getCowQueue',		jr.meId,	function(data){jr.meInitData['q']=data;checkInit();} );
		document.body.style.backgroundColor='#103d82';
		document.body.style.height = '99%';
	})();
});
