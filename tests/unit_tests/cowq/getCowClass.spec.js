'use strict';
describe('getCowClass tests', function () {

  var $rootScope,
      getCowClass;

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      getCowClass = $injector.get('getCowClass');
    });
  });

  describe('test the functionality of getCowClass', function () {
    it('should check default data', function () {
      expect(getCowClass).toBeDefined();
    });
    it('execute', function () {
      var cow = {},
          time = {};
      cow.action = 1;
      
      expect(getCowClass(cow,time)).toBe('passthrough');
    });
  });
});