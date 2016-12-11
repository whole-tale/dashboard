import Ember from 'ember';
import layout from './template';
import RSVP from 'rsvp';
import loadRelationship from 'wholetale/utils/load-relationship';
import _ from 'lodash/lodash';

export default Ember.Component.extend( {
    layout,
    fileManager: Ember.inject.service(),
    tree_node: null,
    init() {
        this._super(...arguments);
    },
    actions: {
        expandCollapse(folder) {
            if(folder.get('isProvider') || folder.get('isFolder')) {
                let isVisible = folder.get('isVisible') || false;
                folder.set('isVisible', !isVisible);
                if((!folder.get('isPopulated') || folder.get('isIncomplete')) && !isVisible) {
                    this.logger.debug("Loading folder structure...");
                    folder.set('isPopulating', true);
                    this.loadNestedFileStructure(folder, folder, 0)
                    .then(()=>{ folder.set('isIncomplete', false); })
                    .catch(()=>{ folder.set('isIncomplete', true); })
                    .finally(()=>{ folder.set('isPopulating', false); });
                }
            }
        },
        selectFile(file) {
            //is actual file
            // else {
            //     //download file
            //     this.logger.info("Downloading ...");
            //     let url = this.get('fileManager').getDownloadUrl(file);
            //     window.open(url);
            //     // let headers = {
            //     //     'Access-Control-Request-Headers':'authorization',
            //     //     'Access-Control-Request-Method':'GET'
            //     // };
            //     //
            //     // this.get('fileManager').getContents(file, {headers: headers});
            // }
            this.sendAction('onSelectFile', file);
        },
        ////////////////////////////////////////////////////////////////////////
        //onSelectFile() exists to recursively bubble up the selectFile action eventually reaching the file manager. - Adam B
        onSelectFile(file) {
            this.sendAction('onSelectFile', file);
        },
        refreshFile(file) {
            if(!file) {
                file = this.get('tree_node');
            }

            if(file.get('isProvider') || file.get('isFolder')) {
                this.logger.debug("Loading file structure...");
                file.set('isPopulating', true);
                this.loadNestedFileStructure(file, file, 0)
                    .then(()=>{ file.set('isIncomplete', false); })
                    .catch(()=>{ file.set('isIncomplete', true); })
                    .finally(()=>{ file.set('isPopulating', false); });
            }
            else {
                //TODO: File refresh for rename, etc.
            }
        }
    },
    loadNestedFileStructure(model, file_node, max_depth, depth) {
        let self = this;
        max_depth = max_depth || 0;
        depth = depth || 0;

        file_node.set('directory_listing', Ember.A());
        return loadRelationship(model, 'files', file_node.directory_listing)
            .then(() => {
                file_node.set('isPopulated', true);
                return _.reduce(file_node.directory_listing, (_p_each, _file) => {
                    if(_file.get('isFolder') || _file.get('isProvider')) {
                        _file.set('directory_listing', Ember.A());
                        _file.set('isVisible', false);
                        let _p = new RSVP.Promise(resolve => { resolve(true); });
                        if(depth === max_depth) {
                            _file.set('isPopulated', false);
                            return _p.then(() => { return _p_each; });
                        }
                        _file.set('isPopulated', true);
                        return self.loadNestedFileStructure(_file, _file, max_depth, depth+1)
                            .then(()=>{ return _p_each; });
                    }
                }, new RSVP.Promise(resolve => { resolve(true); }));
            });
    }
});
