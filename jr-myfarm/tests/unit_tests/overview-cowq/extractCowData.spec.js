'use strict';
describe('overview-cowq.extractCowData tests', function () {

  var $rootScope,
      extractData,
      getCowColor = jasmine.createSpy('getCowColor').and.returnValue('red'),
      getCowColorCode = jasmine.createSpy('getCowColorCode'),
      cowDataColorPriority = jasmine.createSpy('cowDataColorPriority');

  initCommon();

  beforeEach(module('overviewCowq', function ($provide) {
    $provide.value('getCowColor',getCowColor);
    $provide.value('getCowColorCode',getCowColorCode);
    $provide.value('cowDataColorPriority',cowDataColorPriority);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_, $injector) {
      $rootScope = _$rootScope_.$new();
      extractData = $injector.get('overview-cowq.extractCowData');
    });
  });

  describe('overview-cowq.extractCowData', function () {
    it('should check default data', function () {
      expect(extractData).toBeDefined();
    });
    it('should check working', function () {
      var cows,
          time = '12:12';

      cows = [
        {},
        {}
      ];

      expect(extractData(cows,time).totalNumberOfCows).toBe(2);
    });
  });
});
