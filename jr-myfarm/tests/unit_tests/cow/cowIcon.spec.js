'use strict';
describe('coIcon tests', function () {

  var element,
      scope,
      renderIcon = jasmine.createSpy('renderIcon'),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cowq.renderIcon',renderIcon);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<cow-icon cow="cow"></cow-icon>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of cowIcon', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
      scope.cow = 'test';
      scope.$digest();
      expect(renderIcon).toHaveBeenCalled();
    });
  });
});