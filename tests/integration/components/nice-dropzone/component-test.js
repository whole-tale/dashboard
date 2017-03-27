import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nice-dropzone', 'Integration | Component | nice dropzone', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{nice-dropzone}}`);

  assert.equal(this.$().text().trim(), "File Uploads\n\n\nDrop files here to upload");
  
});
