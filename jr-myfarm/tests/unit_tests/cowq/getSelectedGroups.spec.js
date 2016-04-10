'use strict';
describe('getSelectedGroups tests', function () {

  var $rootScope,
      getSelectedGroups,
      $location = {};

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('$location',$location);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      getSelectedGroups = $injector.get('getSelectedGroups');
    });

  });

  describe('test the functionality of getSelectedGroups', function () {
    it('should check default data', function () {
      expect(getSelectedGroups).toBeDefined();
      expect($location).toBeDefined();
    });
    it('execute when NO selectedGroupKeys', function () {
      $location.search = jasmine.createSpy('$location.search').and.callFake(function(){
        return false;
      });

      var groups = {};
      
      expect(getSelectedGroups(groups)).toEqual([]);
    });
    it('execute when selectedGroupKeys', function () {
      $location.search = jasmine.createSpy('$location.search').and.callFake(function(){
        return {groupKeys:'1,2,3,4'};
      });

      var groups = {};
      groups.filter = jasmine.createSpy('groups.filter').and.callFake(function(callback){
        var group = {};
        group.key = 1;
        return callback(group);
      });

      expect(getSelectedGroups(groups)).toEqual(true);
    });
  });
});