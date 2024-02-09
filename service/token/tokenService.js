const Token = require('../../model/Token');


const getToken = async (value) => {
    const token = await Token.findOne({value: String(value)});
    return token;
}

const flagAsUsed = async (token) => {
    await Token.findOneAndUpdate(
        {
            _id: token._id,
            used: false
        },
        {
            used: true
        }
    );
}


module.exports = {
    getToken,
    flagAsUsed
}