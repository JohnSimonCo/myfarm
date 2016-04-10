'use strict';
describe('milkingIcon tests', function () {

  var element,
      scope,
      renderIcon = jasmine.createSpy('renderIcon'),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cow.renderIcon',renderIcon);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<milking-icon></milking-icon>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of milkingIcon', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
      scope.$digest();
      expect(renderIcon).toHaveBeenCalled();
    });
  });
});