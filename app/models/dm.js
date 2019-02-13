import DS from 'ember-data';

export default DS.Model.extend({
  _accessLevel: DS.attr(),
  _id: DS.attr(),
  _modelType: DS.attr('string'),
  ownerId: DS.attr('string'),
  /* --- dataSet ----
  [
    {
      "itemId": "5c1273173fea9e0001a54a93",
      "mountPath": "/datadict2000.html"
    },
    {
      "itemId": "5c1273193fea9e0001a54a95",
      "mountPath": "/datadict2005.html"
    },
    {
      "itemId": "5c12731a3fea9e0001a54a97",
      "mountPath": "/dictionary95.txt"
    }
  ]
  */
  dataSet: DS.attr()
});
