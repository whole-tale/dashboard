// app/helpers/lt.js

import Ember from 'ember';

const lt = (params) => params[0] < params[1];
export default Ember.Helper.helper(lt);
