const Recommendation = require('./Recommendation');

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

        expect(recommendationJSON.id).toBeDefined();
        expect(recommendationJSON.user_id.equals('64f6db09096d83b20116e62f')).toEqual(true);
        expect(recommendationJSON.request_id.equals('64f6db09096d83b20116e62f')).toEqual(true);
        expect(recommendationJSON.field1).toEqual('field1');
        expect(recommendationJSON.field2).toEqual('field2');
        expect(recommendationJSON.field3).toEqual('field3');
        expect(recommendationJSON.created_at).toBeDefined();

    })

})