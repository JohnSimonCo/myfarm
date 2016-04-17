'use strict';
describe('myfarmData tests', function () {

  var $rootScope,
      myfarmData,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}});

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      myfarmData = $injector.get('myfarm.data');
    });
  });

  describe('test the functionality of myfarmData', function () {
    it('should check default data', function () {
      expect(myfarmData).toBeDefined();
    });
    it('execute', function () {
      myfarmData(1);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});