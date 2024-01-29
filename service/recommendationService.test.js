
const { mongoose } = require('mongoose');
const { NotFoundError, ForbiddenError } = require('../errors/error');
const Recommendation = require('../model/Recommendation');
const Request = require('../model/Request');
const recommendationService = require('./recommendationService');
const sinon = require('sinon');
const creditService = require('./creditService');


describe('Test getRecommendations function', () => {

    let recommendationStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'find');
    });
    afterEach(() => {
        recommendationStub.restore();
    });


    it('Should return a list of recommendations', async () => {


        const expected = [new Recommendation()];
        recommendationStub.returns(expected);

        const result = await recommendationService.getRecommendations('123', '678');

        expect(result.length).toEqual(1);

        //TODO: test toDTO
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

        await expect(recommendationService.createRecommendation('123', '678', {}))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should throw a Forbidden', async () => {
        requestStub.resolves({
            author_id: '678'
        });

        await expect(recommendationService.createRecommendation('123', '678', {}))
            .rejects
            .toThrow(ForbiddenError);

    });

    it('Should rollback transaction', async () => {

        requestStub.resolves({
            author_id: '777'
        });

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };

        mongooseStub.resolves(sessionStub);

        const expected = {};
        recommendationStub.throws();
        await expect(recommendationService.createRecommendation('123', '678', {
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
        }))
            .rejects
            .toThrow();

        // Verify credit was called
        sinon.assert.calledWith(creditServiceStub, 5, '678');

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });


    it('Should create a recommendation', async () => {

        requestStub.resolves({
            author_id: '777'
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
        const result = await recommendationService.createRecommendation('123', '678', {
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
        });

        expect(result).toEqual(expected);
        // sinon.assert.calledWith(recommendationStub, sinon.match({
        //     request_id: '123',
        //     user_id: '678',
        //     field1: 'field1',
        //     field2: 'field2',
        //     field3: 'field3',
        // }))

        // Verify credit was called
        sinon.assert.calledWith(creditServiceStub, 5, '678');
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

        await expect(recommendationService.updateRecommendation('123', '678', '789', {}))
            .rejects
            .toThrow(NotFoundError);

    });


    it('Should return updated recommendation', async () => {
        const expected = {};
        recommendationStub.resolves(expected);

        const result = await recommendationService.updateRecommendation('123', '456', '789',
            {
                field1: 'field1',
                field2: 'field2',
                field3: 'field3'
            });


        expect(result).toEqual(expected);
        sinon.assert.calledWith(recommendationStub,
            {
                _id: '456',
                user_id: '789',
                request_id: '123'
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

        await expect(recommendationService.deletedRecommendation('123', '456', '789'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should delete recommendation', async () => {
        recommendationStub.resolves({});


        await recommendationService.deletedRecommendation('123', '456', '789');

        sinon.assert.calledWith(recommendationStub,
            {
                _id: String('456'),
                user_id: '789',
                request_id: '123'
            });

    });
});


describe('Test likeRecommendation function', () => {

    let recommendationStub;
    let mongooseStub;
    let requestStub;
    let creditServiceStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findById');
        mongooseStub = sinon.stub(mongoose, 'startSession');
        requestStub = sinon.stub(Request, 'findById');
        creditServiceStub = sinon.stub(creditService, 'addCredit');
    });
    afterEach(() => {
        recommendationStub.restore();
        mongooseStub.restore();
        requestStub.restore();
        creditServiceStub.restore();
    });



    it('Should thrown a recommendation not found error', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should thrown a already like forbidden error', async () => {

        recommendationStub.resolves({
            likes: ['678']
        });


        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(ForbiddenError);
    });

    it('Should thrown an own recommendation forbidden error', async () => {

        recommendationStub.resolves({
            likes: ['999'],
            user_id: '678'
        });

        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(ForbiddenError);
    });



    it('Should thrown a request not found error', async () => {

        recommendationStub.resolves({
            _id: '123',
            likes: ['999'],
            user_id: '007',
            request_id: '123'
        });

        requestStub.resolves(null);

        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should rollback transaction', async () => {

        const recommendation = {
            user_id: '666',
            request_id: '123',
            likes: ['123'],
            save: jest.fn()
        };
        recommendationStub.resolves(recommendation);

        requestStub.resolves({
            author_id: '777'
        });


        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        creditServiceStub.throws();


        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow();

        expect(recommendation.save).not.toHaveBeenCalled();

        //Verify transaction
        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).not.toHaveBeenCalled();
        expect(sessionStub.abortTransaction).toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();

    });
    
    
        it('Should add a like with random author', async () => {
    
            const recommendation = {
                user_id: String('666'),
                request_id: String('123'),
                likes: ['123'],
                save: jest.fn()
            };
            recommendationStub.resolves(recommendation);
    
            requestStub.resolves({
                author_id: '678'
            });
    
            const sessionStub = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            mongooseStub.resolves(sessionStub);
    
            const result = await expect(recommendationService.likeRecommendation('123', '765'));
    
            // expect(result).toBeDefined();
    
            // sinon.assert.calledOnce(creditServiceStub);
            sinon.assert.calledWith(creditServiceStub, 1, '666');
    
            expect(recommendation.likes.length).toEqual(2);
            expect(recommendation.likes[1]).toEqual('678');
            expect(recommendation.save).toHaveBeenCalled();
    
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
    let creditServiceStub;

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findById');
        mongooseStub = sinon.stub(mongoose, 'startSession');
        creditServiceStub = sinon.stub(creditService, 'removeCredit');
    });

    afterEach(() => {
        recommendationStub.restore();
        mongooseStub.restore();
        creditServiceStub.restore();
    });


    it('Should thrown a not found error', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.unlikeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should rollback transaction', async () => {

        const expected = {
            like: ['123'],
            save: jest.fn(),
            user_id: '666',
        };

        recommendationStub.resolves(expected);

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);
        creditServiceStub.throws();


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
            save: jest.fn(),
            user_id: '666',
        };

        recommendationStub.resolves(expected);

        const sessionStub = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongooseStub.resolves(sessionStub);

        const result = await recommendationService.unlikeRecommendation('123', '678');

        expect(sessionStub.startTransaction).toHaveBeenCalled();
        expect(sessionStub.commitTransaction).toHaveBeenCalled();
        expect(sessionStub.abortTransaction).not.toHaveBeenCalled();
        expect(sessionStub.endSession).toHaveBeenCalled();


        expect(recommendation.likes.length).toEqual(1);
        expect(recommendation.likes[0]).toEqual('123');

    });

});
