'use strict';
describe('dropdownController tests', function () {

  var scope,
      $rootScope,
      self;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_, $controller) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

        self = $controller('dropdownController', {
        $scope: scope
      });
    });
  });

  describe('test the functionality of dropdownController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('toggle', function () {
    it('when isExpanded = false', function () {
      scope.isExpanded = false;
      scope.toggle();
      expect(scope.isExpanded).toBe(true);
    });
    it('when isExpanded = true', function () {
      scope.isExpanded = true;
      scope.toggle();
      expect(scope.isExpanded).toBe(false);
    });
  });
  describe('expand', function () {
    it('test', function () {
      scope.isExpanded = false;
      scope.expand();
      expect(scope.isExpanded).toBe(true);
    });
  });
  describe('collapse', function () {
    it('test', function () {
      scope.isExpanded = true;
      scope.collapse();
      expect(scope.isExpanded).toBe(false);
    });
  });
});