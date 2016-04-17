describe('registerDevice', function () {
  var registerDevice;
  var sendRequest;
  var getRegisterInfo;

  initCommon();
  function initRegisterDeviceFactory(platform) {

    beforeEach(module('native', function ($provide) {

      var windows = {
        location: {pathname: []},
        webkit: {
          messageHandlers: {
            app: {
              postMessage: function () {
              }
            }
          }
        }
      };
      $provide.value('nativeProtocol', platform);
      $provide.value('$window', windows);
      $provide.value('$document', [{body: {}}]);
      $provide.value('getRegisterInfo', function () {
        return true;
      });
      sendRequest = function () {
        return {
          then: function () {
            return {sendRequest: 'value'}
          }
        }
      };
      $provide.value('sendRequest', sendRequest);
      $provide.value('nativeInterface', {
        registerCallback: function () {},
        callMethod: function () {}
      })
    }));
    beforeEach(function () {

      jr.storage = {};
      inject(function (_registerDevice_) {
        registerDevice = _registerDevice_;
      })
    });
  }

  describe('Android', function () {
    var nativeProtocol = 'Android 1.0';

    initRegisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(registerDevice().then()).toEqual({sendRequest: 'value'});
    });
  });

  describe('iOS', function () {
    var nativeProtocol = 'IOS 1.0';

    initRegisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(registerDevice().then()).toEqual({sendRequest: 'value'});
    });
  });

  describe('Unknown', function () {
    var nativeProtocol = 'Unknown';

    initRegisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(registerDevice().$$state).toEqual({ status: 0});
    });
  });
});