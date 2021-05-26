const axios = require("axios").default;

async function updateOrderAsync(orderId, transactionId) {
  let url = `https://api.chec.io/v1/orders/${orderId}/transactions/${transactionId}`;
  let apiKey = "sk_27307054eb95b7ae240c6c791b9a06dfd0e531551b23e";
  let headers = {
    "X-Authorization": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let body = {
    status: "complete",
  };
  try {
    return await axios.put(url, body, {
      headers,
    });
  } catch (err) {
    console.log(err);
    return err.data;
  }
}

exports.handler = async function (event, context) {
  let { orderId, transactionId } = event.queryStringParameters;

  let res = await updateOrderAsync(orderId, transactionId);
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success" }),
  };
};
