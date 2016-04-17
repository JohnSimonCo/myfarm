describe('appInfo tests', function () {
  var appInfo,
    location,
    storage;
    beforeEach(module('native'));

  initCommon();

  var search = {
    nativeProtocol: 'protocol',
    deviceId: 'devId',
    deviceToken: 'devTok',
    appVersion: 'appVer',
    osVersion: 'osVer',
    phoneModel: 'phoMod',
    phoneName: 'phoNam'
  };

  location = {search: function () {
    return search;
  }};

  storage = {
    set: function () {}
  };

  beforeEach(module(function ($provide) {
    jr.storage= {};

    $provide.value('$location', location);
    $provide.value('nativeInterface', {
      callMethod: function () { return {} },
      registerCallback: function () { return {} }
    });
    $provide.value('storage', storage)
  }));

  beforeEach(function () {
    inject(function (_appInfo_) {
      appInfo = _appInfo_;
    })
  });

  it('return search object', function () {
    expect(appInfo).toEqual(search);
  });
});