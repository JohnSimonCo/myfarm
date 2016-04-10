'use strict';
describe('alarms.sortAlarms tests', function () {

  var $rootScope,
      sortAlarms;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_.$new();
      sortAlarms = $injector.get('alarms.sortAlarms');
    });
  });

  describe('test the functionality of alarms.sortAlarms', function () {
    it('should check default data', function () {
      expect(sortAlarms).toBeDefined();
    });
    it('o1.dismissDate && o2.dismissDate', function () {
      var alarms = [
        {dismissDate:10 ,time:100 },
        {dismissDate:0 ,time:200 }
      ],
      expected = [
        {dismissDate:0 ,time:200 },
        {dismissDate:10 ,time:100 }
      ];

      expect(sortAlarms(alarms)).toEqual(expected);
    });
    it('o2.dismissDate NULL', function () {
      var alarms = [
        {dismissDate:0 ,time:200 },
        {time:100 }
      ],
      expected = [
        {dismissDate:0 ,time:200 },
        {time:100 }
      ];

      expect(sortAlarms(alarms)).toEqual(expected);
    });
  });
});
