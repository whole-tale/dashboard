import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('publish-modal', 'Integration | Component | publish modal', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{publish-modal}}`);

  assert.notEqual(this.$().text(), '');
});