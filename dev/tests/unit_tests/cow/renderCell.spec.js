'use strict';
describe('cow.renderCell tests', function () {

  var $rootScope,
      renderCell,
      getText = jasmine.createSpy('getText').and.returnValue({split:function(){}}),
      renderHelth = jasmine.createSpy('renderHelth'),
      drawSprite = jasmine.createSpy('drawSprite');

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cowq.getText',getText);
    $provide.value('util.renderHelth',renderHelth);
    $provide.value('drawSprite',drawSprite);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      renderCell = $injector.get('cow.renderCell');
    });

  });

  describe('test the functionality of cow.renderCell', function () {
    it('should check default data', function () {
      expect(renderCell).toBeDefined();
    });
    it('execute when profileIndex = 1', function () {
      var data = 'test',
          profileIndex = 1,
          time = '12:12',
          milking = {},
          element = {};

      element.text = jasmine.createSpy('element.text');

      renderCell(data, profileIndex, time, milking, element);
      
      expect(element.text).toHaveBeenCalled();
    });
    it('execute when profileIndex = 2', function () {
      var data = 'test',
          profileIndex = 2,
          time = '12:12',
          milking = {},
          element = {};

      element.text = jasmine.createSpy('element.text');
      milking.yield = 1;
      milking.secMilkingTime = 1;
      milking.flow = 1;

      renderCell(data, profileIndex, time, milking, element);

      expect(element.text).toHaveBeenCalled();
    });
    it('execute when profileIndex = 3', function () {
      var data = 'test',
          profileIndex = 3,
          time = '12:12',
          milking = {},
          element = {};

      element.text = jasmine.createSpy('element.text');
      element.empty = jasmine.createSpy('element.empty');
      milking.yield = 1;
      milking.secMilkingTime = 1;
      milking.flow = 1;
      milking.bmcMask = 10;

      renderCell(data, profileIndex, time, milking, element);

      expect(element.empty).toHaveBeenCalled();
    });
    it('execute when profileIndex = 4', function () {
      var data = 'test',
          profileIndex = 4,
          time = '12:12',
          milking = {},
          element = {};

      element.empty = jasmine.createSpy('element.empty');
      element.text = function(){};

      $.fn.appendTo = jasmine.createSpy('appendTo');

      milking.yield = 1;
      milking.totalYield = 1;
      milking.secMilkingTime = 1;
      milking.flow = 1;

      renderCell(data, profileIndex, time, milking, element);

      expect(element.empty).toHaveBeenCalled();
    });
    it('execute when profileIndex = 5', function () {
      var data = 'test',
          profileIndex = 5,
          time = '12:12',
          milking = {},
          element = {};

      element.text = jasmine.createSpy('element.text');

      milking.yield = 1;
      milking.secMilkingTime = 1;
      milking.flow = 1;

      renderCell(data, profileIndex, time, milking, element);

      expect(element.text).toHaveBeenCalled();
    });
    it('execute when profileIndex = 6', function () {
      var data = 'test',
          profileIndex = 6,
          time = '12:12',
          milking = {},
          element = {};

      element.empty = jasmine.createSpy('element.empty');
      element.text = jasmine.createSpy('element.text');

      milking.milkDestination = 'test';
      milking.yield = 1;
      milking.secMilkingTime = 1;
      milking.flow = 1;

      renderCell(data, profileIndex, time, milking, element);


      expect(element.text).toHaveBeenCalled();
      expect(renderHelth).toHaveBeenCalled();
    });
  });
});