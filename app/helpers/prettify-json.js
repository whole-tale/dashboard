import { helper } from '@ember/component/helper';
import JSONBeautify from 'npm:json-beautify';

export default helper(function(params) {
  return JSONBeautify(params, null, 2, 80);
});
