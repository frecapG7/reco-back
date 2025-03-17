const Notification = require("../../model/Notification");
const { createNotification } = require("./notificationService");
const sinon = require("sinon");
describe("Should validate createNotification", () => {
  let saveStub;

  beforeEach(() => {
    saveStub = sinon.stub(Notification.prototype, "save");
  });
  afterEach(() => {
    saveStub.restore();
  });
  it("Should validate createNotification", async () => {
    const to = sinon.mock();
    const from = sinon.mock();

    saveStub.resolvesThis();

    const result = await createNotification({
      to,
      from,
      type: "test",
    });

    sinon.assert.calledOnce(saveStub);
  });
});
