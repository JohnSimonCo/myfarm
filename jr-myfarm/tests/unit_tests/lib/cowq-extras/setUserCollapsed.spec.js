'use strict';
describe('setUserCollapsed', function () {
  var setUserCollapsed,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      set: function () {},
      get: function () {}
    };
    $provide.value('storage', storage);

    spyOn(storage, 'set');
    spyOn(storage, 'get');
  }));

  beforeEach(inject(function (_setUserCollapsed_) {
    setUserCollapsed = _setUserCollapsed_;
  }));

  it('storage set should be called', function () {
    setUserCollapsed(1, true);
    expect(storage.set).toHaveBeenCalledWith('cowq.collapsed', { 1: true });
    expect(storage.get).toHaveBeenCalledWith('cowq.collapsed');
  });
});