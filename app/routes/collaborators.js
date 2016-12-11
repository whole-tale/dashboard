import Ember from 'ember';


export default Ember.Route.extend({
 model: function(params) {
   console.log("The parameters are ");
   console.log(params);
   return this.get('store').findAll('user');
  }
});

