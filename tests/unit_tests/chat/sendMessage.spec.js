'use strict';
describe('sendMessage tests', function () {

  var $rootScope,
      sendMessage,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}});


  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(module('chat', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      sendMessage = $injector.get('chat.sendMessage');
    });
  });

  describe('test the functionality of sendMessage', function () {
    it('should check default data', function () {
      expect(sendMessage).toBeDefined();
    });
    it('execute', function () {
      sendMessage(1);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});