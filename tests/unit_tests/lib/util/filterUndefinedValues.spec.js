describe('filterUndefinedValues', function () {
  var filterUndefinedValues;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function (_filterUndefinedValues_) {
      filterUndefinedValues = _filterUndefinedValues_;
    })
  });

  it('should return true when pattern is matched', function () {
    var object = {
      prop1: 'value1',
      prop2: 'value2'
    };
    expect(filterUndefinedValues(object)).toEqual(object);
  });
});