describe('stringEndsWith', function () {
  var stringEndsWith;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function (_stringEndsWith_) {
      stringEndsWith = _stringEndsWith_;
    })
  });

  it('should return true when pattern is matched', function () {
    expect(stringEndsWith('string', 'ing')).toEqual(true);
  });
  it('should return false when pattern is not matched', function () {
    expect(stringEndsWith('string', 'ting')).toEqual(false);
  });
});