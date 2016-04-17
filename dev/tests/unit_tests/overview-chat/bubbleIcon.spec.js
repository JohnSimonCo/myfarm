'use strict';
describe('bubbleIcon tests', function () {

  var element,
      scope,
      isolatedScope,
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

      element = angular.element('<bubble-icon unread-count="unread.length"><img src="/Resources/jr-chat.png" class="icon" style="display:none"><div class="unread-count" ng-class="{\'no-unread\': unread.length < 1}"></div></bubble-icon>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      isolatedScope = element.scope();
    });
  });

  describe('test the functionality of bubbleIcon', function () {
    it('should check loading', function () {
      var img = element.find('img'),
          div = element.find('div');

      img.load();
      expect(div.css('display')).toBe('block');
    });
    it('should check loading', function () {
      var img = element.find('img'),
          div = element.find('div');

      img.css('display','none');
      img.load();

      expect(div.css('width')).toBe('384px');
      expect(div.css('height')).toBe('0px');
      expect(div.css('font-size')).toBe('16px');
      expect(div.css('line-height')).toBe('normal');
    });
  });
});