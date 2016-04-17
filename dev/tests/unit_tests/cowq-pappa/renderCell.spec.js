'use strict';
describe('cowq.renderCell tests', function () {

  var $rootScope,
      renderCell,
      formatDate = jasmine.createSpy('formatDate'),
      getText = jasmine.createSpy('getText').and.returnValue('monday,tuesday,wednesday'),
      cowNr = jasmine.createSpy('cowNr'),
      timeDiff = jasmine.createSpy('timeDiff').and.returnValue(1),
      renderHelth = jasmine.createSpy('renderHelth'),
      translate = jasmine.createSpy('translate').and.returnValue('translated Value'),
      drawSprite = jasmine.createSpy('drawSprite'),
      element = {};

  initCommon();

  beforeEach(module('cowq', function ($provide) {
    $provide.value('util.formatDate',formatDate);
    $provide.value('cowq.getText',getText);
    $provide.value('util.cowNr',cowNr);
    $provide.value('util.timeDiff',timeDiff);
    $provide.value('util.renderHelth',renderHelth);
    $provide.value('translate',translate);
    $provide.value('drawSprite',drawSprite);
  }));

  beforeEach(function () {
    jr.storage = {};

    $.fn.appendTo = ''; /* $.fn is spied globally, you need to rest it to be able to spy in single module */

    element.empty = jasmine.createSpy('element.empty');
    element.text = jasmine.createSpy('element.text');

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      renderCell = $injector.get('cowq.renderCell');
    });
  });

  describe('test the functionality of cowq.renderCell', function () {
    it('should check default data', function () {
      expect(renderCell).toBeDefined();
      expect(getText).toBeDefined();
      expect(cowNr).toBeDefined();
      expect(timeDiff).toBeDefined();
      expect(renderHelth).toBeDefined();
      expect(translate).toBeDefined();
    });
    it('execute when profileIndex = 2', function () {
      var data = {},
          profileIndex = 2,
          time = 12000,
          cow = {};

      renderCell(data, profileIndex, time, cow, element);

      expect(cowNr).toHaveBeenCalledWith(data,cow,element);
    });
    it('execute when profileIndex = 3', function () {
      var data = {},
          profileIndex = 3,
          time = 12000,
          cow = {};

      data.groups = [];
      data.groups['test'] = {name:'testName',nr:'1'};
      cow.group = 'test';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('testName (1)');
    });
    it('execute when profileIndex = 4', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 4,
          time = 12000,
          cow = {};

      data.groups = [];
      data.groups['test'] = {name:'testName',nr:'1'};
      cow.group = 'test';

      renderCell(data, profileIndex, time, cow, element);

      expect(cowNr).toHaveBeenCalledWith(data,cow,element);
      expect($.fn.appendTo).toHaveBeenCalled();
    });
    it('execute when profileIndex = 5', function () {
      var data = {},
          profileIndex = 5,
          time = 12000,
          cow = {};

      cow.lact = 'lactTest';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('lactTest');
    });
    it('execute when profileIndex = 6', function () {
      var data = {},
          profileIndex = 6,
          time = 12000,
          cow = {};

      cow.lactS = 50000;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(-1);
    });
    it('execute when profileIndex = 7', function () {
      var data = {},
          profileIndex = 7,
          time = 1200000,
          cow = {};

      cow.lactS = 5;
      cow.lact = 5;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('0 (5)');
    });
    it('execute when profileIndex = 8', function () {
      var data = {},
          profileIndex = 8,
          time = 1200000,
          cow = {};

      cow.lactS = 5;
      cow.lact = 5;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(1);
    });
    it('execute when profileIndex = 9', function () {
      var data = {},
          profileIndex = 9,
          time = 1200000,
          cow = {};

      cow.lactS = 5;
      cow.lact = 5;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(1);
    });
    it('execute when profileIndex = 10', function () {
      var data = {},
          profileIndex = 10,
          time = 1200000,
          cow = {};

      cow.occ = [];
      cow.occ[0] = 0;
      cow.occ[1] = 1;
      cow.occ[2] = 2;
      cow.occ[3] = 3;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('0 (1,2,3)');
    });
    it('execute when profileIndex = 11', function () {
      var data = {},
          profileIndex = 11,
          time = 1200000,
          cow = {};

      cow.prev = 500;
      cow.spd = 500;
      cow.cy = 500;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(6.7);
    });
    it('execute when profileIndex = 12', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 12,
          time = 1200000,
          cow = {};

      cow.sevenDays = 4;
      cow.sumMask = 10;

      renderCell(data, profileIndex, time, cow, element);

      expect($.fn.appendTo).toHaveBeenCalled();
    });
    it('execute when profileIndex = 13', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 13,
          time = 1200000,
          cow = {};

      cow.sevenDays = 4;
      cow.sumMask = 10;

      renderCell(data, profileIndex, time, cow, element);

      expect($.fn.appendTo).toHaveBeenCalled();
    });
    it('execute when profileIndex = 14', function () {
      var data = {},
          profileIndex = 14,
          time = 1200000,
          cow = {};

      cow.sumMask = 2000;

      renderCell(data, profileIndex, time, cow, element);

      expect(renderHelth).toHaveBeenCalledWith(element,cow.sumMask);
    });
    it('execute when profileIndex = 16', function () {
      var data = {},
          profileIndex = 16,
          time = 1200000,
          cow = {};

      cow.notify = 'notify';
      cow.markBySign = 'markBySign';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('notify (markBySign)');
    });
    it('execute when profileIndex = 17', function () {
      var data = {},
          profileIndex = 17,
          time = 1200000,
          cow = {};

      cow.action = 'action';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalled();
    });
    it('execute when profileIndex = 18', function () {
      var data = {},
          profileIndex = 18,
          time = 1200000,
          cow = {};

      cow.name = 'name';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalled();
    });
    it('execute when profileIndex = 19', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 19,
          time = 1200000,
          cow = {};

      cow.name = 'name';

      renderCell(data, profileIndex, time, cow, element);

      expect(cowNr).toHaveBeenCalled();
      expect($.fn.appendTo).toHaveBeenCalled();
    });
    it('execute when profileIndex = 20', function () {
      var data = {},
          profileIndex = 20,
          time = 1200000,
          cow = {};

      data.areas = {};
      data.areas['areaId'] = {name:'testName'};
      cow.areaId = 'areaId';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('testName');
    });
    it('execute when profileIndex = 21', function () {
      var data = {},
          profileIndex = 21,
          time = 1200000,
          cow = {};

      renderCell(data, profileIndex, time, cow, element);

      expect(timeDiff).toHaveBeenCalled();
      expect(element.text).toHaveBeenCalledWith(1);
    });
    it('execute when profileIndex = 22', function () {
      var data = {},
          profileIndex = 22,
          time = 1200000,
          cow = {};

      data.areas = {};
      data.areas['areaId'] = {name:'testName'};
      cow.areaId = 'areaId';

      renderCell(data, profileIndex, time, cow, element);

      expect(timeDiff).toHaveBeenCalled();
      expect(element.text).toHaveBeenCalledWith('testName (1)');
    });
    it('execute when profileIndex = 23', function () {
      var data = {},
          profileIndex = 23,
          time = 1200000,
          cow = {};

      cow.activity = 4;

      renderCell(data, profileIndex, time, cow, element);

      expect(timeDiff).toHaveBeenCalled();
      expect(element.text).toHaveBeenCalledWith('(+)');
    });
    it('execute when profileIndex = 24', function () {
      var data = {},
          profileIndex = 24,
          time = 1200000,
          cow = {};

      cow.milkingsPerDay = 4;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(0.4);
    });
    it('execute when profileIndex = 25', function () {
      var data = {},
          profileIndex = 25,
          time = 1200000,
          cow = {};

      cow.trapString = 'test';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('X');
    });
    it('execute when profileIndex = 26', function () {
      var data = {},
          profileIndex = 26,
          time = 1200000,
          cow = {};

      cow.trapString = 'test';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('test');
    });
    it('execute when profileIndex = 27', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 27,
          time = 1200000,
          cow = {};

      cow.expectedCalvingDate = 'expectedCalvingDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 28', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 28,
          time = 1200000,
          cow = {};

      cow.lastInseminationDate = 'lastInseminationDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 29', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 29,
          time = 1200000,
          cow = {};

      cow.expectedBuildupDate = 'expectedBuildupDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 30', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 30,
          time = 1200000,
          cow = {};

      cow.expectedDryOff = 'expectedDryOff';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 31', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 31,
          time = 1200000,
          cow = {};

      cow.expectedHeatDate = 'expectedHeatDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 31', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 31,
          time = 1200000,
          cow = {};

      cow.expectedHeatDate = 'expectedHeatDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 32', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 32,
          time = 1200000,
          cow = {};

      cow.expectedInseminationDueDate = 1000;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 33', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 33,
          time = 1200000,
          cow = {};

      cow.expectedPregnancyCheck = 'expectedPregnancyCheck';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 34', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 34,
          time = 1200000,
          cow = {};

      cow.lastHeatDate = 'lastHeatDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 35', function () {
      spyOn(Date.prototype,'toLocaleDateString').and.returnValue('localeDateString');
      var data = {},
          profileIndex = 35,
          time = 1200000,
          cow = {};

      cow.latestSCCDate = 'latestSCCDate';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('localeDateString');
    });
    it('execute when profileIndex = 36', function () {
      var data = {},
          profileIndex = 36,
          time = 1200000,
          cow = {};

      cow.breed = 'breed';
      data.codeSets = [];
      data.codeSets['BreedTypes_breed'] = 'test';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('test');
    });
    it('execute when profileIndex = 37', function () {
      var data = {},
          profileIndex = 37,
          time = 1200000,
          cow = {};

      cow.hoursSinceHighActivity = 1;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(1);
    });
    it('execute when profileIndex = 38', function () {
      var data = {},
          profileIndex = 38,
          time = 1200000,
          cow = {};

      cow.latestSCC = 1;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith(1);
    });
    it('execute when profileIndex = 39', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 39,
          time = 1200000,
          cow = {};

      cow.isDryingOff = 1;

      renderCell(data, profileIndex, time, cow, element);

      expect($.fn.appendTo).toHaveBeenCalled();
      expect(drawSprite).toHaveBeenCalled();
    });
    it('execute when profileIndex = 40', function () {
      spyOn($.fn, 'appendTo');
      var data = {},
          profileIndex = 40,
          time = 1200000,
          cow = {};

      cow.toBeCulled = 1;

      renderCell(data, profileIndex, time, cow, element);

      expect($.fn.appendTo).toHaveBeenCalled();
      expect(drawSprite).toHaveBeenCalled();
    });
    it('execute when profileIndex = 41', function () {
      var data = {},
          profileIndex = 41,
          time = 1200000,
          cow = {};

      cow.relativeActivity = 'relativeActivity';

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('relativeActivity');
    });
    it('execute when profileIndex = 42', function () {
      var data = {},
          profileIndex = 42,
          time = 1200000,
          cow = {};

      cow.reproductionStatus = 1;

      renderCell(data, profileIndex, time, cow, element);

      expect(element.text).toHaveBeenCalledWith('translated Value');
    });
    [43,44,45,46,47,48,49].forEach(function(key) {
      it('execute when profileIndex = '+key, function() {
        var data = {},
            time = 1200000,
            cow = {};

        cow.notes = [];
        cow.notes[key - 43] = 'test';

        renderCell(data, key, time, cow, element);

        expect(element.text).toHaveBeenCalled();
      });
    });
  });
});