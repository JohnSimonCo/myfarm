'use strict';
describe('changeServerController tests', function () {

  var scope,
      $rootScope,
      self,
      $location,
      $window,
      $modal = jasmine.createSpy('modal').and.callFake(function(){
        return {
          result: {
            then: jasmine.createSpy('modal.result.then').and.callFake(function(){
              return {then:jasmine.createSpy('modal.result.then').and.callFake(function(){
                return {then:jasmine.createSpy('modal.result.then')
                }})};
            })
          }
        }
      }),
      getServers,
      convertServerUrlToAppUrl,
      validateServerUrl,
      setServer,
      testUrl = 'http://test.com';

    initCommon();

  beforeEach(function () {

    inject(function (_$rootScope_, $controller, _convertServerUrlToAppUrl_, _validateServerUrl_, _setServer_) {
      $rootScope = _$rootScope_;
      scope = _$rootScope_.$new();

      $window = {};
      $window.location = {};
      $window.location.origin = '';
      convertServerUrlToAppUrl = _convertServerUrlToAppUrl_;
      setServer = _setServer_;
      validateServerUrl = _validateServerUrl_;
      getServers = function() {
        return {
          then: function (callback) {
            var servers = {};
            servers.url = testUrl;

            servers.filter = function (input) {
              if(input(servers)){
                return false;
              }
              else {
                return testUrl;
              }

            };
            callback(servers);
          }
        }
      };

      self = $controller('changeServerController', {
        $scope: scope,
        $window: $window,
        $location: $location,
        $modal: $modal,
        convertServerUrlToAppUrl: convertServerUrlToAppUrl,
        getServers: getServers,
        setServer: setServer,
        validateServerUrl: validateServerUrl
      });
    });
  });

  describe('test the functionality of changeServerController', function () {
    it('should check default data', function () {
      expect(scope).toBeDefined();
      expect(convertServerUrlToAppUrl).toBeDefined();
      expect(getServers).toBeDefined();
      expect(setServer).toBeDefined();
      expect(validateServerUrl).toBeDefined();
    });
    it('ChangeServer', function () {
      $window.location.origin = testUrl;
      scope.changeServer();
      expect($modal).toHaveBeenCalled();
    });
  });

});


function mockBroadcasts() {
  return function () {};
}