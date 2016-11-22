import adaptersMapping from '../mappings/adapters';
import DS from 'ember-data';

// uses the maps in mapings/adapters to mapy from each model to an adapter
// Since an adapter provides the implementation to the backend API, we
// can use this to talk to multiple backends simulataneously

export default DS.Store.extend({
  adapterFor(modelName) {
    if(adaptersMapping[modelName]) {
      return this._super(adaptersMapping[modelName]);
    }
    return this._super(modelName);
  }
});
