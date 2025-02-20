const Recommendation = require("../../model/Recommendation");
const { NotFoundError, ForbiddenError } = require("../../errors/error");
const { acceptedUrls } = require("../../constants");

/**
 *
 * @param {*} param0
 */
const create = async ({
  field1,
  field2,
  field3,
  html,
  url,
  requestType,
  provider,
  user,
  request,
  duplicated_from,
}) => {
  // 1 - Verify url is accepted
  if (
    acceptedUrls.filter((acceptedUrl) => url?.includes(acceptedUrl))?.length ===
    0
  )
    throw new ForbiddenError("Url not accepted");

  // 2 - Create recommendation
  const recommendation = new Recommendation({
    field1,
    field2,
    field3,
    html,
    url,
    requestType,
    provider,
    user,
    request,
  });

  return recommendation;
};

module.exports = {
  create,
};
