describe('resources', function () {
  var resources;

  initCommon();

  beforeEach(module('j$'));
  beforeEach(function () {
    inject(function (_resources_) {
      resources = _resources_;
    })
  });

  it('should return valuve from resources', function () {
    jr.resources = {name: 'value'};

    expect(resources.get('name')).toEqual()
  });
});