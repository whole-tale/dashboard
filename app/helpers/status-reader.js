import {helper} from '@ember/component/helper';

const INACTIVE = 0;
const QUEUED = 1;
const RUNNING = 2;
const SUCCESS = 3;
const ERROR = 4;
const CANCELED = 5;

export default helper(function(params) {
  const [status] = params;
  if (status === INACTIVE) { 
    return 'Inactive';
  } else if (status === QUEUED) {
    return 'Queued';
  } else if (status === RUNNING) {
    return 'Running';
  } else if (status === SUCCESS) {
    return 'Success';
  } else if (status === ERROR) {
    return 'Error';
  } else if (status === CANCELED) {
    return 'Canceled';
  } else {
    return 'Unknown';
  }
});
