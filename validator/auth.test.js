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

        authenticateToken({ headers: { authorization: 'Bearer 123' } },
            {
                sendStatus: (code) => {
                    expect(code).to.equal(403);
                }
            }, () => { });
    });
    it('Should call next', async () => {

        let req = {
            headers: {
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOGNmYWE3YzllN2NlMmUzYzliMWIwYiIsImlhdCI6MTY5NDAxNDY5NywiZXhwIjoxNjk0MDE2NDk3fQ.P4576JagCuh5rkN2G9wrd3jTY493jlHnxVG4aJ6ecXw'
            }
        };

        authenticateToken(req,
            {},
            () => {
                console.log('next called');
                expect(req.token.id).to.equal('5e8cfaa7c9e7ce2e3c9b1b0b');
            });
    });
});