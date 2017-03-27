import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('registration-modal', 'Integration | Component | registration modal', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{registration-modal}}`);

  assert.notEqual(this.$().text(), '');
});
