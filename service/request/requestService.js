const Request = require("../../model/Request");
const Recommendation = require("../../model/Recommendation");
const { NotFoundError } = require("../../errors/error");
const { ObjectId } = require("mongodb");

const toDTO = async (request) => {
  const recommendationsCount = await Recommendation.countDocuments({
    request,
  });
  return {
    ...request.toJSON(),
    recommendationsCount,
  };
};

/**
 * Asynchronous function to get a request by its ID.
 *
 * @async
 * @function getRequest
 * @param {string} id - The ID of the request.
 */
const getRequest = async (id) => {
  const request = await Request.findById(id).populate("author").exec();
  if (!request) throw new NotFoundError("Request not found");
  return await toDTO(request);
};

/**
 *  Asynchronous function to create a request.
 *
 * @async
 * @function createRequest
 * @param {Object} data - The data of the request.
 * @param {Object} user - The authenticated user.
 */
const createRequest = async (data, user) => {
  const request = new Request({
    requestType: data.requestType,
    title: data.title,
    description: data.description,
    tags: data.tags,
    author: user._id,
  });
  const saveRequest = await request.save();

  return {
    ...saveRequest.toJSON(),
    recommendationsCount: 0,
  };
};

/**
 * Asynchronous function to update a request.
 *
 * @async
 * @function updateRequest
 * @param {string} id - The ID of the request.
 * @param {Object} data - The data of the request.
 * @param {Object} user - The authenticated user.
 */
const updateRequest = async (id, data, user) => {
  const savedRequest = await Request.findOneAndUpdate(
    {
      _id: String(id),
      author: user._id,
    },
    {
      requestType: data.requestType,
      title: data.title,
      description: data.description,
      tags: data.tags,
    },
    { new: true }
  );

  if (!savedRequest) throw new NotFoundError("Request not found");

  return await toDTO(savedRequest);
};

/**
 * Asynchronous function to delete a request.
 *
 * @async
 * @function deleteRequest
 * @param {string} id - The ID of the request.
 * @param {Object} user - The authenticated user.
 */
const deleteRequest = async (id, user) => {
  const request = await Request.findOneAndDelete({
    _id: String(id),
    author: user._id,
  });
  if (!request) throw new NotFoundError("Request not found");
  return request;
};

/**
 * Asynchronous function to search requests.
 * @param {Object} filters
 * @param {Number} pageSize
 * @param {Number} pageNumber
 * @returns
 */
const search = async ({ filters, pageSize, pageNumber }) => {
  const totalResults = await Request.countDocuments(filters);

  const results = await Request.find(filters)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ created_at: -1 })
    .populate("author")
    .exec();

  const paginatedResults = await Promise.all(
    results.map(async (result) => toDTO(result))
  );

  return {
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / pageSize),
      totalResults,
    },
    results: paginatedResults,
  };
};

module.exports = {
  search,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
};
