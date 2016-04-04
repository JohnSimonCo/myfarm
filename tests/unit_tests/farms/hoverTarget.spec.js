'use strict';
describe('hoverTarget tests', function () {

  var element,
      scope,
      $httpBackend,
      $timeout,
      controller,
      controllerSecond,
      $window;

  initCommon();

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_, _$timeout_, _$window_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $timeout = _$timeout_;
      $window = _$window_;

      spyOn($.fn, "appendTo");

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<span hover-display><div hover-target></div></span>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      controller = element.controller('hoverDisplay');
      controllerSecond = element.find('div').controller('hoverTarget');
    });
  });

  describe('test the functionality of hoverTarget', function () {
    it('should check default data', function () {
      expect(element).toBeDefined();
      expect(controller).toBeDefined();
      expect(controllerSecond).toBeDefined();
    });
    it('execute', function () {
      spyOn(controller,'display');
      spyOn(controller,'hide');

      controllerSecond.setTemplate();
      element.find('div').triggerHandler('mouseenter');
      
      expect(controller.display).toHaveBeenCalled();

      element.find('div').triggerHandler('mouseleave');

      expect(controller.hide).toHaveBeenCalled();
    });
  });
});
