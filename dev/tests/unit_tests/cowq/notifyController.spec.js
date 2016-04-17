'use strict';
describe('cowq.notifyController Controller tests', function () {

  var scope,
      self,
      $rootScope,
      $httpBackend,
      markAnimal = jasmine.createSpy('markAnimal');

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;

      self = $controller('cowq.notifyController', {
        $scope: scope,
        markAnimal:markAnimal
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowq.notifyController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(markAnimal).toBeDefined();
    });
  });
  describe('addNotify', function () {
    it('execute', function () {
      var cow = 'test';
      scope.data = {};
      scope.data.vcId = 1;

      scope.addNotify(cow);
      expect(markAnimal).toHaveBeenCalledWith(scope.data.vcId,cow);
    });
  });
});