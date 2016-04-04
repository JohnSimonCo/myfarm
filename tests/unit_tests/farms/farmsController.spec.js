'use strict';
describe('farmsController Controller tests', function () {

  var scope,
      self,
      data,
      farmsData,
      $rootScope,
      $httpBackend;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;

      data = {};
      data.farms = [
        {id:1}
      ];

      farmsData = jasmine.createSpy('farms.data').and.returnValue({then:function(callback){return callback(data);}});

      self = $controller('farmsController', {
        $scope: scope,
        data: data,
        'farms.data': farmsData
      });
    });
  });

  describe('test the functionality of farmsController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(data).toBeDefined();
      expect(farmsData).toBeDefined();
    });
    describe('scope.setSortCol', function () {
      it('execute when col = 0', function () {
        var col = 0;

        scope.setSortCol(col);

        expect(scope.sortDir).toBe(-1);
      });
      it('execute when col != 0', function () {
        var col = 2;

        scope.setSortCol(col);

        expect(scope.sortDir).toBe(1);
        expect(scope.sortCol).toBe(2);
      });
    });
    describe('scope.refresh', function () {
      it('execute', function () {
        var event = {},
            expected;

        event.stopPropagation = jasmine.createSpy('stopPropagation');
        expected = {};
        expected.farms =[
              {id:1}
            ];

        scope.refresh(event);

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(scope.data).toEqual(expected);
        expect(scope.farms).toEqual(expected.farms);
      });
    });
  });
});
