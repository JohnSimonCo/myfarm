'use strict';
describe('overviewController tests', function () {

  var scope,
      $rootScope,
      self,
      getTime = jasmine.createSpy('getTime').and.returnValue(100),
      $timeout,
      updateInterval = 10;

  initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_,$controller,_$timeout_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $timeout = _$timeout_;

      self = $controller('overviewController', {
        $scope: scope,
        'util.getTime':getTime,
        $timeout:$timeout,
        updateInterval:updateInterval
      });
    });
  });

  describe('test the functionality of overviewController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(getTime).toBeDefined();
      expect($timeout).toBeDefined();
    });
  });
  describe('updateTime', function () {
    it('execute', function () {
      expect(getTime).toHaveBeenCalled();
    });
  });
});