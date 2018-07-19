import Ember from 'ember';
import editor from 'wholetale/components/ember-ace';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
    console.log("Configuring ace editor in component" );

    // how do I set these???

    editor.mode = "ace/mode/javascript";
    editor.theme = "ace/theme/chaos";
  },
  actions : {
    valueUpdated: function (newVal) {
      console.log("New code: " + newVal);
      this.sendAction('action', newVal );
    },
  }
});

/**
 *
 Options:

 mode: the mode for the editor to operate in, either a string (e.g. "ace/mode/javascript") or a Mode instance
 theme: the color scheme to be used (e.g. "ace/theme/chaos");


 These are the themes available for this editor:

 The IDE contains the following themes:

 Chrome
 Clouds
 Clouds Midnight
 Cobalt
 Crimson Editor
 Dawn
 Eclipse
 Idle Fingers
 Kr Theme
 Merbivore
 Merbivore Soft
 Mono Industrial
 Monokai
 Pastel On Dark
 Solarized Dark
 Solarized Light
 TextMate
 Tomorrow
 Tomorrow Night
 Tomorrow Night Blue
 Tomorrow Night Bright
 Tomorrow Night Eighties
 Twilight
 Vibrant Ink

 */
