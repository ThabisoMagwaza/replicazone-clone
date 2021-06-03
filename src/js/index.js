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
  populateOrderSummaryUI,
  openCartSummaryUI,
  closeCartSummaryUI,
  showErrorUI,
} from "./modules/updateUI";
import { openCheckoutPageUI } from "./modules/checkoutPage";

let checkoutBtn = document.querySelector(".btn-checkout");
let cartSummaryRemoveBtn = document.querySelector(".cart-summary__items");
let cartUpdateBtn = document.querySelector(".cart-summary__items");
let headerCartBtn = document.querySelector(".header__cart");
let summaryCloseBtn = document.querySelector(".cart-summary-close-btn");
let productsContainer = document.querySelector(".container");

let summaryCartOverlay = document.querySelector(".overlay");

let currentCart;

productsContainer.onclick = addProductsToCart;
summaryCloseBtn.onclick = () => closeCartSummaryUI(currentCart);
headerCartBtn.onclick = () => openCartSummaryUI(currentCart);
cartSummaryRemoveBtn.addEventListener("click", removeItemFromCart);
cartUpdateBtn.addEventListener("click", updateCartItem);
checkoutBtn.onclick = () => openCheckoutPageUI(currentCart);
summaryCartOverlay.onclick = () => closeCartSummaryUI(currentCart);

window.onload = init;

async function init() {
  await populateProductsAsync();
  await initializeCartAsync();
}

async function initializeCartAsync() {
  try {
    let res = await createCart();
    currentCart = res;
    updateCartPriceUI(currentCart.subtotal.formatted);
  } catch (err) {
    handleApiError(
      err,
      "Error creating cart! Please reload page (ctr/cmd + F5)."
    );
  }
}

async function populateProductsAsync() {
  try {
    let products = await getProductsAsync();
    updateProductsUI(products);
  } catch (err) {
    handleApiError(err, "Error loading catalog! Please try again later.");
  }
}

async function updateCartItem(event) {
  if (!event.target.closest(".cart-summary__quantity-btn")) return;
  let dataset = event.target.closest(".cart-summary__quantity-btn").dataset;
  let currentItem = currentCart.line_items.find(
    (item) => item.id === dataset.productid
  );
  try {
    let res = await updateCart(
      dataset.productid,
      dataset.action == "inc"
        ? currentItem.quantity + 1
        : currentItem.quantity - 1
    );
    updateCartState(res);
    populateOrderSummaryUI(currentCart);
  } catch (err) {
    handleApiError(err, "Error updating cart. Please try again later.");
  }
}

async function removeItemFromCart(event) {
  if (!event.target.closest(".summary__item-btn-delete")) return;
  let productId = event.target.closest(".summary__item-btn-delete").dataset
    .prodictid;

  try {
    let res = await removeFromCart(productId);
    updateCartState(res);
  } catch (err) {
    handleApiError(
      err,
      "Error removing product from cart. Please try again later."
    );
  }
}

async function addProductsToCart(event) {
  if (!event.target.classList.contains("card__btn")) return;
  openCartSummaryUI(currentCart);
  let productId = event.target.dataset.productid;
  let quantity = document.querySelector(`.${productId}`).value;

  try {
    let res = await addToCart(productId, quantity);
    updateCartState(res);
  } catch (err) {
    handleApiError(
      err,
      "Error adding product to cart. Please try again later."
    );
  }
}

function updateCartState(res) {
  currentCart = res.cart;
  updateCartSummaryUI(currentCart);
}

function handleApiError(error, message) {
  console.error(error);
  showErrorUI(message);
}
