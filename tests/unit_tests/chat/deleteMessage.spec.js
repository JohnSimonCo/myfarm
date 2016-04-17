'use strict';
describe('deleteMesssage tests', function () {

  var $rootScope,
      deleteMesssage,
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
      deleteMesssage = $injector.get('chat.deleteMessage');
    });
  });

  describe('test the functionality of deleteMesssage', function () {
    it('should check default data', function () {
      expect(deleteMesssage).toBeDefined();
    });
    it('execute', function () {
      deleteMesssage(1);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});