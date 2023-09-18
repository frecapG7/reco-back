const { expect } = require("chai");
const { authenticateToken } = require("./auth");




describe('VALIDATE authenticateToken', () => {


    it('Should return a 401 status code', async () => {

        authenticateToken({ headers: {} }, {
            sendStatus: (code) => {
                expect(code).to.equal(401);
            }
        }, () => { });


    });
    it('Should return a 403 status code', async () => {

        authenticateToken({ headers: 
            { Cookie: 'access_token=123',  authorization: 'Bearer 123' },
        },
            {
                sendStatus: (code) => {
                    expect(code).to.equal(403);
                }
            }, () => { });
    });
    it('Should call next', async () => {

        let req = {
            headers: {
                Cookie: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOGNmYWE3YzllN2NlMmUzYzliMWIwYiIsImlhdCI6MTY5NDQ0NDE4MSwiZXhwIjoxNjk0NDQ1OTgxfQ.i-I9xSbMmWbAi6k2Bfem2Ri4E1pEQSiXRiiZyjARAtk',
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOGNmYWE3YzllN2NlMmUzYzliMWIwYiIsImlhdCI6MTY5NDQ0NDE4MSwiZXhwIjoxNjk0NDQ1OTgxfQ.i-I9xSbMmWbAi6k2Bfem2Ri4E1pEQSiXRiiZyjARAtk'
            }
        };

        authenticateToken(req,
            {},
            () => {
                console.log('next called');
                expect(req.userId).to.equal('5e8cfaa7c9e7ce2e3c9b1b0b');
            });
    });
});