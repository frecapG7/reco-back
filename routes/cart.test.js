const sinon = require('sinon');
const supertest = require('supertest');

const cartRoutes = require('./cart');
const cartService = require('../service/cartService');

const express = require('express');
const bodyParser = require('body-parser');
const handleError = require('../middleware/errorMiddleware');


const app = express();
app.use(bodyParser.json());
app.use(express.json());


app.use(handleError);
app.use('/api/users/:userId/carts', cartRoutes);


jest.mock('../validator/auth', () => ({
    authenticateToken: (req, res, next) => {
        req.userId = '123';
        next();
    }
}));


describe('Test PUT :itemId/mark-read', () => {
    let cartStub;
    beforeEach(() => {
        cartStub = sinon.stub(cartService, 'markItemAsRead');
    });
    afterEach(() => {
        cartStub.restore();
    });


    it('Should return 401', async () => {

        const response = await supertest(app)
            .put('/api/users/456/carts/123/mark-read');

        expect(response.status).toEqual(401);

    });

    it('Should return cart', async () => {

        cartStub.withArgs('123', '123')
            .resolves({
                items: [{ _id: 1 }]
            });

        const response = await supertest(app)
            .put('/api/users/123/carts/123/mark-read');

        expect(response.status).toEqual(200);

    });

})