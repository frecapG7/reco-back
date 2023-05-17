




const sinon = require('sinon');
const supertest = require('supertest');

const search = require('./search');
const Request = require('../model/Request');



const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/search', search);




describe('POST /requests', () => {

    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(Request, 'aggregate');
    });

    afterEach(() => {
        requestStub.restore();
    });


    it('should return paginated search with default values', async () => {

        requestStub.withArgs([
            { $match: { requestType: 'BOOK' } },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: 0 },
                        { $limit: 10 }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ]).resolves([
            {
                totalCount: [{ count: 2 }],
                paginatedResults: [
                    { _id: 1 },
                    { _id: 2 }
                ]
            }]);

        const response = await supertest(app)
            .post('/search/requests')
            .send({ requestType: 'BOOK' });

        expect(response.status).toBe(200);
        console.log(response.body);
        expect(response.body).toEqual(
            {
                "results": [
                    {
                        _id: 1,
                    },
                    {
                        _id: 2
                    }
                ],
                "totalCount": 2,
                "totalPages": 1,
            });


    });

    
    it('should return paginated search with values', async () => {

        requestStub.withArgs([
            { $match: { requestType: 'BOOK' } },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: 40 },
                        { $limit: 10 }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ]).resolves([
            {
                totalCount: [{ count: 2 }],
                paginatedResults: [
                    { _id: 1 },
                    { _id: 2 }
                ]
            }]);

        const response = await supertest(app)
            .post('/search/requests?pageNumber=5&pageSize=10')
            .send({ requestType: 'BOOK' });

        expect(response.status).toBe(200);
        console.log(response.body);
        expect(response.body).toEqual(
            {
                "results": [
                    {
                        _id: 1,
                    },
                    {
                        _id: 2
                    }
                ],
                "totalCount": 2,
                "totalPages": 1,
            });


    });

});
