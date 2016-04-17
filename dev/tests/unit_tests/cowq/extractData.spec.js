'use strict';
describe('cowq.extractData tests', function () {

  var $rootScope,
      extractData,
      cacheByFarm = jasmine.createSpy('cacheByFarm').and.callFake(
          function(input,callback){
            return callback;
          }),
      deSerializeData = jasmine.createSpy('deSerializeData'),
      deSerializeProfiles = jasmine.createSpy('deSerializeProfiles');

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('myfarm.cacheByFarm',cacheByFarm);
    $provide.value('cowq.deSerializeData',deSerializeData);
    $provide.value('deSerializeProfiles',deSerializeProfiles);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      extractData = $injector.get('cowq.extractData');
    });

  });

  describe('test the functionality of cowq.extractData', function () {
    it('should check default data', function () {
      expect(extractData).toBeDefined();
      expect(cacheByFarm).toBeDefined();
      expect(deSerializeData).toBeDefined();
      expect(deSerializeProfiles).toBeDefined();
    });
    it('execute when no farm', function () {
      var data = 'No farm';
      expect(extractData(data)).toBeUndefined();
    });
    it('execute when farm', function () {
      var data = {};
      data.cows = {};
      data.codeSetsSerialized = '';
      data.writeMessagePermission = 1;

      extractData(data);

      expect(cacheByFarm).toHaveBeenCalled();
      expect(deSerializeData).toHaveBeenCalled();
      expect(deSerializeProfiles).toHaveBeenCalled();
    });
  });
});