'use strict';
describe('deSerializeProfiles', function () {
  var deSerializeProfiles,
    storage;

  beforeEach(module('cowqExtras'));

  beforeEach(module(function ($provide) {
    storage = {
      get: function () {
      }
    };
    $provide.value('storage', storage)
  }));

  beforeEach(inject(function (_deSerializeProfiles_) {
    deSerializeProfiles = _deSerializeProfiles_;
  }));

  it('deserialize profile', function () {
    var data = {
      deLaval: {
        profiles: {
          profile1: {prop1: 'prop Value'},
          profile2: {prop2: 'prop Value'}
        },
        myProfile: {},
        fieldNames: {fieldName: 'name'}
      }
    };

    expect(deSerializeProfiles(data)).toEqual({
      fieldNames: undefined,
      profiles: {profile1: {prop1: 'prop Value'}, profile2: {prop2: 'prop Value'}},
      sortedProfiles: [{key: 'profile1', value: {prop1: 'prop Value'}}, {key: 'profile2', value: {prop2: 'prop Value'}}]
    });
  });
});