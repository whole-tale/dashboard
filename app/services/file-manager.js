import Ember from 'ember';
import RSVP from 'rsvp';


let allowedRelationships = [
    {"LISTING":"listing"},
    {"CONTENTS":"contents"},
    {"DETAILS":"details"},
    {"ROOTPATH":"rootpath"},
    {"ACCESS":"access"}
];

export {
    allowedRelationships
};

export default Ember.Service.extend({
    init() {
        this._super(...arguments);
    },
    getDownloadUrl(file) {

    },
    updateContents(file) {

    },
    addSubfolder(folder, folderName) {

    },
    uploadFile(folder, fileName, file) {

    },
    rename(file, newName) {

    },
    deleteFile(file) {

    },
    move(file, folder, options) {

    },
    loadNestedFileStructure(model, file_node, max_depth, depth) {
        let self = this;
        max_depth = max_depth || 0;
        depth = depth || 0;

        file_node.set('directory_listing', Ember.A());
        return this.loadChildren(model, 'files', file_node.directory_listing)
            .then(() => {
                file_node.set('isPopulated', true);
                return _.reduce(file_node.directory_listing, (_p_each, _file) => {
                    if(_file.get('isFolder')) {
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
    },
    loadChildren(model, relationships, node) {
        let promises = [];

        let modelType = model.get('_modelType');
        let id = model.get('id');

        let modelAttributes = model.store.modelFor(modelType);
        let relByNames = Ember.get(modelAttributes, 'relationshipsByName');
        let relDescriptors = relationships.reduce((acc, rel) => {
            acc.push(relByNames.get(rel));
            return acc;
        }, []);

        relDescriptors.forEach(descriptor => {
            let parentRelationshipId = (descriptor.type == "folder") ? 'parentId' : 'folderId';
            let queryParams = {};
            queryParams[parentRelationshipId] = id;
            queryParams['parentType'] = modelType;

            promises.push(model.store.query(descriptor.type, queryParams)
                .then(_children => {
                    node = node.concat(_children.toArray());
                }));
        });

        return RSVP.allSettled(promises).then(()=>{
            return node;
        });
    },
    isValidRelationship(relationship) {
        return !!(allowedRelationships[(relationship+"").toUpperCase]);
    }
});
