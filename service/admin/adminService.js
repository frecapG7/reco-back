


const Token = require('../../model/Token');

const createToken = async (type) => {


    const token = new Token({
        type: type
    });
    

    const savedToken = await token.save();

    return savedToken;
}



module.exports = {
    createToken
};