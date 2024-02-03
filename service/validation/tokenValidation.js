const Token = require('../../model/Token');
const { NotFoundError, ForbiddenError } = require('../../errors/error');



const validateToken = async (value) => {
    // 1 - Find token
    const token = await Token.findOne(
        {
            value: value,
            used: false
        }
    );

    if (!token)
        throw new NotFoundError(`Invalid token ${value}`);

    //2 - Verify expiration
    if(token.expiration < Date.now())
        throw new ForbiddenError(`Token ${value} is expired`);

}


module.exports = {
    validateToken
}