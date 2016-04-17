'use strict';
describe('appType', function () {
  var appType;

  initCommon();

  beforeEach(module('native'));

  describe('default nativeProtocol', function () {
    var nativeProtocol = '';
    injectFactory(nativeProtocol);

    it('returns unknown value', function () {
      expect(appType).toEqual('Unknown');
    });
  });

  describe('IOS native protocol', function () {
    var nativeProtocol = 'IOS 1.0';
    injectFactory(nativeProtocol);

    it('returns IOS value', function () {
      expect(appType).toEqual('IOS');
    });
  });

  describe('Android native protocol', function () {
    var nativeProtocol = 'Android 1.0';
    injectFactory(nativeProtocol);

    it('returns IOS value', function () {
      expect(appType).toEqual('Android');
    });
  });

  function injectFactory(nativeProtocol) {
    beforeEach(module(function ($provide) {
      provideMocks($provide, nativeProtocol);
    }));

    beforeEach(function () {
      jr.storage = {};

      inject(function (_appType_) {
        appType = _appType_;
      })
    });
  }

  function provideMocks($provide, nativeProtocol) {
    $provide.value('nativeInterface', {
      callMethod: function () {
        return {}
      },
      registerCallback: function () {
        return {}
      }
    });
    $provide.value('nativeProtocol', nativeProtocol)
  }
});