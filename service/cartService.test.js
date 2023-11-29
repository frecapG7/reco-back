
const { ObjectId } = require('mongodb');
const { NotFoundError } = require('../errors/error');
const { Cart, CartItem } = require('../model/Cart');
const cartService = require('./cartService');
const sinon = require('sinon');


describe('Test getCart function', () => {

    let cartStub;

    beforeEach(() => {
        cartStub = sinon.stub(Cart, 'findOne');
    });
    afterEach(() => {
        cartStub.restore();
    });



    it('Should return an empty cart', async () => {

        cartStub.withArgs({
            user_id: '123'
        }).resolves(null);

        const result = await cartService.getCart('123', 1, 1);

        expect(result.items.length).toEqual(0);

    });

    it('Should return cart items', async () => {
        const cartItem1 = new CartItem({
            'field1': 'Toito',
            'type': 'OPEN'
        });
        const cartItem2 = new CartItem({
            'field1': 'Toito',
            'type': 'OPEN'
        });


        cartStub.withArgs({
            user_id: '123'
        }).resolves(new Cart({
            items: [cartItem1, cartItem2]
        }));

        const result = await cartService.getCart('123', 1, 1);

        expect(result.items?.length).toEqual(2);

    });

});



describe('Test addItemToCart function', () => {


    let cartFindOneStub;
    let cartInstanceStub

    beforeEach(() => {
        cartFindOneStub = sinon.stub(Cart, 'findOne');
        cartInstanceStub = sinon.stub(Cart.prototype, 'save');
    });
    afterEach(() => {
        cartFindOneStub.restore();
    });

    it('Should create a new cart and push item', async () => {

        cartFindOneStub.withArgs({
            user_id: '123'
        }).resolves(null);


        // Stub save method
        const cart1 = new Cart({});
        cartInstanceStub.onCall(0).returns(cart1);
        const cart = new Cart({});
        cartInstanceStub.onCall(1).returns(cart);

        const result = cartService.addItemToCart('123', {
            field1: 'Toito',
            type: 'BOOK'
        });


        expect(result).toBeDefined();

    });

    it('Sould push an item into an existing cart', async () => {

       const cart = new Cart({});
        cartFindOneStub.withArgs({
            user_id: '123'
        }).resolves({
            cart
        });
        cartInstanceStub.resolves(cart);

        const result = await cartService.addItemToCart('123', {
            field1: 'Toito2',
            requestType: 'BOOK'
        });

        expect(result).toBeDefined();
        sinon.assert.calledWith(cartInstanceStub, cart);

    });

});


describe('Test deleteItemFromCart function', () => {

    let cartFindOneStub;
    let cartInstanceStub;

    beforeEach(() => {
        cartFindOneStub = sinon.stub(Cart, 'findOne');
        cartInstanceStub = sinon.stub(Cart.prototype, 'save');
    });

    afterEach(() => {
        cartFindOneStub.restore();
        cartInstanceStub.restore();
    });

    it('Should throw a not found error', async () => {

        cartFindOneStub.resolves(null);

        await expect(cartService.deleteItemFromCart('123', '123'))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should not remove item from cart', async () => {

        const cartItem1 = new CartItem({
            field1: 'Toito',
            type: 'BOOK'
        });

        const cart = new Cart({
            user_id: new ObjectId(12345),
            items: [cartItem1]
        });

        cartFindOneStub.resolves(cart);

        const result = await cartService.deleteItemFromCart(123, '123');
        expect(result.items.length).toEqual(1);
        // expect(result.items[0]).toContain(cartItem1);

        sinon.assert.notCalled(cartInstanceStub);

    });

    it('Should remove item from cart', async () => {

        const cartItem1 = new CartItem({
            field1: 'Toito',
            type: 'BOOK'
        });
        const cartItem2 = new CartItem({
            field1: 'Toito2',
            type: 'BOOK'
        });

        const cart = new Cart({
            user_id: new ObjectId(12345),
            items: [cartItem1, cartItem2]
        });

        cartFindOneStub.resolves(cart);


        cartInstanceStub.resolves(cart);

        const result = await cartService.deleteItemFromCart(123, `${cartItem1._id}`);
        expect(result.items.length).toEqual(1);
        // expect(result.items).toContain(cartItem2);

        // cartInstanceStub.calledOnceWih(cart);

    });

});



describe('Test markItemAsRead function', () => {

    let cartFindOneStub;
    let cartInstanceStub;
    
    beforeEach(() => {
        cartFindOneStub = sinon.stub(Cart, 'findOne');
        cartInstanceStub = sinon.stub(Cart.prototype, 'save');
    });

    afterEach(() => {
        cartFindOneStub.restore();
        cartInstanceStub.restore();
    });

    it('Should throw a not found error', async () => {
        
        cartFindOneStub.resolves(null);

        await expect(cartService.markItemAsRead('123', '123'))
            .rejects
            .toThrow(NotFoundError);
    });

    it('Should return same cart', async () => {

        const cart = new Cart({
            items: [
                new CartItem({
                    _id: new ObjectId(123),
                })
            ]
        });
        cartFindOneStub.resolves(cart);

        const result = await cartService.markItemAsRead('123', '456');

        expect(result).toEqual(cart);

        expect(result.items.length).toEqual(1);
        expect(result.items[0].status).toEqual('OPEN');
        
    
    });
    it('Should return cart with read item', async () => {

        const cartItem = new CartItem({
        });
        const cart = new Cart({
            items: [
                cartItem
            ]
        });
        cartFindOneStub.resolves(cart);

        cartInstanceStub.resolves(cart);

        const result = await cartService.markItemAsRead('123', `${cartItem._id}`);

        expect(result).toEqual(cart);

        expect(result.items.length).toEqual(1);
        expect(result.items[0].status).toEqual('READ');
        
    
    });

});