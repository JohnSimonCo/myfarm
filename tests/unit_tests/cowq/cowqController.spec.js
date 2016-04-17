'use strict';
describe('cowqController Controller tests', function () {

  var scope,
      self,
      data,
      $rootScope,
      $httpBackend,
      getTime,
      selectCows,
      sortCows,
      getCowClass,
      $timeout,
      updateInterval,
      hasTextInput;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_,_$timeout_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;

      getTime = jasmine.createSpy('getTime').and.returnValue('12:12');
      selectCows = jasmine.createSpy('selectCows').and.returnValue([]);
      sortCows = jasmine.createSpy('sortCows').and.returnValue([]);
      getCowClass = jasmine.createSpy('getCowClass').and.returnValue('cowClass');
      updateInterval = jasmine.createSpy('updateInterval').and.returnValue(100);
      hasTextInput = jasmine.createSpy('hasTextInput');

      data = {};

      self = $controller('cowqController', {
        $scope: scope,
        data: data,
        'util.getTime': getTime,
        'cowq.selectCows': selectCows,
        'cowq.sort': sortCows,
        getCowClass: getCowClass,
        $timeout: $timeout,
        updateInterval: updateInterval,
        hasTextInput: hasTextInput
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowqController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect($timeout).toBeDefined();
      expect(getTime).toBeDefined();
      expect(selectCows).toBeDefined();
      expect(sortCows).toBeDefined();
      expect(getCowClass).toBeDefined();
      expect(updateInterval).toBeDefined();
      expect(hasTextInput).toBeDefined();
    });
  });
  describe('readyToRender', function () {
    it('execute', function () {
      scope.profile = {};
      scope.group = {};
      scope.sort = {};
      
      expect(scope.readyToRender()).toBe(true);
    });
  });
  describe('scope.renderCows', function () {
    it('execute', function () {
      spyOn(scope,'readyToRender').and.returnValue(true);
      spyOn(scope,'selectCows');
      spyOn(scope,'sortCows');
      spyOn(scope,'render');
      spyOn(scope,'setTimeout');

      scope.renderCows();

      expect(scope.readyToRender).toHaveBeenCalled();
      expect(scope.selectCows).toHaveBeenCalled();
      expect(scope.sortCows).toHaveBeenCalled();
      expect(scope.render).toHaveBeenCalled();
      expect(scope.setTimeout).toHaveBeenCalled();
    });
  });
  describe('selectCows', function () {
    it('execute', function () {
      scope.selectCows();

      expect(scope.cows).toEqual([]);
      expect(selectCows).toHaveBeenCalled();
    });
  });
  describe('sortCows', function () {
    it('execute', function () {
      scope.sortCows();
      
      expect(sortCows).toHaveBeenCalled();
    });
  });
  describe('render', function () {
    it('execute', function () {
      spyOn(scope,'$broadcast');
      scope.render();

      expect(scope.$broadcast).toHaveBeenCalled();
    });
  });
  describe('setTimeout', function () {
    it('execute when NO scope.$timeout', function () {
      scope.setTimeout();
      $timeout.flush();
    });
    it('execute when scope.$timeout', function () {
      spyOn($timeout,'cancel');
      scope.timeout = {};
      
      scope.setTimeout();

      expect($timeout.cancel).toHaveBeenCalled();
    });
  });
  describe('$on', function () {
    it('cowq.update', function () {
      spyOn(scope,'$apply').and.callFake(function(callback){return callback()});
      spyOn(scope,'renderCows');

      scope.$broadcast('cowq.update',{test:'test'});

      expect(scope.$apply).toHaveBeenCalled();
      expect(scope.renderCows).toHaveBeenCalled();
      expect(scope.data).toEqual({test:'test'})
    });
    it('$destroy', function () {
      spyOn($timeout,'cancel');
      
      scope.timeout = {};
      scope.$broadcast('$destroy');

      expect($timeout.cancel).toHaveBeenCalled();
    });
  });
  describe('setProfile', function () {
    it('execute', function () {
      scope.setProfile('testName','testProfile');

      expect(scope.profileName).toBe('testName');
      expect(scope.profile).toBe('testProfile');
    });
  });
  describe('setSearch', function () {
    it('execute when searchPattern == scope.searchPatter', function () {
      scope.searchPattern = 'test';

      expect(scope.setSearch('test')).toBeUndefined();
    });
    it('execute when searchPattern != scope.searchPatter', function () {
      spyOn(scope,'renderCows');
      scope.searchPattern = 'test2';

      scope.setSearch('test');

      expect(scope.searchPattern).toBe('test');
      expect(scope.renderCows).toHaveBeenCalled();
    });
  });
  describe('setSort', function () {
    it('execute', function () {
      spyOn(scope,'renderCows');
      scope.sort = '';

      scope.setSort('asc');

      expect(scope.sort).toBe('asc');
      expect(scope.renderCows).toHaveBeenCalled();
    });
  });
  describe('setGroup', function () {
    it('execute', function () {
      spyOn(scope,'renderCows');
      scope.group = '';

      scope.setGroup('group1');

      expect(scope.group).toBe('group1');
      expect(scope.renderCows).toHaveBeenCalled();
    });
  });
  describe('setSelectedGroups', function () {
    it('execute', function () {
      scope.selectedGroups = '';

      scope.setSelectedGroups('group');

      expect(scope.selectedGroups).toBe('group');
    });
  });
  describe('getCowClass', function () {
    it('execute', function () {
      var cow = {};

      expect(scope.getCowClass(cow)).toBe('cowClass');
      expect(getCowClass).toHaveBeenCalled();

    });
  });
});