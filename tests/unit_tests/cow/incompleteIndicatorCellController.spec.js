'use strict';
describe('cow.incompleteIndicatorCellController tests', function () {

  var scope,
      self,
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

      self = $controller('cow.incompleteIndicatorCellController', {
        $scope: scope
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cow.incompleteIndicatorCellController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('watchers', function () {
    it('execute', function () {
      var expected = ['white', 'white', 'white', 'white'];
      scope.milking = {};
      scope.milking.mask = 1000;
      scope.$digest();
      
      expect(scope.colors).toEqual(expected);
    });
  });
});