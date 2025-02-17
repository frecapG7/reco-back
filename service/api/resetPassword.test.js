const { resetPassword, forgottenPassword } = require("./resetPassword");
const Token = require("../../model/Token");
const User = require("../../model/User");
const sinon = require("sinon");

describe("Should test resetPassword", () => {
  let tokenFindOneStub;

  beforeEach(() => {
    tokenFindOneStub = sinon.stub(Token, "findOne");
  });

  afterEach(() => {
    tokenFindOneStub.restore();
  });

  it("Should throw a NotFoundError", async () => {
    tokenFindOneStub.returns(null);

    await expect(resetPassword("password", "123456")).rejects.toThrow(
      "Token not found"
    );
  });

  it("Should reset password", async () => {
    const token = {
      used: false,
      expiration: new Date(),
      created_by: {
        setPassword: sinon.stub(),
        save: sinon.stub(),
      },
      populate: sinon.stub().returnsThis(),
      save: sinon.stub(),
    };

    tokenFindOneStub.returns(token);

    await resetPassword("password", "123456");

    sinon.assert.calledOnce(tokenFindOneStub);
    sinon.assert.calledWith(tokenFindOneStub, {
      value: "123456",
      used: false,
      expiration: { $gte: sinon.match.instanceOf(Date) },
    });

    sinon.assert.calledOnce(token.populate);
    sinon.assert.calledOnce(token.created_by.setPassword);
    sinon.assert.calledWith(token.created_by.setPassword, "password");
    sinon.assert.calledOnce(token.save);
    sinon.assert.calledOnce(token.created_by.save);
  });
});

describe("Should test forgottenPassword", () => {
  let userFindOneStub;
  let tokenSaveStub;

  beforeEach(() => {
    userFindOneStub = sinon.stub(User, "findOne");
    tokenSaveStub = sinon.stub(Token.prototype, "save");
  });
  afterEach(() => {
    userFindOneStub.restore();
    tokenSaveStub.restore();
  });

  it("Should do nothing on NotFound", async () => {
    userFindOneStub.resolves(null);

    await forgottenPassword("toto");

    sinon.assert.calledOnce(userFindOneStub);
    sinon.assert.notCalled(tokenSaveStub);
  });

  it("Should create token and send email", async () => {
    const user = {
      email: "user@mail.net",
      name: "user",
    };

    userFindOneStub.resolves(user);

    tokenSaveStub.resolvesThis();

    await forgottenPassword("toto");

    sinon.assert.calledOnce(userFindOneStub);
    sinon.assert.calledWith(userFindOneStub, { email: "toto" });

    sinon.assert.calledOnce(tokenSaveStub);
  });
});
