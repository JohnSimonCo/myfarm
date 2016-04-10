'use strict';
describe('cowq.deSerializeCow tests', function () {

  var $rootScope,
      deSerializeCow,
      cowNoteLock = 0,
      trapMaskMockValue = 1,
      trapTimeLock = 0,
      Cow,
      getText = jasmine.createSpy('getText').and.returnValue('monday,tuesday,wednesday'),
      JsSerilz = jasmine.createSpy('JsSerilz').and.returnValue({
            getInt:function(){return 1},
            getString: function(){return '1'}
          });

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('cowq.Cow',Cow);
    $provide.value('cowq.getText',getText);
    $provide.value('JsSerilz',JsSerilz);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      deSerializeCow = $injector.get('cowq.deSerializeCow');
    });

  });

  describe('test the functionality of cowq.deSerializeCow', function () {
    it('should check default data', function () {
      expect(deSerializeCow).toBeDefined();
      expect(Cow).toBeDefined();
      expect(getText).toBeDefined();
      expect(JsSerilz).toBeDefined();
    });
    it('execute when trapMask&1 = 0', function () {
      var sd = {},
          time = 1200,
          cow;

      cow = deSerializeCow(sd, time);

      expect(cow.trapMask).toBe(0);
    });
    it('execute when trapMask&1 != 0', function () {
      var sd = {},
          time = 1200,
          cow;

      trapTimeLock = 1;
      trapMaskMockValue = 4093;
      cow = deSerializeCow(sd, time);

      expect(cow.trapString).toBe('13/10-14/10');
      expect(cow.trapMask).toBe(4093);
    });
    it('execute when trapMask&1 != 0 and cow.note', function () {
      var sd = {},
          time = 1200,
          cow;

      cowNoteLock = 1;
      trapTimeLock = 1;
      trapMaskMockValue = 4093;
      cow = deSerializeCow(sd, time);

      expect(cow.trapString).toBe('13/10-14/10');
      expect(cow.trapMask).toBe(4093);
      expect(JsSerilz).toHaveBeenCalled();
    });
  });

  /////////////////////////

  function trapMaskMock(){
    return trapMaskMockValue;
  }

  Cow = jasmine.createSpy('Cow').and.callFake(function(){
    this.occ = [];
    this.trapMask = trapMaskMock();
    this.trapEndTime = 1;
    if (trapTimeLock){
      this.trapStartTime = 'October 13, 2014 11:13:00';
      this.trapEndTime = 'October 14, 2014 11:13:00';
    }
    if(cowNoteLock){
      this.note = 'test'
    }
    this.occ['map'] = function(){return [1,2,3] };
  })
});