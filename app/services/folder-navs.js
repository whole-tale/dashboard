import Ember from 'ember';
import config from '../config/environment';


export default Ember.Service.extend({
  userAuth : Ember.inject.service(),
  internalState : Ember.inject.service(),

  getFolderNavs: function () {
    var thisUserID = this.get('userAuth').getCurrentUserID();

    return [
      {
        name : "Home Directory",
        command : "home",
        parentId: thisUserID,
        parentType : "user",
        icon : "home",
        isFolder :  true,
        instructions: 'Synced to local machine'
      },
      {
        name : "Registered Data",
        command : "user_data",
        parentId : thisUserID,
        parentType : "user",
        icon : "linkify",
        isFolder: true,
        instructions: 'Linked from external sources'
      },
      {
        name : "Results",
        command : "workspace",
        parentId : thisUserID,          //TODO: Find out what the parent is
        parentType : "user",
        icon : "folder",
        isFolder: true, //TODO: Find out whether this is an actual folder
        instructions: 'Output from Tales'
      },
      {
        name : "Recent",
        command : "recent",
        parentId : null,
        parentType : null,
        icon : "calendar",
        isFolder: false,
        instructions: null
      }

    ];
    },
    getFolderNavFor: function (navCommand) {
      var navs = this.getFolderNavs();
      //console.log(navs);

      for (var i=0; i< navs.length; ++i) {
        //console.log(navs[i]);
        if (navs[i].command === navCommand) return navs[i];
      }
      return null;
    },
    getCurrentFolderNavAndSetOn: function (obj) {
      var navCommand  = this.get('internalState').getCurrentNavCommand();
      console.log("Nav Command = " + navCommand);
      var currentNav = this.getFolderNavFor(navCommand);
      obj.set("currentNavCommand", navCommand);
      return currentNav;
    }


  });


