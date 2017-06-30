import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    let [provider, image_size] = params;
    if(provider === 'DataONE') {
        return new Ember.String.htmlSafe('<img class="ui ' + image_size + ' image" src="/icons/d1-logo-large.png">');
    } else {
        return new Ember.String.htmlSafe('<img class="ui ' + image_size + ' image globusblue" src="/icons/globus-logo-large.png">');
    }
});
