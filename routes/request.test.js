

const sinon = require('sinon');
const supertest = require('supertest');
const requestService = require('../service/requestService');


const express = require('express');
const bodyParser = require('body-parser');
const handleError = require('../middleware/errorMiddleware');

const app = express();
app.use(bodyParser.json());
app.use(express.json());


const auth = require('../validator/auth');
// Mock authenticateToken
// Order must prevail
const authenticateTokenStub = sinon.stub(auth, 'authenticateToken').callsFake((req, res, next) => {
    // Mock authentication logic
    req.userId = String(123);
    next();
});
const requestRoutes = require('./request');
app.use('/requests', requestRoutes);
app.use(handleError);

describe('GET /requests/:id', () => {
    let requestServiceStub;

    beforeEach(() => {
        requestServiceStub = sinon.stub(requestService, 'getRequest');
    });
    afterEach(() => {
        requestServiceStub.restore();
    });


    it('should return a request', async () => {
        requestServiceStub
            .withArgs('123')
            .resolves({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: '2D',
                status: 'PENDING',
            });

        const response = await supertest(app)
            .get('/requests/123');

        expect(response.status).toEqual(200);
    });


});


describe('POST /request', () => {

    let requestServiceStub;

    beforeEach(() => {
        requestServiceStub = sinon.stub(requestService, 'createRequest');
    });
    afterEach(() => {
        requestServiceStub.restore();
    });


    it('should return 200', async () => {

        requestServiceStub
            .withArgs({
                requestType: 'BOOK',
                description: 'SciFi recommended book',
            }, '123')
            .resolves({
                id: '1',
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: '2D',
                status: 'PENDING',
            });

        const response = await supertest(app)
            .post('/requests')
            .send({
                requestType: 'BOOK',
                description: 'SciFi recommended book',
            });

        expect(response.status).toBe(201);
        expect(response.body.id).toEqual('1');



    });

});


describe('PUT /request', () => {

    let requestServiceStub;
    beforeEach(() => {
        requestServiceStub = sinon.stub(requestService, 'updateRequest');
    });
    afterEach(() => {
        requestServiceStub.restore();
    });

    it('should return 200', async () => {

        requestServiceStub
            .withArgs('123',
                {
                    id: 1,
                    requestType: 'BOOK',
                    description: 'SciFi recommended book',
                    duration: '2D',
                },
                '123')
            .resolves(
                {
                    id: 1,
                    requestType: 'BOOK',
                    description: 'SciFi recommended book',
                    duration: '2D',
                    status: 'PENDING',
                }
            );

        const response = await supertest(app).put('/requests/123')
            .send({
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: '2D',
            });

        expect(response.status).toBe(204);


    });


});


describe('DELETE /requests/:id', () => {

    let requestServiceStub;
    beforeEach(() => {
        requestServiceStub = sinon.stub(requestService, 'deleteRequest');
    });
    afterEach(() => {
        requestServiceStub.restore();
    });


    it('should return 200', async () => {

        requestServiceStub
            .withArgs('2', '123')
            .resolves({});

        const response = await supertest(app).delete('/requests/2');

        expect(response.status).toEqual(204);

    });
});