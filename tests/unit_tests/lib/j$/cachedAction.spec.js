describe('cachedAction', function () {
  var cachedAction;

  initCommon();

  beforeEach(module('j$'));
  beforeEach(function () {
    inject(function ($injector) {
      cachedAction = $injector.get('j$.cachedAction');
    })
  });

  it('should return factory.apply result', function () {
    var cachedId = {};
    var factory = {apply: function () {
      return {};
    }};
    var arg = {arg: 'arg'};
    expect(cachedAction(cachedId, factory)(arg)).toEqual({});
  });
});