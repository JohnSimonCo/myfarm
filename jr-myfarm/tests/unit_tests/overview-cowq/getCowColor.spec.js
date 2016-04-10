'use strict';
describe('getCowColor tests', function () {

  var $rootScope,
      getCowColor,
      cowClass = 'overdue',
      getCowClass = jasmine.createSpy('getCowClass').and.callFake(function(){
        return getClass();
      });

  initCommon();

  beforeEach(module('overviewCowq', function ($provide) {
    $provide.value('getCowClass',getCowClass);
  }));

  beforeEach(function () {
    inject(function (_$rootScope_, $injector) {
      $rootScope = _$rootScope_.$new();
      getCowColor = $injector.get('getCowColor');
    });
  });

  describe('getCowColor', function () {
    it('should check default data', function () {
      expect(getCowColor).toBeDefined();
    });
    it('run when overdue', function () {
      var cow = [],
          time = '15:15';

      expect(getCowColor(cow,time)).toBe('red');
    });
    it('run when nevermilked / permission', function () {
      cowClass = 'nevermilked';
      var cow = [],
          time = '15:15';

      expect(getCowColor(cow,time)).toBe('yellow');
    });
    it('run when nopermission', function () {
      cowClass = 'nopermission';
      var cow = [],
          time = '15:15';

      expect(getCowColor(cow,time)).toBe('white');
    });
    it('run when passthrough / feedonly', function () {
      cowClass = 'passthrough';
      var cow = [],
          time = '15:15';

      expect(getCowColor(cow,time)).toBe('green');
    });
  });

  function getClass(){
    return cowClass;
  }
});
