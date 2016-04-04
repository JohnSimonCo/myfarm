'use strict';
describe('alarms.getAlarmIndex tests', function () {

  var $rootScope,
      getAlarmIndex,
      findIndex;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_.$new();
      getAlarmIndex = $injector.get('alarms.getAlarmIndex');
      findIndex = $injector.get('util.findIndex');
    });
  });

  describe('test the functionality of alarms.getAlarmIndex', function () {
    it('should check default data', function () {
      expect(getAlarmIndex).toBeDefined();
      expect(findIndex).toBeDefined();
    });
    it('check usage', function () {
      var alarms = [
        {dismissDate:10, time: 100, guid: 0},
        {dismissDate:20, time: 200}
      ];
      expect(getAlarmIndex(alarms,0)).toBe(2);
    });
  });
});
