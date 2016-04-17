'use strict';
function initCommon(){
  beforeEach(module('app'));
  beforeEach(module('server', function ($provide) {
    $provide.value('onBroadcastError', mockBroadcasts());
    $provide.value('onPollUpdate', mockBroadcasts());
  }));
  beforeEach(function(){
    jr.translations = {};
  });
}

function mockBroadcasts(){
  return true;
}