describe('setUserGroup', function () {
  var storage,
   setUserGroup;

  initCommon();
  beforeEach(module('cowqFilter', function ($provide) {
    storage = {
      get: function () {
        return {}
      },
      set: function () {
      }
    };
    $provide.value('storage', storage);

    spyOn(storage, 'set');
    spyOn(storage, 'get');
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function (_setUserGroup_) {
      setUserGroup = _setUserGroup_;
    })
  });

  it('should should call storage methods', function () {
    setUserGroup(1, {});
    expect(storage.get).toHaveBeenCalledWith('group');
    expect(storage.set).toHaveBeenCalledWith('group', {1: {}});
  });
});