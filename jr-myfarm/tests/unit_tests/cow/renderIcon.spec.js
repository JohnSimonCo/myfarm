'use strict';
describe('cow.renderIcon tests', function () {

  var $rootScope,
      setIncompleteImage = jasmine.createSpy('setIncompleteImage'),
      renderIcon;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('util.setIncompleteImage',setIncompleteImage);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      renderIcon = $injector.get('cow.renderIcon');
    });

  });

  describe('test the functionality of cow.renderIcon', function () {
    it('should check default data', function () {
      expect(renderIcon).toBeDefined();
    });
    it('execute', function () {
      renderIcon('','','','');
      expect(setIncompleteImage).toHaveBeenCalledWith('',0,70,70)
    });
  });
});