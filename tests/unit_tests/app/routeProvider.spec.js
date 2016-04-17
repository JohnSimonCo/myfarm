'use strict';
describe('routeProvider tests', function () {

  var $route,
      $rootScope,
      $location,
      $httpBackend,
      app;

  initCommon();

  beforeEach(function () {
    jr.storage = {};
    app = angular.mock.module("app");

    inject(function (_$rootScope_,_$location_,_$route_, _$httpBackend_) {
      $route = _$route_;
      $rootScope = _$rootScope_;
      $location = _$location_;
      $httpBackend = _$httpBackend_;
    });

    $httpBackend.whenPOST('/Delaval/mvc/SrvLanguage/getTextOnPage').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/SrvMyFarm/getAllData').respond(200,{});
    $httpBackend.whenPOST('/Delaval/mvc/FarmAdmin/getFarmsOnline').respond(200,{});
  });

  describe('test the paths from routeProvider', function () {
    it('initial states', function () {
      expect($route).toBeDefined();
      expect($rootScope).toBeDefined();
      expect($location).toBeDefined();
    });
    it('/', function () {
      $httpBackend.whenGET(new RegExp('templates/overview.html\\?ver=.*')).respond(200,{});
      $location.path('/');

      $rootScope.$digest();

      expect($route.routes['/'].resolve.data).toBeDefined();
    });
    it('/settings', function () {
      $httpBackend.whenGET(new RegExp('templates/settings.html\\?ver=.*')).respond(200,{});
      $location.path('/settings');

      $rootScope.$digest();

      expect($route.routes['/settings'].resolve.data).toBeDefined();
    });
    it('/version', function () {
      $httpBackend.whenGET(new RegExp('templates/version.html\\?ver=.*')).respond(200,{});
      $location.path('/version');

      $rootScope.$digest();

      expect($route.routes['/version'].resolve.data).toBeDefined();
    });
    it('/users', function () {
      $httpBackend.whenGET(new RegExp('templates/users.html\\?ver=.*')).respond(200,{});
      $location.path('/users');

      $rootScope.$digest();

      expect($route.routes['/users'].resolve.data).toBeDefined();
    });
    it('/alarms', function () {
      $httpBackend.whenGET(new RegExp('templates/alarms.html\\?ver=.*')).respond(200,{});
      $location.path('/alarms');

      $rootScope.$digest();

      expect($route.routes['/alarms'].resolve.data).toBeDefined();
    });
    it('/chat', function () {
      $httpBackend.whenGET(new RegExp('templates/chat.html\\?ver=.*')).respond(200,{});
      $location.path('/chat');

      $rootScope.$digest();

      expect($route.routes['/chat'].resolve.data).toBeDefined();
    });
    it('/cowq', function () {
      $httpBackend.whenGET(new RegExp('templates/cowq.html\\?ver=.*')).respond(200,{});
      $location.path('/cowq');

      $rootScope.$digest();

      expect($route.routes['/cowq'].resolve.data).toBeDefined();
    });
    it('/cowq/cow/:nr/:view', function () {
      $httpBackend.whenGET(new RegExp('templates/cow.html\\?ver=.*')).respond(200,{});
      $location.path('/cowq/cow/:nr/:view');

      $rootScope.$digest();

      expect($route.routes['/cowq/cow/:nr/:view'].resolve.data).toBeDefined();
    });
    it('/user/:id/edit', function () {
      $httpBackend.whenGET(new RegExp('templates/edit-user.html\\?ver=.*')).respond(200,{});
      $location.path('/user/:id/edit');

      $rootScope.$digest();

      expect($route.routes['/user/:id/edit'].resolve.data).toBeDefined();
    });
    it('/user/new', function () {
      $httpBackend.whenGET(new RegExp('templates/edit-user.html\\?ver=.*')).respond(200,{});
      $location.path('/user/new');

      $rootScope.$digest();

      expect($route.routes['/user/new'].resolve.data).toBeDefined();
    });
    it('/production', function () {
      $httpBackend.whenGET(new RegExp('templates/production.html\\?ver=.*')).respond(200,{});
      $location.path('/production');

      $rootScope.$digest();

      expect($route.routes['/production'].resolve.data).toBeDefined();
    });
    it('/robots', function () {
      $httpBackend.whenGET(new RegExp('templates/robot-state.html\\?ver=.*')).respond(200,{});
      $location.path('/robots');

      $rootScope.$digest();

      expect($route.routes['/robots'].resolve.data).toBeDefined();
    });
    it('/farms', function () {
      $httpBackend.whenGET(new RegExp('templates/farms.html\\?ver=.*')).respond(200,{});
      $location.path('/farms');

      $rootScope.$digest();

      expect($route.routes['/farms'].resolve.data).toBeDefined();
    });
  });
});