import { helper } from '@ember/component/helper';

export default helper(function truncateText(params, hash) {
    const [ value ] = params;
    let { limit } = hash;
    limit = limit || 35;
    let text = '';
  
    if (value != null && value.length > 0) {
      text = value.substr(0, limit);
  
      if (value.length > limit) {
        text += '...';
      }
    }
  
    return text;
  });
