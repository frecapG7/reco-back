
const { ObjectId } = require('mongodb');
const { NotFoundError } = require('../../errors/error');
const { Cart, CartItem } = require('../../model/Cart');
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
            user: '123'
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
            user: '123'
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
        cartInstanceStub.restore();
    });

    it('Should create a new cart and push item', async () => {

        cartFindOneStub.withArgs({
            user: '123'
        }).resolves(null);


        // Stub save method
        cartInstanceStub.resolvesThis();


        const result = await cartService.addItemToCart('123', {
            field1: 'Toito',
            requestType: 'BOOK'
        });


        expect(result).toBeDefined();


        // expect(result.user._id).toEqual('123');
        expect(result.items.length).toEqual(1);
        expect(result.items[0].field1).toEqual('Toito');
        expect(result.items[0].type).toEqual('BOOK');




    });

    it('Sould push an item into an existing cart', async () => {

        cartFindOneStub.withArgs({
            user: '123'
        }).resolves({
            items: [],
            save: sinon.stub().resolvesThis()
        });
        // Stub save method
        cartInstanceStub.resolvesThis();


        const result = await cartService.addItemToCart('123', {
            field1: 'Toito2',
            requestType: 'BOOK'
        });

        expect(result).toBeDefined();

        expect(result.items.length).toEqual(1);
        expect(result.items[0].field1).toEqual('Toito2');
        expect(result.items[0].type).toEqual('BOOK');

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

        cartFindOneStub.withArgs({user: '123'}).resolves(null);

        await expect(cartService.deleteItemFromCart('123', '123'))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should not remove item from cart', async () => {

        cartFindOneStub.withArgs({user: '123'}).resolves({
            user: {
                _id: '123'
            },
            items: [{
                _id: '5894',
                field1: 'Toito',
                type: 'BOOK'
            }]

        });

        const result = await cartService.deleteItemFromCart('123', '123');
        expect(result.items.length).toEqual(1);

        sinon.assert.notCalled(cartInstanceStub);

    });

    it('Should remove item from cart', async () => {

        cartFindOneStub.withArgs({user: '123'}).resolves({
            user: {
                _id: '123'
            },
            items: [{
                _id: '5894',
                field1: 'Toito',
                type: 'BOOK'
            }],
            save: sinon.stub().resolvesThis()
        });

        const result = await cartService.deleteItemFromCart('123', '5894');
        
        expect(result.items.length).toEqual(0);

    });

});



describe('Test markItemAsRead function', () => {

    let cartFindOneStub;

    beforeEach(() => {
        cartFindOneStub = sinon.stub(Cart, 'findOne');
    });

    afterEach(() => {
        cartFindOneStub.restore();
    });

    it('Should throw a not found error', async () => {

        cartFindOneStub.withArgs({user: '123'}).resolves(null);

        await expect(cartService.markItemAsRead('123', '123'))
            .rejects
            .toThrow(NotFoundError);
    });

    it('Should return same cart', async () => {

        cartFindOneStub.withArgs({user: '123'}).resolves({
            user: {
                _id: '123'
            },
            items: [
                {
                    _id: '124',
                    status: 'OPEN'
                }
            ]
        });

        const result = await cartService.markItemAsRead('123', '456');

        expect(result).toBeDefined();

        expect(result.items.length).toEqual(1);
        expect(result.items[0].status).toEqual('OPEN');


    });
    it('Should return cart with read item', async () => {

       
        cartFindOneStub.withArgs({user: '123'}).resolves({
            user: {
                _id: '123'
            },
            items: [
                {
                    _id: '124',
                    status: 'OPEN'
                }
            ],
            save: sinon.stub().resolvesThis()
        });
        const result = await cartService.markItemAsRead('123', '124');

        expect(result).toBeDefined();

        expect(result.items.length).toEqual(1);
        expect(result.items[0].status).toEqual('READ');


    });

});