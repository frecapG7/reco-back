const Recommendation = require('./Recommendation');
const { expect } = require('chai');

describe('Recommendation method.toJSON', () => {


    it('should return a JSON object', () => {
        const recommendation = new Recommendation({
            _id: '64f6db09096d83b20116e62f',
            request_id: '64f6db09096d83b20116e62f',
            user_id: '64f6db09096d83b20116e62f',
            field1: 'field1',
            field2: 'field2',
            field3: 'field3',
            created_at: new Date(),
        });

        const recommendationJSON = recommendation.toJSON();

        expect(recommendationJSON).to.have.property('id');
        console.log(recommendationJSON.user_id);
        expect(recommendationJSON).to.have.property('user_id').to.equal('64f6db09096d83b20116e62f');
        expect(recommendationJSON).to.have.property('field1').to.equal('field1');
        expect(recommendationJSON).to.have.property('field2').to.equal('field2');
        expect(recommendationJSON).to.have.property('field3').to.equal('field3');
        expect(recommendationJSON).to.have.property('created_at').to.be('Date');

    })

})