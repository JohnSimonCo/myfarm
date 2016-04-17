describe('stringStartsWith', function () {
  var stringStartsWith;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function (_stringStartsWith_) {
      stringStartsWith = _stringStartsWith_;
    })
  });

  it('should return true when pattern is matched', function () {
    expect(stringStartsWith('string', 'str')).toEqual(true);
  });
  it('should return false when pattern is not matched', function () {
    expect(stringStartsWith('string', 'strn')).toEqual(false);
  });
});