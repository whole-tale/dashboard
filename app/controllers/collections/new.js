import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  setDriveObj() {
    var obj = Ember.Object.create();
    obj["public"] = true;
    this.set('collection', obj);
  },
  init() {
    this._super(...arguments);
    console.log("Setting up the checkbox.");

    this.setDriveObj();

  },
  isFailed : false,
  reason : "",
  actions: {
    createDrive: function() {
      var self = this;
      var collection = this.get('collection');

      console.log("Checkbox: " + collection.public);

      var failureReasons = "";

      if (collection.name ==null || collection.name === "") {
        failureReasons = "Sorry, you must provide a name for your collection";
      }

      if (failureReasons !== "") {
        self.set('isFailed', true);
        self.set('reason', failureReasons);
        return;
      }

      var drive = this.get('store').createRecord('collection', {
        name: collection.name,
        description: collection.description,
        public: collection.public,
      });


      drive.save().then(function success() {
        self.transition('drives.view', drive);
        // reset variables
        self.setDriveObj();
      }).catch(function (reason) {
        console.log(reason);
        self.set('isFailed', true);
        self.set('reason', JSON.stringify(reason['errors']));
      });

    },
  }
});
