'use strict';
describe('cow.navigationController Controller tests', function () {

  var scope,
      self,
      $rootScope,
      setUserViewIndex,
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

      scope.setView = jasmine.createSpy('setView');
      scope.setCow = jasmine.createSpy('setCow');
      setUserViewIndex = jasmine.createSpy('setUserViewIndex');

      self = $controller('cow.navigationController', {
        $scope: scope,
        setUserViewIndex: setUserViewIndex
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cow.navigationController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('scope.navigate', function () {
    it('execute with direction > 0', function () {
      scope.index = 1;
      scope.navigate(1);
      
      expect(scope.setCow).toHaveBeenCalledWith(2);
    });
    it('execute with direction < 0', function () {
      scope.index = 1;
      scope.navigate(-1);

      expect(scope.setCow).toHaveBeenCalledWith(0);
    });
  });
  describe('changeView', function () {
    it('execute', function () {
      scope.nextViewIndex = 1;
      scope.changeView();

      expect(scope.setView).toHaveBeenCalled();
      expect(setUserViewIndex).toHaveBeenCalled();
      expect(scope.viewIndex).toBe(1);
      expect(scope.nextViewIndex).toBe(2);
    });
  });
  describe('getNextViewIndex', function () {
    it('execute', function () {
      scope.viewIndex = 1;
      
      expect(scope.getNextViewIndex()).toBe(2);
    });
  });
  describe('firstIndex & lastIndex', function () {
    it('firstIndex', function () {
      scope.index = 0;
      
      expect(scope.firstIndex()).toBe(true);
    });
    it('lastIndex', function () {
      scope.index = 0;
      scope.cows = {};

      expect(scope.lastIndex()).toBe(false);
    });
  });
});