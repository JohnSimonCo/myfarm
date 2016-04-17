describe('unregisterDevice', function () {
  var unregisterDevice;
  var sendRequest;
  var getRegisterInfo;

  initCommon();

  function initUnregisterDeviceFactory(platform) {

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
      inject(function (_unregisterDevice_) {
        unregisterDevice = _unregisterDevice_;
      })
    });
  }

  describe('Android', function () {
    var nativeProtocol = 'Android 1.0';

    initUnregisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(unregisterDevice().then()).toEqual({sendRequest: 'value'});
    });
  });

  describe('iOS', function () {
    var nativeProtocol = 'IOS 1.0';

    initUnregisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(unregisterDevice().then()).toEqual({sendRequest: 'value'});
    });
  });

  describe('Unknown', function () {
    var nativeProtocol = 'Unknown';

    initUnregisterDeviceFactory(nativeProtocol);

    it('returns state', function () {
      expect(unregisterDevice().$$state).toEqual({ status: 0});
    });
  });
});