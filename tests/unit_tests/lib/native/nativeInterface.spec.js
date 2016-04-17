describe('nativeInterface', function () {
  var nativeInterface;
  var window;

  initCommon();

  window = {
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

  describe('native protocol IOS', function () {
    var nativeProtocol = 'IOS 1.0';

    initNativeProtocolFactory(nativeProtocol);

    it('force update for IOS', function () {
      spyOn(window.webkit.messageHandlers.app, 'postMessage');
      nativeInterface.forceUpdate();
      expect(window.webkit.messageHandlers.app.postMessage).toHaveBeenCalled();
    });
  });

  describe('native protocol Unknown', function () {
    var nativeProtocol = 'Unknown';

    initNativeProtocolFactory(nativeProtocol);

    it('force update not defined for Unknown', function () {
      spyOn(window.webkit.messageHandlers.app, 'postMessage');
      expect(nativeProtocol.forceUpdate).not.toBeDefined();
    });
  });

  function initNativeProtocolFactory(platform) {
    beforeEach(module('native', function ($provide) {
      $provide.value('nativeProtocol', platform);
      $provide.value('$window', window);
      $provide.value('$document', [{body: {}}]);
    }));

    beforeEach(function () {
      jr.storage = {};

      inject(function (_nativeInterface_) {
        nativeInterface = _nativeInterface_;
      })
    });
  }
});