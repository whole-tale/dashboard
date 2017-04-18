import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    _id: faker.random.alphaNumeric.bind(faker.random, 16),
    _modelType: "folder",
    baseParentId: faker.random.alphaNumeric.bind(faker.random, 16),
    baseParentType: "collection",
    created: faker.date.past.bind(faker.date),
    creatorId: faker.random.alphaNumeric.bind(faker.random, 16),
    description: faker.lorem.sentences.bind(faker.lorem),
    meta: {
        identifier: faker.random.alphaNumeric.bind(faker.random, 5),
        provider: "DataONE"
    },
    parentId: faker.random.alphaNumeric.bind(faker.random, 16),
    parentCollection: "collection",
    public: true,
    size: faker.random.number.bind(faker.random, {min: 12345, max: 123456789}),
    name: faker.lorem.words.bind(faker.lorem, 3),
    updated: faker.date.recent.bind(faker.date)
});
