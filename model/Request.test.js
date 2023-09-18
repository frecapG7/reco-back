const { expect } = require("chai");
const Request = require("./Request");


describe('Request method.toJSON', () => {

    it('should return a JSON object', () => {
        const request = new Request({
            _id: '64f6db09096d83b20116e62f',
            requestType: 'BOOK',
            description: 'SciFi recommended book',
            duration: '2D',
            status: 'PENDING',
        });

        const requestJSON = request.toJSON();

        expect(requestJSON).to.have.property('id');
        expect(requestJSON).to.have.property('requestType').to.equal('BOOK');
        expect(requestJSON).to.have.property('description').to.equal('SciFi recommended book');
        expect(requestJSON).to.have.property('duration').to.equal('2D');
        expect(requestJSON).to.have.property('status').to.equal('PENDING');


    });
});