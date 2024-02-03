const sinon = require('sinon');
const supertest = require('supertest');

const tokenValidation = require('../service/validation/tokenValidation');
const userValidation = require('../service/validation/userValidation');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const handleError = require('../middleware/errorMiddleware');
app.use(bodyParser.json());
app.use(express.json());


const validationRoutes = require('./validation');

app.use('/validate', validationRoutes);
app.use(handleError);

describe('Test /validate/token', () => {

    let validateTokenStub;

    beforeEach(() => {
        validateTokenStub = sinon.stub(tokenValidation, 'validateToken');
    });
    afterEach(() => {
        validateTokenStub.restore();
    });


    it('Should valid happy path', async () => {

        validateTokenStub.resolves();

        const response = await supertest(app)
            .post('/validate/token')
            .send({
                value: 'to1to3'
            });

        expect(response.status).toBe(200);
        sinon.assert.calledWith(validateTokenStub, 'to1to3');
    })

});


describe('Test /validate/email', () => {

    let validateEmailStub;

    beforeEach(() => {
        validateEmailStub = sinon.stub(userValidation, 'validateEmailUnicity');
    });
    afterEach(() => {
        validateEmailStub.restore();
    });


    it('Should valid happy path', async () => {

        validateEmailStub.resolves();
        
        const response = await supertest(app)
            .post('/validate/email')
            .send({
                value: 'toto@hotmail.fr'
            });

        expect(response.status).toBe(200);
        sinon.assert.calledWith(validateEmailStub, 'toto@hotmail.fr');
    });

});



describe('Test /validate/username', () => {

    let validateUsernameStub;

    beforeEach(() => {
        validateUsernameStub = sinon.stub(userValidation, 'validateUsernameUnicity');
    });
    afterEach(() => {
        validateUsernameStub.restore();
    });


    it('Should valid happy path', async () => {

        validateUsernameStub.resolves();
        
        const response = await supertest(app)
            .post('/validate/username')
            .send({
                value: 'LeoKram'
            });

        expect(response.status).toBe(200);
        sinon.assert.calledWith(validateUsernameStub, 'LeoKram');
    })

});
