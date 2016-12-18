import Ember from 'ember';

// a set of methods dedicated to certain state maintenance on the front end.
// these methods use localStorage so they persist beyond sessions ...

export default Ember.Service.extend({
  isAuthenticated: true,

  setCurrentCollectionID: function(val) {
    localStorage.currentCollectionID = val;
  },

  getCurrentCollectionID: function() {
    return localStorage.currentCollectionID;
  },

  setCurrentFolderID: function(val) {
    localStorage.currentFolderID = val;
  },

  getCurrentFolderID: function() {
    return localStorage.currentFolderID;
  },

  setCurrentFileBreadcrumbs: function(val) {
    localStorage.currentFileBreadcrumbs = JSON.stringify(val);
  },

  getCurrentFileBreadcrumbs: function() {
    return JSON.parse(localStorage.currentFileBreadcrumbs);
  },

});
