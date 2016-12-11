import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    fileManager: Ember.inject.service(),
    selectedFile: null,
    actions: {
        onSelectFile(file) {
            this.logger.debug("Action received " + file.get('id'));
            let currentlySelected = this.get('selectedFile');
            if(currentlySelected) {
                currentlySelected.set('isSelected', false);
            }

            this.set('selectedFile', file);
            file.set('isSelected', true);
        }
    }
});
