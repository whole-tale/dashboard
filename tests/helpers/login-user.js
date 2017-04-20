import Ember from 'ember';

// Initialize the DB with fake data for the homepage and login the user
// This helper should typically be invoked before each test that requires
// an authenticated session.
export default Ember.Test.registerAsyncHelper('loginUser', function(app) {
    const server = window.server;

    let user = server.create('user', {id:1});
    server.createList('image', 3);
    server.createList('tale', 3);
    server.createList('folder', 3);

    let d = new Date();
    d.setTime(d.getTime() + (180*24*60*60*1000));
    let expires = d.toUTCString();
    document.cookie = "girderToken=blah;" +
        ";path="+
        ";domain="+
        ";expires=" + expires;

    visit('/');
    return wait().then(_=>user.attrs);
});
