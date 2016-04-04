'use strict';
describe('cowq.sort tests', function () {

  var $rootScope,
      cowqSort,
      cows,
      allAreas,
      timeNow,
      options,
      codeSets,
      o1 = {},
      o2 = {};

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    resetVariables();

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      cowqSort = $injector.get('cowq.sort');
    });
  });

  describe('test the functionality of cowq.sort', function () {
    it('should check default data', function () {
      expect(cowqSort).toBeDefined();
    });
    it('execute when no options', function () {
      resetVariables();
      options = null;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toEqual({});
    });
    it('execute when profileIndex = 0', function () {
      resetVariables();

      cows.sort = function(callback){
        var o1 = {},
            o2 = {};

        o1.action = 0;
        o2.action = 0;

        return callback(o1,o2)
      };

      options.profileIndex = 0;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(0);
    });
    it('execute when profileIndex = 1 and o1 = o2', function () {
      resetVariables();

      cows.sort = function(callback){
        var o1 = {},
            o2 = {};

        o1.action = 0;
        o2.action = 0;

        o1.next = 100;
        o1.prev = 100;
        o1.over = 100;
        o1.prev = 100;
        o1.nr = 1;

        o2.next = 100;
        o2.prev = 100;
        o2.over = 100;
        o2.prev = 100;
        o2.nr = 1;

        return callback(o1,o2)
      };

      options.profileIndex = 1;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-0);
    });
    it('execute when profileIndex = 1 and o1 != o2', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 1;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 2,4,19', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 2;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);

      options.profileIndex = 4;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);

      options.profileIndex = 19;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 3', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 3;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 5', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 5;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 6,7', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 6;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);

      options.profileIndex = 7;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 8', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 8;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-100);
    });
    it('execute when profileIndex = 9', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 9;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(100);
    });
    it('execute when profileIndex = 10', function () {
      resetVariables();
      addDefault();

      o1.occ = [];
      o2.occ = [];

      options.profileIndex = 10;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 11', function () {
      resetVariables();
      addDefault();

      o1.spd = 100;
      o1.cy = 150;

      o2.spd = 100;
      o2.cy = 150;

      options.profileIndex = 11;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(0.10000000000000009);
    });
    it('execute when profileIndex = 12,13', function () {
      resetVariables();
      addDefault();

      o1.sevenDays = 'mon';
      o2.sevenDays = 'mon';

      options.profileIndex = 12;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);

      options.profileIndex = 13;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 14', function () {
      resetVariables();
      addDefault();

      o1.sumMask = 100;
      o2.sumMask = 150;

      options.profileIndex = 14;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 15', function () {
      resetVariables();
      addDefault();

      o1.mask = 0x9999;
      o2.mask = 0x9999;

      options.profileIndex = 15;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 16', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 16;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 16 when o1.markBySign==null&&o2.markBySign!=null', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 16;
      options.reverse = -1;

      o1.markBySign = null;
      o2.markBySign = {};

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(100);
    });
    it('execute when profileIndex = 17', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 17;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 18', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 18;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 18 when o1.name != o2.name', function () {
      resetVariables();
      addDefault();

      o1.name = 'test1';
      o2.name = 'test2';

      options.profileIndex = 18;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-100);
    });
    it('execute when profileIndex = 20,22 when p2 = null', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 20;
      options.reverse = -1;

      allAreas['area1'] = {name:'area1'};
      allAreas['area2'] = {name:'area2'};
      o1.areaId = 'area1';


      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);

      options.profileIndex = 22;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 20,22 when p1,p2 = null', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 20;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);

      options.profileIndex = 22;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 20,22', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 20;
      options.reverse = -1;

      allAreas['area1'] = {name:'area1'};
      allAreas['area2'] = {name:'area2'};
      o1.areaId = 'area1';
      o2.areaId = 'area2';

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-100);

      options.profileIndex = 22;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(100);
    });
    it('execute when profileIndex = 21', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 21;
      options.reverse = -1;

      allAreas['area1'] = {name:'area1'};
      allAreas['area2'] = {name:'area2'};
      o1.areaId = 'area1';
      o2.areaId = 'area2';
      o1.inAreaSince = 100;
      o2.inAreaSince = 100;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1000);
    });
    it('execute when profileIndex = 23', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 23;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 24', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 24;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 25,26', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 25;
      options.reverse = -1;

      o1.trapString = 1;
      o2.trapString = 2;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);

      options.profileIndex = 26;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-1);
    });
    it('execute when profileIndex = 27,28', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 27;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);

      options.profileIndex = 28;
      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 29', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 29;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 30', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 30;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 31', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 31;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 32 when o1,o2 < 1000000 ', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 32;
      options.reverse = -1;

      o1.expectedInseminationDueDate = 1;
      o2.expectedInseminationDueDate = 1;
      o1.reproductionStatus = 10;
      o2.reproductionStatus = 8;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(2);
    });
    it('execute when profileIndex = 33', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 33;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(3);
    });
    it('execute when profileIndex = 34', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 34;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 35', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 35;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 36', function () {
      resetVariables();
      addDefault();

      o1.breed = 'test1';
      o2.breed = 'test2';

      codeSets['BreedTypes_'+o1.breed] = 'testCodeSet1';
      codeSets['BreedTypes_'+o2.breed] = 'testCodeSet2';

      options.profileIndex = 36;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(9);
    });
    it('execute when profileIndex = 36', function () {
      resetVariables();
      addDefault();

      o1.breed = 'test1';
      o2.breed = 'test2';

      codeSets['BreedTypes_'+o1.breed] = 'testCodeSet1';
      codeSets['BreedTypes_'+o2.breed] = 'testCodeSet2';

      options.profileIndex = 36;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(9);
    });
    it('execute when profileIndex = 37', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 37;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 38', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 38;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
    it('execute when profileIndex = 39', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 39;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 40', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 40;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(1);
    });
    it('execute when profileIndex = 41', function () {
      resetVariables();
      addDefault();

      options.profileIndex = 41;
      options.reverse = -1;

      expect(cowqSort(cows, allAreas, timeNow, options, codeSets)).toBe(-3);
    });
  });

  function resetVariables(){
    cows = {};
    allAreas = [];
    timeNow = 150000;
    options = {};
    codeSets = [];
  }

  function addDefault(){
    cows.sort = function(callback){

      o1.action = 0;
      o2.action = 0;

      o1.next = 100;
      o1.prev = 100;
      o1.over = 100;
      o1.prev = 100;
      o1.nr = 1;

      o2.next = 0;
      o2.prev = 0;
      o2.over = 0;
      o2.prev = 0;
      o2.nr = 2;

      return callback(o1,o2)
    };
  }
});
