# Wholetale

This README outlines the details of collaborating on this Ember application.

This is the EmberJS/Semantic UI WholeTale dashboard.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## A note of PODs and components

Wholetale uses components in the Pods structure and uses this add on:

ember install ember-cli-component-pod

to allow components to be generated in this format. The resulting structure looks like this for a component called shape-3d:

shape-3d/component.js
shape-3d/style.scss
shape-3d/template.js

which allow you to add specific CSS styles, javascript functonality and HTML templates for the 
components. To create a new component, you would use the following Ember CLI:

ember g component-pod shape-3d

which would create the component, template and stylesheet. 

Clean Installation

bower cache clean
bower install --force
bower prune


## Notes

We use Ember truth helpers to make the handle bars code more readable:

https://github.com/jmurphyau/ember-truth-helpers
