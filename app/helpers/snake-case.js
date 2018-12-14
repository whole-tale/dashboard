import { helper } from '@ember/component/helper';

export default helper(function snakeCase(params) {
    const [value] = params;
    let text = '';
    if (value && value.length) {
        text = value.trim().toLowerCase().replace(' ', '_');
    }

    return text;
});
