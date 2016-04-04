'use strict';
describe('chatify tests', function () {

  var element,
      scope,
      isolatedScope,
      $httpBackend,
      escapeHtml,
      chatify = function(){return true},
      emojify = function(){return true},
      cowify = function(){return true};

  initCommon();

  beforeEach(module('chat', function ($provide) {
    $provide.value('escapeHtml',chatify);
    $provide.value('emojify',emojify);
    $provide.value('cowify',cowify);
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($rootScope,$compile,_$httpBackend_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
      $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});

      element = angular.element('<pre class="text selectable" chatify="message.text"></pre>');
      element = $compile(element)(scope);
      document.body.appendChild(element[0]);
      scope.$digest();
      isolatedScope = element.isolateScope();
    });
  });

  describe('test the functionality of chatify', function () {
    it('should check default data', function () {
      expect($(element).text()).toBe('true');
    });
  });
});