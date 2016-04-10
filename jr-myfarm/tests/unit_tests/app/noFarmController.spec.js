'use strict';
describe('noFarmController tests', function () {

  var scope,
      $rootScope,
      $window,
      self;

  initCommon();

  beforeEach(function () {
    jr.translations = {};

    inject(function (_$rootScope_, $controller,_$window_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();
      $window = _$window_;

      self = $controller('noFarmController', {
        $scope: scope,
        $window:$window
      });
    });
  });

  describe('test the functionality of noFarmController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect($window).toBeDefined();
    });
    it('retry function', function () {
      spyOn($window.location,'reload');
      scope.retry();
      expect($window.location.reload).toHaveBeenCalled();
    });
  });
});