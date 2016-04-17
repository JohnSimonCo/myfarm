'use strict';
describe('cowq.CowqData tests', function () {

  var $rootScope,
      CowqData,
      format = jasmine.createSpy('format').and.callFake(function(input){
        return function(sd){
          input[0].groups[0] = input[0].groups[0]();
          input[1].areas[0] = input[1].areas[0]();
          input[2].cows[0] = input[2].cows[0](sd);
          return input
        }
      }),
      Group = jasmine.createSpy('Group').and.returnValue('group'),
      Area = jasmine.createSpy('Area').and.returnValue('area'),
      deSerializeCow = jasmine.createSpy('deSerializeCow').and.returnValue('yes'),
      getTime = jasmine.createSpy('getTime');

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('j$SerilzFormat',format);
    $provide.value('cowq.Group',Group);
    $provide.value('cowq.Area',Area);
    $provide.value('cowq.deSerializeCow',deSerializeCow);
    $provide.value('util.getTime',getTime);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      CowqData = $injector.get('cowq.CowqData');
    });

  });

  describe('test the functionality of cowq.CowqData', function () {
    it('should check default data', function () {
      expect(CowqData).toBeDefined();
      expect(Group).toBeDefined();
      expect(Area).toBeDefined();
      expect(deSerializeCow).toBeDefined();
      expect(getTime).toBeDefined();
    });
    it('execute', function () {
      var test,
          expected;
      test = {
        getInt:function(){return 1}
      };
      expected = [
        {groups: ['group']},
        {areas: ['area']},
        {cows: ['yes', 'hasMore']}
      ];

      expect(CowqData(test)).toEqual(expected);
    });
  });
});