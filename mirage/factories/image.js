import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    _id: faker.random.alphaNumeric.bind(faker.random, 16),
    _modelType: "image",
    created: faker.date.past.bind(faker.date),
    creatorId: faker.random.alphaNumeric.bind(faker.random, 16),
    description: faker.lorem.sentences.bind(faker.lorem),
    digest: faker.random.number.bind(faker.random, {max:99999}),
    fullName: function() {
        return "wholetale/" + faker.lorem.word();
    },
    parentId: faker.random.alphaNumeric.bind(faker.random, 16),
    public: true,
    status: faker.random.number.bind(faker.random, {max:3}),
    tags: [],
    name: faker.lorem.words.bind(faker.lorem, 2),
    recipeId: faker.random.alphaNumeric.bind(faker.random, 16),
    updated: faker.date.recent.bind(faker.date),
    icon: faker.image.imageUrl.bind(faker.image, 518, 600, "abstract")
});
