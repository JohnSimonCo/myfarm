'use strict';
describe('cowGraph tests', function () {

  var element,
      scope,
      renderGraph = jasmine.createSpy('renderGraphNew'),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cow.renderGraphNew', renderGraph);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<div cow-graph class="full-height"></div>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of cowGraph', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
    scope.cow = 'test';
    scope.cowData = 'test';

    scope.$digest();
    expect(renderGraph).toHaveBeenCalled();
    });
  });
});