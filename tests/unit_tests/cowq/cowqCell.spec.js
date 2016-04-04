'use strict';
describe('cowqCell tests', function () {

  var element,
      scope,
      renderCell = jasmine.createSpy('renderCell'),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cowq.renderCell',renderCell);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      scope.data = {};
      scope.profile = {};
      scope.profile.profileIndex = 1;
      scope.time = '12:12';
      scope.cow = {};

      element = angular.element('<cowq-cell></cowq-cell>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of cowqCell', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
      scope.$digest();
      expect(renderCell).toHaveBeenCalled();
    });
  });
});