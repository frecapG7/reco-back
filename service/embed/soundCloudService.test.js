const { search } = require("./soundcloudService");
const ExternalAccessToken = require("../../model/tokens/ExternalAccessToken");
const sinon = require("sinon");

describe("Should return search results from soundcloud", () => {
  let findOneStub;
  let saveStub;

  beforeEach(() => {
    findOneStub = sinon.stub(ExternalAccessToken, "findOne");
    saveStub = sinon.stub(ExternalAccessToken.prototype, "save");
  });

  afterEach(() => {
    findOneStub.restore();
  });

  it.skip("Should return search results from soundcloud based on new auth", async () => {
    findOneStub.returns(null);

    saveStub.resolvesThis();

    const results = await search("Alfa Romero");

    expect(results).toBeDefined();
    console.log(JSON.stringify(results, null, 2));
  });

  it.skip("Should return search results from soundcloud based on existing auth and refresh token", async () => {
    const externalAccessToken = sinon.mock();
    findOneStub.returns(externalAccessToken);

    externalAccessToken.expiresAt = Date.now() - 1000;
    externalAccessToken.refreshToken = "cdkJYaZ21USSkCw2XYzGDoLdvTgi3lMF";
    externalAccessToken.save = sinon.stub().resolvesThis();

    const results = await search("Alfa Romero");

    expect(results).toBeDefined();
    console.log(JSON.stringify(results, null, 2));
  });
});
