import createCard from "./cardTemplate";
import createCartSummaryCard from "./cartSummaryTemplate";
import anime from "animejs/lib/anime.es.js";
import createOrderSummaryItem from "./orderSummaryItemTemplate";

let cardsContainer = document.querySelector(".container");
let loader = document.querySelector(".loader");
let cartPriceUI = document.querySelector(".header__value");
let cartSummaryUI = document.querySelector(".cart-summary__items");
let cartSammaryTotalUI = document.querySelector(".cart-summary__value");
let oderSummaryItems = document.querySelector(".order__items");
let orderTotal = document.querySelector(".order__total span");

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
