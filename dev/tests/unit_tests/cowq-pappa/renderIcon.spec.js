'use strict';
describe('cowq.renderIcon tests', function () {

  var $rootScope,
      renderIcon,
      setIncompleteImage = jasmine.createSpy('setIncompleteImage'),
      drawSprite = jasmine.createSpy('drawSprite');

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('util.setIncompleteImage',setIncompleteImage);
    $provide.value('drawSprite',drawSprite);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      renderIcon = $injector.get('cowq.renderIcon');
    });
  });

  describe('test the functionality of cowq.renderIcon', function () {
    it('should check default data', function () {
      expect(renderIcon).toBeDefined();
      expect(setIncompleteImage).toBeDefined();
      expect(drawSprite).toBeDefined();
    });
    it('execute when index > 0', function () {
      var data = {},
          index = 1,
          cow = {},
          element = {};

      cow.markBySign = 'test';
      cow.notify = 'notifyTest';
      cow.markByUser = 'testMarkByUser';

      data.myName = 'testMarkByUser';

      renderIcon(data, index, cow, element);

      expect(drawSprite).toHaveBeenCalled();
    });
    it('execute when index < 0', function () {
      var data = {},
          index = -1,
          cow = {},
          element = {};

      cow.markBySign = 'test';
      cow.notify = 'notifyTest';
      cow.markByUser = 'testMarkByUser';

      data.myName = 'testMarkByUser';

      renderIcon(data, index, cow, element);

      expect(setIncompleteImage).toHaveBeenCalled();
    });
    it('execute when index = 0', function () {
      var data = {},
          index = 0,
          cow = {},
          element = {};

      cow.markBySign = 'test';
      cow.notify = 'notifyTest';
      cow.markByUser = 'testMarkByUser';

      data.myName = 'testMarkByUser';

      renderIcon(data, index, cow, element);

      expect(setIncompleteImage).toHaveBeenCalled();
    });
  });
});