describe('getUserGroup', function () {
  var getUserGroup;

  initCommon();

  beforeEach(module('cowqFilter', function ($provide) {
    $provide.value('storage', {
      get: function () {
        return {}
      }
    });
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_getUserGroup_) {
      getUserGroup = _getUserGroup_;
    })
  });

  it('should return null', function () {
    expect(getUserGroup(1)).toEqual(null)
  });
});