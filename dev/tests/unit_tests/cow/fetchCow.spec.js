'use strict';
describe('fetchCow tests', function () {

  var $rootScope,
      fetchCow,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({then:function(){}});

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('sendRequest',sendRequest);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,_fetchCow_) {
      $rootScope = _$rootScope_;
      fetchCow =  _fetchCow_;
    });
  });

  describe('test the functionality of fetchCow', function () {
    it('should check default data', function () {
      expect(fetchCow).toBeDefined();
    });
    it('execute', function () {
      fetchCow(1,1,1);
      expect(sendRequest).toHaveBeenCalledWith('SrvAnimal.setFetch',{vcId:1, animalNr:1, isFetch:1});
    });
  });
});