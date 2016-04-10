'use strict';
describe('sortFarms tests', function () {

  var $rootScope,
      sortFarms,
      $filter,
      translate = jasmine.createSpy('translate').and.returnValue('translated Value');

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector,_$filter_) {
      $rootScope = _$rootScope_;
      $filter = _$filter_;
      sortFarms = $injector.get('$filter')('sortFarms');
    });
  });

  describe('test the functionality of sortFarms', function () {
    it('should check default data', function () {
      expect(sortFarms).toBeDefined();
    });
    it('execute when sortcol = 0', function () {
        var farms,
            sortCol = 0,
            sortDir = {};

      farms = [
        {
          name:String('test1'),
          state:1,
          offLineTimeSec:null
        },
        {
          name:String('test1'),
          state:1,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(farms);
    });
    it('execute when sortcol = 1', function () {
        var farms,
            sortCol = 1,
            sortDir = {};

      farms = [
        {
          name:'test1',
          state:1,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(farms);
    });
    it('execute when sortcol = 1', function () {
        var farms,
            sortCol = 1,
            sortDir = {};

      farms = [
        {
          name:'test1',
          state:3,
          offLineTimeSec:2
        },
        {
          name:'test2',
          state:3,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(farms);
    });
    it('execute when sortcol = 0', function () {
        var farms,
            sortCol = 0,
            sortDir = 1,
            expected;

      farms = [
        {
          name:'test1',
          state:1,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 2', function () {
      var farms,
          sortCol = 2,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 3', function () {
      var farms,
          sortCol = 3,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrRedCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrRedCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrRedCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrRedCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 4', function () {
      var farms,
          sortCol = 4,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrYellowCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrYellowCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrYellowCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrYellowCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 5', function () {
      var farms,
          sortCol = 5,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrWhiteCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrWhiteCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrWhiteCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrWhiteCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 5', function () {
      var farms,
          sortCol = 5,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrWhiteCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrWhiteCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrWhiteCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrWhiteCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 6', function () {
      var farms,
          sortCol = 6,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          milkingCows:20,
          nrRedCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          milkingCows:20,
          nrRedCows:5,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          milkingCows:20,
          nrRedCows:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          milkingCows:20,
          nrRedCows:5,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 7', function () {
      var farms,
          sortCol = 7,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          vcName:'test1',
          state:1,
          milkingCows:20,
          nrRedCows:10,
          nrFatalAlarms:0,
          nrUserNotAlarms:1,
          offLineTimeSec:null
        },
        {
          name:'test2',
          vcName:'test2',
          state:1,
          milkingCows:20,
          nrRedCows:5,
          nrFatalAlarms:0,
          nrUserNotAlarms:1,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          vcName:'test1',
          state:1,
          milkingCows:20,
          nrRedCows:10,
          nrFatalAlarms:0,
          nrUserNotAlarms:1,
          offLineTimeSec:null
        },
        {
          name:'test2',
          vcName:'test2',
          state:1,
          milkingCows:20,
          nrRedCows:5,
          nrFatalAlarms:0,
          nrUserNotAlarms:1,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 8', function () {
      var farms,
          sortCol = 8,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          cleaning:100,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          cleaning:100,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          cleaning:100,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          cleaning:100,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 9', function () {
      var farms,
          sortCol = 9,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          vcVersion:String('1.0.0'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          vcVersion:String('1.0.0'),
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test2',
          state:1,
          vcVersion:String('1.0.0'),
          offLineTimeSec:null
        },
        {
          name:'test1',
          state:1,
          vcVersion:String('1.0.0'),
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 10', function () {
      var farms,
          sortCol = 10,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          vcVersion:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          vcVersion:10,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          vcVersion:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          vcVersion:10,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when sortcol = 11', function () {
      var farms,
          sortCol = 11,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:1,
          nrRobotNotAuto:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrRobotNotAuto:10,
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:1,
          nrRobotNotAuto:10,
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:1,
          nrRobotNotAuto:10,
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when state > 3 && status = 3 && sortCol = 0', function () {
      var farms,
          sortCol = 0,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when state > 3 && status = 3 && sortCol = 8', function () {
      var farms,
          sortCol = 8,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
    it('execute when state > 3 && status = 3 && sortCol = random', function () {
      var farms,
          sortCol = 2,
          sortDir = 1,
          expected;

      farms = [
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expected =[
        {
          name:'test1',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        },
        {
          name:'test2',
          state:4,
          status:3,
          ipAddress: String('127.0.0.1'),
          offLineTimeSec:null
        }
      ];

      expect(sortFarms(farms,sortCol,sortDir)).toEqual(expected);
    });
  });
});

