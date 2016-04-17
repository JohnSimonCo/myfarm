'use strict';
describe('editUser.data tests', function () {

  var $rootScope,
      data,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} }),
      deSerialize = jasmine.createSpy('deSerialize').and.returnValue({ then:function(callback){callback()} });

  initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('sendRequest',sendRequest);
    $provide.value('editUser.deSerialize',deSerialize);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      data = $injector.get('editUser.data');
    });

  });

  describe('test the functionality of editUser.data', function () {
    it('should check default data', function () {
      expect(data).toBeDefined();
    });
    it('execute', function () {
      data(1,1);
      
      expect(sendRequest).toHaveBeenCalled();
      expect(deSerialize).toHaveBeenCalledWith('test',1);
    });
  });
});