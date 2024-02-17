
const Recommendation = require('../model/Recommendation');
const Request = require('../model/Request');
const { NotFoundError, ForbiddenError } = require("../errors/error");
const creditService = require('./creditService');
const mongoose = require('mongoose');

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

    const request = await Request.findById(requestId);
    if (!request)
        throw new NotFoundError('Request not found');
    if(request.author_id == userId)
        throw new ForbiddenError('User cannot create a recommendation for his own request');


    let session;
    try {
        session = await mongoose.startSession();

        session.startTransaction();

        await creditService.removeCredit(5, userId);

        const newRecommendation = new Recommendation({
            request_id: String(requestId),
            user_id: String(userId),
            field1: String(data.field1),
            field2: String(data.field2),
            field3: String(data.field3),
        });
        const savedRecommendation = await newRecommendation.save();

        await session.commitTransaction();

        return savedRecommendation;

    } catch (err) {
        if (session)
            await session.abortTransaction();
        throw err;
    } finally {
        if (session)
            await session.endSession();
    }

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

const deleteRecommendation = async (requestId, recommendationId, userId) => {
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
const likeRecommendation = async (recommendationId, authenticatedUser) => {

    // 1.a Check if recommendation exists
    const recommendation = await Recommendation.findById(recommendationId)
        .populate('request')
        .populate('user')
        .exec();
    if (!recommendation)
        throw new NotFoundError('Recommendation not found');
    // 1.b Check if user has already liked the recommendation
    if (recommendation.likes.includes(authenticatedUser._id))
        throw new ForbiddenError('User has already liked this recommendation');
    // 1.c Check if user is not recommendation's author
    if (recommendation.user === authenticatedUser)
        throw new ForbiddenError('User cannot like his own recommendation');

    // 2. Find request
    if (!recommendation.request)
        throw new NotFoundError('Request not found');

    // 2. Start transaction
    let session;
    try {

        session = await mongoose.startSession();
        await session.startTransaction();

        // 3. Add credit
        // If the user is the author of the recommendation's request, give 5 credit
        const credit = request.author_id === authenticatedUser._id ? 5 : 1;
        await creditService.addCredit(credit, recommendation.user);
        // 4. Add like
        recommendation.likes.push(userId);

        // 5. Commit transaction
        await session.commitTransaction();

        //6. Return result
        return await recommendation.save();

    } catch (err) {
        if (session)
            session.abortTransaction();
        throw err;
    } finally {
        if (session)
            session.endSession();
    }

}

// Function to unlike a recommendation
const unlikeRecommendation = async (recommendationId, userId) => {

    // 1. Find recommendation
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation)
        throw new NotFoundError('Recommendation not found');

    let session;

    // Start transaction
    try {

        session = await mongoose.startSession();
        session.startTransaction();

        //2. Remove like
        recommendation.likes.pull(userId);
        //3. Remove credit
        await creditService.removeCredit(1, recommendation.user_id, { session });

        //4. Commit transaction
        await session.commitTransaction();
        //5. Return result
        return await recommendation.save();
    } catch (err) {
        if (session)
            session.abortTransaction();
        throw err;
    } finally {
        if (session)
            session.endSession();
    }
}


module.exports = {
    getRecommendations,
    getRecommendation,
    createRecommendation,
    updateRecommendation,
    deletedRecommendation: deleteRecommendation,
    likeRecommendation,
    unlikeRecommendation,
}
