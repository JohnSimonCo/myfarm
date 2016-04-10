'use strict';
describe('farmConnectionStatus tests', function () {

  var $rootScope,
      farmConnectionStatus,
      farmConnectionThresholdRed = 100,
      farmConnectionThresholdYellow = 10;

  initCommon();

  beforeEach(module('myfarm', function ($provide) {
    $provide.value('farmConnectionThresholdRed',farmConnectionThresholdRed);
    $provide.value('farmConnectionThresholdYellow',farmConnectionThresholdYellow);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      farmConnectionStatus = $injector.get('farmConnectionStatus');
    });

  });

  describe('test the functionality of farmConnectionStatus', function () {
    it('should check default data', function () {
      expect(farmConnectionStatus).toBeDefined();
    });
    it('execute when timeSinceLastContact > redThreshold', function () {
      expect(farmConnectionStatus(101)).toBe('red');
    });
    it('execute when timeSinceLastContact > yellowThreshold', function () {
      expect(farmConnectionStatus(11)).toBe('yellow');
    });
    it('execute when timeSinceLastContact < yellowThreshold', function () {
      expect(farmConnectionStatus(5)).toBe('ok');
    });
  });
});