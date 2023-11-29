// Assuming you have a database connection and a 'recommendations' collection
const Recommendation = require('../model/Recommendation');
const Request = require('../model/Request');
const { NotFoundError } = require("../errors/error");

const toDTO = (recommendation, userId) => {
    console.debug(JSON.stringify(recommendation));
    return {
        id: recommendation._id,
        request_id: recommendation.request_id,
        user_id: recommendation.user_id,
        field1: recommendation.field1,
        field2: recommendation.field2,
        field3: recommendation.field3,
        created_at: recommendation.created_at,
        likes: recommendation.likes?.length,
        liked: recommendation.likes?.includes(userId),
    }
}

const getRecommendations = async (requestId, userId) => {
    const recommendations = await Recommendation.find({ request_id: String(requestId) });
    return recommendations.map(recommendation => toDTO(recommendation, userId));
}

/**
 * Return Recommendation by id
 * @param {String} recommendationId 
 * @returns Recommendation
 */
const getRecommendation = async (recommendationId) => {
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation)
        throw new NotFoundError('Recommendation not found');
    return recommendation;
}

/**
 * 
 * @param {String} requestId 
 * @param {String} userId 
 * @param {JSON} data 
 */
const createRecommendation = async (requestId, userId, data) => {

    const exist = await Request.exists({ _id: String(requestId) });
    if (!exist)
        throw new NotFoundError('Request not found');

    const newRecommendation = new Recommendation({
        request_id: String(requestId),
        user_id: String(userId),
        field1: String(data.field1),
        field2: String(data.field2),
        field3: String(data.field3),
    });
    const savedRecommendation = await newRecommendation.save();
    return savedRecommendation;
}


const updateRecommendation = async (requestId, recommendationId, userId, data) => {
    const recommendation = await Recommendation.findOneAndUpdate(
        {
            _id: String(recommendationId),
            user_id: String(userId),
            request_id: String(requestId),
        },
        {
            field1: String(data.field1),
            field2: String(data.field2),
            field3: String(data.field3),
        },
        { new: true });
    if (!recommendation)
        throw new NotFoundError('Recommendation not found');
    return recommendation;
};

const deletedRecommendation = async (requestId, recommendationId, userId) => {
    const recommendation = await Recommendation.findOneAndDelete(
        {
            _id: String(recommendationId),
            user_id: String(userId),
            request_id: String(requestId),
        }
    );

    if (!recommendation)
        throw new NotFoundError('Recommendation not found');

}


// Function to like a recommendation
const likeRecommendation = async (recommendationId, userId) => {
    const result = await Recommendation.findOneAndUpdate(
        { _id: String(recommendationId) },
        { $addToSet: { likes: String(userId) } },
        { new: true }
    );
    // If no result thown not found error
    if (!result)
        throw new NotFoundError('Recommendation not found');

    return toDTO(result, userId);
}

// Function to unlike a recommendation
const unlikeRecommendation = async (recommendationId, userId) => {
    const result = await Recommendation.findOneAndUpdate(
        { _id: String(recommendationId) },
        { $pull: { likes: userId } },
        { new: true }
    );
    // If no result thown not found error
    if (!result)
        throw new NotFoundError('Recommendation not found');
    return toDTO(result, userId);
}


module.exports = {
    getRecommendations,
    getRecommendation,
    createRecommendation,
    updateRecommendation,
    deletedRecommendation,
    likeRecommendation,
    unlikeRecommendation,
}
