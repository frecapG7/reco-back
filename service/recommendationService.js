// Assuming you have a database connection and a 'recommendations' collection
const Recommendation = require('../model/Recommendation');
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

async function getRecommendations(request, userId) {
    console.log(request._id);
    const recommendations = await Recommendation.find({ request_id: request._id });
    return recommendations.map(recommendation => toDTO(recommendation, userId));
}

// Function to like a recommendation
async function likeRecommendation(recommendationId, userId) {
    const result = await Recommendation.findOneAndUpdate(
        { _id: recommendationId },
        { $addToSet: { likes: userId } }
    );
    // If no result thown not found error
    if (!result)
        throw new NotFoundError('Recommendation not found');

    return toDTO(result, userId);
}

// Function to unlike a recommendation
async function unlikeRecommendation(recommendationId, userId) {
    const result = await Recommendation.findOneAndUpdate(
        { _id: recommendationId },
        { $pull: { likes: userId } }
    );
    // If no result thown not found error
    if (!result)
        throw new NotFoundError('Recommendation not found');
    return toDTO(result, userId);
}


module.exports = {
    getRecommendations,
    likeRecommendation,
    unlikeRecommendation,
}
