import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/String';
export default helper(function(params) {
    let [provider, image_size] = params;
    if(provider === 'DataONE') {
        return new htmlSafe('<img class="ui ' + image_size + ' image" src="/icons/d1-logo-large.png">');
    } else if(provider === 'Globus') {
        return new htmlSafe('<img class="ui ' + image_size + ' image globusblue" src="/icons/globus-logo-large.png">');
    } else {
        return new htmlSafe('<img class="ui ' + image_size + ' image globusblue" src="/images/wholetale_logo_small.png">');
    }
});
