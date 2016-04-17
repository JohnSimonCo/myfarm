'use strict';
describe('farms.deSerialize tests', function () {

  var $rootScope,
      deSerialize,
      analyzeCleanings = jasmine.createSpy('analyzeCleanings'),
      hr2 = jasmine.createSpy('hr2'),
      getFarmStyle = jasmine.createSpy('getFarmStyle');

  initCommon();

  beforeEach(module('farms', function ($provide) {
    $provide.value('analyzeCleanings',analyzeCleanings);
    $provide.value('hr2',hr2);
    $provide.value('getFarmStyle',getFarmStyle);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      deSerialize = $injector.get('farms.deSerialize');
    });

  });

  describe('test the functionality of farms.deSerialize', function () {
    it('should check default data', function () {
      expect(deSerialize).toBeDefined();
    });
    it('execute', function () {
      var data = {};

      data.farms = [
        {
          status:4,
          vcPreName: 'test1',
          ipAddress:'127.0.0.1'
        },
        {
          name:'test3',
          vcPreName: 'test3',
          vcVersion:'12345678',
          status:2,
          state: 1,
          nrCows: 1,
          nrRedCows: 1,
          nrYellowCows: 1,
          nrWhiteCows: 1,
          milkingCows: 1,
          nrCleaingsLast24:[
            {vmsName:'test1'},
            {vmsName:'test2'}
          ],
          nrFatalAlarms: 1,
          nrUserNotAlarms: 2
        }
      ];

      expect(deSerialize(data)).toBeDefined();
    });
  });
});