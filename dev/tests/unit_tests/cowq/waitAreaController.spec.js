'use strict';
describe('cowq.waitAreaController Controller tests', function () {

  var scope,
      self,
      data,
      $rootScope,
      $httpBackend,
      openWaitArea,
      closeWaitArea,
      getText,
      confirm;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      openWaitArea = jasmine.createSpy('openWaitArea').and.returnValue({then:function(callback){return callback()}});
      closeWaitArea = jasmine.createSpy('closeWaitArea');
      getText = jasmine.createSpy('getText');
      confirm = jasmine.createSpy('confirm').and.returnValue({then:function(callback){return callback()}});

      scope.data = {};

      self = $controller('cowq.waitAreaController', {
        $scope: scope,
        'cowq.openWaitArea': openWaitArea,
        'cowq.closeWaitArea': closeWaitArea,
        'cowq.getText': getText,
        'confirm': confirm
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowq.waitAreaController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(openWaitArea).toBeDefined();
      expect(closeWaitArea).toBeDefined();
      expect(getText).toBeDefined();
      expect(confirm).toBeDefined();
    });
  });
  describe('$watchGroup([data.waitAreas, data.waitAreaStateTime]', function () {
    it('execute', function () {
      scope.data.waitAreas = 'waitAreas';
      scope.data.waitAreaStateTime = 'waitAreaStateTime';

      scope.$digest();
    });
    it('execute when waitAreaStateTime', function () {
      scope.data.waitAreas = 'waitAreas';
      scope.data.waitAreaStateTime = null;

      scope.$digest();
      
      expect(scope.data.openGate).toEqual({});
    });
    it('execute when scope.data.render', function () {
      scope.render = jasmine.createSpy('render');
      scope.data.waitAreas = 'waitAreas';
      scope.data.waitAreaStateTime = null;
      scope.data.render = {};

      scope.$digest();

      expect(scope.data.openGate).toEqual({});
      expect(scope.render).toHaveBeenCalled();
    });
  });
  describe('shouldShow', function () {
    it('spec title', function () {
      scope.waitAreaStateTime = 'test';
      expect(scope.shouldShow()).toBe(true);
    });
  });
  describe('scope.getClass', function () {
    it('execute when error', function () {
      expect(scope.getClass(0)).toBe('error');
    });
    it('execute when success', function () {
      expect(scope.getClass(1)).toBe('success');
    });
    it('execute when ""', function () {
      expect(scope.getClass(88)).toBe('');
    });
  });
  describe('openWaitArea', function () {
    it('execute when waitAreaStateTime = null', function () {
      scope.waitAreaStateTime = null;

      scope.openWaitArea();

      expect(confirm).toHaveBeenCalled();
      expect(openWaitArea).toHaveBeenCalled();
      expect(scope.waitAreaStateTime).toBe(null);
    });
    it('waitAreaStateTime > 0', function () {
      scope.waitAreaStateTime = 10;

      scope.openWaitArea();
      expect(scope.waitAreaStateTime).toBe(-10);
      expect(closeWaitArea).toHaveBeenCalled();
    });
  });
  describe('suite title', function () {
    it('spec title', function () {
      scope.waitAreaStateTime = 10;
      scope.time = 5;
      expect(scope.getDuration()).toBe(1);
    });
  });
  describe('scope.waitAreaClosed', function () {
    it('execute', function () {
      scope.render = jasmine.createSpy('render');
      
      expect(scope.waitAreaClosed()).toBe(3);
      expect(scope.render).toHaveBeenCalled();
    });
  });
  describe('scope.getState', function () {
    it('execute when scope.waitAreaStateTime = 0', function () {
      scope.waitAreaStateTime = 0;
      expect(scope.getState()).toBe(0);
    });
    it('execute when scope.waitAreaStateTime > 0 AND scope.waitAreaStateTime < scope.time', function () {
      scope.render = jasmine.createSpy('render');
      scope.waitAreaStateTime = 1;
      scope.time = 10;

      expect(scope.getState()).toBe(3);
      expect(scope.render).toHaveBeenCalled();
    });
    it('execute when scope.waitAreaStateTime > 0 AND scope.waitAreaStateTime > scope.time', function () {
      scope.waitAreaStateTime = 10;
      scope.time = 1;

      expect(scope.getState()).toBe(1);
    });
    it('execute when scope.waitAreaStateTime < 0', function () {
      scope.waitAreaStateTime = -10;

      expect(scope.getState()).toBe(2);
    });
    it('execute when scope.waitAreaStateTime is string', function () {
      scope.waitAreaStateTime = 'test';

      expect(scope.getState()).toBe(3);
    });
  });
});