'use strict';
describe('circularGraph tests', function () {

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

      scope.cowGroups = [
        {amount:1},
        {amount:1},
        {amount:1}
      ];

      element = angular.element('<circular-graph graph-data="cowGroups" width="200" height="200"></circular-graph>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of circularGraph', function () {
    it('should check loading', function () {
      var isolatedScope = element.scope();
      expect(isolatedScope).toBeDefined();
    });
  });
});