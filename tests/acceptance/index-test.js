import { test } from 'qunit';
import moduleForAcceptance from 'wholetale/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | index', {
    before() {
    }
});

test('authenticate user before routing to /index', function(assert) {
    const server = window.server;
    
    server.create('user', {id:1});
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

    andThen(function() {
        assert.equal(currentURL(), '/');
    });
});
