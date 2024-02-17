

const sinon = require('sinon');
const supertest = require('supertest');
const requestService = require('../service/request/requestService');


const express = require('express');
const bodyParser = require('body-parser');
const handleError = require('../middleware/errorMiddleware');

const app = express();
app.use(bodyParser.json());
app.use(express.json());


const passport = require('../auth');

// Mock authenticateToken
// Order must prevail
const passportStub = sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
    return (req, res, next) => {
        req.user = {
            _id: '123'
        };
        next();
    };
});

const requestRoutes = require('./request');
app.use('/requests',(req, res, next) => {
    req.user = {
        _id: '123'
    };
    next();
}, requestRoutes);
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
            }, {
                _id: '123'
            
            })
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
                {
                    _id: '123'
                })
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

        expect(response.status).toBe(200);


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


describe('GET /requests', () => {

    let requestServiceStub;
    beforeEach(() => {
        requestServiceStub = sinon.stub(requestService, 'search');
    });
    afterEach(() => {
        requestServiceStub.restore();
    });

    it('should return 200 with no params', async () => {

        requestServiceStub
            .withArgs({}, 10, 1)
            .resolves({
                results: [],
                total: 0,
            });

        const response = await supertest(app).get('/requests');

        expect(response.status).toEqual(200);
        expect(response.body.results).toEqual([]);
        expect(response.body.total).toEqual(0);

    });

    it('should return 200 with params', async () => {

        requestServiceStub
            .withArgs({
                requestType: 'BOOK',
                status: 'OPEN',
                author: '123',
            }, 10, 1)
            .resolves({
                results: [],
                total: 0,
            });


        const response = await supertest(app)
            .get('/requests?type=BOOK&status=OPEN&me=true');

        expect(response.status).toEqual(200);
        expect(response.body.results).toEqual([]);
        expect(response.body.total).toEqual(0);
    });


});

