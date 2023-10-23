
const { NotFoundError } = require('../errors/error');
const Recommendation = require('../model/Recommendation');
const recommendationService = require('./recommendationService');
const sinon = require('sinon');


describe('Test likeRecommendation function', () => {
    
    it('Should thrown a not found error', async () => {

        const findOneAndUpdateStub = sinon.stub(Recommendation, 'findOneAndUpdate');
        findOneAndUpdateStub.resolves(null);

        await expect(recommendationService.likeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

        findOneAndUpdateStub.restore();
    });

    it('Should add a like', async () => {

        const expected = new Recommendation();
        const findOneAndUpdateStub = sinon.stub(Recommendation, 'findOneAndUpdate');
        findOneAndUpdateStub.resolves(null);

        const result = await expect(recommendationService.likeRecommendation('123', '678'))
        
        expect(result).toEqual(expected)
        findOneAndUpdateStub.restore();
    });


});


describe('Test unlikeRecommendation function', () => {

    it('Should thrown a not found error', async () => {

        const findOneAndUpdateStub = sinon.stub(Recommendation, 'findOneAndUpdate');
        findOneAndUpdateStub.resolves(null);

        await expect(recommendationService.unlikeRecommendation('123', '678'))
            .rejects
            .toThrow(NotFoundError);

            findOneAndUpdateStub.restore();
    });

    it('Should add a like', async () => {

        const expected = new Recommendation();
        const findOneAndUpdateStub = sinon.stub(Recommendation, 'findOneAndUpdate');
        findOneAndUpdateStub.resolves(null);

        const result = await expect(recommendationService.unlikeRecommendation('123', '678'))
        
        expect(result).toEqual(expected)



        findOneAndUpdateStub.restore();
    });



});
   