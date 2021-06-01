const axios = require("axios").default;
require("dotenv").config();

async function makePayment(reqData) {
  let url = `https://online.yoco.com/v1/charges/`;
  let apiKey = process.env.YOCO_SECRETE_KEY;
  console.log(apiKey);
  let headers = {
    "X-Auth-Secret-Key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return await axios.post(url, reqData, {
    headers,
  });
}

exports.handler = async function (event, context) {
  try {
    let res = await makePayment(event.body);
    return {
      statusCode: res.status,
      body: JSON.stringify({ data: res.data }),
    };
  } catch (err) {
    console.log("Error 🔥:", err.response);
    return {
      statusCode: err.response.status,
      body: JSON.stringify(err.response.data),
    };
  }
};
