import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;

inflector.uncountable('collection');
inflector.uncountable('folder');
inflector.uncountable('item');
inflector.uncountable('user');
inflector.uncountable('image');
inflector.uncountable('registered');
inflector.uncountable('tale');
inflector.uncountable('resource');
inflector.uncountable('instance');

// Meet Ember Inspector's expectation of an export
export default {};
