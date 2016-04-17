'use strict';
describe('actionbarController tests', function () {

  var scope,
      $rootScope,
      self,
      storage,
      logout,
      $location,
      reload,
      $window;


  initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_,$controller, _$window_, _$location_,_storage_,_logout_,_reload_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      storage = _storage_;
      logout = _logout_;
      reload = _reload_;
      $window = _$window_;
      $location = _$location_;

      self = $controller('actionbarController', {
        $scope: scope,
        $window: $window,
        $location: $location,
        storage : storage,
        logout : logout,
        reload : reload
      });
    });
  });

  describe('test the functionality of actionbarController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(scope.logout).toBeDefined();
      expect(scope.reload).toBeDefined();
      expect(scope.farmConnection).toBe('ok');
      expect(scope.connected).toBe(true);
    });
  });
  describe('$on triggers', function () {
    it('myfarm.dataUpdated when farm', function () {
      scope.farmList  = '';

      var updated = function(){
        return {
          cows: {
            myFarms: 'test'
          }
        }
      };

      $rootScope.$broadcast('myfarm.dataUpdated',{then: function(callback){return callback(updated())}});
      expect(scope.farmList).toBe('test');
    });
    it('myfarm.farmConnectionUpdate', function () {
      scope.farmConnection = '';
      $rootScope.$broadcast('myfarm.farmConnectionUpdate','test FarmConnection');
      expect(scope.farmConnection).toBe('test FarmConnection');
    });
    it('connectionError', function () {
      expect(scope.connected).toBe(true);
      $rootScope.$broadcast('connectionError');
      expect(scope.connected).toBe(false);
    });
  });
  describe('navigation', function () {
    it('navigateBack', function () {
      spyOn($window.history,'back');
      scope.navigateBack();
      expect($window.history.back).toHaveBeenCalled();
    });
    it('navigateForward', function () {
      spyOn($window.history,'forward');
      scope.navigateForward();
      expect($window.history.forward).toHaveBeenCalled();
    });
  });
  describe('changeFarm', function () {
    it('execute', function () {
      spyOn(storage,'set');
      spyOn($location,'search');

      scope.changeFarm();

      expect(storage.set).toHaveBeenCalled();
      expect($location.search).toHaveBeenCalled();
    });
  });
});