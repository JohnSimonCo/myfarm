'use strict';
describe('infoCell tests', function () {

  var element,
      scope,
      renderCell = jasmine.createSpy('renderCell'),
      getText = jasmine.createSpy('getText').and.returnValue({split:function(){}}),
      compile,
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
      compile = $compile;


      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<info-cell index="1"></info-cell>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
    });
  });

  describe('test the functionality of infoCell', function () {
    it('should check default data', function () {
      expect(element[0]).toBeDefined();
    });
    it('execute with NO values', function () {
      scope.$digest();
      expect(getText).toHaveBeenCalled();
      expect(renderCell).toHaveBeenCalled();
    });
  });
});