'use strict';
describe('alarms.socket tests', function () {

  var $rootScope,
      socket,
      broadcastMockController = 'dataAvailable',
      sortAlarms = jasmine.createSpy('sortAlarms');

  initCommon();

  beforeEach(module('server', function ($provide) {
    $provide.value('onBroadcast', onBroadcastMockup);
  }));

  beforeEach(module('alarms', function ($provide) {
    $provide.value('alarms.sortAlarms', sortAlarms);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_.$new();

      socket = $injector.get('alarms.socket',[]);
    });
  });

  describe('alarms.socket', function () {
    it('should check default data', function () {
      expect(socket).toBeDefined();
    });
    it('listen with no data', function () {
      expect(socket.listen(1)).toBeUndefined();
    });
    it('run with data and listen', function () {
      var data = {};
      data.alarmsData = {};
      data.alarmsData.alarms = {};
      data.alarmsData.alarms.list = {};

      socket.run(1,data);
      socket.listen(1);
      expect(sortAlarms).toHaveBeenCalled();
    });
  });

  function onBroadcastMockup(id,input,callback){
    var alarms = [
      {dismissDate:10, time: 100, guid: 1,icon:'test'},
      {dismissDate:10, time: 100, guid: 2,icon:'test'},
      {dismissDate:10, time: 100, guid: 3,icon:'test'}
    ];
    if(broadcastMockController == 'dataAvailable'){
      callback(alarms);
    }
    else {
      callback();
    }

  }
});

