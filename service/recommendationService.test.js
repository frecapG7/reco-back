
const { NotFoundError } = require('../errors/error');
const Recommendation = require('../model/Recommendation');
const Request = require('../model/Request');
const recommendationService = require('./recommendationService');
const sinon = require('sinon');


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

    beforeEach(() => {
        requestStub = sinon.stub(Request, 'exists');
        recommendationStub = sinon.stub(Recommendation.prototype, 'save');
    });
    afterEach(() => {
        requestStub.restore();
        recommendationStub.restore();
    });


    it('Should throw a NotFoundError', async () => {
        requestStub.resolves(null);

        await expect(recommendationService.createRecommendation('123', '678', {}))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should create a recommendation', async () => {

        const request = new Request();
        requestStub.resolves(request);

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

    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findOneAndUpdate');
    });
    afterEach(() => {
        recommendationStub.restore();
    });



    it('Should thrown a not found error', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should add a like', async () => {

        const expected = new Recommendation();
        recommendationStub.resolves(expected);

        const result = await expect(recommendationService.likeRecommendation('123', '678'))

        expect(result).toBeDefined();
        sinon.assert.calledWith(recommendationStub,
            { _id: '123' },
            { $addToSet: { likes: '678' } },
            { new: true }
        );

    });


});


describe('Test unlikeRecommendation function', () => {

    let recommendationStub;
    beforeEach(() => {
        recommendationStub = sinon.stub(Recommendation, 'findOneAndUpdate');
    });
    afterEach(() => {
        recommendationStub.restore();
    });

    it('Should thrown a not found error', async () => {

        recommendationStub.resolves(null);

        await expect(recommendationService.unlikeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

    });

    it('Should add a like', async () => {

        const expected = new Recommendation();
        recommendationStub.resolves(expected);

        const result = await expect(recommendationService.unlikeRecommendation('123', '678'))

        expect(result).toBeDefined()
        sinon.assert.calledWith(recommendationStub,
            { _id: '123' },
            { $pull: { likes: '678' } },
            { new: true }
        );

    });

});
