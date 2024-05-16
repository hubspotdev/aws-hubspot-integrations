const axios = require("axios");

const CONFIG = {
  EMAIL_ID: 165655950505,
};

exports.main = async (context = {}) => {
  const PRIVATE_APP_ACCESS_TOKEN = process.env["PRIVATE_APP_ACCESS_TOKEN"];

  const { email } = context.propertiesToSend;

  const data = JSON.stringify({
    emailId: CONFIG.EMAIL_ID,
    message: {
      to: email,
    },
  });

  const config = {
    method: "post",
    url: "https://api.hubapi.com/marketing/v4/email/single-send",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PRIVATE_APP_ACCESS_TOKEN}`,
    },
    data,
  };

  try {
    await axios.request(config);

    return { status: "success" };
  } catch (err) {
    console.log(err);
    return { status: "error" };
  }
};
