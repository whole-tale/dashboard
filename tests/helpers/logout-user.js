import Ember from 'ember';

export default Ember.Test.registerHelper('logoutUser', function(app) {
    let d = new Date();
    d.setTime(d.getTime() + (-1*24*60*60*1000));
    let expires = d.toUTCString();
    document.cookie = "girderToken=;" +
        ";path="+
        ";domain="+
        ";expires=" + expires;

    localStorage.currentUserID = "null";
});
