import Ember from 'ember';

export default Ember.Mixin.create({
    buildQueryParams(queryParams) {
        let keys = Object.keys(queryParams);
        let q = keys.reduce((_q, key) => {
            if(key === "tags") {
                let tags = queryParams[key].map(tag => '"'+ tag + '"').join(",");
                _q.push(key + "=" + encodeURI("[" + tags + "]"));
            }
            else {
                _q.push(key + "=" + queryParams[key]);
            }
            return _q;
        }, []);
        return q.join('&');
    }
});
