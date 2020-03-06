// app/helpers/array-empty.js

import Ember from 'ember';

const empty = (params) => !params[0] || params[0].length === 0;
export default Ember.Helper.helper(empty);
