'use strict';
describe('sortMilkings tests', function () {

  var $rootScope,
      sortMilkings,
      milkings = {},
      options = {},
      o1 = {},
      o2 = {};

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      sortMilkings = $injector.get('sortMilkings');
    });

    milkings.sort = function(callback){return callback(o1,o2)};
  });

  describe('test the functionality of sortMilkings', function () {
    it('should check default data', function () {
      expect(sortMilkings).toBeDefined();
    });
    it('execute when sortCol 1', function () {
      o1.endOfMilkingTime = 1;
      o2.endOfMilkingTime = 2;

      options.sortCol = 1;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 2', function () {
      o1.flow = 1;
      o2.flow = 2;

      options.sortCol = 2;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 3', function () {
      o1.totalYield = 1;
      o2.totalYield = 2;

      options.sortCol = 3;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 4', function () {
      o1.time = 1;
      o2.time = 2;

      o1.robotName = 'test1';
      o2.robotName = 'test1';

      options.sortCol = 4;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 5', function () {
      o1.time = 1;
      o2.time = 2;

      o1.robotName = 'test1';
      o2.robotName = 'test1';

      options.sortCol = 5;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 6', function () {
      o1.time = 1;
      o2.time = 2;

      o1.bmcMask = 20;
      o2.bmcMask = 1;

      options.sortCol = 6;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 7 when o2 = o1', function () {
      o1.mask = 1;
      o2.mask = 1;

      options.sortCol = 7;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 7 when o2 != o1', function () {
      o1.mask = 1;
      o2.mask = 2;

      options.sortCol = 7;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 7 when o2 != o1 AND o1 > o2', function () {
      o1.mask = 2;
      o2.mask = 1;

      options.sortCol = 7;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
    it('execute when sortCol 7 when o2,o1 = 0', function () {
      o1.time = 1;
      o2.time = 2;

      o1.mask = 0;
      o2.mask = 0;

      options.sortCol = 7;
      options.reverse = 1;

      expect(sortMilkings(milkings,options)).toBe(-1);
    });
  });
});