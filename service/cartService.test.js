
const { NotFoundError } = require('../errors/error');
const Cart = require('../model/Cart');
const cartService = require('./cartService');
const sinon = require('sinon');


describe('Test getCart function', () => {

    it('Should thrown a not found error', async () => {

        const findOneStub = sinon.stub(Cart, 'findOne');
        findOneStub.resolves(null);

        await expect(cartService.getCart('123', 2, 5))
            .rejects
            .toThrow(NotFoundError);

        findOneStub.restore();
    });

    it('Should return cart items', async () => {
        const expected = new Cart();
        const other = new Cart();


        const findOneStub = sinon.stub(Cart, 'findOne');
        findOneStub.resolves({
            items: [expected, other]
        });

        const result = await cartService.getCart('123', 1, 1);

        expect(result.items).toEqual([expected]);
        findOneStub.restore();

    });

});



describe('Test addItemToCart function', () => {

    it('Should create a new cart and push item', async () => {
        const findOneStub = sinon.stub(Cart, 'findOne');
        findOneStub.resolves(null);


        const result = cartService.addItemToCart('123', {
            field1: 'Toito'
        });


        findOneStub.restore();





    });

});


describe('Test deleteItemFromCart function', () => {


    it('Should throw a not found error', async () => {

        const findOneStub = sinon.stub(Cart, 'findOne');
        findOneStub.resolves(null);

        await expect(cartService.deleteItemFromCart('123', '123'))
            .rejects
            .toThrow(NotFoundError);

        findOneStub.restore();
    });

    it('Should remove item from cart', async() => {
       
        const cart = new Cart({
            user_id: 123,
            items: [
                {
                    id: 123,
                },
                {
                    id: 456
                }
            ]
        });


        const findOneStub = sinon.stub(Cart, 'findOne');
        findOneStub.resolves(null);



        const result = await cartService.deleteItemFromCart(123, 123);
        expect(result.items).toEqual([{
            id: 456
        }]);


    })

});