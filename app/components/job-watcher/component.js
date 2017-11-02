import Ember from 'ember';
import layout from './template';

const INACTIVE = 0;
const QUEUED = 1;
const RUNNING = 2;
const SUCCESS = 3;
const ERROR = 4;
const CANCELED = 5;

export default Ember.Component.extend({
  layout,
  
  watchedJobs: Ember.A(),
  pastJobs: Ember.A(),
  
  showPastJobs: false, 

  isLoading: true,

  didInsertElement() {
    this._super(...arguments);

    const jobs = this.jobs.toArray();
    if (jobs.length) {
      const { _watched, _past } = jobs.reduce((all, job) => {
        const status = job.get('status');
        if (status <= RUNNING ) {
          all._watched.push(job);
        } else {
          all._past.push(job);
        }
        return all;
      }, {_watched: [], _past: []});
      this.set('watchedJobs', _watched);
      this.set('pastJobs', _past);
    }

    $('.message .close')
      .on('click', function() {
        $(this)
          .closest('.message')
          .transition('fade')
        ;
      })
    ;
  },

  actions: {
    togglePastJobs() {
      this.set('showPastJobs', !this.showPastJobs);
    },

    clearAllPastJobs() {
      this.pastJobs.forEach(job => job.destroyRecord());
      this.set('pastJobs', Ember.A());
    },

    deleteJob(job) {
      const component = this;
      job.destroyRecord()
        .then(() => {
          const pastJobs = component.pastJobs.reject(j => j._id===job._id);
          component.set('pastJobs', pastJobs); 
        })
      ;
    },

    cancelJob(job) {
      const component = this;
      job.save({adapterOptions:{appendPath:'cancel'}})
        .then(() => {
          job.set('status', CANCELED);
          const pastJobs = component.pastJobs.slice().toArray();
          pastJobs.unshift(job);
          component.set('pastJobs', pastJobs);
          const watchedJobs = component.pastJobs.reject(j => j._id===job._id);
          component.set('watchedJobs', watchedJobs);
        })
      ;
    }
  }
});