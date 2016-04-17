describe('AnimalData', function () {
  var AnimalData;

  beforeEach(module('milkdata'));
  beforeEach(function () {
    inject(function (_AnimalData_) {
      AnimalData = _AnimalData_;
    })
  });

  it('running animal data should succeed', function () {
    var animal = {
      milkings: [
        {
          endOfMilkingTime: new Date().setDate(new Date().getDate() - 1)
        },
        {
          endOfMilkingTime: new Date().toString()
        }
      ]
    };
    expect(AnimalData(animal)).toEqual(undefined);
  });
});