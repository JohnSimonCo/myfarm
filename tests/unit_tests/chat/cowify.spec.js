'use strict';
describe('cowify tests', function () {

  var $rootScope,
      cowify;

  initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_,_cowify_) {
      $rootScope = _$rootScope_;
      cowify = _cowify_;
    });
  });

  describe('test the functionality of cowify', function () {
    it('should check default data', function () {
      expect(cowify).toBeDefined();
    });
    it('execute', function () {
      var expected = '<a href="#/cowq/cow/1">1</a>';
      $rootScope.data = {};
      $rootScope.data.cows = {};
      $rootScope.data.cows.cows = [
        {nr:1},
        {nr:2},
        {nr:3}
      ];

      expect(cowify('1')).toBe(expected);
    });
  });
});