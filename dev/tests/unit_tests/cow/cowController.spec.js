'use strict';
describe('cowController tests', function () {

  var scope,
      $rootScope,
      extractData,
      self,
      scrollTo = {},
      data,
      extractCowData,
      getCowClass,
      $timeout,
      $ngSilentLocation = {},
      $httpBackend,
      $location;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$location_,_$httpBackend_, _$timeout_ ) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();


      data = {};

      $timeout = _$timeout_;
      $location = _$location_;
      $httpBackend = _$httpBackend_;
      extractData = jasmine.createSpy('extractData').and.callFake(function(){return {}});
      scrollTo.set = jasmine.createSpy('scrollTo');
      extractCowData = jasmine.createSpy('extractData').and.callFake(function(){return true});
      $ngSilentLocation.silent = jasmine.createSpy('$ngSilentLocation.silent');
      getCowClass = jasmine.createSpy('getCowClass').and.returnValue('cowTest');

      
      self = $controller('cowController', {
        $scope: scope,
        $location : $location,
        data: data,
        'cow.extractData':extractData,
        scrollTo:scrollTo,
        extractCowData:extractCowData,
        $ngSilentLocation:$ngSilentLocation,
        getCowClass:getCowClass
      });
    });
    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of actionbarController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect($location).toBeDefined();
      expect(data).toBeDefined();
      expect(extractData).toBeDefined();
    });
  });
  describe('$on', function () {
    it('cowq.update', function () {
      var expected = {test:'test'};

      scope.id = 1;
      scope.nr = 1;
      scope.time = 100;

      spyOn(scope,'updateUrl');
      scope.$broadcast('cowq.update',{test:'test'});

      expect(extractData).toHaveBeenCalled();
      expect(scope.updateUrl).toHaveBeenCalled();
      expect(scope.data).toEqual(expected);
    });
    it('$destroy', function () {
      scope.timeout = 1;
      spyOn($timeout,'cancel');

      scope.$broadcast('$destroy');
      expect($timeout.cancel).toHaveBeenCalledWith(scope.timeout);
    });
    it('myfarm.farmChanged', function () {
      scope.$broadcast('myfarm.farmChanged');

      expect($location.path()).toBe('/');
    });
  });
  describe('setCow', function () {
    it('execute', function () {
      spyOn(scope,'updateUrl');
      scope.cows = [ {cow:{nr:1}} ];

      scope.setCow(0);

      expect(scope.updateUrl).toHaveBeenCalled();
      expect(scrollTo.set).toHaveBeenCalled();
    });
  });
  describe('setCowData', function () {
    it('execute', function () {
      var data = {test:'test'};

      scope.setCowData(data);

      expect(extractCowData).not.toHaveBeenCalled();
    });
  });
  describe('updateUrl', function () {
    it('execute', function () {
      scope.nr = 1;
      scope.view = 'test';
      
      scope.updateUrl();
      
      expect($ngSilentLocation.silent).toHaveBeenCalledWith('/cowq/cow/1/test',true);
    });
  });
  describe('setView', function () {
    it('execute', function () {
      spyOn(scope,'updateUrl');

      scope.setView('test');
      
      expect(scope.view).toBe('test');
      expect(scope.updateUrl).toHaveBeenCalled();
    });
  });
  describe('getCowClass', function () {
    it('execute', function () {
      expect(scope.getCowClass()).toBe('cowTest');
      expect(getCowClass).toHaveBeenCalled();
    });
  });
});