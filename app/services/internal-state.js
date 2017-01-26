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

  setCurrentCollectionName: function(val) {
    localStorage.currentCollectionName = val;
  },

  getCurrentCollectionName: function() {
    return localStorage.currentCollectionName;
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
    var bcs = localStorage.currentFileBreadcrumbs;
    if (!bcs) return null;
    return JSON.parse(bcs);
  },

  setCurrentBreadCrumb: function(val) {
    localStorage.currentBreadCrumb= JSON.stringify(val);
  },

  getCurrentBreadCrumb: function() {
    return JSON.parse(localStorage.currentBreadCrumb);
  },

  toString: function () {
      return "Collection ID: " + localStorage.currentCollectionID +
        ", Collection Name: " + localStorage.currentCollectionName +
        ", Current Folder ID: " + localStorage.currentFolderID +
        ", CurrentFileBreadcrumbs: " + localStorage.currentFileBreadcrumbs +
        ", CurrentBreadCrumb: " + localStorage.currentBreadCrumb;
  }

});
