describe('simpleHash', function () {
  var simpleHash;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function ($injector) {
      simpleHash = $injector.get('util.simpleHash');
    })
  });

  it('should return arguments signature', function () {
    expect(simpleHash({}, function () {})).toEqual('|[object Object]|function () {}')
  });
});