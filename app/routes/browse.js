import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import {inject as service} from '@ember/service';
import {A} from '@ember/array';
import object from '@ember/object';

const O = object.create.bind(object);

export default AuthenticateRoute.extend({
  store: service('store'),

  queryParams:{
    // The URI of a package or Tale that is going to be imported
    uri: {refreshModel:true},
    // An optional title of the dataset or Tale
    name: {refreshModel:true},
    // An optional API URL that can be used to access information about the dataset
    api: {refreshModel:true},
    // An optional environment name
    environment: {refreshModel:true}
  },

  async model(queryParams) {
    this._super(...arguments);

    //NOTE(Adam): The compute environments are needed within the "Create New Tale" modal. This 
    //            modal was temporarily added onto the "browse tales" page on 04/18/19 as instructed
    //            by Craig Willis in issue https://github.com/whole-tale/dashboard/issues/452
    let computeEnvironments = O({
      official: A(),
      nonOfficial: A()
    }); 

    //NOTE(Adam): Fetch all compute environments
    let images = await this.get('store').query('image', {sort:'name', sortdir:'1'});

    //NOTE(Adam): Sort out the official and non-official compute environments
    images.forEach(image => {
      if (image._accessLevel == -1 && image.public == true) {
        computeEnvironments.official.pushObject(image);
      } else {
        computeEnvironments.nonOfficial.pushObject(image);
      }
    });

    return RSVP.hash({
      computeEnvironments,
      queryParams,
      instances: this.get('store').findAll('instance', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }),
      tales: this.get('store').findAll('tale', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "created",
            sortdir: "1",
            limit: "0"
          }
        }
      })
    });
  }
});