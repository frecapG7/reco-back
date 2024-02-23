
const Recommendation = require('../../model/Recommendation');
const Request = require('../../model/Request');
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const creditService = require('../creditService');
const mongoose = require('mongoose');

const toDTO = (recommendation, user) => {
    console.debug(JSON.stringify(recommendation));
    return {
        id: recommendation._id,
        request: recommendation.request,
        user: {
            id: recommendation.user._id,
            name: recommendation.user.name,
        },
        field1: recommendation.field1,
        field2: recommendation.field2,
        field3: recommendation.field3,
        created_at: recommendation.created_at,
        likes: recommendation.likes?.length,
        liked: recommendation.likes?.includes(user._id),
    }
}

const getRecommendations = async (requestId, user) => {
    const recommendations = await Recommendation.find({ request: String(requestId) })
    .populate('user', 'name')
    .exec();

    return recommendations.map(recommendation => toDTO(recommendation, user));
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
 * @param {Object} the authenticated user
 * @param {JSON} data 
 */
const createRecommendation = async (requestId, data, user) => {

    const request = await Request.findById(requestId);
    if (!request)
        throw new NotFoundError('Request not found');
    if(request.author === user._id)
        throw new ForbiddenError('User cannot create a recommendation for his own request');


    let session;
    try {
        session = await mongoose.startSession();

        session.startTransaction();

        await creditService.removeCredit(5, user._id);

        const newRecommendation = new Recommendation({
            request: request._id,
            user: user._id,
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


const updateRecommendation = async (requestId, recommendationId, data, user) => {
    const recommendation = await Recommendation.findOneAndUpdate(
        {
            _id: String(recommendationId),
            user: user._id,
            request: String(requestId),
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

const deleteRecommendation = async (requestId, recommendationId, user) => {
    const recommendation = await Recommendation.findOneAndDelete(
        {
            _id: String(recommendationId),
            user: user._id,
            request: String(requestId),
        }
    );

    if (!recommendation)
        throw new NotFoundError('Recommendation not found');

}


// Function to like a recommendation
const likeRecommendation = async (recommendationId, authenticatedUser) => {

    // 1.a Check if recommendation exists
    const recommendation = await Recommendation.findById(recommendationId)
        .populate("request", "author")
        .exec();
    if (!recommendation)
        throw new NotFoundError('Recommendation not found');
    // 1.b Check if user has already liked the recommendation
    if (recommendation.likes.includes(authenticatedUser._id))
        throw new ForbiddenError('User has already liked this recommendation');
    // 1.c Check if user is not recommendation's author
    if (recommendation.user._id === authenticatedUser._id)
        throw new ForbiddenError('User cannot like his own recommendation');

    // 2. Find request
    if (!recommendation.request)
        throw new NotFoundError('Request not found');

    // 2. Start transaction
    let session;
    try {

        session = await mongoose.startSession();
        session.startTransaction();

        // 3. Add credit
        // If the user is the author of the recommendation's request, give 5 credit
        const credit = recommendation.request.author._id === authenticatedUser._id ? 5 : 1;
        await creditService.addCredit(Number(credit), recommendation.user._id);
        // 4. Add like
        recommendation.likes.push(authenticatedUser._id);

        // 5. Commit transaction
        await session.commitTransaction();

        //6. Return result
        const savedRecommendation =  await recommendation.save();
        return savedRecommendation;

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
const unlikeRecommendation = async (recommendationId, user) => {

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
