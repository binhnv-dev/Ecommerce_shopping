const keys = require("../config/keys");
const nodemailer = require("nodemailer");

const template = require("../config/template");

const { sender, email, password } = keys.mailgun;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email || "nguyenbinh26.dev@gmail.com",
    pass: password || "zmwp aruj nmnu xvjs",
  },
});

// const mailgun = new MailgunService().init();

exports.sendEmail = async (email, type, host, data) => {
  try {
    const message = prepareTemplate(type, host, data);
    const config = {
      from: `Industrious Commerce <${sender}>`,
      to: email,
      subject: message.subject,
      text: message.text,
    };
    return await transporter.sendMail(config);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const prepareTemplate = (type, host, data) => {
  let message;

  switch (type) {
    case "reset":
      message = template.resetEmail(host, data);
      break;

    case "reset-confirmation":
      message = template.confirmResetPasswordEmail();
      break;

    case "signup":
      message = template.signupEmail(data);
      break;

    case "merchant-signup":
      message = template.merchantSignup(host, data);
      break;

    case "merchant-welcome":
      message = template.merchantWelcome(data);
      break;

    case "newsletter-subscription":
      message = template.newsletterSubscriptionEmail();
      break;

    case "contact":
      message = template.contactEmail();
      break;

    case "merchant-application":
      message = template.merchantApplicationEmail();
      break;

    case "order-confirmation":
      message = template.orderConfirmationEmail(data);
      break;

    case "payment-success":
      message = template.paymentSuccessEmail(data);

    case "verify":
      message = template.verifyEmail(data);
      break;

    default:
      message = "";
  }

  return message;
};
