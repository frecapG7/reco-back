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

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Authentication failed. User not found.' });

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

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Authentication failed. Wrong password.' });

    });
    
    it('Should return an authenticated user', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({
            validPassword: sinon.stub().returns(true),
            toJSON: sinon.stub().returns({ name: 'test' })
        });

        const response = await supertest(app)
            .post('/auth')
            .send({ name: 'test', password: 'test' });

        expect(response.status).toBe(200);
        console.log(response.body);
        expect(response.body).toEqual({ 
            name: 'test'
        });

    });
    


});