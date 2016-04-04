'use strict';
describe('cowq.socket tests', function () {

  var $rootScope,
      cowSocket,
      onBroadcast,
      extractData,
      deSerializeCow,
      setCowsToGroups,
      getTime,
      findIndex,
      JsSerilz,
      jsSerilzState = 0,
      jsSerilzhasMore = 0,
      broadcastCallback = '',
      cows = '';

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('onBroadcast',onBroadcast);
    $provide.value('cowq.extractData',extractData);
    $provide.value('cowq.deSerializeCow',deSerializeCow);
    $provide.value('cowq.setCowsToGroups',setCowsToGroups);
    $provide.value('util.getTime',getTime);
    $provide.value('util.findIndex',findIndex);
    $provide.value('JsSerilz',JsSerilz);
  }));
  beforeEach(function () {
    jr.storage = {};

    JsSerilz = jasmine.createSpy('jsSerilzState').and.callFake(function(){
      var temp = {};

      temp.hasMore = function(){
        return jsSerilzhasMore;
      };
      temp.getInt = function(){
        return jsSerilzState;
      };
      temp.getString = function(){
        return '0,1';
      };
      return temp;
    });

    onBroadcast = jasmine.createSpy('onBroadcast').and.callFake(function(id,queue,callback){
      return callback(broadcastCallback);
    });
    extractData = jasmine.createSpy('extractData').and.callFake(function(input){
      if(input !== ''){
        return cows;
      }else {
        return null;
      }
    });
    getTime = jasmine.createSpy('getTime').and.returnValue('12:12');
    setCowsToGroups = jasmine.createSpy('setCowsToGroups');
    deSerializeCow = jasmine.createSpy('deSerializeCow').and.returnValue(1);

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      cowSocket = $injector.get('cowq.socket');
    });
  });

  describe('test the functionality of cowq.socket', function () {
    it('should check default data', function () {
      expect(cowSocket).toBeDefined();
    });
    it('execute run when current Id = id', function () {
        expect(cowSocket.run(1,'')).toBeUndefined();
    });
    it('execute listen when Jserilz = 1', function () {
      cows = {cows:[1,2,3]};
      cowSocket.run(1,'');
      cowSocket.listen(10);
      cowSocket.run(10,1);
      cowSocket.listen(10);
    });
  });
});