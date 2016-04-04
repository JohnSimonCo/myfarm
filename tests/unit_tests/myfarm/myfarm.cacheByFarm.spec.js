'use strict';
describe('myfarm.cacheByFarm tests', function () {

  var $rootScope,
      $httpBackend,
      cacheByFarm,
      $cacheFactory;

  $cacheFactory = jasmine.createSpy('$cacheFactory').and.callFake(function(){
    return {
      put:jasmine.createSpy('$cacheFactory.put'),
      get:function(input){
        if(input == 1){
          return 1;
        }
        else{
          return null;
        }
      },
      removeAll: function(){}
    }});

  initCommon();

  beforeEach(module('myfarm', function ($provide) {
    $provide.value('$cacheFactory',$cacheFactory);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector,_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      cacheByFarm = $injector.get('myfarm.cacheByFarm');
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of myfarm.cacheByFarm', function () {
    it('should check default data', function () {
      expect(cacheByFarm).toBeDefined();
    });
    it('$rootScope.$on(myfarm.farmChanged) and cache Is available', function () {
      $rootScope.$broadcast('myfarm.farmChanged','test');
      cacheByFarm(1,2)();
    });
    it('$rootScope.$on(myfarm.farmChanged) and cache Is available', function () {
      var factory = {};
      factory.apply = jasmine.createSpy('factory');
      
      $rootScope.$broadcast('myfarm.farmChanged','test');
      
      cacheByFarm(2,factory)();
      
      expect(factory.apply).toHaveBeenCalled();
    });
  });
});