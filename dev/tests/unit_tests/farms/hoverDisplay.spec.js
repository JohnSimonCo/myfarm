'use strict';
describe('hoverDisplay tests', function () {

  var element,
      scope,
      isolatedScope,
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

      element = angular.element('<div hover-display><div class="hover-display"></div></div>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      isolatedScope = element.isolateScope();
      controller = element.controller('hoverDisplay');
    });
  });

  describe('test the functionality of hoverDisplay', function () {
    it('should check default data', function () {
      expect(element).toBeDefined();
    });
    it('display and mousemove', function () {
      controller.display();
      $timeout.flush();
      element.triggerHandler({
        type:'mousemove',
        pageX:250,
        pageY:250
      });

      expect($.fn.appendTo).toHaveBeenCalled();
    });
    it('hide and mousemove', function () {
      controller.hide();

      expect($.fn.appendTo).toHaveBeenCalled();
    });
  });
});