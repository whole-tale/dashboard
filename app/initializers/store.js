export function initialize(application) {
  // application.lookup supports Ember v >= 2.1
  // application.__container__ supports Ember 1.11 <= v <= 2.0
  const container = application.lookup ? application : application.__container__;

  // Eagerly generate the store so defaultStore is populated.
  container.lookup('service:store');
}

export default {
  name: 'store',
  initialize
};
