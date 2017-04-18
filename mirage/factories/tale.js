import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    _id: faker.random.alphaNumeric.bind(faker.random, 16),
    _modelType: "tale",
    config: "null",
    created: faker.date.past.bind(faker.date),
    creatorId: faker.random.alphaNumeric.bind(faker.random, 16),
    description: faker.lorem.words.bind(faker.lorem, 3),
    folderId: faker.random.alphaNumeric.bind(faker.random, 16),
    imageId: faker.random.alphaNumeric.bind(faker.random, 16),
    parentCollection: "collection",
    public: true,
    name: faker.lorem.words.bind(faker.lorem, 3),
    published: true,
    updated: faker.date.recent.bind(faker.date)
});
