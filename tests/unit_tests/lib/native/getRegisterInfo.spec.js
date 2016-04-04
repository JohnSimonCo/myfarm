describe('getRegisterInfo', function () {
  var getRegisterInfo;

  initCommon();

  beforeEach(module('native', function ($provide) {
    $provide.value('appType', 'IOS 1.0');
    $provide.value('appInfo', {
      deviceToken: 'devTok',
      deviceId: 'devId',
      appVersion: '1.0.0',
      osVersion: '2.0.0',
      phoneModel: 'iPhone 6s',
      phoneName: 'PhoName'
    })
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_getRegisterInfo_) {
      getRegisterInfo = _getRegisterInfo_;
    })
  });

  it('should return register info', function () {
    expect(getRegisterInfo()).toEqual({ appType: 'IOS 1.0', deviceToken: 'devTok', deviceId: 'devId', appVersion: '1.0.0', osVersion: '2.0.0', phoneModel: 'iPhone 6s', phoneName: 'PhoName' });
  }); 
});