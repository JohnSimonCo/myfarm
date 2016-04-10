describe('setUserViewIndex', function () {
  var storage;
  var setUserViewIndex;

  initCommon();

  beforeEach(module('cowExtras', function ($provide) {
    storage = {
      get: function () {},
      set: function () {}
    };
    $provide.value('storage', storage);

    spyOn(storage, 'get').and.returnValue({});
  }));

  beforeEach(function () {
    jr.storage = {get: function () {}};

    inject(function ($injector) {
      setUserViewIndex = $injector.get('setUserViewIndex');
    })
  });

  it('should sort user', function () {
    var id = 0;
    var view = {name: 'view'};
    setUserViewIndex(id, view);

    expect(storage.get).toHaveBeenCalledWith('cow.view');
  });
});