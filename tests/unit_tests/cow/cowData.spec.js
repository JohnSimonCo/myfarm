'use strict';
describe('cowData tests', function () {

  var $rootScope,
      cowData,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}});

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      cowData = $injector.get('cow.cowData');
    });
  });

  describe('test the functionality of cowData', function () {
    it('should check default data', function () {
      expect(cowData).toBeDefined();
    });
    it('execute', function () {
      cowData(1,1);
      expect(sendRequest).toHaveBeenCalledWith('SrvAnimal.getAnimalData','1,1');
    });
  });
});