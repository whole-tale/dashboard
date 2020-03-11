// app/helpers/array-not-empty.js

import Ember from 'ember';

const notEmpty = (params) => params[0] && params[0].length !== 0;
export default Ember.Helper.helper(notEmpty);
