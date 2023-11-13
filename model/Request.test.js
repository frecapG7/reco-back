
const Request = require("./Request");


describe('Request method.toJSON', () => {

    it('should return a JSON object', () => {
        const request = new Request({
            requestType: 'BOOK',
            description: 'SciFi recommended book',
            duration: '2D',
            status: 'PENDING',
            author: '64f6db09096d83b20116e62f'
        });

        const requestJSON = request.toJSON();

        expect(requestJSON.id).toBeDefined();
        expect(requestJSON.requestType).toEqual('BOOK');
        expect(requestJSON.description).toEqual('SciFi recommended book');
        expect(requestJSON.duration).toEqual('2D');
        expect(requestJSON.status).toBeDefined();
        expect(requestJSON.created).toBeDefined();
        expect(requestJSON.author.equals('64f6db09096d83b20116e62f')).toEqual(true);


    });
});