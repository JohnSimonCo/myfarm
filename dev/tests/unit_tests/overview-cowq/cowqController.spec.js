'use strict';
describe('overview.cowqController tests', function () {

  var scope,
      $rootScope,
      self,
      $httpBackend,
      myfarm = {},
      extractData = jasmine.createSpy('extractData'),
      extractCowData = jasmine.createSpy('extractCowData');

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;

      myfarm.data = {};
      myfarm.data.then = function () {
        return {then:function(callback){return callback('test')}};
      };

      self = $controller('overview.cowqController', {
        $scope: scope,
        myfarm:myfarm,
        'cowq.extractData':extractData,
        'overview-cowq.extractCowData':extractCowData
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

  });

  describe('test the functionality of overview.cowqController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(extractData).toBeDefined();
      expect(extractCowData).toBeDefined();
    });
    it('$watchGroup [data, time]', function () {
      scope.data = 'test';
      scope.time = '15:15';
      scope.$apply();
      
      expect(extractCowData).toHaveBeenCalled();
    });
    it('$on(cowq.update)', function () {
      scope.$broadcast('cowq.update','data');

      expect(extractCowData).toHaveBeenCalled();
      expect(scope.data).toBe('data');
    });
  });
});