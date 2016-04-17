'use strict';
describe('alarms.extractAlarm tests', function () {

  var $rootScope,
    extractAlarm,
    getAlarmType,
    formatAlarmDate;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_, _getAlarmType_, _formatAlarmDate_, $injector) {
      $rootScope = _$rootScope_.$new();
      extractAlarm = $injector.get('alarms.extractAlarm');
      getAlarmType = _getAlarmType_;
      formatAlarmDate = _formatAlarmDate_;
    });
  });

  describe('test the functionality of alarms.extractAlarm', function () {
    it('should check default data', function () {
      expect(extractAlarm).toBeDefined();
      expect(getAlarmType).toBeDefined();
      expect(formatAlarmDate).toBeDefined();
    });
    it('spec title', function () {
      var alarm = {};
      alarm.time = '2015.12.11 12:12';
      alarm.dismissDate = '2016.12.11 12:12';
      alarm.severity = 1;
      alarm.icon = 'Test';
      alarm.message = 'message';
      alarm.majorCode = 'major';
      alarm.minorCode = 'minor';


      var expected = {
        time: '2015.12.11 12:12',
        dismissDate: '2016.12.11 12:12',
        severity: 1,
        icon: 'test',
        message: 'message',
        majorCode: 'major',
        minorCode: 'minor',
        date: '2015.12.11 12:12',
        msg:'message',
        type: 'standard',
        dismissDateFormatted: '2016.12.11 12:12'
      };
      expect(extractAlarm(alarm)).toEqual(expected)
    });
  });
});
