
const { mongoose } = require('mongoose');
const { NotFoundError, ForbiddenError } = require('../../errors/error');
const Recommendation = require('../../model/Recommendation');
const Request = require('../../model/Request');
const recommendationService = require('./recommendationService');
const sinon = require('sinon');
const creditService = require('../market/creditService');


describe('Test getRecommendations function', () => {

    let recommendationStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'find');
    });
    afterEach(() => {
        recommendationStub.restore();
    });


    it('Should return a list of recommendations', async () => {
        recommendationStub
            .withArgs({ request: '123' })
            .returns({
                populate: sinon.stub().withArgs("user", 'name').returns({
                    exec: sinon.stub().resolves([
                        {
                            _id: '1',
                            request: '123',
                            user: {
                                _id: '123',
                                name: 'name'
                            },
                            field1: 'field1',
                            field2: 'field2',
                            field3: 'field3',
                            created_at: new Date(),
                            likes: ['123', '456']
                        },
                    ])
                })
            });

        const result = await recommendationService.getRecommendations('123', { _id: '123' });

        expect(result.length).toEqual(1);

        expect(result[0]).toEqual({
            id: '1',
            request: '123',
            user: {
                id: '123',
                name: 'name',
            },
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
            created_at: expect.any(Date),
            likes: 2,
            liked: true
        });
    });



});

describe('Test getRecommendation function', () => {
    let recommendationStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findById');
    });
    afterEach(() => {
        recommendationStub.restore();
    });

    it('Should throw a NotFoundError', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.getRecommendation('123'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should return a recommendation', async () => {

        const expected = new Recommendation();
        recommendationStub.resolves(expected);

        const result = await recommendationService.getRecommendation('123');

        expect(result).toEqual(expected);

    });


});

describe('Test createRecommendation function', () => {

    let requestStub;
    let recommendationStub;
    let creditServiceStub;
    let mongooseStub;


    beforeEach(() => {
        requestStub = sinon.stub(Request, 'findById');
        recommendationStub = sinon.stub(Recommendation.prototype, 'save');
        creditServiceStub = sinon.stub(creditService, 'removeCredit');
        mongooseStub = sinon.stub(mongoose, 'startSession');
    });

    afterEach(() => {
        requestStub.restore();
        recommendationStub.restore();
        creditServiceStub.restore();
        mongooseStub.restore();
    });


    it('Should throw a NotFoundError', async () => {
        requestStub.resolves(null);

        await expect(recommendationService.createRecommendation('123', {}, { _id: '678' }))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should throw a Forbidden', async () => {
        requestStub.resolves({
            author: '678'
        });

        await expect(recommendationService.createRecommendation('123', {}, { _id: '678' }))
            .rejects
            .toThrow(ForbiddenError);

    });

    it('Should rollback transaction', async () => {

        requestStub.resolves({
            author: '777'
        });

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };

        mongooseStub.resolves(sessionStub);

        recommendationStub.throws();
        await expect(recommendationService.createRecommendation('123', {
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
        }, { _id: '678' }))
            .rejects
            .toThrow();

        // Verify credit was called
        sinon.assert.calledWith(creditServiceStub, 5, {_id: '678' });

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });


    it('Should create a recommendation', async () => {

        requestStub.resolves({
            _id: '123',
            author: '777'
        });

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };

        mongooseStub.resolves(sessionStub);

        const expected = {};
        recommendationStub.resolves(expected);
        const result = await recommendationService.createRecommendation('123', {
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
        },
            {
                _id: '678'
            });

        expect(result).toEqual(expected);
        // sinon.assert.calledWith(recommendationStub, sinon.match({
        //     request: '123',
        //     user: '678',
        //     field1: 'field1',
        //     field2: 'field2',
        //     field3: 'field3',
        // }))

        // Verify credit was called
        sinon.assert.calledWith(creditServiceStub, 5, {_id: '678' });
        expect(sessionStub.startTransaction).toHaveBeenCalled();

        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    }
    );

});

describe('Test updateRecommendation function', () => {
    let recommendationStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findOneAndUpdate');
    });
    afterEach(() => {
        recommendationStub.restore();
    });

    it('Should throw a NotFoundError', async () => {
        recommendationStub
            .resolves(null);

        await expect(recommendationService.updateRecommendation('123', '678', {}, { _id: '789' }))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should return updated recommendation', async () => {
        const expected = {};
        recommendationStub.resolves(expected);

        const result = await recommendationService.updateRecommendation('123', 'recommendationId',
            {
                field1: 'field1',
                field2: 'field2',
                field3: 'field3'
            },
            {
                _id: 'userId'
            });


        expect(result).toEqual(expected);
        sinon.assert.calledWith(recommendationStub,
            {
                _id: 'recommendationId',
                user: 'userId',
                request: '123'
            },
            {
                field1: 'field1',
                field2: 'field2',
                field3: 'field3'
            },
            { new: true });
    });
});


describe('Test deleteRecommendation function', () => {

    let recommendationStub;
    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findOneAndDelete');
    });
    afterEach(() => {
        recommendationStub.restore();
    });

    it('Should throw a NotFoundError', async () => {
        recommendationStub.resolves(null);

        await expect(recommendationService.deletedRecommendation('123', '456', { _id: 'userId' }))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should delete recommendation', async () => {
        recommendationStub.resolves({});


        await recommendationService.deletedRecommendation('123', '456', { _id: 'userId' });

        sinon.assert.calledWith(recommendationStub,
            {
                _id: String('456'),
                user: 'userId',
                request: '123'
            });

    });
});


describe('Test likeRecommendation function', () => {

    let recommendationStub;
    let mongooseStub;
    let creditServiceStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findById');
        mongooseStub = sinon.stub(mongoose, 'startSession');
        creditServiceStub = sinon.stub(creditService, 'addCredit');
    });
    afterEach(() => {
        recommendationStub.restore();
        mongooseStub.restore();
        creditServiceStub.restore();
    });



    it('Should thrown a recommendation not found error', async () => {

        recommendationStub.returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves(null)
            })
        });

        await expect(recommendationService.likeRecommendation('123', { _id: 'userId' }))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should thrown a already like forbidden error', async () => {

        recommendationStub.returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves({
                    likes: ['userId']
                })
            })
        });


        await expect(recommendationService.likeRecommendation('123', { _id: 'userId' }))
            .rejects
            .toThrow(ForbiddenError);
    });

    it('Should thrown an own recommendation forbidden error', async () => {

        recommendationStub.withArgs('123').returns({
            populate: sinon.stub().withArgs("request", "author").returns({
                exec: sinon.stub().resolves({
                    likes: ['anotherUserId'],
                    user: {
                        _id: 'userId'
                    }
                })
            })
        });

        await expect(recommendationService.likeRecommendation('123', { _id: 'userId' }))
            .rejects
            .toThrow(ForbiddenError);
    });



    it('Should thrown a request not found error', async () => {

        recommendationStub.withArgs('123').returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves({
                    _id: '123',
                    likes: ['anotherUserId'],
                    user: {
                        _id: 'anotherUserId'
                    }
                })
            })
        });
        await expect(recommendationService.likeRecommendation('123', {_id: 'userId'}))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should rollback transaction', async () => {

        recommendationStub.withArgs('123').returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves({
                    _id: '123',
                    likes: ['anotherUserId'],
                    user: {
                        _id: 'anotherUserId'
                    },
                    request: {
                        _id: 'requestId'
                    },
                    save: jest.fn()
                })
            })
        });


        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        creditServiceStub.throws();


        await expect(recommendationService.likeRecommendation('123', {_id: 'userId'}))
            .rejects
            .toThrow();


        //Verify transaction
        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });


    it('Should add a like with random author', async () => {

        const expected = {
            _id: '123',
            likes: ['anotherUserId'],
            user: {
                _id: 'anotherUserId'
            },
            request: {
                _id: 'requestId',
                author: {
                    _id: '666'
                }
            },
            save: sinon.stub().resolvesThis()
        }

        recommendationStub.withArgs('123').returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves(expected)
            })
        });

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession:  jest.fn()
        };
        mongooseStub.resolves(sessionStub);
        creditServiceStub.resolves();


        const result = await recommendationService.likeRecommendation('123', {_id: 'userId'});

        expect(result).toBeDefined();

        sinon.assert.calledOnce(creditServiceStub);
        sinon.assert.calledWith(creditServiceStub, 1, { _id: 'anotherUserId' });

        expect(result.likes.length).toEqual(2);
        expect(result.likes[1]).toEqual('userId');
        // expect(result.save).toHaveBeenCalled();

        //Verify transaction
        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });


    it('Should add a like with request author', async () => {

        recommendationStub.withArgs('123').returns({
            populate: sinon.stub().withArgs('request', 'author').returns({
                exec: sinon.stub().resolves({
                    _id: '123',
                    likes: ['anotherUserId'],
                    user: {
                        _id: 'anotherUserId'
                    },
                    request: {
                        _id: 'requestId',
                        author: {
                            _id: 'userId'
                        }
                    },
                    save: sinon.stub().resolvesThis()
                })
            })
        });

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);
        creditServiceStub.resolves();


        const result = await recommendationService.likeRecommendation('123', {_id: 'userId'});

        expect(result).toBeDefined();

        sinon.assert.calledOnce(creditServiceStub);
        sinon.assert.calledWith(creditServiceStub, 5,  { _id: 'anotherUserId' });

        expect(result.likes.length).toEqual(2);
        expect(result.likes[1]).toEqual('userId');

        //Verify transaction
        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });

});


describe('Test unlikeRecommendation function', () => {

    let recommendationStub;
    let mongooseStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findById');
        mongooseStub = sinon.stub(mongoose, 'startSession');
    });

    afterEach(() => {
        recommendationStub.restore();
        mongooseStub.restore();
    });


    it('Should thrown a not found error', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.unlikeRecommendation('123', {_id: '678' }))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should rollback transaction', async () => {

        const expected = {
            like: ['123'],
            save: sinon.stub().resolvesThis(),
        };

        recommendationStub.resolves(expected);

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);


        await expect(recommendationService.unlikeRecommendation('123', '678'))
            .rejects
            .toThrow();

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();


    });

    it('Should unlike recommendation', async () => {

        const expected = {
            likes: ['123', '678'],
            save: sinon.stub().resolvesThis(),
        };

        recommendationStub.resolves(expected);

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        const result = await recommendationService.unlikeRecommendation('123', {_id: '678' });

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();


        expect(result.likes.length).toEqual(1);
        expect(result.likes[0]).toEqual('123');

    });

});
