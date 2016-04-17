describe('getUserCollapsed', function () {
  var getUserCollapsed;

  initCommon();

  beforeEach(module('cowExtras', function ($provide) {
    $provide.value('storage', {get: function () {
      return [true, false]
    }});
  }));

  beforeEach(function () {
    jr.storage = {get: function () {}};

    inject(function ($injector) {
      getUserCollapsed = $injector.get('cow.getUserCollapsed');
    })
  });

  it('should return false', function () {
    expect(getUserCollapsed(1)).toEqual(false)
  });

  it('should return true', function () {
    expect(getUserCollapsed(0)).toEqual(true)
  });
});