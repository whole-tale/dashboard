import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    selectedUser: {},

    didInsertElement() {
        this._super(...arguments);
        let self = this;
        let store = this.get('store');
        let users;
        store.query('user', {})
            .then(_users => {
                users = _users;
                let groups = store.query('group', {});
                return groups;
            })
            .then(groups => {
                let content = users.reduce((_content, user) => {
                    let _user = user.toJSON();
                    _user.name= `${_user.firstName} ${_user.lastName}`;
                    _content.push({title: _user.name, userObject: _user }); 
                    return _content;
                }, []);

                content = groups.reduce((_content, group) => {
                    let _group = group.toJSON();
                    _content.push({title: _group.name, userObject: _group }); 
                    return _content;
                }, content);

                return content;
            })
            .then(_content => {
                Ember.$('.ui.search.user-groups')
                    .search({
                        source: _content.toArray(),
                        onSelect: self.userSelected.bind(self)
                    })
                ;
            })
        ;
    },

    userSelected(result, response) {
        this.set('selectedUser', result.userObject);
    },
});
