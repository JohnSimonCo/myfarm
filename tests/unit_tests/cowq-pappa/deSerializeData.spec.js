'use strict';
describe('cowq.deSerializeData tests', function () {

  var $rootScope,
      deSerializeData,
      CowqData,
      setCowsToGroups = jasmine.createSpy('setCowsToGroups'),
      getTime = jasmine.createSpy('getTime'),
      JsSerilz = jasmine.createSpy('JsSerilz').and.returnValue({
            getInt:function(){return 1},
            getString: function(){return '1'}
          });

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('cowq.CowqData',CowqData);
    $provide.value('cowq.setCowsToGroups',setCowsToGroups);
    $provide.value('util.getTime',getTime);
    $provide.value('JsSerilz',JsSerilz);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      deSerializeData = $injector.get('cowq.deSerializeData');
    });

  });

  describe('test the functionality of cowq.deSerializeData', function () {
    it('should check default data', function () {
      expect(deSerializeData).toBeDefined();
      expect(CowqData).toBeDefined();
      expect(setCowsToGroups).toBeDefined();
      expect(getTime).toBeDefined();
    });
    it('execute', function () {
      spyOn($,'extend');
      
      var data = {},
          codeSets = {},
          writeMessagePermission = {};

      data.openGateSecLeft = 1;
      data.serializedData = {};
      data.waitAreas = [];
      data.vmsAreas = [];
      data.oldOpenGate = 'one,two,three';
      data.delProUsers = 'yes';
      data.userCols = [];

      expect(deSerializeData(data, codeSets, writeMessagePermission)).toBeDefined();

      expect($.extend).toHaveBeenCalled();
      expect(setCowsToGroups).toHaveBeenCalled();
    });
  });

  CowqData = jasmine.createSpy('CowqData').and.callFake(function(){
    var temp = {};
    temp.areas = [
      {id:'test1',type:0},
      {id:'test2',type:1}
    ];
    return temp;
  })
});