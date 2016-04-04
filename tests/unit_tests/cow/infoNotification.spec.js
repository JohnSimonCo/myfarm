'use strict';
describe('infoNotification tests', function () {

  var element,
      scope,
      renderCell = jasmine.createSpy('renderCell'),
      getText = jasmine.createSpy('getText').and.returnValue(''),
      $httpBackend;

  initCommon();

  beforeEach(module('cow', function ($provide) {
    $provide.value('cowq.renderCell',renderCell);
    $provide.value('cowq.getText',getText);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<info-notification></info-notification>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);

      scope.data = 'test data';
      scope.time = 'test time';
      scope.cow = {};
      scope.cow.notify = 'test';
      scope.cow.markByUser = 'test';

      scope.$digest();
    });
  });

  describe('test the functionality of infoNotification', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute', function () {
      scope.$digest();
      expect(getText).toHaveBeenCalled();
    });
  });
});