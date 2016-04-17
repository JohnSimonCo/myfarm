describe('util.cowNr', function () {
  var cowNr;

  beforeEach(module('util'));
  beforeEach(function () {
    inject(function ($injector) {
      cowNr = $injector.get('util.cowNr');
    })
  });

  it('should return true when pattern is matched', function () {
    var data = { openGate: []};
    var cow = {
      nr: 100,
      fetchCow: true
    };
    var element = {
      append: function () {}
    };

    spyOn(element, 'append');
    cowNr(data, cow, element);

    expect(element.append).toHaveBeenCalledWith($('<span></span>').text('#'));
  });
  it('should return true when pattern is matched', function () {
    var data = { openGate: []};
    var cow = {};
    var element = {
      append: function () {}
    };

    spyOn(element, 'append');
    cowNr(data, cow, element);

    expect(element.append).toHaveBeenCalledWith($('<span class="cow-nr"></span>'));
  });
  it('should return true when pattern is matched', function () {
    var data = { openGate: [true]};
    var cow = {
      nr: 0
    };
    var element = {
      append: function () {}
    };

    spyOn(element, 'append');
    cowNr(data, cow, element);

    expect(element.append).toHaveBeenCalledWith($('<span></span>').text('*'));
  });
});