import Component from '@ember/component';
import EmberObject, { observer } from '@ember/object';
import { A } from '@ember/array';

export default Component.extend({
  // Temporary mock data
  datasets: A([]),

  actions: {
    clickedDataset(dataset) {
      alert("You clicked on: " + dataset.name);
    },
    
    refresh() {
      console.log("Refreshing... ?");
    }
  },
});
