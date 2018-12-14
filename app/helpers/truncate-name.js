import { helper } from '@ember/component/helper';

export default helper(function truncateText(params/*, hash*/) {
    const [value] = params;
    let limit = params.length > 1 ? params[1] : 35;
    let text = '';

    if (value && value.length) {
        text = value.substr(0, limit);

        if (value.length > limit) {
            text += '...';
        }
    }

    return text;
});
