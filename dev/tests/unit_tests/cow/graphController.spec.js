'use strict';
describe('cow.graphController tests', function () {

  var scope,
      self,
      $rootScope,
      getCowData = jasmine.createSpy('cowData').and.callFake(function(){return {then:function(callback){callback()}}}),
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

      self = $controller('cow.graphController', {
        $scope: scope,
        'cow.cowData': getCowData
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cow.graphController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(getCowData).toBeDefined();
    });
    xit('execute', function () {
      scope.id = 1;
      scope.setCowData = function(){};
      scope.$broadcast();
      scope.$digest();
      expect(getCowData).toHaveBeenCalled();
    });
  });
});