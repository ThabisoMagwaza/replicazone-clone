import createCard from "./cardTemplate";
import createCartSummaryCard from "./cartSummaryTemplate";
import anime from "animejs/lib/anime.es.js";
import createOrderSummaryItem from "./orderSummaryItemTemplate";
import { initPaymentForm } from "./checkoutPage";
import { show, toggleVisble, hide } from "./helpers";

let cardsContainer = document.querySelector(".container");
let loader = document.querySelector(".loader");
let cartPriceUI = document.querySelector(".header__value");
let cartSummaryUI = document.querySelector(".cart-summary__items");
let cartSammaryTotalUI = document.querySelector(".cart-summary__value");
let oderSummaryItems = document.querySelector(".order__items");
let orderTotal = document.querySelector(".order__total span");
let summaryCartOverlay = document.querySelector(".overlay");
let summaryCart = document.querySelector(".cart-summary");
let checkoutPage = document.querySelector(".checkout");
let shoppingPageElements = document.querySelectorAll(".checkout ~ *");
let errorUI = document.querySelector(".error");
let body = document.querySelector("body");

export function updateProductsUI(products) {
  let altenator = 0;
  let cardStrings = products.data.map((product, index) => {
    if (product.is.sold_out) return;
    let isCardLeft = (altenator + 1) % 2 === 0 ? true : false; // alternate type of card
    altenator++;
    return createCard(product, isCardLeft);
  });
  cardsContainer.insertAdjacentHTML("afterbegin", cardStrings.join("\n"));

  loader.classList.add("hidden");
  anime({
    targets: ".card",
    translateY: ["10rem", "0rem"],
    duration: 2000,
    easing: "easeOutExpo",
    delay: anime.stagger(300),
  });
}

export function updateCartPriceUI(price) {
  let priceObj = { value: 0 };
  anime({
    targets: priceObj,
    value: price,
    round: 100,
    easing: "easeInOutExpo",
    update: function () {
      cartPriceUI.innerHTML = priceObj.value;
    },
  });
}

export function updateCartSummaryUI(cart) {
  let cartSummaryStrings = cart.line_items.map((item) =>
    createCartSummaryCard(item)
  );
  cartSummaryUI.innerHTML = "";
  cartSummaryUI.insertAdjacentHTML("afterbegin", cartSummaryStrings.join("\n"));

  cartSammaryTotalUI.textContent = cart.subtotal.formatted_with_symbol;
}

export function populateOrderSummaryUI(cart) {
  let lineItems = cart.line_items.map((item) => createOrderSummaryItem(item));
  oderSummaryItems.innerHTML = lineItems.join("\n");
  orderTotal.textContent = cart.subtotal.formatted_with_symbol;
}

export function openCartSummaryUI(cart) {
  updateCartSummaryUI(cart);
  summaryCart.classList.remove("cart-summary--hidden");
  body.classList.add("no-overflow-y");
  show(summaryCartOverlay);
}

export function closeCartSummaryUI(cart) {
  updateCartPriceUI(cart.subtotal.formatted);
  summaryCart.classList.add("cart-summary--hidden");
  body.classList.remove("no-overflow-y");
  hide(summaryCartOverlay);
  populateOrderSummaryUI(cart);
  initPaymentForm(cart);
}

export function showCheckoutPageUI() {
  checkoutPage.classList.remove("checkout--hidden");
  shoppingPageElements.forEach((el) => el.classList.add("hidden"));
  summaryCart.classList.remove("hidden");
}

export async function showShoppingPageUI(cart) {
  shoppingPageElements.forEach((el) => el.classList.remove("hidden"));
  checkoutPage.classList.add("checkout--hidden");
  closeCartSummaryUI(cart);
}

export function showErrorUI(message) {
  errorUI.textContent = message;
  errorUI.classList.remove("error--hidden", "hidden");
  setTimeout(() => errorUI.classList.add("error--hidden"), 3000);
}
