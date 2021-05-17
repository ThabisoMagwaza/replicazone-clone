import {
  getProductsAsync,
  createCart,
  addToCart,
  removeFromCart,
} from "./modules/commonjs";
import {
  updateProductsUI,
  updateCartPriceUI,
  updateCartSummaryUI,
} from "./modules/updateUI";

let cartSummaryRemoveBtn = document.querySelector(".cart-summary__items");
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
  updateCartPriceUI(cart.subtotal.formatted);
});

productsContainer.onclick = addProductsToCart;
summaryCloseBtn.onclick = closeCartSummary;
headerCartBtn.onclick = openCartSummary;
cartSummaryRemoveBtn.onclick = removeItemFromCart;

function removeItemFromCart(event) {
  if (!event.target.closest(".summary__item-btn-delete").dataset) return;
  let productId = event.target.closest(".summary__item-btn-delete").dataset
    .prodictid;
  console.log(productId);
  removeFromCart(productId).then((res) => {
    updateCartState(res);
  });
}

function addProductsToCart(event) {
  if (!event.target.classList.contains("card__btn")) return;
  openCartSummary();
  let productId = event.target.dataset.productid;
  let quantity = document.querySelector(`.${productId}`).value;
  addToCart(productId, quantity).then((res) => {
    updateCartState(res);
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

function updateCartState(res) {
  currentCart = res.cart;
  updateCartSummaryUI(currentCart.line_items);
}
