import Service from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';

// a set of methods dedicated to certain state maintenance on the front end.
// these methods use localStorage so they persist beyond sessions ...

export default Service.extend({
  isAuthenticated: true,
  currentInstanceId: computed({
    get() {
      return localStorage.currentInstanceId ? JSON.parse(localStorage.currentInstanceId) : undefined;
    },
    set(key, value) {
      localStorage.currentInstanceId = JSON.stringify(value);
      return value;
    }
  }),

  setCurrentNavCommand: function (val) {
    localStorage.currentNavCommand = val;
  },

  getCurrentNavCommand: function () {
    return localStorage.currentNavCommand;
  },

  setCurrentFolderID: function (val) {
    localStorage.currentFolderID = val;
  },

  getCurrentFolderID: function () {
    return localStorage.currentFolderID;
  },

  setCurrentFolderName: function (val) {
    localStorage.currentFolderName = val;
  },

  getCurrentFolderName: function () {
    return localStorage.currentFolderName;
  },

  setCurrentParentType: function (val) {
    localStorage.currentParentType = val;
  },

  getCurrentParentType: function () {
    return localStorage.currentParentType;
  },

  setCurrentFileBreadcrumbs: function (val) {
    localStorage.currentFileBreadcrumbs = JSON.stringify(val);
  },

  getCurrentFileBreadcrumbs: function () {
    var bcs = localStorage.currentFileBreadcrumbs;
    if (!bcs) return null;
    return JSON.parse(bcs);
  },

  setCurrentBreadCrumb: function (val) {
    localStorage.currentBreadCrumb = JSON.stringify(val);
  },

  getCurrentBreadCrumb: function () {
    return JSON.parse(localStorage.currentBreadCrumb);
  },

  setCurrentParentId: function (id) {
    localStorage.currentParentId = id;
  },

  getCurrentParentId: function () {
    return localStorage.currentParentId;
  },

  setStaticMenu: function (val) {
    if (val)
      localStorage.staticMenu = 1;
    else
      localStorage.staticMenu = 0;
  },

  getIsStaticMenu: function () {
    return (localStorage.staticMenu != 0);
  },

  setNewUIMode: function (val) {
    if (val)
      localStorage.newUIMode = 1;
    else
      localStorage.newUIMode = 0;
  },

  getNewUIMode: function () {
    return (localStorage.newUIMode != 0);
  },

  addFolderToRecentFolders: function (folderId) {
    var recentFolders = this.getRecentFolders();

    if (recentFolders.length > 15) {
      recentFolders.splice(0, 1); // remove first element (last one in)
    }

    recentFolders.push(folderId);

    localStorage.recentFolders = JSON.stringify(recentFolders);
  },

  removeFolderFromRecentFolders: function (folderId) {
    var recentFolders = this.getRecentFolders();

    recentFolders = recentFolders.reject(id => {
      return folderId === id;
    });

    localStorage.recentFolders = JSON.stringify(recentFolders);
  },

  getRecentFolders: function () {
    var bcs = localStorage.recentFolders;
    if (!bcs) return [];
    return JSON.parse(bcs);
  },

  // Get the object that Access Control will be modifying perms for
  getACLObject() {
    let aclObj = localStorage.ACLObject;
    if (!aclObj) return null;
    return JSON.parse(aclObj)
  },

  // Sets the object that Access Control will be modifying permissions for
  setACLObject(aclObj) {
    localStorage.ACLObject = JSON.stringify(aclObj.toJSON());
  },

  getRecentTales() {
    let recent = localStorage.recentTales;
    if (!recent) {
      return A();
    }
    return JSON.parse(recent);
  },

  addRecentTale(taleId) {
    let recent = this.getRecentTales();

    if (recent.length > 15) {
      recent.splice(0, 1); // remove first element (last one in)
    }

    recent.push(taleId);

    localStorage.recentTales = JSON.stringify(recent);
  },

  removeRecentTale: function (taleId) {
    var recent = this.getRecentTales();
    recent = recent.reject(id => {
      return taleId === id;
    });
    localStorage.recentTales = JSON.stringify(recent);
  },

  toString: function () {
    return "CurrentFileBreadcrumbs: " + localStorage.currentFileBreadcrumbs +
      +", Current Parent Type: " + localStorage.currentParentType +
      +", Current Folder ID: " + localStorage.currentFolderID +
      ", CurrentBreadCrumb: " + localStorage.currentBreadCrumb;
  },

  getRecentEnvironments() {
    let recent = localStorage.recentEnvironments;
    if (!recent) {
      return A();
    }
    return JSON.parse(recent);
  },
  setRecentEnvironments(environments) {
    environments = environments || A();
    localStorage.recentEnvironments = JSON.stringify(environments);
  },

  addRecentEnvironment(environmentId) {
    let recent = this.getRecentEnvironments();

    if (recent.length > 15) {
      recent.splice(0, 1); // remove first element (last one in)
    }

    recent.push(environmentId);

    localStorage.recentEnvironments = JSON.stringify(recent);
  },

  removeRecentEnvironment(environmentId) {
    let recent = this.getRecentEnvironments();
    recent = recent.reject(id => {
      return environmentId === id;
    });
    localStorage.recentEnvironments = JSON.stringify(recent);
  },

  setSearchString(searchStr) {
    localStorage.lastSearchStr = searchStr;
  },
  getSearchString() {
    return localStorage.searchStr;
  }

});
