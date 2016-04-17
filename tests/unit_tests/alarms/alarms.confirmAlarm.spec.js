'use strict';
describe('alarms.confirmAlarm tests', function () {

  var $rootScope,
      sendRequest = function(){ return{ then:function(callback){callback('test')} } },
      confirmAlarm,
      createFormat = jasmine.createSpy('createFormat').and.returnValue({render: jasmine.createSpy('render')});

  initCommon();

  beforeEach(module('util', function ($provide) {
    $provide.value('util.format', createFormat);
  }));
  beforeEach(module('server', function ($provide) {
    $provide.value('sendRequest', sendRequest);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_.$new();
      confirmAlarm = $injector.get('alarms.confirmAlarm');
    });
  });

  describe('test the functionality of alarms.confirmAlarm', function () {
    it('should check default data', function () {
      expect(confirmAlarm).toBeDefined();
    });
    it('execute', function () {
      var alarm = {};
      alarm.guid = 1;
      confirmAlarm(1,alarm);
      expect(createFormat).toHaveBeenCalled();
    });
  });
});