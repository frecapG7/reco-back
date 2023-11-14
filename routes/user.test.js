

const sinon = require('sinon');
const supertest = require('supertest');

const userRoutes = require('./user');
const User = require('../model/User');
const auth = require('../validator/auth');
const userService = require('../service/userService');


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


describe('GET /users/:id', () => {

    let authenticateTokenStub;
    let userServiceStub;

    beforeEach(() => {
        authenticateTokenStub = sinon.stub(auth, 'authenticateToken').callsFake((req, res, next) => {
            // Mock authentication logic
            req.userId = 1;
            next();
        });
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

    let authenticateTokenStub;


    beforeEach(() => {
        authenticateTokenStub = sinon.stub(authenticateToken, 'authenticateToken');
    });

    it('should return forbiden on invalid user id', async () => {


    });


    it('should return updated user', async () => {
        const mockUser = new User({
            _id: 1,
            email: 'test',
            name: 'test',
        });


        sinon.stub(authenticateToken)


        const response = await supertest(app)
            .put('/users/1')
            .send({
                email: 'test',
                name: 'test',
            });

        expext(response.status).toBe(200);

    });







});
