'use strict';
describe('editUserController Controller tests', function () {

  var scope,
      self,
      data,
      $rootScope,
      $httpBackend,
      translate,
      confirm,
      alert,
      requestNewPassword,
      $window,
      saveUser,
      scrollTo,
      mockData;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_, _$window_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      $window = _$window_;

      data = {};
      data.user = {};
      data.user.id = 1;
      data.roles = [
        {id:1, checked:true},
        {id:2, checked:true},
        {id:3, checked:false}
      ];
      data.add = {};


      translate = jasmine.createSpy('translate');
      confirm = jasmine.createSpy('confirm').and.returnValue({then:function(callback){ return callback}});
      alert = jasmine.createSpy('alert');
      requestNewPassword = {};
      requestNewPassword.bind = function(){return {then:function(callback){return callback(getMockData())}};};
      saveUser = jasmine.createSpy('saveUser').and.callFake(function(){return {then:function(callback){return callback();}}});
      scrollTo = {};
      scrollTo.set = jasmine.createSpy('scrollTo.set');

      self = $controller('editUserController', {
        $scope: scope,
        data: data,
        translate: translate,
        confirm: confirm,
        alert: alert,
        'editUser.requestNewPassword': requestNewPassword,
        $window: $window,
        'editUser.saveUser': saveUser,
        scrollTo: scrollTo
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of editUserController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(translate).toBeDefined();
      expect(confirm).toBeDefined();
      expect(alert).toBeDefined();
      expect(requestNewPassword).toBeDefined();
      expect($window).toBeDefined();
      expect(saveUser).toBeDefined();
      expect(scrollTo).toBeDefined();
    });
  });
  describe('scope.reset', function () {
    it('execute', function () {
      spyOn(angular,'copy');
      scope.reset();
      expect(angular.copy).toHaveBeenCalled();
    });
  });
  describe('scope.isFormSame', function () {
    it('execute', function () {
      expect(scope.isFormSame()).toBe(true);
    });
  });
  describe('scope.isFormValid', function () {
    it('execute', function () {
      expect(scope.isFormValid()).toBe(true);
    });
  });
  describe('requestNewPassword', function () {
    it('execute when data = true', function () {
      mockData = 'true';
      scope.requestNewPassword();
      expect(translate).toHaveBeenCalledWith('E-mail with new password is sent!');
      expect(alert).toHaveBeenCalled();
    });
    it('execute when data = false', function () {
      mockData = 'false';
      scope.requestNewPassword();
      expect(translate).toHaveBeenCalledWith('Got problem sending e-mail with new password!');
      expect(alert).toHaveBeenCalled();
    });
    it('execute when NO data', function () {
      mockData = undefined;
      scope.requestNewPassword();
      expect(translate).toHaveBeenCalledWith('Got problem creating new password!');
      expect(alert).toHaveBeenCalled();
    });
  });
  describe('scope.submit', function () {
    it('execute', function () {
      scope.getFormData = function(){return {then:function(){} }};
      spyOn($window.history,'back');
      scope.submit();
      expect(saveUser).toHaveBeenCalled();
      expect($window.history.back).toHaveBeenCalled();
    });
  });
  describe('scope.extractRoles', function () {
    it('spec title', function () {
      scope.extractRoles();
      expect(scope.user.roles).toEqual([1,2]);
    });
  });

  function getMockData(){
    return mockData;
  }

});
