'use strict';
describe('cowq.incompleteIndicatorCellController Controller tests', function () {

  var scope,
      self,
      mask,
      counter = 0,
      $rootScope,
      $httpBackend;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;

      scope.cow = {};
      if (counter == 2){
        scope.cow.mask = 0x9999;
      }

      self = $controller('cowq.incompleteIndicatorCellController', {
        $scope: scope
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
    counter++;
  });

  describe('test the functionality of cowq.incompleteIndicatorCellController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('cowq.incompleteIndicatorCellController', function () {
    it('execeute when mask != 0x9999', function () {
      expect(scope.colors).toEqual(['white', 'white', 'white', 'white']);
    });
  });
  describe('cowq.incompleteIndicatorCellController', function () {
    it('execeute when mask = 0x9999', function () {
      expect(scope.colors).toEqual(['red', 'red', 'red', 'red']);
    });
  });
});

