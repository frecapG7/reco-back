const sinon = require('sinon');
const supertest = require('supertest');
const cartService = require('../service/cartService');

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
const cartRoutes = require('./cart');
app.use('/api/users/:userId/carts', cartRoutes);
app.use(handleError);



describe('Test GET /users/:userId/carts', () => {
    let cartStub;

    beforeEach(() => {
        cartStub = sinon.stub(cartService, 'getCart');
    });
    afterEach(() => {
        cartStub.restore();
    });


    it('Should return cart', async () => {

        cartStub.withArgs('123', 1, 10)
            .resolves({
                items: [{ _id: 1 }]
            });

        const response = await supertest(app)
            .get('/api/users/123/carts');

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ items: [{ _id: 1 }] });
    });


});

describe('Test POST /users/:userId/carts', () => {

    let cartStub;
    beforeEach(() => {
        cartStub = sinon.stub(cartService, 'addItemToCart');
    });
    afterEach(() => {
        cartStub.restore();
    });

    it('Should return forbidden', async () => {
        const response = await supertest(app)
            .post('/api/users/456/carts')
            .send({});
        expect(response.status).toEqual(403);

    })

    it('Should return created', async () => {
        cartStub.withArgs('123', {})
            .resolves({
                items: [{ _id: 1 }]
            });

        const response = await supertest(app)
            .post('/api/users/123/carts')
            .send({});
        expect(response.status).toEqual(201);
        expect(response.body).toEqual({ items: [{ _id: 1 }] });
        
    });
});

describe('Test DELETE /users/:userId/carts/:itemId', () => {
    let cartStub;
    beforeEach(() => {
        cartStub = sinon.stub(cartService, 'deleteItemFromCart');
    });
    afterEach(() => {
        cartStub.restore();
    });

    it('Should return forbidden', async () => {
        const response = await supertest(app)
            .delete('/api/users/456/carts/123');
        expect(response.status).toEqual(403);

    })

    it('Should return created', async () => {
        cartStub.withArgs('123', '456')
            .resolves({});

        const response = await supertest(app)
            .delete('/api/users/123/carts/456');
            
        expect(response.status).toEqual(204);
        
    });
    

});

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

        expect(response.status).toEqual(403);

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