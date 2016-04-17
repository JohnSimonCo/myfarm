'use strict';
describe('percentGraph tests', function () {

  var element,
      elemenetScope,
      scope,
      $httpBackend,
      format = jasmine.createSpy('format');

  initCommon();

  beforeEach(module('farms', function ($provide) {
    $provide.value('util.format',format);
  }));


  beforeEach(function () {
    jr.storage = {};

    spyOn($.fn, "appendTo");

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      scope.farm = {};
      scope.farm.nrCows = 2;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<percent-graph farm="{nrCows:45,nrRedCows:10, nrYellowCows:15, nrWhiteCows:20}"></percent-graph>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      elemenetScope = element.scope();
    });
  });

  describe('test the functionality of percentGraph', function () {
    it('should check default data', function () {
      expect(element).toBeDefined();
      expect(elemenetScope).toBeDefined();
    });
    it('execute checking', function () {
      expect($.fn.appendTo).toHaveBeenCalled();
    });
  });
});