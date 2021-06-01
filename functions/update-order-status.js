const axios = require("axios").default;
require("dotenv").config();

async function updateOrderAsync(orderId, transactionId) {
  let url = `https://api.chec.io/v1/orders/${orderId}/transactions/${transactionId}`;
  let apiKey = process.env.CHECH_SECRETE_KEY;
  let headers = {
    "X-Authorization": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let body = {
    status: "complete",
  };
  return await axios.put(url, body, {
    headers,
  });
}

exports.handler = async function (event, context) {
  let { orderId, transactionId } = event.queryStringParameters;
  try {
    let res = await updateOrderAsync(orderId, transactionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success" }),
    };
  } catch (err) {
    console.log(err.response);
    // TODO: Send email to admint alerting them that they should update the order manually
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
      }),
    };
  }
};
