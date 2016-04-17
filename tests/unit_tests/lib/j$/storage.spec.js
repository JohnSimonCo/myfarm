describe('storage', function () {
  var storage;

  initCommon();

  beforeEach(module('j$'));
  beforeEach(function () {
    jr.storage = {
      property: 'value',
      property1: 'value1'
    };

    inject(function (_storage_) {
      storage = _storage_;
    });
  });

  it('has function should return true for existing value', function () {
    expect(storage.has('property')).toEqual(true);
  });
  it('get should return value for given property', function () {
    expect(storage.get('property')).toEqual('value');
  });
  it('get should return object if not property is given', function () {
    expect(storage.get()).toEqual(jr.storage);
  });
  it('set should set given prop and value', function () {
    storage.set('propToAdd', 'addedValue');
    expect(jr.storage).toEqual({property: 'value', property1: 'value1', propToAdd: 'addedValue'});
  });
  it('remove should remove property from storage', function () {
    storage.delete('propToAdd', 'addedValue');
    expect(jr.storage).toEqual({property: 'value', property1: 'value1'});
  });
  it('remove should remove property from storage', function () {
    storage.deleteMultiple('property');
    expect(jr.storage).toEqual({property1: 'value1'});
  });
  it('remove should remove property from storage', function () {
    expect(storage.toJson()).toEqual('{"property1":"value1"}');
  });
});