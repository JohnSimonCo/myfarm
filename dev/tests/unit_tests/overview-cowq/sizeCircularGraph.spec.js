'use strict';
describe('sizeCircularGraph tests', function () {

  var element,
      scope,
      $httpBackend;

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      scope.cowGroups = [];
      element = angular.element('<div size-circular-graph></div size-circular-graph>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of sizeCircularGraph', function () {
    it('should check default data', function () {
      expect(element[0].width).toBe(0);
      expect(element[0].height).toBe(0);
    });
  });
});