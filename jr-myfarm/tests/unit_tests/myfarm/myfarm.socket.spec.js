'use strict';
describe('myfarm.socket tests', function () {

  var $rootScope,
      myfarmSocket,
      myfarmData,
      data = 'No farm',
      chatSocket = {},
      alarmsSocket = {},
      cowqSocket = {},
      robotStateSocket = {},
      onBroadcastCancel = jasmine.createSpy('onBroadcastCancel'),
      vcTimeDiff;

  myfarmData = jasmine.createSpy('chatSocket.listen').and.callFake(function(){
    return {then:function(callback){callback(getMyfarmData())}};
  });

  chatSocket.listen = jasmine.createSpy('chatSocket.listen');
  alarmsSocket.listen = jasmine.createSpy('alarmsSocket.listen');
  cowqSocket.listen = jasmine.createSpy('cowqSocket.listen');
  robotStateSocket.listen = jasmine.createSpy('robotStateSocket.listen');
  chatSocket.run = jasmine.createSpy('chatSocket.run');
  alarmsSocket.run = jasmine.createSpy('alarmsSocket.run');
  cowqSocket.run = jasmine.createSpy('cowqSocket.run');
  robotStateSocket.run = jasmine.createSpy('robotStateSocket.run');

  initCommon();

  beforeEach(module('myfarm',function ($provide) {
    $provide.value('myfarm.data',myfarmData);
    $provide.value('chat.socket',chatSocket);
    $provide.value('alarms.socket',alarmsSocket);
    $provide.value('cowq.socket',cowqSocket);
    $provide.value('robotState.socket',robotStateSocket);
    $provide.value('onBroadcastCancel',onBroadcastCancel);
    $provide.value('util.vcTimeDif',vcTimeDiff);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      myfarmSocket = $injector.get('myfarm.socket');
    });

  });

  describe('test the functionality of myfarm.socket', function () {
    it('should check default data', function () {
      expect(myfarmSocket).toBeDefined();
    });
    it('execute when cancelBroadcast', function () {
      myfarmSocket(1,true);

      expect(onBroadcastCancel).toHaveBeenCalled();
      expect(chatSocket.listen).toHaveBeenCalled();
      expect(alarmsSocket.listen).toHaveBeenCalled();
      expect(cowqSocket.listen).toHaveBeenCalled();
      expect(robotStateSocket.listen).toHaveBeenCalled();
    });
    it('execute when NO cancelBroadcast', function () {
      data = 'farm';

      myfarmSocket(1,false);

      expect(onBroadcastCancel).toHaveBeenCalled();
      expect(chatSocket.listen).toHaveBeenCalled();
      expect(alarmsSocket.listen).toHaveBeenCalled();
      expect(cowqSocket.listen).toHaveBeenCalled();
      expect(robotStateSocket.listen).toHaveBeenCalled();
      expect(chatSocket.run).toHaveBeenCalled();
      expect(alarmsSocket.run).toHaveBeenCalled();
      expect(cowqSocket.run).toHaveBeenCalled();
      expect(robotStateSocket.run).toHaveBeenCalled();
    });
  });

  function getMyfarmData(){
    return data;
  }
});