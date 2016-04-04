'use strict';
describe('cowq.searchController Controller tests', function () {

  var scope,
      self,
      $rootScope,
      $httpBackend,
      getText,
      prompt;

  initCommon();

  beforeEach(function(){
    jr.storage= {};
  });

  beforeEach(function () {
    inject(function (_$rootScope_,$controller,_$httpBackend_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $httpBackend = _$httpBackend_;

      getText = jasmine.createSpy('cowq.getText');
      prompt = jasmine.createSpy('prompt').and.returnValue({then:function(callback){return callback('12')}});

      scope.setSearch = jasmine.createSpy('scope.setSearch');

      self = $controller('cowq.searchController', {
        $scope: scope,
        'cowq.getText': getText,
        prompt:prompt
        });
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the functionality of cowq.searchController Controller', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
    });
  });
  describe('searchclick', function () {
    it('execute', function () {
      scope.searchPattern = '1';

      scope.searchClick();

      expect(scope.setSearch).toHaveBeenCalled();
      expect(getText).toHaveBeenCalled();
      expect(prompt).toHaveBeenCalled();
    });
  });
});