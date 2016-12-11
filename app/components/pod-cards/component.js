// app/pods/components/projects-cards/component.js
import Ember from 'ember';
import layout from './template';
//import PaginatedComponentMixin from 'wholetale/mixins/paginated-component';

var dummyPrivatePODs = [
  {
    title : "DataOne",
    description : "An analysis of a dataone dataset",
    dateModified : "12/4/2016",
  },
  {
    title : "New Research",
    description : "An analysis of ET data",
    dateModified : "12/1/2016",
  },
  {
    title : "Example 3",
    description : "Yet another research POD",
    dateModified : "12/5/2016",
  }
];

var dummyPublicPODs = [
  {
    title : "DataOne Public",
    description : "An analysis of a public dataone dataset",
    dateModified : "12/4/2016",
  },
  {
    title : "Global Research",
    description : "A Global research collaboration",
    dateModified : "12/1/2016",
  },
  {
    title : "Public Search",
    description : "A search around the country",
    dateModified : "12/5/2016",
  }
];

//export default Ember.Component.extend(PaginatedComponentMixin, {
export default Ember.Component.extend({
  layout,
  classNames: ['projects', 'cards'],
  isLoading: false,
  pageSize: null,
  isPublic: false,
  user: null,
  filter: {},
  filterChanged: Ember.observer('filter', function() {
    // deal with the change
    this.loadProfileList();
  }),
  init() {
    this._super(...arguments);
    this.loadProfileList();
  },
  loadProfileList: function() {

    if (this.get('isPublic'))
      this.set("list", dummyPublicPODs);
    else
      this.set("list", dummyPrivatePODs);

    this.set('isLoading', false);
    $('.loading.widget.private').hide();

      // var user = this.get('user');
    // this.get('user');
    //
    // var routeParams = {
    //     page: this.get('page'),
    //     page_size: this.get('pageSize')
    // };
    //
    // let filter = this.get('filter');
    // let _filter = {
    //     contributors: this.get('user.id'),
    //     public: this.get('isPublic'),
    //     tags: filter.tags
    // };
    //
    // var userParams = {filter:_filter};
    //
    // this.queryForComponent('node', routeParams, userParams).then(() => {
    //     this.send('hideLoading');
    // });
  },
  willUpdate: function() {
    this.set('isLoading', false);
    // console.log(this.get('isLoading', false));
  },
  actions: {
    next: function() {
      this.send('showLoading');
      this.incrementProperty('page', 1);
      this.loadProfileList();
    },
    previous: function() {
      this.send('showLoading');
      this.decrementProperty('page', 1);
      this.loadProfileList();
    },
    goToPage: function(pageNumber) {
      this.send('showLoading');
      this.set('page', pageNumber);
      this.loadProfileList();
    },
    hideLoading: function() {
      this.set('isLoading', false);
      if(!(this.get('isLoading'))) {
        $('.loading.widget.private').hide();
      }
    },
    showLoading: function() {
      this.set('isLoading', true);
      if(this.get('isLoading')) {
        $('.loading.widget.private').show();
      }
    }
  }
});
