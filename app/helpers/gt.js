// app/helpers/gt.js

import Ember from 'ember';

const gt = (params) => params[0] > params[1];
export default Ember.Helper.helper(gt);
