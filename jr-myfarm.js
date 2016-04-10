jr.include('/js/jr-myfarm.js');

$(function() {
	$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">');
	var tryAgainTimer = null,
		disconnected = function() {
			tryAgainTimer = setTimerout(tryAgain, 5000);
console.log('Disconnected. Set 5 sec for tryAgain...');
		},
		tryAgain = function() {
			setupBroadcast();
		},
		setupBroadcast = function() {
console.log('setup Broadcast!');
			jr.onBroadcast(jr.getUrlVar('id'),'chat',	function(data){alert('Chat: '+JSON.stringify(data, null, "\t"));}, disconnected);
			jr.onBroadcast(jr.getUrlVar('id'),'alarm',	function(data){alert('Alarm: '+JSON.stringify(data, null, "\t"));});
			jr.onBroadcast(jr.getUrlVar('id'),'queue',	function(data){alert('Queue: '+JSON.stringify(data, null, "\t"));});
		};
	setupBroadcast();
});
//		jr.sendRequest('SrvProfile.getProfiles', jr.meId, jr.data.bind(jr, 'profiles'));
//		jr.sendRequest('SrvProfile.getAlarms', jr.meId, jr.data.bind(jr, 'alarms'));
//		jr.sendRequest('SrvProfile.getMessages', jr.meId, jr.data.bind(jr, 'messages'));
//		jr.sendRequest('SrvProfile.getCanData', jr.meId, jr.data.bind(jr, 'canData'));
//		jr.sendRequest('SrvProfile.getLastContact', jr.meId, jr.data.bind(jr, 'lastContact'));
//		jr.sendRequest('SrvProfile.getCowQueue', jr.meId, jr.data.bind(jr, 'cowQueue'));

