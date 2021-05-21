const axios = require("axios").default;

exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello Serverless!!" }),
  };
};
