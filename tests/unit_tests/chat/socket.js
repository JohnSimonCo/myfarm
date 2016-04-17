'use strict';
describe('chatify tests', function () {

  var $rootScope,
      chatSocket,
      broadcastMockController = 'dataAvailable',
      extractData = jasmine.createSpy('getMessageIndex').and.returnValue({test:'test'}),
      getMessageIndex = function(){return 1},
      $filter;

  initCommon();

  beforeEach(module('server', function ($provide) {
    $provide.value('onBroadcast', onBroadcastMockup);
  }));

  beforeEach(module('chat', function ($provide) {
    $provide.value('chat.extractData',extractData);
    $provide.value('chat.getMessageIndex',getMessageIndex);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_, $injector, _$filter_) {
      $rootScope = _$rootScope_;
      chatSocket = $injector.get('chat.socket');
      $filter = _$filter_;
    });
  });

  describe('test the functionality of chatify', function () {
    it('should check default data', function () {
      expect(chatSocket).toBeDefined();
    });
    it('listen with no data', function () {
      expect(chatSocket.listen(1)).toBeUndefined();
    });
    it('run with data and listen', function () {
      var data = {};
      data.list = {};

      chatSocket.run(1,data);
      chatSocket.listen(1);
      expect(extractData).toHaveBeenCalled();
    });

  });

  function onBroadcastMockup(id,input,callback){
    var messages = [
      {dismissDate:10, time: 100, id: 1,icon:'test'},
      {dismissDate:10, time: 100, id: 2,icon:'test'},
      {dismissDate:10, time: 100, id: 3,icon:'test'}
    ];

    if(broadcastMockController == 'dataAvailable'){
      callback(messages);
    }
    else {
      callback();
    }
  }
});