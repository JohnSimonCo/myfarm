'use strict';
describe('getFarmStyle tests', function () {

  var $rootScope,
      getFarmStyle,
      sendRequest = jasmine.createSpy('sendRequest').and.returnValue({ then:function(callback){callback('test')} }),
      deSerialize = jasmine.createSpy('deSerialize').and.returnValue({ then:function(callback){callback()} });

  initCommon();

  beforeEach(module('editUser', function ($provide) {
    $provide.value('sendRequest',sendRequest);
    $provide.value('editUser.deSerialize',deSerialize);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      getFarmStyle = $injector.get('getFarmStyle');
    });
  });

  describe('test the functionality of getFarmStyle', function () {
    it('should check default data', function () {
      expect(getFarmStyle).toBeDefined();
    });
    it('execute when offlineUntil', function () {
      var farm = {},
          yesterday = new Date().getTime() + 1000 * 60 * 60 * 24;

      farm.offlineUntil = new Date(yesterday);
      expect(getFarmStyle(farm)).toBe('styleGrey');
    });
    it('execute when status 2', function () {
      var farm = {},
          yesterday = new Date().getTime() - 1000 * 60 * 60 * 24;

      farm.offlineUntil = new Date(yesterday);
      farm.state = 1;
      farm.hasLicense = true;
      farm.status = 2;
      expect(getFarmStyle(farm)).toBe('styleLightBlue');
    });
    it('execute when status 1 and state 1', function () {
      var farm = {},
          yesterday = new Date().getTime() - 1000 * 60 * 60 * 24;

      farm.offlineUntil = new Date(yesterday);
      farm.state = 1;
      farm.hasLicense = true;
      farm.status = 1;
      expect(getFarmStyle(farm)).toBe('styleOrange');
    });
    it('execute when status 3', function () {
      var farm = {},
          yesterday = new Date().getTime() - 1000 * 60 * 60 * 24;

      farm.offlineUntil = new Date(yesterday);
      farm.state = 1;
      farm.hasLicense = true;
      farm.status = 3;
      farm.vcGUID = null;
      expect(getFarmStyle(farm)).toBe('styleYellow');
    });
    it('execute when hasLicense = false', function () {
      var farm = {},
          yesterday = new Date().getTime() - 1000 * 60 * 60 * 24;

      farm.offlineUntil = new Date(yesterday);
      farm.state = 1;
      farm.hasLicense = false;
      expect(getFarmStyle(farm)).toBe('styleRed');
    });
  });
});