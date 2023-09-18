const sinon = require('sinon');
const supertest = require('supertest');

const authenticationRoutes = require('./authentication');
const User = require('../model/User');


const express = require('express');
const bodyParser = require('body-parser');
const { expect } = require('chai');
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

        expect(response.status).equal(401);
        expect(response.body).equal({ message: 'Authentication failed. User not found.' });

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

        expect(response.status).equal(401);
        expect(response.body).equal({ message: 'Authentication failed. Wrong password.' });

    });

    it('Should return an authenticated user', async () => {

        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({
            _id: '5e8cfaa7c9e7ce2e3c9b1b0b',
            validPassword: sinon.stub().returns(true),
            toJSON: sinon.stub().returns({
                name: 'test'
            })
        });

        const response = await supertest(app)
            .post('/auth')
            .send({ name: 'test', password: 'test' });


        expect(response.status).equal(200);
        expect(response.body).to.have.property('access_token');
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('username');
        expect(response.body.username).toEqual('test');
        // expect(response.body)
        //     .toEqual("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImlhdCI6MTY5Mzg0NTMwNSwiZXhwIjoxNjkzODQ3MTA1fQ.CHATksVcjRSbZSc_Pl18g6KMzYdYdRnhvQ6p0h7mNXM");

    });



});