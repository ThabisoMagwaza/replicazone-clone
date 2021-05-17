// Import the Commerce module
import Commerce from "@chec/commerce.js";

const public_api_key = "pk_test_273072b92c2d1f1cb13ff4cd03ec581e32aea9bd47ebb";

// Create a Commerce instance
const commerce = new Commerce(`${public_api_key}`);

export async function getProductsAsync() {
  return await commerce.products.list();
}

export async function createCart() {
  return await commerce.cart.retrieve();
}

export async function addToCart(productId, quantity) {
  return await commerce.cart.add(productId, quantity);
}

export async function removeFromCart(productId) {
  return await commerce.cart.remove(productId);
}

export async function updateCart(prodictId, quantity) {
  return await commerce.cart.update(prodictId, { quantity });
}
