'use strict';
describe('analyzeCleanings tests', function () {

  var $rootScope,
      analyzeCleanings;

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      analyzeCleanings = $injector.get('analyzeCleanings');
    });

  });

  describe('test the functionality of analyzeCleanings', function () {
    it('should check default data', function () {
      expect(analyzeCleanings).toBeDefined();
    });
    it('execute', function () {
      var cleanings = [
        {latest24Count: 1},
        {latest24Count: 2},
        {latest24Count: 3},
        {latest24Count: 4}
      ];

      expect(analyzeCleanings(cleanings)).toBe(1);
    });
  });
});