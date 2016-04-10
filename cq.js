jr.include( '/cowq_.js' );
jr.include( '/4.css' );
var connFlag=0;
jr.init( function() {
	var id = jr.getUrlVar( 'id' ),
		cowQueues=[],
		cowq = function(obj,index) {
			cowQueues.push(new CowQueue( obj, id, index ));
			jr.touch.attachTouchScroll( this );
		},
		cowImage=new Image(),
		cowImageLoaded=false,
		profileData=null,
		cowQueueData=null,
		cowQueueCheck=function(){
connFlag=(cowQueueData?1:0)|(profileData?2:0)|(cowImageLoaded?4:0)
			if(cowQueueData&&profileData&&cowImageLoaded)
				jr.foreach(cowQueues, function(q){q.initData(cowImage,cowQueueData,profileData)});
		},
		cowQueueInitData=function(data)		{cowQueueCheck(cowQueueData=data)},
		imageLoaded=function()				{cowQueueCheck(cowImageLoaded=true)},
		checkLogin=function(d)				{if(d==null)window.location='/login.vcx';return d;},
		profileDataReceived=function(data)	{
//			jr.eventManager.removeListener('profileUpdate',profileListener);
			if(profileData==null)
				cowQueueCheck(profileData=data)
		},
		winCowQ,
		onresize = function() {
			var w=window.innerWidth,h=window.innerHeight,nh,i=0;
			document.body.style.top=Math.floor(71+(nh=(h-77)/2))+'px';
			winCowQ.resize();
		};
		
	$( window ).resize( onresize );
    winCowQ = jr.ec( document.body, { children: [
		{ 'div': { style: { left: '0.5%', top: '99.75%' }, children: function(obj){cowq(obj,21)} } }
	] } );
	if(cowQueues.length){
		cowImage.onload=imageLoaded;
		cowImage.src="/Delaval/Resources/info2.png";
		jr.eventManager.addListener('cowQueueInitData', jr.eventManager, function(data) {cowQueueInitData(checkLogin(data));});
		jr.eventManager.addListener('profileUpdate', jr.eventManager, function(data) {profileDataReceived((data));});
		jr.ajax('SrvAnimal','getCowQueue',id,'cowQueueInitData' );
		jr.ajax('Profile','getProfiles',id,'profileUpdate');
	}
} );
