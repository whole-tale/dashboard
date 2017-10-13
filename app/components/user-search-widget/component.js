import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    let self = this;
    let store = this.get('store');

    Ember.run.scheduleOnce('afterRender', function(){
      store.query('user', {}).then(_users => {
        let content = _users.reduce(function(_content, _user) {
          let obj = { title: _user.get('firstName') + " " + _user.get('lastName'), userObject: _user };
          _content.push(obj);
          return _content;
        }, []);
        $('.ui.search')
          .search({
            source: content,
            onSelect: self.userSelected.bind(self)
          });
      });
    })

  },

  userSelected(result, response) {
    this.sendAction('action', result.userObject);
  },
});
