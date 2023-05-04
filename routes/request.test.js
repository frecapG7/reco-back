

const sinon = require('sinon');
const supertest = require('supertest');



const requestRoutes = require('./request');
const Request = require('../model/Request');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/requests', requestRoutes);

describe('GET /requests', () => {

    it('should return all requests', async () => {
        sinon.stub(Request, 'find').resolves([
            {
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
                status: 'PENDING',
                author: '5e8cfaa7c9e7ce2e3c9b1b0b',
                created_at: '2020-04-07T20:25:35.000Z'
            },
            {
                id: 2,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
                status: 'PENDING',
                author: '5e8cfaa7c9e7ce2e3c9b1b0b',
                created_at: '2020-04-07T20:25:35.000Z'
            }
        ]);


        const response = await supertest(app)
            .get('/requests');
        expect(response.status).toBe(200);
        console.log(response.body);
    });

});


describe('GET /requests/:id', () => {
    it('should return 404', async () => {
        const stub = sinon.stub(Request, 'findById').resolves(null);

        const response = await supertest(app).get('/requests/1');

        expect(response.status).toBe(404);

        stub.restore();
    });

    it('should return a request', async () => {
        const stub = sinon.stub(Request, 'findById').resolves({
            id: 1,
            requestType: 'BOOK',
            description: 'SciFi recommended book',
            duration: 2,
            status: 'PENDING',
        });

        const response = await supertest(app).get('/requests/1');

        expect(response.status).toBe(200);

        stub.restore();
    });


});


describe('POST /request', () => {

    it('should return 500', async () => {

        const stub = sinon.stub(Request.prototype, 'save')
            .throws(new Error('Fake error from sinon'));

        const response = await supertest(app).post('/requests')
            .send({
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
            });

        expect(response.status).toBe(500);

        stub.restore();

    });


    it('should return 200', async () => {

        const stub = sinon.stub(Request.prototype, 'save')
            .resolves({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
                status: 'PENDING',
            });

        const response = await supertest(app).post('/requests')
            .send({
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
            });

        expect(response.status).toBe(200);

        stub.restore();

    });

});


describe('PUT /request', () => {

    it('should return 500', async () => {

        const stub = sinon.stub(Request, 'findOneAndUpdate').throws(new Error('Fake error from sinon'));

        const response = await supertest(app).put('/requests')
            .send({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
            });

        expect(response.status).toBe(500);

        stub.restore();


    });


    it('should return 404', async () => {

        const stub = sinon.stub(Request, 'findOneAndUpdate').resolves(null);

        const response = await supertest(app).put('/requests')
            .send({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
            });

        expect(response.status).toBe(404);

        stub.restore();


    });


    it('should return 200', async () => {
        const stub = sinon.stub(Request, 'findOneAndUpdate').resolves(
            {
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
                status: 'PENDING',
            }
        );

        const response = await supertest(app).put('/requests')
            .send({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
            });

        expect(response.status).toBe(200);


        stub.restore();

    });


});


describe('DELETE /requests/:id', () => {

    it('should return 404', async () => {
        const stub = sinon
            .stub(Request, 'findByIdAndDelete')
            .resolves(null);

        const response = await supertest(app).delete('/requests/2');

        expect(response.status).toBe(404);
        stub.restore();

    });


    it('should return 500', async () => {
        const stub = sinon
            .stub(Request, 'findByIdAndDelete')
            .throws(new Error('Fake error from sinon'));

        const response = await supertest(app).delete('/requests/2');

        expect(response.status).toBe(500);

        stub.restore();
    });


    it('should return 200', async () => {
        const stub = sinon
            .stub(Request, 'findByIdAndDelete')
            .resolves({
                id: 1,
                requestType: 'BOOK',
                description: 'SciFi recommended book',
                duration: 2,
                status: 'PENDING',
            });

        const response = await supertest(app).delete('/requests/2');

        expect(response.status).toBe(200);
        stub.restore();

    });
});