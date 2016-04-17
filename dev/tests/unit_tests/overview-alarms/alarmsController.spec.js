'use strict';
describe('overview.alarmsController tests', function () {

  var scope,
      $rootScope,
      $httpBackend,
      self,
      myfarm = {},
      extractData = {};

  myfarm.data  = {};
  myfarm.data.then  = function(){
    return {then:function(callback){return callback('data');}}
  };

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      scope = _$rootScope_.$new();

      self = $controller('overview.alarmsController', {
        $scope: scope,
        myfarm: myfarm,
        'alarms.extractData': extractData
      });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of overview.alarmsController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(myfarm).toBeDefined();
      expect(extractData).toBeDefined();
    });
    it('execute myfarm.data', function () {
      expect(scope.data).toBe('data');
    });
    it('execute $on(alarms.update)', function () {
      var data = 'new data';

      spyOn(scope,'$apply').and.callThrough();
      scope.$broadcast('alarms.update',data);
      
      expect(scope.data).toBe('new data');
      expect(scope.$apply).toHaveBeenCalled();
    });
  });
});