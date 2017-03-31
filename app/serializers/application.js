import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  primaryKey: '_id',

  serialize(snapshot, options) {
    var json = this._super(...arguments);

    console.log("JSON coming from call is");
    console.log(json);

    if (json.hasOwnProperty("folder")) {
      json = json['folder'];
    }

    return json;
  },
});


