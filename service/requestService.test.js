const Request = require('../model/Request');
const sinon = require('sinon');
const requestService = require('./requestService');
const { NotFoundError } = require('../errors/error');
const { ObjectId } = require('mongodb');


describe('Test getRequest', () => {

    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(Request, 'findById');
    });
    afterEach(() => {
        requestStub.restore();
    });

    it('Should thrown a not found error', async () => {
        requestStub.returns(null);
        await expect(requestService.getRequest('123'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should return a request', async () => {
        const expected = new Request();
        requestStub.returns(expected);

        const result = await requestService.getRequest('123');

        expect(result).toEqual(expected);
    });

});


describe('Test createRequest', () => {

    let requestStub;
    beforeEach(() => {
        requestStub = sinon.stub(Request.prototype, 'save');
    });
    afterEach(() => {
        requestStub.restore();
    });


    it('Should return a request', async () => {
        const result = await requestService.createRequest({
            requestType: 'requestType',
            description: 'description',
            duration: 'duration',
        }, '613a9b6b9b0b1d1b1c9b1b1b');


        sinon.assert.calledOnce(requestStub);
        // sinon.assert.calledWith(requestStub, sinon.match.has("requestType", 'requestType'));
        // sinon.assert.calledWith(requestStub, sinon.match.has("description", 'description'));

        // sinon.assert.calledWith(requestStub, {
        //     requestType: 'requestType',
        //     description: 'description',
        //     duration: 'duration',
        //     status: 'OPEN',
        //     author: new ObjectId('613a9b6b9b0b1d1b1c9b1b1b')
        // });

    });

});

describe('Test updateRequest', () => {

    let requestStub;
    beforeEach(() => {
        requestStub = sinon.stub(Request, 'findOneAndUpdate');
    });
    afterEach(() => {
        requestStub.restore();
    });

    it('Should thrown a NotFoundError', async () => {

        requestStub.returns(null);

        await expect(requestService.updateRequest('123', {}, '123'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should return updated request', async () => {

        const expected = new Request();
        requestStub.returns(expected);

        const result = await requestService.updateRequest('123', {
            requestType: 'BOOK',
            description: 'description',
            duration: 'duration',
        }, '123');

        expect(result).toEqual(expected);
        sinon.assert.calledWith(requestStub, {
            _id: '123',
            author: '123',
        },
            {
                requestType: 'BOOK',
                description: 'description',
                duration: 'duration',
            },
            { new: true }
        );

    }
    );

});


describe('Test deleteRequest', () => {

    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(Request, 'findOneAndDelete');
    });

    afterEach(() => {
        requestStub.restore();
    });

    it('Should thrown a NotFoundError', async () => {

        requestStub.returns(null);

        await expect(requestService.deleteRequest('123', '123'))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should return deleted request', async () => {

        const expected = new Request();
        requestStub.returns(expected);

        const result = await requestService.deleteRequest('123', '123');

        expect(result).toEqual(expected);
        sinon.assert.calledWith(requestStub, {
            _id: '123',
            author: '123'
        });
    });
});

