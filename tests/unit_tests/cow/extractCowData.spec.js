'use strict';
describe('extractCowData tests', function () {

  var $rootScope,
      extractCowData;

  initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_,_extractCowData_) {
      $rootScope = _$rootScope_;
      extractCowData = _extractCowData_;
    });
  });

  describe('test the functionality of extractCowData', function () {
    it('should check default data', function () {
      expect(extractCowData).toBeDefined();
    });
    it('execute', function () {
      var cow = {},
          cowData = { milkings: {} },
          data = {};

      cowData.mlk = [{milkingTimeHex:15},{milkingTimeHex:15},{milkingTimeHex:16}];

      expect(extractCowData(cow,cowData,data)).toBeDefined();
    });
  });
});