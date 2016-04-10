'use strict';
describe('extractData tests', function () {

  var $rootScope,
      extractData,
      getTime = function(){return '12:12'},
      cowqSnapshot,
      findIndex = jasmine.createSpy('findIndex').and.returnValue(1),
      getItem = jasmine.createSpy('getItem').and.returnValue(1);

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('util.getTime',getTime);
    $provide.value('cowqSnapshot',cowqSnapshotMock);
    $provide.value('util.findIndex',findIndex);
    $provide.value('util.getItem',getItem);
  }));

  beforeEach(function () {
    jr.storage = {};
    inject(function (_$rootScope_,$injector) {
      $rootScope = _$rootScope_;
      extractData = $injector.get('cow.extractData');
    });
  });

  describe('test the functionality of extractData', function () {
    it('should check default data', function () {
      expect(extractData).toBeDefined();
    });
    it('execute', function () {
      var data = {},
          expected;
      
      expected = {
        id: 1,
        nr: 1,
        time: '12:12',
        data: {
          profiles: {},
          cows: [1]
        },
        cows: [1, {}],
        cow: 1,
        index: 0
      };

      data.profiles = {};
      data.cows = [1];

      expect(extractData(data,1,1)).toEqual(expected);
    });
  });
});

function cowqSnapshotMock() {
    return [
      {}
    ];
}