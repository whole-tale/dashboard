import config from '../config/environment';
import { later, cancel } from '@ember/runloop';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import $ from 'jquery';
import {
    inject as service
} from '@ember/service';

const O = EmberObject.create.bind(EmberObject);

export default Service.extend({
    store: service(),
    tokenHandler: service('token-handler'),
    notificationHandler: service('notification-handler'),
    store: service(),
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

    postInstance(taleId, imageId, name) {
        return new Promise((resolve, reject) => {
            // Creates an instance
            const token = this.get('tokenHandler').getWholeTaleAuthToken();
            let url = config.apiUrl + '/instance/';
            let queryPars = "";
            if ((taleId == null) && (imageId == null)) {
                reject("You must provide a tale or an image ID");
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
                    let response = JSON.parse(client.responseText);
                    resolve(EmberObject.create(response));
                } else {
                    let err = JSON.parse(client.responseText);
                    reject(err);
                }
            });

            client.addEventListener("error", reject);
    
            client.send();
        });
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
    */
    getFinalJobStatus(jobId) {
        let token = this.get('tokenHandler').getWholeTaleAuthToken();
        let url = config.apiUrl + '/job/' + jobId + '/result';

        return new Promise((resolve, reject) => {
            let client = new XMLHttpRequest();
            client.open('GET', url);
            client.setRequestHeader("Girder-Token", token);
            client.addEventListener("load", function () {
                if (client.status === 200) {
                    resolve(JSON.parse(client.responseText));
                } else {
                    reject(JSON.parse(client.responseText));
                }
            });
            client.addEventListener("error", reject);
            client.send();
        });
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
    
    // Calls POST /tale/:id/copy and returns the copied tale
    copyTale(tale) {
        return new Promise((resolve, reject) => {
            if (tale._accessLevel > 0) {
              // No need to copy, short-circuit
              resolve(tale);
            }
    
            const token = this.get('tokenHandler').getWholeTaleAuthToken();
            let url = `${config.apiUrl}/tale/${tale._id}/copy`;
    
            let client = new XMLHttpRequest();
            client.open('POST', url);
            client.setRequestHeader("Girder-Token", token);
            client.addEventListener("load", () => {
                if (client.status === 200) {
                    const taleCopy = JSON.parse(client.responseText);
                    resolve(taleCopy);
                } else {
                    reject(client.responseText);
                }
            });
            client.addEventListener("error", reject);
            client.send();
        });
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

    /**
     * Publishes a Tale to DataONE
     * @method publishTale
     * @param taleId The ID of the Tale this is being published
     * @param repository the repo to which we should publish 
     */
  publishTale(taleId, repoUrl) {
      const token = this.get('tokenHandler').getWholeTaleAuthToken();
      return new Promise ((resolve, reject) => {
          let client = new XMLHttpRequest();
          client.open('PUT', `${config.apiUrl}/tale/${taleId}/publish?repository=${encodeURIComponent(repoUrl)}`);
          client.setRequestHeader("Girder-Token", token);
    
          client.addEventListener("load", function() {
            if (client.status === 200) {
              resolve(JSON.parse(client.response));
            } else {
              reject(JSON.parse(client.response));
            }
          });
          client.addEventListener("error", reject);
    
          client.send();
      });
    },

    /**
     * Returns the workspace folder ID for a Tale
     * @method getWorkspaceId
     * @param taleId The ID of the Tale
     * @param success Function to be called on success
     * @param fail Function to be called when the call fails
     */
    getWorkspaceId(taleId, success, fail) {
      const token = this.get('tokenHandler').getWholeTaleAuthToken();
      let url = `${config.apiUrl}/workspace/${taleId}`;

      let client = new XMLHttpRequest();
      client.open('GET', url);
      client.setRequestHeader("Girder-Token", token);
      client.addEventListener("load", () => {
          if (client.status === 200) {
              const resp = JSON.parse(client.responseText);
              success(resp._id);
          } else {
              fail(client.responseText);
          }
      });
      client.addEventListener("error", fail);
      client.send();
    },
    
    /** 
     * Wait for a model to meet a particular condition.
     * 
     * NOTE: You must provide a condition that, upon evaluating to "true", 
     * will stop the watch loop
     */
    waitFor(model, condition = (response) => true) {
        const self = this;
        let currentLoop = null;
        
        return new Promise((resolve, reject) => {
            if (!model) { return reject("No model provided"); }
            if (!model._modelType) { return reject("No modelType provided"); }
        
            // Poll the status of the model every second using recursive iteration
            const startLooping = (func) => {
              return later(() => {
                currentLoop = startLooping(func);
                self.get('store').findRecord(model._modelType, model._id, {
                    reload: true
                }).then(response => {
                    if (condition(response)) {
                        cancel(currentLoop);
                        resolve(response);
                    }
                }).catch(err => {
                    cancel(currentLoop);
                    reject(err);
                });
              }, 1000);
            };
    
            // Start polling
            currentLoop = startLooping();
        });
    },
    
    /** 
     * Wait for an image to reach a certain status. 
     * By default, we wait for the image status to be "Available".
     * 
     * For reference, see https://github.com/whole-tale/girder_wholetale/blob/master/server/constants.py
     * 
     * class ImageStatus(object):
     *     INVALID = 0
     *     UNAVAILABLE = 1
     *     BUILDING = 2
     *     AVAILABLE = 3
     */
    waitForImage(image, targetStatus = 3) {
        return this.waitFor(image, (image) => image.status === targetStatus)
    },
    
    /** 
     * Wait for an instance to reach a certain status. 
     * By default, we wait for the instance status to be "Running".
     * 
     * For reference, see https://github.com/whole-tale/girder_wholetale/blob/master/server/constants.py
     * 
     * class InstanceStatus(object):
     *     LAUNCHING = 0
     *     RUNNING = 1
     *     ERROR = 2
     *     DELETING = 3
     */
    waitForInstance(instance, targetStatus = 1) {
        return this.waitFor(instance, (instance) => instance.status === targetStatus || instance.status === 2);
    },
    
    /** 
     * Wait for a job to reach a certain status. 
     * By default, we wait for the job status to be "Success".
     * 
     * For reference, see https://github.com/girder/girder/blob/master/plugins/jobs/girder_jobs/constants.py
     * 
     * class JobStatus(object):
     *     INACTIVE = 0
     *     QUEUED = 1
     *     RUNNING = 2
     *     SUCCESS = 3
     *     ERROR = 4
     *     CANCELED = 5
     */
    waitForJob(job, targetStatus = 3) {
        return this.waitFor(job, (job) => job.status === targetStatus)
    },
  
    /**
     * Creates and returns an instance of the given Tale.
     * Best used with the "waitForInstance" helper method below.
     */
    startTale(tale) {
      const self = this;
      if (tale.instance && (tale.instance.status === 1 || tale.instance.status === 0)) {
          // Instance already exists, noop and return instance to watch status
          return new Promise(resolve => resolve(tale.instance));
      } else if (tale.instance && tale.instance.status === 2) {
          // TODO: Job finished, previous instance creation failed
          return this.stopTale(tale).then(instance => {
            // TODO: Wait a few seconds for Girder to finish deleting the instance
          }).then(() => {
            // Create a new instance
            return this.postInstance(tale.get("_id"), tale.get("imageId"), null);
          }).catch(err => {
              tale.set('launchError', err.message || err);
          });
      }
        
      // Create Job to launch new instance
      return this.postInstance(tale.get("_id"), tale.get("imageId"), null);
    },
  
    /**
     * Shuts down and deletes an instance of the given Tale.
     * Best used with the "waitForInstance" helper method below.
     */
    stopTale(tale) {
      const self = this;
      return new Promise((resolve, reject) => {
          if (tale.instance) {
            if (tale.instance.status === 2) {
              // TODO: Previous instance creation failed, proceed with caution
            } else if (tale.instance.status === 0) {
              // TODO: Instance is still launching... wait and then shut down
            }
              
            // TODO: Create Job to destroy/cleanup instance
            self.set('deletingInstance', true);
            const model = tale.instance;
            model.destroyRecord({
                reload: true,
                backgroundReload: false
            }).then((response) => {
                // TODO replace this workaround for deletion with something more robust
                self.get('store').unloadRecord(model);
                tale.set('instance', null);
                resolve(response);
            });
    
          } 
      });
    },
  
    fetchTaleData(taleId, fetchAll = true) {
      const self = this;
      const store = self.get('store');
      return store.findRecord('tale', taleId).then(tale => {
        // Fetch Tale instance, if one exists
        store.query('instance', { 'taleId': tale.get('id') }).then(instances => {
          tale.set('instance', instances.firstObject);
        }).catch((error) => console.log(`Failed to fetch instance(s) for tale (${tale._id}):`, error));
        
        // Fetch Tale creator
        store.findRecord('user', tale.get('creatorId')).then(creator => {
          tale.set('creator', O({
            firstName: creator.firstName,
            lastName: creator.lastName,
            orcid: ''
          }));
        }).catch((error) => console.log(`Failed to fetch creator for tale (${tale._id}):`, error));
          
        if (fetchAll) {
          // Fetch Tale image
          store.findRecord('image', tale.get('imageId')).then(image => {
            tale.set('image', image);
          }).catch((error) => console.log(`Failed to fetch image for tale (${tale._id}):`, error));
          
          // Fetch Tale Workspace folder
          let folderId = tale.get('folderId');
          if (folderId) {
            store.findRecord('folder', folderId).then(folder => {
              tale.set('folder', folder);
            }).catch((error) => console.log(`Failed to fetch folder for tale (${tale._id}):`, error));
          }
        }
        return tale;
      });
    },
    

    /**
     * Fetch the target resource_servers associated with the given provider.
     * @method getExtAccountTargets
     * @param providerName The name of the provider
     */
    getExtAccountTargets(providerName) {
        return new Promise((resolve, reject) => {
          const token = this.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/account/${providerName}/targets`;
    
          let client = new XMLHttpRequest();
          client.open('GET', url);
          client.setRequestHeader("Girder-Token", token);
          client.addEventListener("load", () => {
              if (client.status === 200) {
                  const resp = JSON.parse(client.responseText);
                  resolve(resp);
              } else {
                  reject(client.responseText);
              }
          });
          client.addEventListener("error", reject);
          client.send();
        });
    },
    

    /**
     * Authorize an external token.
     * @method authExtToken
     * @param providerName The provider for which to create a token
     * @param resourceServer The resource_server associated with this API key
     * @param keyValue The value of the API key to add
     * @param keyType (optional) either 'dataone' or 'apikey' (apikey is default) 
     */
    authExtToken(providerName, resourceServer, keyValue, keyType) {
        return new Promise((resolve, reject) => {
          const token = this.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/account/${providerName}/key?key=${keyValue}&resource_server=${resourceServer}`;
          
          if (keyType) {
              url += `&key_type=${keyType}`;
          } else {
              url += `&key_type=apikey`;
          }
    
          let client = new XMLHttpRequest();
          client.open('POST', url);
          client.setRequestHeader("Girder-Token", token);
          client.addEventListener("load", () => {
              if (client.status === 200) {
                  const resp = JSON.parse(client.responseText);
                  resolve(resp);
              } else {
                  reject(client.responseText);
              }
          });
          client.addEventListener("error", reject);
          client.send();
        });
    },
    

    /**
     * Revoke an external token.
     * @method revokeExtToken
     * @param token The token to revoke
     */
    revokeExtToken(extToken, redirect, resourceServer) {
        return new Promise((resolve, reject) => {
          const token = this.get('tokenHandler').getWholeTaleAuthToken();
          let url = `${config.apiUrl}/account/${extToken.provider}/revoke?redirect=${redirect}`;
          
          if (resourceServer) {
              url += `&resource_server=${resourceServer}`;
          }
    
          let client = new XMLHttpRequest();
          client.open('GET', url);
          client.setRequestHeader("Girder-Token", token);
          client.addEventListener("load", () => {
              if (client.status === 200) {
                  const resp = JSON.parse(client.responseText);
                  resolve(resp);
              } else {
                  reject(client.responseText);
              }
          });
          client.addEventListener("error", reject);
          client.send();
        });
    },
  
    /**
     * Returns the ID of the home folder
     * @method getHomeId
     * @param success Function to be called on success
     * @param fail Function to be called when the call fails
     */
/*     getHomeId(success, fail) {
      const token = this.get('tokenHandler').getWholeTaleAuthToken();
      let url = `${config.apiUrl}/workspace/${taleId}`;

      let client = new XMLHttpRequest();
      client.open('GET', url);
      client.setRequestHeader("Girder-Token", token);
      client.addEventListener("load", () => {
          if (client.status === 200) {
              const resp = JSON.parse(client.responseText);
              success(resp._id);
          } else {
              fail(client.responseText);
          }
      });
      client.addEventListener("error", fail);
      client.send();
  }, */
  })
