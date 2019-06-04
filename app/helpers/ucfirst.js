import {helper} from '@ember/component/helper';

export function ucfirst(params/*, hash*/) {
  return params.charAt(0).toUpperCase() + params.slice(1);
}

export default helper(ucfirst);
