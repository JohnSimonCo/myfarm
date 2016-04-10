'use strict';
describe('hoverTemplate tests', function () {

  var element,
      scope,
      $httpBackend,
      $timeout,
      controller,
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

      element = angular.element('<span hover-display><div hover-target><hover-template></hover-template></div></span>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      controller = element.controller('hoverDisplay');
    });
  });

  describe('test the functionality of hoverTarget', function () {
    it('should check default data', function () {
      expect(element).toBeDefined();
      expect(controller).toBeDefined();
    });
    it('execute', function () {
      var hoverTarget = element.find('div').children()[0];
      expect(hoverTarget).toBeDefined();
    });
  });
});
