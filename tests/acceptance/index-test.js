import { test } from 'qunit';
import moduleForAcceptance from 'wholetale/tests/helpers/module-for-acceptance';

moduleForAcceptance('\x1b[36mAcceptance | index\x1b[0m', {

});

//------------------------------------------------------------------------------
test('Should authenticate user', function(assert) {
    let promised_user = loginUser();

    andThen(function() {
        let user = promised_user._result;
        assert.equal(currentURL(), '/');
        assert.ok(user._id);
        assert.equal(localStorage.currentUserID, user._id);
    });
});

//------------------------------------------------------------------------------
test('Should logout user', function(assert) {
    logoutUser();

    visit('/');

    andThen(function() {
        assert.equal(currentURL(), '/login');
        assert.notOk(/girderToken/.test(document.cookie));
        assert.equal(localStorage.currentUserID, "undefined");
    });
});
