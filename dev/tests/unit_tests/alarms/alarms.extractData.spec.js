'use strict';
describe('alarms.extractData tests', function () {

  var $rootScope,
    extractData,
    cacheByFarm,
    sortAlarms,
    extractAlarm;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_, $injector) {
      $rootScope = _$rootScope_.$new();
      extractData = $injector.get('alarms.extractData');
      cacheByFarm = $injector.get('myfarm.cacheByFarm');
      sortAlarms = $injector.get('alarms.sortAlarms');
      extractAlarm = $injector.get('alarms.extractAlarm');
    });
  });

  describe('alarms.extractData', function () {
    it('should check default data', function () {
      expect(extractData).toBeDefined();
      expect(cacheByFarm).toBeDefined();
      expect(sortAlarms).toBeDefined();
      expect(extractAlarm).toBeDefined();
    });
    it('execute when alarms available', function () {
      var data = {},
        expected;

      data.alarms = {
        alarms: {
          list: [
            {dismissDate: 10, time: 100, guid: 0, icon: 'test'},
            {dismissDate: 20, time: 200, icon: 'test'}
          ]
        }
      };

      expected = [
        {
          dismissDate: 20,
          time: 200,
          icon: 'test',
          date: '1970-01-01 01:00',
          msg: 'undefined',
          type: 'standard',
          dismissDateFormatted: '1970-01-01 01:00'
        },{
          dismissDate: 10,
          time: 100,
          guid: 0,
          icon: 'test',
          date: '1970-01-01 01:00',
          msg: 'undefined',
          type: 'standard',
          dismissDateFormatted: '1970-01-01 01:00'
        }
      ];

      expect(extractData(data).alarms.list).toEqual(expected);
    });
    it('execute when alarms available', function () {
      var data = {},
        expected = [];
      expect(extractData(data).alarms.list).toEqual(expected);
    });
  });
});
