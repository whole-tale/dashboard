import config from '../config/environment';
import Service from '@ember/service';
import $ from 'jquery';
import {
    inject as service
} from '@ember/service';

export default Service.extend({
    tokenHandler: service('token-handler'),
    notificationHandler: service('notification-handler'),
    isAuthenticated: true,

    getFileContents(itemID, callback) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            callback(client.responseText);
        });
        client.send();
    },

    getPreviewLink(itemID) {
        return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=inline';

        // https://girder.wholetale.org/api/v1/file/584ed73a548a6f00017d7504/download?contentDisposition=inline

    },

    getDownloadLink(itemID) {
        return config.apiUrl + '/item/' + itemID + '/download?contentDisposition=attachment';
    },

    putItemDetails(itemID, name, description, success, fail) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/item/' + itemID;
        let queryPars = "";
        if (name != null) {
            queryPars += "name=" + encodeURIComponent(name);
        }
        if (description != null) {
            if (queryPars !== "")
                queryPars += "&";
            queryPars += "description=" + encodeURIComponent(description);
        }

        if (queryPars !== "") {
            url += "?" + queryPars;
        }
        let client = new XMLHttpRequest();
        client.open('PUT', url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(client.responseText);
            } else {
                fail(client);
            }
        });

        client.addEventListener("error", fail);

        client.send();
    },

    /**
    * Posts a Tale, using the query parameters specified in the API ...
    * @method postTale
    * @param httpCommand
    * @param taleID
    * @param imageId
    * @param folderId
    * @param instanceId
    * @param title
    * @param description
    * @param isPublic
    * @param configuration
    * @param success
    * @param fail
    */
    postTale(httpCommand, taleID, imageId, folderId, instanceId, title, description, isPublic, configuration, success, fail) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/tale/';
        let queryPars = "";
        if (httpCommand === "post") {
            if (!imageId) {
                fail("You must provide an image");
                return;
            }
            if (!folderId) {
                fail("You must provide a folder");
                return;
            }
            queryPars += "imageId=" + encodeURIComponent(imageId);
            queryPars += "&";
            queryPars += "folderId=" + encodeURIComponent(folderId);
        } else {
            url += taleID + "/";
        }

        if (instanceId) {
            if (queryPars !== "")
                queryPars += "&";
            queryPars += "instanceId=" + encodeURIComponent(instanceId);
        }
        if (title) {
            if (queryPars !== "")
                queryPars += "&";
            queryPars += "title=" + encodeURIComponent(title);
        }
        if (description != null) {
            queryPars += "&";
            queryPars += "description=" + encodeURIComponent(description);
        }

        if (isPublic) {
            queryPars += "&";
            queryPars += "public=" + encodeURIComponent(isPublic);
        }

        if (configuration) {
            queryPars += "&";
            queryPars += "config=" + encodeURIComponent(configuration);
        }

        if (queryPars) {
            url += "?" + queryPars;
        }
        let client = new XMLHttpRequest();
        client.open(httpCommand, url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(client.responseText);
            } else {
                fail(client.responseText);
            }
        });

        client.addEventListener("error", fail);

        client.send();
    },

    /**
    * Creates a Tale from a dataset.
    * @method taleFromDataset
    * @param imageId The ID of the image used for the Tale
    * @param identifier The doi/identifier of the data package
    * @param spawn Bool on whether to spawn the instance
    * @param lookupKwargs Optional arguments
    * @param taleKwargs Optional arguments
    * @param success Callback function that is called on success
    * @param fail Callback function that is called on fail
    */
    taleFromDataset(imageId,
        identifier,
        spawn,
        lookupKwargs,
        taleKwargs,
        success,
        fail) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/tale/import';
        let queryPars = "?";

        queryPars += "imageId=" + encodeURIComponent(imageId);
        queryPars += "&";
        queryPars += "url=" + encodeURIComponent(identifier);

        if (spawn) {
            queryPars += "&";
            queryPars += "spawn=" + encodeURIComponent(spawn);
        }
        if (lookupKwargs) {
            queryPars += "&";
            queryPars += "lookupKwargs=" + encodeURIComponent(lookupKwargs);
        }
        if (taleKwargs) {
            queryPars += "&";
            queryPars += "taleKwargs=" + encodeURIComponent(taleKwargs);
        }

        url += queryPars;
        let client = new XMLHttpRequest();
        client.open("post", url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(JSON.parse(client.responseText));
            } else {
                fail(client.responseText);
            }
        });

        client.addEventListener("error", fail);
        client.send();
    },

    postInstance(taleId, imageId, name, success, fail) {
        // Creates an instance
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/instance/';
        let queryPars = "";
        if ((taleId == null) && (imageId == null)) {
            fail("You must provide a tale or an image ID");
            return;
        }

        if (taleId == null) {
            queryPars += "imageId=" + encodeURIComponent(imageId);
        } else {
            queryPars += "imageId=" + encodeURIComponent(imageId);
            queryPars += "&";
            queryPars += "taleId=" + encodeURIComponent(taleId);
        }
        if (name != null) {
            queryPars += "&";
            queryPars += "name=" + encodeURIComponent(name);
        }

        if (queryPars !== "") {
            url += "?" + queryPars;
        }
        let client = new XMLHttpRequest();
        client.open("post", url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(client.responseText);
            } else {
                fail(client.responseText);
            }
        });

        client.addEventListener("error", fail);

        client.send();
    },

    exportTale(taleId, success, fail) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/tale/' + taleId + '/export?contentDisposition=attachment';

        let client = new XMLHttpRequest();
        client.responseType = 'blob';
        client.open('GET', url);
        client.setRequestHeader("Girder-Token", token);

        // Construct a filename for the download. Ideally this would be based upon
        // the filename set by the backend but I'm not sure how to access this
        // yet
        // TODO: Set filename argument in success callback to use the filename
        // provided by the backend
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(client, "tale-export-" + taleId + '.zip');
            } else {
                fail(client);
            }
        });

        client.send();
    },

    /**
    * Queries the job result endpoint.
    * @method getFinalJobStatus
    * @param jobId The ID of the job whose status is wanted
    * @param success Function that is called on success
    * @param fail Function that is called when the call fails
    */
    getFinalJobStatus(jobId, success, fail) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/job/' + jobId + '/result';

        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                success(JSON.parse(client.responseText));
            } else {
                fail(client.responseText);
            }
        });
        client.addEventListener("error", fail);
        client.send();
    },

    /**
     * Queries the resource/lookup endpoint to get the workspaceRootId.
     * @method getWorkspaceRootId
     * @param success Function to be called on success
     * @param fail Function to be called when the call fails
     */
    getWorkspaceRootId(success, fail) {
        const token = this.get('tokenHandler').getWholeTaleAuthToken();
        const path = '/collection/WholeTale Workspaces/WholeTale Workspaces';
        let url = `${config.apiUrl}/resource/lookup?path=${path}&test=false`;

        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", () => {
            if (client.status === 200) {
                const workspacesRoot = JSON.parse(client.responseText);
                success(workspacesRoot._id);
            } else {
                fail(client.responseText);
            }
        });
        client.addEventListener("error", fail);
        client.send();
    },

    /**
     * Copies a list of files and folders to a new destination folder POSTing to /resource/copy
     * @method copyToFolder
     * @param resources A JSON-encoded set of resources to copy. 
     *                  Each type is a list of ids. Only folders and items may be specified. 
     * @param parentType Parent type for the new parent of these resources
     * @param destinationFolderId Parent ID for the new parent of these resources
     * @param success Function to be called on success
     * @param fail Function to be called when the call fails
     * @param copier Component consuming the service
     * @param progress Whether to record progress on this task (optional).
     */
    copyToFolder(destinationFolderId, parentType, resources, permanently, success, fail, copier, progress) {
        const token = this.get('tokenHandler').getWholeTaleAuthToken();
        let verb = permanently ? 'move' : 'copy';
        const httpVerb = permanently ? 'PUT' : 'POST';
        let url = `${config.apiUrl}/resource/${verb}?resources=${resources}&parentType=${parentType}&parentId=${destinationFolderId}`;
        if(progress) {
            url += '&progress=true';
        }
        let client = new XMLHttpRequest();
        let notifier = this.get('notificationHandler');
        client.open(httpVerb, url);
        client.setRequestHeader("Girder-Token", token);
        client.addEventListener("load", function () {
            if (client.status === 200) {
                let gerund = permanently ? 'moving' : 'copying';
                success(notifier, copier, gerund);
            } else {
                fail(notifier, client.responseText);
            }
        });

        client.addEventListener("error", fail);

        client.send();
    },
    
    // Calls GET /instance/:id with the given id then immediately
    // calls PUT as a noop to restart the instance
    restartInstance(instance) {
        return $.ajax({
            url: `${config.apiUrl}/instance/${instance._id}`,
            method: 'PUT',
            headers: {
                'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
            },
            data: JSON.stringify(instance),
            dataType: 'json',
            contentType: 'application/json',
            timeout: 3000, // ms
            success: function(response) {
                console.log('Restarted Tale instance:', response);
            },
            error: function(err) {
                console.log('Failed to restart Tale instance:', err);
            }
        });
    },
    
    // Calls PUT /tale/:id/build with the given id
    rebuildTale(taleId) {
        return $.ajax({
            url: `${config.apiUrl}/tale/${taleId}/build`,
            method: 'PUT',
            headers: {
                'Girder-Token': this.get('tokenHandler').getWholeTaleAuthToken()
            },
            timeout: 3000, // ms
            success: function(response) {
                console.log('Building Tale image:', response);
            },
            error: function(err) {
                console.log('Failed to build Tale image:', err);
            }
        });
    },
});
