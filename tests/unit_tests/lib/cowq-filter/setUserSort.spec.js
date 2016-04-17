describe('setUserSort', function () {
  var storage,
    setUserSort;

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

    inject(function (_setUserSort_) {
      setUserSort = _setUserSort_;
    })
  });

  it('should call storage methods', function () {
    setUserSort('profileName', {});
    expect(storage.get).toHaveBeenCalledWith('sort');
    expect(storage.set).toHaveBeenCalledWith('sort', { profileName:{  } });
  });
});