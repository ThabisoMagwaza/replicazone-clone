import { getProductsAsync, createCart, addToCart } from "./modules/commonjs";
import {
  updateProductsUI,
  updateCartPriceUI,
  updateCartSummaryUI,
} from "./modules/updateUI";

let headerCartBtn = document.querySelector(".header__cart");
let summaryCloseBtn = document.querySelector(".cart-summary-close-btn");
let summaryCart = document.querySelector(".cart-summary");
let productsContainer = document.querySelector(".container");
let allProducts = [];
let currentCart;

getProductsAsync().then((products) => {
  allProducts = products; //cache products
  updateProductsUI(products);
});

createCart().then((cart) => {
  currentCart = cart;
  console.log(cart);
  updateCartPriceUI(cart.subtotal.formatted);
});

productsContainer.addEventListener("click", addProductsToCart);

summaryCloseBtn.onclick = closeCartSummary;
headerCartBtn.onclick = openCartSummary;

function addProductsToCart(event) {
  if (!event.target.classList.contains("card__btn")) return;
  openCartSummary();
  let productId = event.target.dataset.productid;
  let quantity = document.querySelector(`.${productId}`).value;
  addToCart(productId, quantity).then((res) => {
    currentCart = res.cart;
    updateCartSummaryUI(currentCart.line_items);
  });
}

function closeCartSummary() {
  updateCartPriceUI(currentCart.subtotal.formatted);
  summaryCart.classList.add("cart-summary--hidden");
}

function openCartSummary() {
  updateCartSummaryUI(currentCart.line_items);
  summaryCart.classList.remove("cart-summary--hidden");
}
