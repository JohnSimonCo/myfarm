describe('setUserSort', function () {
  var storage;
  var setUserSort;

  initCommon();
  beforeEach(module('cowExtras', function ($provide) {
    storage = {
      set: function () {
      }
    };
    $provide.value('storage', storage);
    
    spyOn(storage, 'set');
  }));

  beforeEach(function () {
    jr.storage = {get: function () {}};

    inject(function ($injector) {
      setUserSort = $injector.get('cow.setUserSort');
    })
  });

  it('should sort user', function () {
    setUserSort(['sort']);

    expect(storage.set).toHaveBeenCalledWith('cow.sort', ['sort']);
  });
});