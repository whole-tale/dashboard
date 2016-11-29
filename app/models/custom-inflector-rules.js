import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;

inflector.uncountable('collection');
inflector.uncountable('folder');
inflector.uncountable('item');

// Meet Ember Inspector's expectation of an export
export default {};
