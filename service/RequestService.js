

const Request = require('../model/Request');
const Recommendation = require('../model/Recommendation');


const search = async (filters, pageSize, pageNumber) => {

    const totalResults = await Request.countDocuments(filters);

    const results = await Request.find(filters)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ created_at: -1 })
        .exec();

    const paginatedResults =  await Promise.all(results.map(async result => {
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
}