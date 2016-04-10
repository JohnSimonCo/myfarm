'use strict';
describe('readMessage tests', function () {

  var $rootScope,
      readMessage,
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
      readMessage = $injector.get('chat.readMessages');
    });
  });

  describe('test the functionality of readMessage', function () {
    it('should check default data', function () {
      expect(readMessage).toBeDefined();
    });
    it('execute', function () {
      readMessage(1);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});