const axios = require("axios").default;

async function makePayment(reqData) {
  let url = `https://online.yoco.com/v1/charges/`;
  let apiKey = "sk_test_fd7dc816QmJEDnDc15d4b7d88101";
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
