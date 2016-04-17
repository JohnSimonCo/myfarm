'use strict';
describe('chat.extractData tests', function () {

  var $rootScope,
      cacheByFarm = jasmine.createSpy('cacheByFarm').and.callFake(cacheByFarmMock()),
      $filter,
      extractData;

  initCommon();

  beforeEach(module('chat', function ($provide) {
    $provide.value('myfarm.cacheByFarm',cacheByFarmMock());
  }));

  beforeEach(function () {
    inject(function (_$rootScope_,$injector, _$filter_) {
      $rootScope = _$rootScope_;

      $filter = _$filter_;
      extractData = $injector.get('chat.extractData');
    });
  });

  describe('test the functionality of chatify', function () {
    it('should check default data', function () {
      expect(extractData).toBeDefined();
    });
    it('execute', function () {
      var expected = ['1','2','3'];
      expect(extractData()).toEqual(expected);
    });
  });
});

function cacheByFarmMock(){
  return function(input,callback){
    return function(){
      var data = {};
      data.messages = ['1','2','3'];
      return callback(data);
    };
  };
}
