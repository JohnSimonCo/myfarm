describe('getUserCollapsed', function () {
  var storage;
  var setUserCollapsed;

  initCommon();
  beforeEach(module('cowExtras', function ($provide) {
    storage = {
      get: function () {},
      set: function () {}
    };

    $provide.value('storage', storage);

    spyOn(storage, 'get').and.returnValue([true, false]);
    spyOn(storage, 'set');
  }));

  beforeEach(function () {
    jr.storage = {};

    inject(function ($injector) {
      setUserCollapsed = $injector.get('cow.setUserCollapsed');
    })
  });

  it('should return false', function () {
    var id = 0;

    setUserCollapsed(id, true);

    expect(storage.get).toHaveBeenCalledWith('cow.collapsed');
    expect(storage.set).toHaveBeenCalledWith('cow.collapsed', [true, false]);
  });
});