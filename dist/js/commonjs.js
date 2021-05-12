// Import the Commerce module
import Commerce from "@chec/commerce.js";

const public_api_key = "pk_test_273072b92c2d1f1cb13ff4cd03ec581e32aea9bd47ebb";

// Create a Commerce instance
const commerce = new Commerce(`${public_api_key}`);

commerce.products.list().then((product) => console.log(product));

export default "hello commonjs";
