import Component from '@ember/component';
import EmberObject, { observer } from '@ember/object';
import { A } from '@ember/array';

export default Component.extend({
  // Temporary mock data
  datasets: A([
    {
      "_id": "5ce71581df11f7f5db93e7fb",
      "_modelType": "folder",
      "created": "2019-05-23T21:49:53.685000+00:00",
      "creatorId": "5cdde4ca84f03ea7329bab0d",
      "description": "",
      "identifier": "doi:10.5063/F1Z60M87",
      "name": "Elevation per SASAP region and Hydrolic Unit (HUC8) boundary for Alaskan watersheds",
      "provider": "DataONE",
      "size": 10259372,
      "updated": "2019-05-23T21:49:53.688000+00:00"
    },
    {
      "_id": "5ce7154cdf11f7f5db93e7f4",
      "_modelType": "folder",
      "created": "2019-05-23T21:49:00.645000+00:00",
      "creatorId": "5cdde4ca84f03ea7329bab0d",
      "description": "",
      "identifier": "https://raw.githubusercontent.com",
      "name": "raw.githubusercontent.com",
      "provider": "HTTPS",
      "size": 0,
      "updated": "2019-05-23T21:49:00.648000+00:00"
    },
    {
      "_id": "5ce30468df11f7f5db93e2d9",
      "_modelType": "folder",
      "created": "2019-05-20T19:47:52.985000+00:00",
      "creatorId": "5cdde4ca84f03ea7329bab0d",
      "description": "",
      "identifier": "10.7910/DVN/3MJ7IR",
      "name": "Replication Data for: \"Agricultural Fires and Health at Birth",
      "provider": "Dataverse",
      "size": 1901,
      "updated": "2019-05-20T20:29:55.378000+00:00"
    },
    {
      "_id": "5ce311abdf11f7f5db93e51f",
      "_modelType": "folder",
      "created": "2019-05-20T20:44:27.086000+00:00",
      "creatorId": "5cdde4ca84f03ea7329bab0d",
      "description": "",
      "identifier": "10.7910/DVN/R3GZZW",
      "name": "Replication Data for: The Economic Consequences of Partisanship in a Polarized Era",
      "provider": "Dataverse",
      "size": 26808,
      "updated": "2019-05-22T19:58:49.865000+00:00"
    },
    {
      "_id": "5ce715d2df11f7f5db93e807",
      "_modelType": "folder",
      "created": "2019-05-23T21:51:14.281000+00:00",
      "creatorId": "5cdde4ca84f03ea7329bab0d",
      "description": "",
      "identifier": "doi:10.18126/M2301J",
      "name": "Twin-mediated Crystal Growth: an Enigma Resolved",
      "provider": "Globus",
      "size": 793,
      "updated": "2019-05-23T21:51:14.285000+00:00"
    }
  ]),

  actions: {
    clickedDataset(dataset) {
      alert("You clicked on: " + dataset.name);
    },
    
    refresh() {
      console.log("Refreshing... ?");
    }
  },
});
