import Component from '@ember/component';
import { A } from '@ember/array'; 
import { inject as service } from '@ember/service';

export default Component.extend({
  apiCall: service('api-call'),
  selectedNodes: A(),

  init() {
    this._super(...arguments);
    
    // Hide the dots from the tree
    this.set('themes', {"dots": false});
    // Show checkboxes next to each node
    this.set('plugins', "checkbox");

    let failure = () => {};
    let setTaleTree = (tree) => {
      // Set the root to the node tree that was obtained from girder
      this.set('parent', tree);
    }
    this.apiCall.getTaleTree(this.taleId, setTaleTree.bind(this), failure);
  }
});