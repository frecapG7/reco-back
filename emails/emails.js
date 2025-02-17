const nodemailer = require("nodemailer");
const { smtp, server } = require("../config");
const Email = require("email-templates");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  auth: {
    user: smtp.user,
    pass: smtp.password,
  },
});

const sendResetPasswordEmail = async (username, to, token) => {
  const email = new Email({
    message: {
      from: "no-reply@rawkaukau.com",
    },
    send: true,
    transport: transporter,
    i18n: {},
  });

  return await email.send({
    template: path.resolve(__dirname, "password-reset"),
    message: {
      to,
    },
    locals: {
      username,
      url: `${server}/reset-password?token=${token}`,
    },
  });
};

module.exports = {
  sendResetPasswordEmail,
};
