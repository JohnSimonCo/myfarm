'use strict';
describe('cowq.selectCows tests', function () {

  var $rootScope,
      selectCows;

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      selectCows = $injector.get('cowq.selectCows');
    });
  });

  describe('test the functionality of cowq.selectCows', function () {
    it('should check default data', function () {
      expect(selectCows).toBeDefined();
    });
    it('execute', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = 'search',
          groupChoosen = {},
          selectedGroups = ['test','test1'];

      profile.profileIndex = '025';
      data.groups = {};
      data.cows = [
        {nr:0},
        {nr:1},
        {nr:2}
      ];

      selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups);
    });
    it('execute no searchPattern and cow = found', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = [{cows:[0,1]}];

      profile.profileIndex = '025';
      data.groups = {};
      data.cows = [
        {nr:0},
        {nr:1},
        {nr:2}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([{nr:1}]);
    });
    it('execute no searchPattern and cow != found', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      data.groups = {};
      data.cows = [
        {nr:10},
        {nr:11},
        {nr:12}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([{nr:10},{nr:11},{nr:12}]);
    });
    it('execute when profile groups', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.groups = [1,2,3];

      data.groups = {};
      data.cows = [
        {nr:10},
        {nr:11},
        {nr:12}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x200', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x200;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 1', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x090;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 2', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x150;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 3', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x190;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 4', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x240;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 5', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x290;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 6', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x340;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when activity = 0x380 and bitwise(>>) = 7', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.activityAndAreaMask = 0x380;
      profile.groups = [10,20,30,40,'test'];

      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          toBeCulled:false,
          reproductionStatus: 'test'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
    it('execute when cow.fetchCow&&fetchCows != true', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null,
          expected = [];

      expected[0] = {
        nr: 1,
        group: 10,
        fetchCow: false,
        areaId: 'area1'
      };

      profile.profileIndex = '025';
      profile.groups = [10,20,30,40,'test'];
      profile.areas = ['area1'];


      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          fetchCow: false,
          areaId: 'area1'
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual(expected);
    });
    it('execute when cow.fetchCow&&fetchCows != true AND ', function () {
      var data = {},
          profile = {},
          timeNow = {},
          searchPattern = null,
          groupChoosen = {},
          selectedGroups = null;

      profile.profileIndex = '025';
      profile.groups = [10,20,30,40,'test'];
      profile.areas = ['area1'];
      profile.activityAndAreaMask = 0x1e;

      data.areas = ['area1'];
      data.groups = {};
      data.cows = [
        {
          nr:1,
          group:10,
          fetchCow: false,
          toBeCulled: true,
          areaId: 'area1',
          trapMask: 0
        },
        {nr:2},
        {nr:3}
      ];

      expect(selectCows(data, profile, timeNow, searchPattern, groupChoosen, selectedGroups)).toEqual([]);
    });
  });
});