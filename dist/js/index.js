import { set } from "animejs";
import {
  getProductsAsync,
  createCart,
  addToCart,
  removeFromCart,
  updateCart,
  generateCheckoutToken,
  captureOder,
} from "./modules/commonjs";
import {
  updateProductsUI,
  updateCartPriceUI,
  updateCartSummaryUI,
} from "./modules/updateUI";

let billingEdit = document.querySelector(".billing-summary__btn-edit");
let billingSummary = document.querySelector(".billing-summary");
let billingForm = document.querySelector(".checkout__form--billing");
let billingSubmit = document.querySelector(".checkout__form button");
let checkoutBtnText = document.querySelector(".checkout__form button span");
let checkoutSpinner = document.querySelector(".checkout__form .spinner");
let checkoutPage = document.querySelector(".checkout");
let checkoutBackBtn = document.querySelector(".checkout__btn-back");
let checkoutBtn = document.querySelector(".btn-checkout");
let cartSummaryRemoveBtn = document.querySelector(".cart-summary__items");
let cartUpdateBtn = document.querySelector(".cart-summary__items");
let headerCartBtn = document.querySelector(".header__cart");
let summaryCloseBtn = document.querySelector(".cart-summary-close-btn");
let summaryCart = document.querySelector(".cart-summary");
let productsContainer = document.querySelector(".container");
let shoppingPageElements = document.querySelectorAll(".checkout ~ *");

let allProducts = [];
let currentCart;

let billingObj = (function (name, email, street, city) {
  return {
    set name(v) {
      name.textContent = v;
    },
    set email(v) {
      email.textContent = v;
    },
    set street(v) {
      street.textContent = v;
    },
    set city(v) {
      city.textContent = v;
    },
  };
})(
  document.querySelector(".billing-summary__person .name"),
  document.querySelector(".billing-summary__person .email"),
  document.querySelector(".billing-summary__address .street"),
  document.querySelector(".billing-summary__address .city")
);

getProductsAsync().then((products) => {
  allProducts = products; //cache products
  updateProductsUI(products);
});

createCart().then((cart) => {
  currentCart = cart;
  updateCartPriceUI(cart.subtotal.formatted);
});

if (productsContainer) productsContainer.onclick = addProductsToCart;
if (summaryCloseBtn) summaryCloseBtn.onclick = closeCartSummary;
if (headerCartBtn) headerCartBtn.onclick = openCartSummary;
if (cartSummaryRemoveBtn)
  cartSummaryRemoveBtn.addEventListener("click", removeItemFromCart);
if (cartUpdateBtn) cartUpdateBtn.addEventListener("click", updateCartItem);
if (checkoutBtn) checkoutBtn.onclick = handleCheckout;
if (checkoutBackBtn) checkoutBackBtn.onclick = showShopping;
if (billingSubmit) billingSubmit.onclick = submitBilling;
if (billingEdit) billingEdit.onclick = toggleBillingSummaryVisble;

function submitBilling(event) {
  event.preventDefault();
  updateBillingSummary();
  toggleBillingSummaryVisble();
}

function updateBillingSummary() {
  billingObj.name = billingForm.elements.fullname.value;
  billingObj.email = billingForm.elements.email.value;
  billingObj.street = billingForm.elements.street.value;

  let province = billingForm.elements.province.value
    ? `,${billingForm.elements.province.value}`
    : "";
  let zipcode = billingForm.elements.zipcode.value
    ? `,${billingForm.elements.zipcode.value}`
    : "";

  billingObj.city = `${billingForm.elements.city.value}${province}${zipcode}`;
}

function toggleBillingSummaryVisble() {
  billingSummary.classList.toggle("hidden");
  billingForm.classList.toggle("hidden");
}

function toggleCheckoutBtnSpinner() {
  checkoutBtnText.classList.toggle("hidden");
  checkoutSpinner.classList.toggle("hidden");
}

async function handleCheckout() {
  showCheckoutPage();
  await checkout();
}

function showShopping() {
  shoppingPageElements.forEach((el) => el.classList.remove("hidden"));
  checkoutPage.classList.add("checkout--hidden");
  closeCartSummary();
}

function showCheckoutPage() {
  checkoutPage.classList.remove("checkout--hidden");
  shoppingPageElements.forEach((el) => el.classList.add("hidden"));
}

async function checkout() {
  let checkout = await generateCheckoutToken(currentCart.id);
  let gatewayPaymentId = checkout.gateways.manual[0].id;
  let items = currentCart.line_items.reduce((acc, item) => {
    acc[item.id] = {
      quantity: item.quantity,
    };
    return acc;
  }, {});
  let orderOptions = {
    line_items: items,
    customer: {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
    },
    shipping: {
      name: "John Doe",
      street: "123 Fake St",
      town_city: "San Francisco",
      county_state: "US-CA",
      postal_zip_code: "94103",
      country: "US",
    },
    billing: {
      name: "John Doe",
      street: "234 Fake St",
      town_city: "San Francisco",
      county_state: "US-CA",
      postal_zip_code: "94103",
      country: "US",
    },
    payment: {
      gateway: "manual",
      manual: {
        id: gatewayPaymentId,
      },
    },
  };

  // let order = await captureOder(checkout.id, orderOptions);
  // console.log(order);
}

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
