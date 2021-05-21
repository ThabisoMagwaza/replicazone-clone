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
  populateOrderSummaryUI,
} from "./modules/updateUI";
import { show, toggleVisble, hide } from "./modules/helpers";

let btnPayment = document.querySelector(".btn-complete-payment");
let useShipping = document.querySelector("#useshipping");
let nextStepPayment = document.querySelector(".step-next--payment");
let nextStepShipping = document.querySelector(".step-next--shipping");
let billingEdit = document.querySelector(".summary__btn-edit--billing");
let shippingEdit = document.querySelector(".summary__btn-edit--shipping");
let billingSummary = document.querySelector(".summary--billing");
let shippingSummary = document.querySelector(".summary--shipping");
let billingForm = document.querySelector(".checkout__form--billing");
let shippingForm = document.querySelector(".checkout__form--shipping");
let checkoutBtnText = document.querySelector(".btn-complete-payment span");
let checkoutSpinner = document.querySelector(".btn-complete-payment .spinner");
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
let orderSummaryEditBtn = document.querySelector(".summary__btn-edit--order");
let summaryCartOverlay = document.querySelector(".overlay");

let allProducts = [];
let currentCart;

let billingObj = (function (fullname, email, street, city) {
  let _firstname, _lastname, _email, _street, _city;
  return {
    set fullname(v) {
      let nameArr = v.split(" ");
      _firstname = nameArr[0];
      _lastname = nameArr[1] ?? "";
      fullname.textContent = v;
    },
    get fullname() {
      return `${_firstname} ${_lastname}`;
    },
    get firstname() {
      return _firstname;
    },
    get lastname() {
      return _lastname;
    },
    set email(v) {
      _email = v;
      email.textContent = v;
    },
    get email() {
      return _email;
    },
    set street(v) {
      _street = v;
      street.textContent = v;
    },
    get street() {
      return _street;
    },
    set city(v) {
      _city = v;
      city.textContent = v;
    },
    get city() {
      return _city;
    },
  };
})(
  document.querySelector(".summary--billing .name"),
  document.querySelector(".summary--billing .email"),
  document.querySelector(".summary--billing .street"),
  document.querySelector(".summary--billing .city")
);

let shippingObj = (function (street, city) {
  let _street, _city;
  return {
    set street(v) {
      _street = v;
      street.textContent = v;
    },
    get street() {
      return _street;
    },
    set city(v) {
      _city = v;
      city.textContent = v;
    },
    get city() {
      return _city;
    },
  };
})(
  document.querySelector(".summary--shipping .street"),
  document.querySelector(".summary--shipping .city")
);

getProductsAsync().then((products) => {
  allProducts = products; //cache products
  updateProductsUI(products);
});

createCart().then((cart) => {
  currentCart = cart;
  updateCartPriceUI(cart.subtotal.formatted);
});

if (btnPayment) btnPayment.onclick = checkout;
if (productsContainer) productsContainer.onclick = addProductsToCart;
if (summaryCloseBtn) summaryCloseBtn.onclick = closeCartSummary;
if (headerCartBtn) headerCartBtn.onclick = openCartSummary;
if (cartSummaryRemoveBtn)
  cartSummaryRemoveBtn.addEventListener("click", removeItemFromCart);
if (cartUpdateBtn) cartUpdateBtn.addEventListener("click", updateCartItem);
if (checkoutBtn) checkoutBtn.onclick = handleCheckout;
if (checkoutBackBtn) checkoutBackBtn.onclick = showShopping;
if (billingForm) billingForm.addEventListener("submit", submitBilling);
if (billingEdit)
  billingEdit.addEventListener("click", () => {
    toggleVisble(
      billingSummary,
      billingForm,
      nextStepShipping,
      shippingSummary
    );
    nextStepPayment.classList.remove("hidden");
    btnPayment.classList.add("hidden");
  });
if (shippingEdit)
  shippingEdit.addEventListener("click", () => {
    toggleVisble(shippingSummary, shippingForm);
    nextStepPayment.classList.remove("hidden");
    btnPayment.classList.add("hidden");
  });
if (shippingForm) shippingForm.onsubmit = submitShipping;
if (orderSummaryEditBtn) orderSummaryEditBtn.onclick = openCartSummary;
if (summaryCartOverlay) summaryCartOverlay.onclick = closeCartSummary;

function submitShipping(event) {
  event.preventDefault();
  updateFormObject(shippingObj, shippingForm);
  toggleVisble(shippingSummary, shippingForm, nextStepPayment, btnPayment);
}

function submitBilling(event) {
  event.preventDefault();
  updateFormObject(billingObj, billingForm, "billing");

  if (!useShipping.checked)
    return toggleVisble(
      billingSummary,
      billingForm,
      nextStepShipping,
      shippingForm
    );

  updateFormObject(shippingObj, billingForm);
  toggleVisble(
    billingForm,
    billingSummary,
    nextStepShipping,
    shippingSummary,
    nextStepPayment,
    btnPayment
  );
}

function updateFormObject(object, form, type) {
  if (type == "billing") object.fullname = form.elements.fullname.value;
  if (type == "billing") object.email = form.elements.email.value;
  object.street = form.elements.street.value;

  let province = form.elements.province.value
    ? `, ${form.elements.province.value}`
    : "";
  let zipcode = form.elements.zipcode.value
    ? `, ${form.elements.zipcode.value}`
    : "";

  object.city = `${form.elements.city.value}${province}${zipcode}`;
}

function toggleCheckoutBtnSpinner() {
  checkoutBtnText.classList.toggle("hidden");
  checkoutSpinner.classList.toggle("hidden");
}

async function handleCheckout() {
  showCheckoutPage();
  // await checkout();
}

function showShopping() {
  shoppingPageElements.forEach((el) => el.classList.remove("hidden"));
  checkoutPage.classList.add("checkout--hidden");
  closeCartSummary();
}

function showCheckoutPage() {
  checkoutPage.classList.remove("checkout--hidden");
  shoppingPageElements.forEach((el) => el.classList.add("hidden"));
  summaryCart.classList.remove("hidden");
  closeCartSummary();
  populateOrderSummaryUI(currentCart);
}

async function checkout() {
  toggleCheckoutBtnSpinner();
  let token = await generateCheckoutToken(currentCart.id);
  let gatewayPaymentId = token.gateways.manual[0].id;
  let items = currentCart.line_items.reduce((acc, item) => {
    acc[item.id] = {
      quantity: item.quantity,
    };
    return acc;
  }, {});
  let billingAddressArr = billingObj.city.split(",");
  let shippingAddressArr = shippingObj.city.split(",");
  let orderOptions = {
    line_items: items,
    customer: {
      firstname: billingObj.firstname,
      lastname: billingObj.lastname,
      email: billingObj.email,
    },
    shipping: {
      name: billingObj.fullname,
      street: shippingObj.street,
      town_city: shippingAddressArr[0],
      county_state: shippingAddressArr[1] ?? "",
      postal_zip_code: shippingAddressArr[2] ?? "",
      country: "SA",
    },
    billing: {
      name: billingObj.fullname,
      street: billingObj.street,
      town_city: billingAddressArr[0],
      county_state: billingAddressArr[1] ?? "",
      postal_zip_code: billingAddressArr[2] ?? "",
      country: "SA",
    },
    payment: {
      gateway: "manual",
      manual: {
        id: gatewayPaymentId,
      },
    },
  };

  console.log(orderOptions);

  // let order = await captureOder(checkout.id, orderOptions);
  // console.log(order);
}

async function updateCartItem(event) {
  if (!event.target.closest(".cart-summary__quantity-btn")) return;
  let dataset = event.target.closest(".cart-summary__quantity-btn").dataset;
  let currentItem = currentCart.line_items.find(
    (item) => item.id === dataset.productid
  );

  let res = await updateCart(
    dataset.productid,
    dataset.action == "inc"
      ? currentItem.quantity + 1
      : currentItem.quantity - 1
  );
  updateCartState(res);
  populateOrderSummaryUI(currentCart);
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
  hide(summaryCartOverlay);
}

function openCartSummary() {
  updateCartSummaryUI(currentCart);
  summaryCart.classList.remove("cart-summary--hidden");
  show(summaryCartOverlay);
}

function updateCartState(res) {
  currentCart = res.cart;
  updateCartSummaryUI(currentCart);
}
