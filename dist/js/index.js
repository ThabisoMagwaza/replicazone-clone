import {
  getProductsAsync,
  createCart,
  addToCart,
  removeFromCart,
  updateCart,
} from "./modules/commonjs";
import {
  updateProductsUI,
  updateCartPriceUI,
  updateCartSummaryUI,
} from "./modules/updateUI";

let cartSummaryRemoveBtn = document.querySelector(".cart-summary__items");
let cartUpdateBtn = document.querySelector(".cart-summary__items");
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
cartSummaryRemoveBtn.addEventListener("click", removeItemFromCart);
cartUpdateBtn.addEventListener("click", updateCartItem);

function updateCartItem(event) {
  if (!event.target.closest(".cart-summary__quantity-btn")) return;
  let dataset = event.target.closest(".cart-summary__quantity-btn").dataset;
  let currentItem = currentCart.line_items.find(
    (item) => item.id === dataset.productid
  );
  updateCart(
    dataset.productid,
    dataset.action == "inc"
      ? currentItem.quantity + 1
      : currentItem.quantity - 1
  ).then((res) => updateCartState(res));
}

function removeItemFromCart(event) {
  if (!event.target.closest(".summary__item-btn-delete")) return;
  let productId = event.target.closest(".summary__item-btn-delete").dataset
    .prodictid;
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
  updateCartSummaryUI(currentCart);
  summaryCart.classList.remove("cart-summary--hidden");
}

function updateCartState(res) {
  currentCart = res.cart;
  updateCartSummaryUI(currentCart);
}
