import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';

// a set of methods dedicated to certain state maintenance on the front end.
// these methods use localStorage so they persist beyond sessions ...

export default Service.extend({
    store: service(),
    isAuthenticated: true,
    currentInstanceId: computed({
        get() {
            return (localStorage.currentInstanceId && localStorage.currentInstanceId !== 'undefined') ? JSON.parse(localStorage.currentInstanceId) : undefined;
        },
        set(key, value) {
            localStorage.currentInstanceId = JSON.stringify(value);
            return value;
        }
    }),

    setCurrentNavCommand(val) {
        localStorage.currentNavCommand = val;
    },

    getCurrentNavCommand() {
        return localStorage.currentNavCommand;
    },

    setCurrentFolderID(val) {
        localStorage.currentFolderID = val;
    },

    getCurrentFolderID() {
        this.get('store').findRecord('folder', localStorage.currentFolderID).then(folder => {
            console.log(folder);
            return localStorage.currentFolderID;
        }).catch(function(error){
            console.log("No such folder : " + localStorage.currentFolderID);
            return null;
        });
    },

    setCurrentFolderName(val) {
        localStorage.currentFolderName = val;
    },

    getCurrentFolderName() {
        return localStorage.currentFolderName;
    },

    setCurrentParentType(val) {
        localStorage.currentParentType = val;
    },

    getCurrentParentType() {
        return localStorage.currentParentType;
    },

    setCurrentFileBreadcrumbs(val) {
        localStorage.currentFileBreadcrumbs = JSON.stringify(val);
    },

    getCurrentFileBreadcrumbs() {
        let bcs = localStorage.currentFileBreadcrumbs;
        if (!bcs) return null;
        return JSON.parse(bcs);
    },

    setCurrentBreadCrumb(val) {
        localStorage.currentBreadCrumb = JSON.stringify(val);
    },

    getCurrentBreadCrumb() {
        return JSON.parse(localStorage.currentBreadCrumb);
    },

    setCurrentParentId(id) {
        localStorage.currentParentId = id;
    },

    getCurrentParentId() {
        return localStorage.currentParentId;
    },

    setStaticMenu(val) {
        if (val)
            localStorage.staticMenu = 1;
        else
            localStorage.staticMenu = 0;
    },

    getIsStaticMenu() {
        return (localStorage.staticMenu != 0);
    },

    addFolderToRecentFolders(folderId) {
        let recentFolders = this.getRecentFolders();

        if (recentFolders.length > 15) {
            recentFolders.splice(0, 1); // remove first element (last one in)
        }

        recentFolders.push(folderId);

        localStorage.recentFolders = JSON.stringify(recentFolders);
    },

    removeFolderFromRecentFolders(folderId) {
        let recentFolders = this.getRecentFolders();

        recentFolders = recentFolders.reject(id => {
            return folderId === id;
        });

        localStorage.recentFolders = JSON.stringify(recentFolders);
    },

    getRecentFolders() {
        let bcs = localStorage.recentFolders;
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

    removeRecentTale(taleId) {
        let recent = this.getRecentTales();
        recent = recent.reject(id => {
            return taleId === id;
        });
        localStorage.recentTales = JSON.stringify(recent);
    },

    toString() {
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
    },

    setDataOneAuthenticated(authenticated) {
        localStorage.dataOneAuthenticated = authenticated;
    },

    getDataOneAuthenticated() {
        return localStorage.dataOneAuthenticated;
    },

    workspaceRootId: computed({
        get() {
            return (localStorage.workspaceRootId && localStorage.workspaceRootId !== 'undefined') ? JSON.parse(localStorage.workspaceRootId) : undefined;
        },
        set(key, value) {
            localStorage.workspaceRootId = JSON.stringify(value);
            return value;
        }
    })

});
