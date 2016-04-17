'use strict';
describe('setUserGroup', function () {
  var setUserGroup,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      set: function () {},
      get: function () {}
    };
    $provide.value('storage', storage);

    spyOn(storage, 'set');
  }));

  beforeEach(inject(function (_setUserGroup_) {
    setUserGroup = _setUserGroup_;
  }));

  it('should execute storage set', function () {
    setUserGroup(1, { group: 'group name'});
    expect(storage.set).toHaveBeenCalled();
  });
});