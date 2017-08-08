import Ember from 'ember';

export default Ember.Mixin.create({
    buildQueryParams(queryParams) {
        let keys = Object.keys(queryParams);
        let q = keys.reduce((_q, key) => {
            _q.push(key + "=" + queryParams[key]);
            return _q;
        }, []);
        return q.join('&');
    }
});