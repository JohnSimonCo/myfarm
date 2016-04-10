describe('native protocol', function () {
  var nativeProtocol,
    appInfo = {};

  beforeEach(module('native'));

  initCommon();

  beforeEach(module(function ($provide) {
    $provide.value('appInfo', appInfo)
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_nativeProtocol_) {
      nativeProtocol = _nativeProtocol_;
    })
  });

  it('native protocol unknown', function () {
    expect(nativeProtocol).toEqual('Unknown');
  });
});
