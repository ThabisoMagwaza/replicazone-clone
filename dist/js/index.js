import { getProductsAsync, createCart, addToCart } from "./modules/commonjs";
import { updateProductsUI, updateCartPriceUI } from "./modules/updateUI";

let productsContainer = document.querySelector(".container");
let allProducts = [];
let currentCart;

getProductsAsync().then((products) => {
  allProducts = products; //cache products
  updateProductsUI(products);
});

createCart().then((cart) => {
  currentCart = cart;
  updateCartPriceUI(cart.subtotal.formatted);
});

productsContainer.addEventListener("click", addProductsToCart);

function addProductsToCart(event) {
  if (!event.target.classList.contains("card__btn")) return;
  let productId = event.target.dataset.productid;
  let quantity = document.querySelector(`.${productId}`).value;
  addToCart(productId, quantity).then((res) => {
    currentCart = res.cart;
    updateCartPriceUI(res.cart.subtotal.formatted);
  });
}
