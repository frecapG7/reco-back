const sinon = require('sinon');
const supertest = require('supertest');

const routes = require('../routes/routes');
const Recommendation = require('../model/Recommendation');
const Request = require('../model/Request');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/', routes);


describe('GET /requests/:requestId/recommendations', () => {
    it('should return a missing request', async () => {
        const spy = sinon.spy(Recommendation, 'find');
        const stub = sinon.stub(Request, 'findById').resolves(null);

        const response = await supertest(app).get('/requests/1/recommendations');
        expect(response.status).toBe(404);
        //expect(response.error).toBe('Error: cannot GET /requests/1/recommendations');

        console.log(response.error);

        sinon.assert.notCalled(spy);

        stub.restore();
    });


    it('should return all recommendations for a request', async () => {
        const stubRequest = sinon.stub(Request, 'findById').resolves({
            id: 1,
        });
        const stubRecommentation = sinon.stub(Recommendation, 'find').resolves([
            {
                id: 1,
                request_id: 1,
                user_id: 1,
                field1: 'value1',
                field2: 'value2',
                field3: 'value3',
            }]);

        const response = await supertest(app).get('/requests/1/recommendations');
        expect(response.status).toBe(200);
        console.log(response.body);

        sinon.assert.calledWith(Recommendation.find, { request_id: 1 });


        stubRequest.restore();
        stubRecommentation.restore();
    });

});


describe('GET /recommendations/:id', () => {

    it('should return a recommendation', async () => {
        sinon.stub(Recommendation, 'findById').resolves(
            {
                id: 1,
                request_id: 1,
                user_id: 1,
                field1: 'value1',
                field2: 'value2',
                field3: 'value3',
            });

        const response = await supertest(app).get('/recommendations/1');
        expect(response.status).toBe(200);
        console.log(response.body);

        sinon.assert.calledWith(Recommendation.findById, 1);
    }
    );

});
