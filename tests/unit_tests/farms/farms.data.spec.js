'use strict';
describe('farms.data tests', function () {

  var $rootScope,
      data,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} }),
      deSerialize = jasmine.createSpy('deSerialize').and.returnValue({ then:function(callback){callback()} });

  initCommon();

  beforeEach(module('farms', function ($provide) {
    $provide.value('sendRequest',sendRequest);
    $provide.value('farms.deSerialize',deSerialize);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      data = $injector.get('farms.data');
    });

  });

  describe('test the functionality of farms.data', function () {
    it('should check default data', function () {
      expect(data).toBeDefined();
    });
    it('execute', function () {
      data();

      expect(sendRequest).toHaveBeenCalled();
      expect(deSerialize).toHaveBeenCalledWith('test');
    });
  });
});