const { sendResetPasswordEmail } = require("./emails");

describe("Should test sending of reset password", () => {
  it("Should send the password reset email", async () => {
    const result = await sendResetPasswordEmail(
      "test",
      "test@lifesquare.fr",
      "123456"
    );

    expect(result).toBeDefined();
    expect(result.response?.includes("250")).toBeTruthy();

    console.log(JSON.stringify(result.originalMessage.html, null, 2));
  });
});
