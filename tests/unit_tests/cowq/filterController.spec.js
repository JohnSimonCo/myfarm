'use strict';
describe('cowq.filterController Controller tests', function () {

  var scope,
      self,
      $rootScope,
      getSelectedGroups,
      setUserSort,
      getUserSort,
      setUserGroup,
      setUserCollapsed,
      $httpBackend,
      selectedGroups = [];

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;


      selectedGroups = ['groupOne','groupTwo','groupThree'];
      getSelectedGroups = jasmine.createSpy('getSelectedGroups').and.callFake(function(input){
        return selectedGroups;
      });
      getUserSort = jasmine.createSpy('getSelectedGroups').and.returnValue(['testProfile']);
      setUserSort = jasmine.createSpy('setUserSort');
      setUserGroup = jasmine.createSpy('setUserGroup');
      setUserCollapsed = jasmine.createSpy('setUserCollapsed');
      scope.setSelectedGroups = jasmine.createSpy('setSelectedGroups').and.callFake(function(){
        scope.selectedGroups = selectedGroups;
      });
      scope.setGroup= jasmine.createSpy('setGroup').and.callFake(function(input){
        scope.group = input;
      });
      scope.setSort = function(sort) {
        scope.sort = sort;
      };
      scope.setSearch = jasmine.createSpy('setSearch');
        
      self = $controller('cowq.filterController', {
        $scope: scope,
        getSelectedGroups:getSelectedGroups,
        getUserSort:getUserSort,
        setUserSort:setUserSort,
        setUserGroup:setUserGroup,
        setUserCollapsed:setUserCollapsed
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowq.filterController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('watchers', function () {
    it('[profileName, profile]', function () {
      scope.profileName = 'testName';
      scope.profile = ['testProfile','testProfile2','testProfile3'];
      scope.data = {};
      scope.data.groupsArray = [1,2,3];

      scope.$digest();
    });
    it('groups when available', function () {
      scope.$digest();
      scope.groups = ['testGroup','testGroup2','testGroup3'];
      scope.$digest();
      
      expect(scope.group).toBe(0);
    });
    it('groups when NOT available', function () {
      scope.$digest();
      expect(scope.group).toBe(0);
    });
  });
  describe('getProfileIndex', function () {
    it('execute', function () {
      scope.profile = {};
      scope.profile.profileIndex = [];
      scope.profile.profileIndex['test'] = 'test';
      
      expect(scope.getProfileIndex('test')).toBe('test');
    });
  });
  describe('isSelectedProfileIndex', function () {
    it('execute', function () {
      scope.profileIndex = 1;
      expect(scope.isSelectedProfileIndex(1)).toBe(true);
    });
  });
  describe('selectProfileIndex', function () {
    it('execute when selected = profileIndex', function () {
      var event = {};
      event.stopPropagation = jasmine.createSpy('event.stopPropagation');
      scope.profileIndex = 1;

      scope.selectProfileIndex(1,event);

      expect(setUserSort).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
    it('execute when selected != profileIndex', function () {
      var event = {};
      event.stopPropagation = jasmine.createSpy('event.stopPropagation');
      scope.profileIndex = 1;

      scope.selectProfileIndex(10,event);

      expect(setUserSort).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(scope.profileIndex).toBe(10);
      expect(scope.reverse).toBe(false);
    });
  });
  describe('getFieldName', function () {
    it('execute', function () {
      scope.data = {};
      scope.data.profiles = {};
      scope.data.profiles.fieldNames = ['test'];
      scope.profile = {};
      scope.profile.profileIndex = [0];
      
      expect(scope.getFieldName(0)).toBe('test');
    });
  });
  describe('cancelSearch', function () {
    it('execute', function () {
      var event = {};
      event.stopPropagation = jasmine.createSpy('event.stopPropagation');
      scope.cancelSearch(event);

      expect(scope.setSearch).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });
  describe('selectGroup ', function () {
    it('execute', function () {
      scope.selectGroup();

      expect(scope.setGroup).toHaveBeenCalled();
      expect(setUserGroup).toHaveBeenCalled();
    });
  });
  describe('getGroupName', function () {
    it('execute', function () {
      scope.data = {};
      scope.data.groups = {};
      scope.data.groups.test = {};
      scope.data.groups.test.name = 'test';

      scope.group = 'test';

      expect(scope.getGroupName()).toBe('test');
    });
  });
  describe('toggleCollapse', function () {
    it('execute when scope.searchPattern is TRUE', function () {
      scope.searchPattern = true;
      
      expect(scope.toggleCollapse()).toBeUndefined();
    });
    it('execute when scope.searchPattern is NOT TRUE', function () {
      scope.searchPattern = false;

      scope.toggleCollapse();

      expect(setUserCollapsed).toHaveBeenCalled();
    });
  });
});