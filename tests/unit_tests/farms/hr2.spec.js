'use strict';
describe('hr2 tests', function () {

  var $rootScope,
      hr,
      translate = jasmine.createSpy('translate').and.returnValue('translated Value');

  initCommon();

  beforeEach(module('farms', function ($provide) {
    $provide.value('translate',translate);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      hr = $injector.get('hr2');
    });
  });

  describe('test the functionality of hr2', function () {
    it('should check default data', function () {
      expect(hr).toBeDefined();
    });
    it('execute', function () {
      expect(hr(180)).toBe('00:03');
    });
  });
});

