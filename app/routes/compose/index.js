import AuthenticateRoute from 'wholetale/routes/authenticate';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default AuthenticateRoute.extend({
  internalState: service(),
  // Optional query parameters used when importing a dataset/Tale
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

  model(params) {
    let state = this.get('internalState');
    let thisUserID = this.get('userAuth').getCurrentUserID();
    let data = this.get('store').query('folder', {
      parentId: thisUserID,
      parentType: "user",
      reload: true,
      adapterOptions: {
        queryParams: {
          limit: "0"
        }
      }
    });
    let registered = this.get('store').query('folder', {
      reload: true,
      adapterOptions: {
        appendPath: "registered",
        queryParams: {
          limit: "0"
        }
      }
    });
    let allData = [];

    data.forEach(function (model) {
      allData.push(model);
    });
    registered.forEach(function (model) {
      allData.push(model);
    });

    return RSVP.hash({
      data: data,
      images: this.get('store').findAll('image', {
        reload: true,
        adapterOptions: {
          queryParams: {
            sort: "lowerName",
            sortdir: "1",
            limit: "50"
          }
        }
      }),
      tales: this.get('store').findAll('tale', {
        reload: true,
        adapterOptions: {
          queryParams: {
            limit: "0"
          }
        }
      }),
      dataRegistered: registered,
      allData: registered,
      queryParams: params
    });
  }
});
