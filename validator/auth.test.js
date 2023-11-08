const { authenticateToken } = require("./auth");
const sinon = require('sinon');
const authService = require('../service/authService');

describe('VALIDATE authenticateToken', () => {

    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();
    let verifyTokenStub;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            sendStatus: jest.fn(),
            json: jest.fn()
        };
        verifyTokenStub = sinon.stub(authService, 'verifyToken');
    });

    afterEach(() => {
        verifyTokenStub.restore();
    });

    it('Should return a 401 status code', async () => {
        const result = await authenticateToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    });

    it('Should return a 403 status code', async () => {
       //Build mock request with token in header
        mockRequest = {
            headers: {authorization: 'Bearer 123'}
        };
        verifyTokenStub.returns(null);

        const result = await authenticateToken(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    });
    
    it('Should call next', async () => {
        mockRequest = {
            headers: {authorization: 'Bearer 123'}
        };
        const decodedToken = '653bc4cbed7a506fb75fc603';
        verifyTokenStub.returns(decodedToken);

        const result = await authenticateToken(mockRequest, mockResponse, nextFunction);

        expect(mockRequest.userId).toEqual(decodedToken);
        expect(nextFunction).toHaveBeenCalled();
    });
});