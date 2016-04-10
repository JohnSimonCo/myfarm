'use strict';
describe('cow.milkings Controller tests', function () {

  var scope,
      self,
      cowData,
      sortMilkings,
      setUserSort,
      getUserCollapsed,
      setUserCollapsed,
      $rootScope,
      $httpBackend;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;
      cowData = jasmine.createSpy('cowData').and.returnValue({then:function(){}});
      sortMilkings = jasmine.createSpy('sortMilkings');
      setUserSort = jasmine.createSpy('setUserSort');
      getUserCollapsed = jasmine.createSpy('getUserCollapsed');
      setUserCollapsed = jasmine.createSpy('setUserCollapsed');


      self = $controller('cow.milkingsController', {
        $scope: scope,
        'cow.cowData':cowData,
        'cow.setUserSort': setUserSort,
        'cow.getUserCollapsed': getUserCollapsed,
        'cow.setUserCollapsed': setUserCollapsed,
        sortMilkings:sortMilkings
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cow.milkingsController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect('cow.cowData').toBeDefined();
      expect('cow.setUserSort').toBeDefined();
      expect('cow.getUserCollapsed').toBeDefined();
      expect('cow.setUserCollapsed').toBeDefined();
      expect('sortMilkings').toBeDefined();
    });
  });
  describe('Watchers', function () {
    xit('cowData, nr', function () {
      scope.cowData = false;
      scope.id = 1;
      scope.nr = 1;

      scope.$digest();
      
      expect(cowData).toHaveBeenCalled();
    });
    it('cowData, sort', function () {
      spyOn(scope,'$broadcast');
      scope.cowData = {};
      scope.id = 1;
      scope.sort = 1;

      scope.$digest();
      expect(sortMilkings).toHaveBeenCalled();
      expect(scope.$broadcast).toHaveBeenCalled();
    });
  });
  describe('setSortCol', function () {
    it('execute when NOT selectedSortCol', function () {
      var col = {},
          event = {};
      event.stopPropagation = jasmine.createSpy('event');

      scope.setSortCol(col,event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(setUserSort).toHaveBeenCalled();
    });
    it('execute when selectedSortCol', function () {
      var col = {},
          event = {};
      scope.isSelectedSortCol = function(){return true};
      event.stopPropagation = jasmine.createSpy('event');

      scope.setSortCol(col,event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(setUserSort).toHaveBeenCalled();
    });
  });
  describe('toggleCollapse', function () {
    it('execute', function () {
      scope.toggleCollapse();

      expect(setUserCollapsed).toHaveBeenCalled();
    });
  });
});