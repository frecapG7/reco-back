const { authenticateToken } = require("./auth");




describe('VALIDATE authenticateToken', () => {


    it('Should return a 401 status code', async () => {

        authenticateToken({ headers: {} }, {
            sendStatus: (code) => {
                expect(code).toEqual(401);
            }
        }, () => { });


    });
    it('Should return a 403 status code', async () => {

        authenticateToken({ headers: 
            { Cookie: 'access_token=123',  authorization: 'Bearer 123' },
        },
            {
                sendStatus: (code) => {
                    expect(code).toEqual(403);
                }
            }, () => { });
    });
    
    it('Should call next', async () => {

        let req = {
            headers: {
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNjUzYmM0Y2JlZDdhNTA2ZmI3NWZjNjAzIiwiaWF0IjoxNjk4NDE1ODE5LCJleHAiOjE2OTg0MTc2MTl9.ukx_0ZLj1y-eSfzDltrAnbJgHb23-MLIMNpqkeaIzck'
            }
        };

        authenticateToken(req,
            {},
            () => {
                expect(req.userId).toEqual('653bc4cbed7a506fb75fc603');
            });
    });
});