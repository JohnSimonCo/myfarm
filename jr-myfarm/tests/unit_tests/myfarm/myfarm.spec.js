'use strict';
describe('myfarm.socket tests', function () {

  var $rootScope,
      data = 'No farm',
      myfarm,
      farmId = jasmine.createSpy('farmId').and.returnValue(1),
      myfarmSocket = jasmine.createSpy('myfarmSocket').and.callFake(function(){
        return {then:function(callback){callback(getData())}};
      }),
      storage = {};
  
  storage.set = jasmine.createSpy('storage.set');

  initCommon();

  beforeEach(module('myfarm',function ($provide) {
    $provide.value('farmId',farmId);
    $provide.value('myfarm.socket',myfarmSocket);
    $provide.value('storage',storage);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      myfarm = $injector.get('myfarm');
    });

  });

  describe('test the functionality of myfarm.socket', function () {
    it('should check default data', function () {
      expect(myfarm).toBeDefined();
    });
    it('execute when data = "No Farm"', function () {
      $rootScope.$broadcast('$locationChangeSuccess');
      expect(myfarm).toBeDefined();
    });
    it('execute when data != "No Farm"', function () {
      data = {
        cows:{
          vcId:1,
          vcName:'test'
        }
      };
      $rootScope.$broadcast('$locationChangeSuccess');
      
      expect(myfarm).toBeDefined();
      expect(storage.set).toHaveBeenCalledWith('farm',1);
    });
  });

  function getData(){
    return data;
  }
});