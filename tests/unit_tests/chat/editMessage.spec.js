'use strict';
describe('editMessage tests', function () {

  var $rootScope,
      editMessage,
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
      editMessage = $injector.get('chat.editMessage');
    });
  });

  describe('test the functionality of editMessage', function () {
    it('should check default data', function () {
      expect(editMessage).toBeDefined();
    });
    it('execute', function () {
      editMessage(1);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});