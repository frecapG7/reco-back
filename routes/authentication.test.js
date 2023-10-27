const sinon = require('sinon');
const supertest = require('supertest');

const authenticationRoutes = require('./authentication');
const User = require('../model/User');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/auth', authenticationRoutes);


describe('POST /login', () => {


    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findOne');
    });
    afterEach(() => {
        userStub.restore();
    });


    it('Should return a missing user', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves(null);

        const response = await supertest(app)
            .post('/auth')
            .send({ name: 'test', password: 'test' });

        expect(response.status).toEqual(401);
        expect(response.body.message).toEqual('Authentication failed.');

    });

    it('Should return a wrong password', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({
            validPassword: sinon.stub().returns(false)
        });

        const response = await supertest(app)
            .post('/auth')
            .send({ name: 'test', password: 'test' });

        expect(response.status).toEqual(401);
        expect(response.body.message).toEqual('Authentication failed.');

    });

    it('Should return an authenticated user', async () => {

        const user = new User({
            name: 'test',
        });
        sinon.stub(user, 'validPassword').returns(true);

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves(user);

        const response = await supertest(app)
            .post('/auth')
            .send({ name: 'test', password: 'test' });

        console.debug(response.body.access_token);

        expect(response.status).toEqual(200);
        expect(response.body.username).toEqual('test');
        expect(response.body.id).toEqual(`${user._id}`);
        expect(response.body.access_token).toBeDefined();

    });



});