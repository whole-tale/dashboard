import Service from '@ember/service';
import {
    inject as service
} from '@ember/service';

export default Service.extend({
    userAuth: service(),
    internalState: service(),

    getFolderNavs() {
        const thisUserID = this.get('userAuth').getCurrentUserID();

        return [{
            name: "Home",
            displayName: "Home",
            command: "home",
            parentId: thisUserID,
            parentType: "user",
            icon: "home",
            isFolder: true,
            instructions: 'Synced to local machine',
            allowUpload: true,
            allowRegister: false,
            disallowImport: false,
            description: 'Global directory accessible across all Tales; can be synced to local machine'
        },
        {
            name: "Data",
            displayName: "External Data",
            command: "user_data",
            parentId: thisUserID,
            parentType: "user",
            icon: "linkify",
            isFolder: true,
            instructions: 'Linked from external sources',
            allowUpload: false,
            allowRegister: true,
            disallowImport: true,
            description: 'Linked, external data for use as Tale input (read-only)'
        },
        {
            name: "Workspace",
            displayName: "Tale Workspace",
            command: "workspace",
            parentId: thisUserID,
            parentType: "user",
            icon: "folder",
            isFolder: true,
            instructions: 'Output from Tales',
            allowUpload: true,
            // allowRegister: false,
            disallowImport: false,
            description: 'All files associated with this Tale, except external data and global files in Home'
        }];
        /*,
        {
          name : "Recent",
          command : "recent",
          parentId : null,
          parentType : null,
          icon : "calendar",
          isFolder: false,
          instructions: null
        }
        */
    },
    getFolderNavFor(navCommand) {
        let navs = this.getFolderNavs();
        //console.log(navs);

        for (let i = 0; i < navs.length; ++i) {
            //console.log(navs[i]);
            if (navs[i].command === navCommand) return navs[i];
        }
        return null;
    },
    getCurrentFolderNavAndSetOn(obj) {
        let currentCommand = this.get('internalState').getCurrentNavCommand();
        let navCommand = (currentCommand && currentCommand !== 'undefined') ? currentCommand : 'home';
        // console.log("Nav Command = " + navCommand);
        let currentNav = this.getFolderNavFor(navCommand);
        obj.set("currentNavCommand", navCommand);
        obj.set("currentNavTitle", currentNav.name);
        obj.set("currentNav", currentNav);
        return currentNav;
    }

});
