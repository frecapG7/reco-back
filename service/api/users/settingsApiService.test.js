const sinon = require("sinon");
const User = require("../../../model/User");

const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("./settingsApiService");

describe("Test getSettings", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    await expect(getSettings({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });

  it("Should throw a not found error", async () => {
    findByIdStub.resolves(null);

    await expect(
      getSettings({ params: { id: "123" }, user: { role: "ADMIN" } })
    ).rejects.toThrow("User not found");
  });

  it("Should test happy path", async () => {
    const user = sinon.mock();

    findByIdStub.resolves({
      settings: {
        lang: "en",
        theme: "light",
        notifications: true,
      },
    });

    const result = await getSettings({
      params: { id: "123" },
      user: { role: "ADMIN" },
    });

    expect(result.lang).toEqual("en");
    expect(result.theme).toEqual("light");
    expect(result.notifications).toEqual(true);
  });
});

describe("Test updateSettings", () => {
  let findByIdStub;
  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    await expect(updateSettings({ params: { id: "123" } })).rejects.toThrow(
      "You are not authorized to perform this action"
    );
  });
  it("Should throw a not found error", async () => {
    findByIdStub.resolves(null);

    await expect(
      updateSettings({ params: { id: "123" }, user: { role: "ADMIN" } })
    ).rejects.toThrow("User not found");
  });

  it("Should update settings", async () => {
    const user = sinon.mock();
    user.save = sinon.stub().resolvesThis();

    findByIdStub.resolves(user);

    const result = await updateSettings({
      params: { id: "123" },
      body: {
        lang: "fr",
        theme: "dark",
        notifications: false,
      },
      user: { role: "ADMIN" },
    });

    expect(user.save.calledOnce).toBeTruthy();
    expect(result.lang).toEqual("fr");
    expect(result.theme).toEqual("dark");
    expect(result.notifications).toEqual(false);
  });
});
describe("Test resetSettings", () => {
  let findByIdStub;
  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });
  afterEach(() => {
    findByIdStub.restore();
  });

  it("Should throw a forbidden error", async () => {
    await expect(
      resetSettings({
        params: { id: "123" },
      })
    ).rejects.toThrow("You are not authorized to perform this action");
  });

  it("Should throw a not found error", async () => {
    findByIdStub.resolves(null);

    await expect(
      resetSettings({
        params: { id: "123" },
        user: { role: "ADMIN" },
      })
    ).rejects.toThrow("User not found");
  });

  it("Should reset settings", async () => {
    const user = sinon.mock();
    user.save = sinon.stub().resolvesThis();

    findByIdStub.resolves(user);

    const result = await resetSettings({
      params: { id: "123" },
      user: { role: "ADMIN" },
    });

    expect(result.lang).toEqual("en");
    expect(result.theme).toEqual("light");
    expect(result.notifications).toEqual(true);
  });
});
