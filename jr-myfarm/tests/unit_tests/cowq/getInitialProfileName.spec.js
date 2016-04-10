'use strict';
describe('getInitialProfileName tests', function () {

  var $rootScope,
      getInitialProfileName,
      getUserProfileName = jasmine.createSpy('getUserProfileName').and.returnValue(true),
      profileValue = 'test',
      $location = {};

      $location.search = jasmine.createSpy('$location.search').and.callFake(function(){
        return {profile: profileValue }
      });

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('getUserProfileName',getUserProfileName);
    $provide.value('$location',$location);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      getInitialProfileName = $injector.get('getInitialProfileName');
    });

  });

  describe('test the functionality of getInitialProfileName', function () {
    it('should check default data', function () {
      expect(getInitialProfileName).toBeDefined();
      expect($location).toBeDefined();
    });
    it('execute when searchProfileName', function () {
      var profiles = {};
      profiles.profiles = {};
      profiles.profiles.test = false;

      expect(getInitialProfileName(profiles)).toBe(true);
    });
    it('execute when no searchProfileName', function () {
      var profiles = {};
      profiles.profiles = {};
      profiles.profiles.test = {};
      profiles.profiles.test.commonName = 'test';
      profileValue = 'test';

      expect(getInitialProfileName(profiles)).toBe('test');
    });
  });
});