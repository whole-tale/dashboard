import DS from 'ember-data';

export default DS.Model.extend({
  "name": DS.attr('string'),
  "fullName": DS.attr('string'),
  "logo":  DS.attr("string"),
  "docs_href": DS.attr('string'),
  "tags": DS.attr(),
  "targets": DS.attr(),
  "type":  DS.attr("string"),
  "url":  DS.attr("string"),
  "state":  DS.attr("string"),
});
