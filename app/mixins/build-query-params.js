import Ember from 'ember';

export default Ember.Mixin.create({
    buildQueryParams(queryParams) {
        let keys = Object.keys(queryParams);
        let q = keys.reduce((_q, key) => {
            if(/tags/.test(key)) {
                let tags = queryParams[key].map(tag => '"'+ tag + '"').join(",");
                _q.push(key + "=" + encodeURIComponent("[" + tags + "]"));
            }
            else {
                _q.push(key + "=" + encodeURIComponent(queryParams[key]));
            }
            return _q;
        }, []);
        return q.join('&');
    }
});
