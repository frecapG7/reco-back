

const sinon = require('sinon');
const supertest = require('supertest');



const userRoutes = require('./user');
const User = require('../model/User');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/users', userRoutes);


describe('POST /users', () => {


    it('should return exception on user unicity', async () => {
        const userStub = sinon.stub(User, 'findOne');
        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves({ _id: 1 });

        const response = await supertest(app)
            .post('/users')
            .send({
                email: 'test',
                name: 'test',
                password: 'test'
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ message: 'User already exists' });

        userStub.restore();

    });

    it('should test happy path', async () => {
        const userStub = sinon.stub(User, 'findOne');
        userStub.withArgs({
            $or: [
                { email: 'test' },
                { name: 'test' }
            ]
        }).resolves(null);

        const userSaveStub = sinon.stub(User.prototype, 'save')
            .resolves({
                _id: 1,
                email: 'test',
                name: 'test',
                toJSON: sinon.stub().returns({})
            });


        const response = await supertest(app)
            .post('/users')
            .send({
                email: 'test',
                name: 'test',
                password: 'test'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({});

        userStub.restore();

    });
});
