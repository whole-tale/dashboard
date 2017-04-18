import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    id: 1,
    _id: faker.random.alphaNumeric.bind(faker.random, 16),
    _modelType: "user",
    _accessLevel: 2,
    admin: false,
    email: faker.internet.email.bind(faker.internet),
    emailVerified: true,
    created: faker.date.past.bind(faker.date),
    firstName: faker.name.firstName.bind(faker.name),
    lastName: faker.name.lastName.bind(faker.name),
    updated: faker.date.recent.bind(faker.date),
    gravatar_baseUrl: faker.image.avatar.bind(faker.image),
    login: faker.lorem.word.bind(faker.lorem),
    public: true,
    size: faker.random.number.bind(faker.random, {min:12345, max: 1234567}),
    status: "enabled"
});
