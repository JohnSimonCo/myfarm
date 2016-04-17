'use strict';
describe('alarmsController tests', function () {

  var scope,
      $rootScope,
      self,
      data,
      $httpBackend,
      $location;

  initCommon();

  beforeEach(function () {
    inject(function (_$rootScope_,$controller, _$location_,_$httpBackend_) {
      jr.storage = {};
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();
      data = mockData();
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $location.search = function(){
        return {alarmIp: '0,1,2,3,4,5'}
      };

      self = $controller('alarmsController', {
        $scope: scope,
        $location: $location,
        data: data
      });

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
    });
  });

  describe('test the functionality of alarmsController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect($location).toBeDefined();
      expect(data).toBeDefined();
    });
  });
  describe('removeNotValidIp', function () {
    it('test', function () {
      expect(scope.data).toEqual(mockData());
    });
  });
  describe('$on events', function () {
    it('alarms.update', function () {
      scope.data = {};
      $rootScope.$broadcast('alarms.update',mockData());
      expect(scope.data).toEqual(mockData());
    });
  });
});

function mockData()
{
  var temp = {};
  temp.ipDeviceMap = ['127.0.0.1','127.0.0.2'];
  temp.alarms = {};
  temp.alarms.list = [
    "127.0.0.1",
    "127.0.0.2"
  ];

  return temp;
}