import { helper } from '@ember/component/helper';

export default helper(function (params) {
    let [a, b] = params;
    return a !== b;
});
