// app/pods/components/loading-widget/component.js
import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    classNames: ['loading', 'widget'],
    classNameBindings: ['isPrivate:private', 'isPublic:public', 'isProjectList:plist'],
    isPrivate: false,
    isPublic: false,
    isProjectList: false,
    isLoading: null
});
