'use strict';
describe('cowq.profileController Controller tests', function () {

  var scope,
      self,
      $rootScope,
      $httpBackend,
      getInitialProfileName,
      setUserProfileName;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      getInitialProfileName = jasmine.createSpy('getInitialProfileName').and.returnValue('test');
      setUserProfileName = jasmine.createSpy('setUserProfileName');

      scope.setProfile = jasmine.createSpy('scope.setProfile');
      scope.data = {};
      scope.data.profiles = {};
      scope.data.profiles.profiles = {};
      scope.data.profiles.profiles.test = 'test';

      self = $controller('cowq.profileController', {
        $scope: scope,
        getInitialProfileName:getInitialProfileName,
        setUserProfileName:setUserProfileName
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowq.profileController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(getInitialProfileName).toBeDefined();
      expect(setUserProfileName).toBeDefined();
    });
  });
  describe('change', function () {
    it('execute', function () {
      scope.change();
      expect(setUserProfileName).toHaveBeenCalled();
      expect(scope.setProfile).toHaveBeenCalled();
    });
  });
  describe('getprofile', function () {
    it('execute', function () {
      expect(scope.getProfile('test')).toBe('test');
    });
  });
  describe('setProfile', function () {
    it('execute', function () {
      expect(scope.setProfile).toHaveBeenCalled();
    });
  });
});