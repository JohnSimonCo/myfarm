'use strict';
describe('milkingCell tests', function () {

  var element,
      scope,
      renderCell = jasmine.createSpy('renderCell'),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cow.renderCell',renderCell);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<milking-cell index="1"></milking-cell>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of milkingCell', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
      scope.$digest();
      expect(renderCell).toHaveBeenCalled();
    });
  });
});