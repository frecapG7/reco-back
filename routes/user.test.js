const sinon = require('sinon');
const supertest = require('supertest');

const User = require('../model/User');
const auth = require('../validator/auth');
const userService = require('../service/userService');
const userSettingsService = require('../service/userSettingsService');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const handleError = require('../middleware/errorMiddleware');
app.use(bodyParser.json());
app.use(express.json());

// Mock authenticateToken
// Order must prevail
const authenticateTokenStub = sinon.stub(auth, 'authenticateToken').callsFake((req, res, next) => {
    // Mock authentication logic
    req.userId = String(1);
    next();
});
const userRoutes = require('./user');

app.use('/users', userRoutes);
app.use(handleError);


describe('POST /users', () => {

    let userServiceStub;
    beforeEach(() => {
        userServiceStub = sinon.stub(userService, 'createUser');
    });
    afterEach(() => {
        userServiceStub.restore();
    });

    it('should return 201', async () => {

        userServiceStub.resolves(new User({
            email: 'test',
            name: 'test',
        }));

        const response = await supertest(app)
            .post('/users')
            .send({
                email: 'test',
                name: 'test',
                password: 'test'
            });

        expect(response.status).toBe(201);

    });
});


describe('GET /users/:id', () => {

    let userServiceStub;

    beforeEach(() => {
        userServiceStub = sinon.stub(userService, 'getUser');
    });
    afterEach(() => {
        authenticateTokenStub.restore();
        userServiceStub.restore();
    });

    it('should return user', async () => {
        userServiceStub.resolves(new User({
            email: 'test',
            name: 'test',
        }));

        const response = await supertest(app)
            .get('/users/1');

        expect(response.status).toBe(200);

    });
});

describe('PUT /users/:id', () => {

    let userServiceStub;


    beforeEach(() => {
        userServiceStub = sinon.stub(userService, 'updateUser');
    });
    afterEach(() => {
        userServiceStub.restore();
    });

    it('should return forbiden on invalid user id', async () => {

        const response = await supertest(app)
            .put('/users/2')
            .send({
                email: 'test',
                name: 'test',
            });

        expect(response.status).toBe(403);

    });


    it('should return updated user', async () => {

        userServiceStub.resolves({
            id: 1
        });

        const response = await supertest(app)
            .put('/users/1')
            .send({
                email: 'test',
                name: 'test',
            });

        expect(response.status).toBe(200);
        expect(response.body.id).toEqual(1);

    });


});


describe('GET /users/:id/settings', () => {

    let userSettingsServiceStub;

    beforeEach(() => {
        userSettingsServiceStub = sinon.stub(userSettingsService, 'getSettings');
    });
    afterEach(() => {
        userSettingsServiceStub.restore();
    });

    it('retun forbidden on invalid user id', async () => {
        const response = await supertest(app)
            .get('/users/123/settings');

        expect(response.status).toBe(403);

    });

    it('should return user settings', async () => {
        userSettingsServiceStub.resolves({
            lang: 'en',
            theme: 'light',
            notifications: true,
        });

        const response = await supertest(app)
            .get('/users/1/settings');

        expect(response.status).toBe(200);
        expect(response.body.lang).toEqual('en');
        expect(response.body.theme).toEqual('light');
        expect(response.body.notifications).toEqual(true);


    });

});

describe('PATCH /users/:id/settings', () => {

    let userSettingsServiceStub;

    beforeEach(() => {
        userSettingsServiceStub = sinon.stub(userSettingsService, 'updateSettings');
    });
    afterEach(() => {
        userSettingsServiceStub.restore();
    });

    it('Shoud return forbidden on invalid user id', async () => {
        const response = await supertest(app)
            .patch('/users/123/settings')
            .send({
                lang: 'en',
                theme: 'light',
                notifications: true,
            });

        expect(response.status).toBe(403);

    });

    it('Should return updated settings', async () => {
        userSettingsServiceStub.resolves({
            lang: 'en',
            theme: 'light',
            notifications: true,
        });

        const response = await supertest(app)
            .patch('/users/1/settings')
            .send({
                lang: 'en',
                theme: 'light',
                notifications: true,
            });

        expect(response.status).toBe(200);

    });

});

describe('DELETE /users/:id/settings', () => {

    let userSettingsServiceStub;

    beforeEach(() => {
        userSettingsServiceStub = sinon.stub(userSettingsService, 'resetSettings');
    });
    afterEach(() => {
        userSettingsServiceStub.restore();
    });

    it('Shoud return forbidden on invalid user id', async () => {
        const response = await supertest(app)
            .delete('/users/123/settings')
            .send();

        expect(response.status).toBe(403);

    });

    it('Should return updated settings', async () => {
        userSettingsServiceStub.resolves({
            lang: 'en',
            theme: 'light',
            notifications: true,
        });

        const response = await supertest(app)
            .delete('/users/1/settings')
            .send();

        expect(response.status).toBe(200);

    });

});

