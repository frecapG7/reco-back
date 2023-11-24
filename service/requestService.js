const Request = require('../model/Request');
const Recommendation = require('../model/Recommendation');
const { NotFoundError } = require('../errors/error');
const { ObjectId } = require('mongodb');


const getRequest = async (id) => {

    const request = await Request.findById(id);
    if (!request)
        throw new NotFoundError('Request not found');
    return request;
}

const createRequest = async (data, userId) => {


    const request = new Request({
        requestType: data.requestType,
        description: data.description,
        duration: data.duration,
        status: 'OPEN',
        author: new ObjectId(userId),
    });
    return await request.save();

}

const updateRequest = async (id, data, userId) => {
    const savedRequest = await Request.findOneAndUpdate(
        {
            _id: String(id),
            author: String(userId),
        },
        {
            requestType: data.requestType,
            description: data.description,
            duration: data.duration,
        },
        { new: true });

    if (!savedRequest)
        throw new NotFoundError('Request not found');

    return savedRequest;
}

const deleteRequest = async (id, userId) => {
    const request = await Request.findOneAndDelete({
        _id: String(id),
        author: String(userId)
    });
    if (!request)
        throw new NotFoundError('Request not found');
    return request;
}




const search = async (filters, pageSize, pageNumber) => {

    const totalResults = await Request.countDocuments(filters);

    const results = await Request.find(filters)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ created_at: -1 })
        .exec();

    const paginatedResults = await Promise.all(results.map(async result => {
        const recommendationsCount = await Recommendation.countDocuments({ request_id: result._id });
        const unseenRecommendationsCount = await Recommendation.countDocuments({ request_id: result._id, seen: false });
        return {
            ...result.toJSON(),
            recommendationsCount,
            unseenRecommendationsCount,
        }
    }));

    return {
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalResults / pageSize),
            totalResults,
        },
        results: paginatedResults,
    }


}

module.exports = {
    search,
    getRequest,
    createRequest,
    updateRequest,
    deleteRequest,
}