'use strict';
describe('cowq.closeWaitArea tests', function () {

  var $rootScope,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}}),
      closeWaitArea;

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      closeWaitArea = $injector.get('cowq.closeWaitArea');
    });

  });

  describe('test the functionality of cowq.closeWaitArea', function () {
    it('should check default data', function () {
      expect(closeWaitArea).toBeDefined();
    });
    it('execute', function () {
      var id = 1;
      closeWaitArea(id);
      expect(sendRequest).toHaveBeenCalledWith('SrvAnimal.closeOpenWaitingArea',id);
    });
  });
});