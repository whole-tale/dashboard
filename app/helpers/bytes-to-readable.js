import { helper } from '@ember/component/helper';

export function bytesToReadable(size/*, hash*/) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    var txt = (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    if (txt === "NaN undefined") {
        return "0";
    }
    return txt;
}

export default helper(bytesToReadable);
