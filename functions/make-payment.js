const axios = require("axios").default;

async function makePayment(reqData) {
  let url = `https://online.yoco.com/v1/charges/`;
  let apiKey = "sk_test_fd7dc816QmJEDnDc15d4b7d88101";
  let headers = {
    "X-Auth-Secret-Key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  try {
    return await axios.post(url, reqData, {
      headers,
    });
  } catch (err) {
    console.log(err);
  }
}

exports.handler = async function (event, context) {
  let res = await makePayment(event.body);
  return {
    statusCode: 200,
    body: JSON.stringify({ data: res.data }),
  };
};
