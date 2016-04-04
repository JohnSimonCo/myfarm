'use strict';
describe('messageText tests', function () {

  var element,
      scope,
      chatify = jasmine.createSpy('chatify'),
      isolatedScope,
      $httpBackend;

  initCommon();

  beforeEach(module('overviewChat', function ($provide) {
    $provide.value('chatify',chatify);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      scope.testValue = 'test';
      element = angular.element('<pre class="text" message-text="testValue"></pre>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      isolatedScope = element.scope();
    });
  });

  describe('test the functionality of messageText', function () {
    it('should check loading', function () {
      expect(chatify).toHaveBeenCalled();
    });
  });
});