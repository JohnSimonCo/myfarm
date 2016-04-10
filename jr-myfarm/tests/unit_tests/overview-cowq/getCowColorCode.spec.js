'use strict';
describe('getCowColorCode tests', function () {

  var $rootScope,
      getCowColorCode,
      cowq = jasmine.createSpy('cowq'),
      stat = jasmine.createSpy('stat');

  initCommon();

  beforeEach(module('overviewCowq', function ($provide) {
    $provide.value('cowq',cowq);
    $provide.value('stat',stat);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_, $injector) {
      $rootScope = _$rootScope_.$new();
      getCowColorCode = $injector.get('getCowColorCode');
    });
  });

  describe('getCowColorCode', function () {
    it('should check default data', function () {
      expect(getCowColorCode).toBeDefined();
    });
    it('should check run', function () {
      expect(getCowColorCode('red')).toBe('#ff3200');
    });
  });
});
