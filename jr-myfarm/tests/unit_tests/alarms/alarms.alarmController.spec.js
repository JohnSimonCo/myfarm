'use strict';
describe('alarms.alarmController tests', function () {

  var scope,
      $rootScope,
      self,
      alarms,
      alert,
      confirm,
      format,
      counter = 1;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_, $controller, _confirm_,$injector) {
      jr.storage = {};
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      scope.data = {};
      scope.data.alarms = {};
      if(counter == 2){
        scope.data.alarms.perm = 0;
      }
      else {
        scope.data.alarms.perm = 2;
      }
      counter++;

      alert = jasmine.createSpy('alert');
      confirm = jasmine.createSpy('confirm').and.callFake(function(){
        return {
          then: function(callback){callback()}
        }
      });
      format = $injector.get('util.formatDate');

      self = $controller('alarms.alarmController', {
        $scope: scope,
        alert:alert,
        confirm:confirm
      });
    });
  });

  describe('test the functionality of alarms.alarmController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('scope.confirm', function () {
    it('when !hasConfirmPermission', function () {
      var alarm = {};
      scope.confirm(alarm);
      expect(alert).toHaveBeenCalled();
    });
    it('when hasConfirmPermission', function () {
      var alarm = {};
      scope.confirm(alarm);
      expect(confirm).toHaveBeenCalled();
    });
    it('when alarm.dismissDate && alarm.type === standard', function () {
      var alarm = {};
      alarm.dismissDate = "12.12.2015";
      alarm.type = "standard";
      scope.confirm(alarm);
      expect(confirm).not.toHaveBeenCalled();
    });
  });
});
