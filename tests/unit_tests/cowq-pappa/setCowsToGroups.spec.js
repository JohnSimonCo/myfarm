'use strict';
describe('cowq.setCowsToGroups tests', function () {

  var $rootScope,
      setCowsToGroups,
      getItem = jasmine.createSpy('getItem');

      initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('util.getItem',getItem);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      setCowsToGroups = $injector.get('cowq.setCowsToGroups');
    });

  });

  describe('test the functionality of cowq.setCowsToGroups', function () {
    it('should check default data', function () {
      expect(setCowsToGroups).toBeDefined();
      expect(getItem).toBeDefined();
    });
    it('execute', function () {
      var data = {};

      data.cows = [
        {
          group:1,
          groupsOrginal:'orginalGroup'
        }
      ];

      data.groupsOrginal = {};
      data.groupsOrginal.filter = function(callback){
        var temp = {};
        temp.cows = [1,2,3];

        return callback(temp);
      };

      setCowsToGroups(data);
      expect(data.groupsArray).toEqual([1,2,3]);
    });
  });
});