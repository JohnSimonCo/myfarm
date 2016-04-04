'use strict';
describe('cowq.openWaitArea tests', function () {

  var $rootScope,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}}),
      openWaitArea;

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      openWaitArea = $injector.get('cowq.openWaitArea');
    });

  });

  describe('test the functionality of cowq.openWaitArea', function () {
    it('should check default data', function () {
      expect(openWaitArea).toBeDefined();
    });
    it('execute', function () {
      var id = 1,
          cows = [
            {nr:1},
            {nr:2}
          ];

      openWaitArea(id,cows);
      expect(sendRequest).toHaveBeenCalled();
    });
  });
});