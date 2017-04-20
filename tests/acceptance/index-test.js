import { test } from 'qunit';
import moduleForAcceptance from 'wholetale/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | index', {});

test('should authenticate user before routing to /index', function(assert) {
    loginUser();

    andThen(function() {
        assert.equal(currentURL(), '/');
    });
});
