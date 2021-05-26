import {
  getProductsAsync,
  createCart,
  addToCart,
  removeFromCart,
  updateCart,
  generateCheckoutToken,
  captureOder,
  deleteCart,
} from "./modules/commonjs";
import {
  updateProductsUI,
  updateCartPriceUI,
  updateCartSummaryUI,
  populateOrderSummaryUI,
  openCartSummaryUI,
  closeCartSummaryUI,
  showCheckoutPageUI,
  showShoppingPageUI,
  showErrorUI,
} from "./modules/updateUI";
import { show, toggleVisble, hide } from "./modules/helpers";
import axios from "axios";

let paymentForm = document.querySelector("#payment-form");
let btnPaymentComplete = document.querySelector(".btn-payment-completed");
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
let checkoutBackBtn = document.querySelector(".checkout__btn-back");
let checkoutBtn = document.querySelector(".btn-checkout");
let cartSummaryRemoveBtn = document.querySelector(".cart-summary__items");
let cartUpdateBtn = document.querySelector(".cart-summary__items");
let headerCartBtn = document.querySelector(".header__cart");
let summaryCloseBtn = document.querySelector(".cart-summary-close-btn");
let productsContainer = document.querySelector(".container");
let orderSummaryEditBtn = document.querySelector(".summary__btn-edit--order");
let summaryCartOverlay = document.querySelector(".overlay");

let currentCart;
let yocoInline;
let paymentIntentObj;

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

paymentForm.onsubmit = checkout;
productsContainer.onclick = addProductsToCart;
summaryCloseBtn.onclick = () => closeCartSummaryUI(currentCart);
headerCartBtn.onclick = () => openCartSummaryUI(currentCart);
cartSummaryRemoveBtn.addEventListener("click", removeItemFromCart);
cartUpdateBtn.addEventListener("click", updateCartItem);
checkoutBtn.onclick = openCheckoutPage;
checkoutBackBtn.onclick = showShoppingPageUI;
btnPaymentComplete.onclick = showShoppingPageUI;
billingForm.addEventListener("submit", submitBilling);
shippingForm.onsubmit = submitShipping;
orderSummaryEditBtn.onclick = () => openCartSummaryUI(currentCart);
summaryCartOverlay.onclick = () => closeCartSummaryUI(currentCart);

billingEdit.addEventListener("click", () => {
  show(billingForm, nextStepShipping, nextStepPayment);
  hide(billingSummary, shippingSummary, btnPayment, paymentForm);
});

shippingEdit.addEventListener("click", () => {
  show(shippingForm, nextStepPayment);
  hide(shippingSummary, btnPayment, paymentForm);
});

window.onload = init;

async function initializeCartAsync() {
  let res = await createCart();
  currentCart = res;
  updateCartPriceUI(currentCart.subtotal.formatted);
}

async function populateProductsAsync() {
  let products = await getProductsAsync();
  showErrorUI("Error loading products!");
  updateProductsUI(products);
}

async function init() {
  await populateProductsAsync();
  await initializeCartAsync();
}

function submitShipping(event) {
  event.preventDefault();
  updateFormObject(shippingObj, shippingForm);
  hide(shippingForm, nextStepPayment);
  show(shippingSummary, btnPayment, paymentForm);
  initPaymentForm(currentCart.subtotal);
}

function submitBilling(event) {
  event.preventDefault();
  updateFormObject(billingObj, billingForm, "billing");

  hide(billingForm);
  show(billingSummary);

  if (!useShipping.checked) {
    show(shippingForm);
    hide(nextStepShipping);
  } else {
    updateFormObject(shippingObj, billingForm);
    hide(nextStepShipping, nextStepPayment);
    show(shippingSummary, btnPayment, paymentForm);
    initPaymentForm(currentCart.subtotal);
  }
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

function openCheckoutPage() {
  showCheckoutPageUI();
  closeCartSummaryUI(currentCart);
  populateOrderSummaryUI(currentCart);
  initPaymentForm(currentCart.subtotal);
}

async function checkout(event) {
  event.preventDefault();
  btnPayment.disabled = true;
  toggleCheckoutBtnSpinner();

  let tokenCommerceJs = await generateCheckoutToken(currentCart.id);
  let gatewayPaymentId = tokenCommerceJs.gateways.manual[0].id;
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
      country: "ZA",
    },
    billing: {
      name: billingObj.fullname,
      street: billingObj.street,
      town_city: billingAddressArr[0],
      county_state: billingAddressArr[1] ?? "",
      postal_zip_code: billingAddressArr[2] ?? "",
      country: "ZA",
    },
    payment: {
      gateway: "manual",
      manual: {
        id: gatewayPaymentId,
      },
    },
  };

  let yocoToken;

  try {
    let res = await yocoInline.createToken();
    btnPayment.disabled = false;
    if (res.error) {
      let errorMessage = res.error.message;
      errorMessage && alert("error occured: " + errorMessage);
      btnPayment.disabled = false;
      toggleCheckoutBtnSpinner();
      return;
    } else {
      yocoToken = res;
      // alert("card successfully tokenised: " + yocoToken.id);
    }
  } catch (err) {
    btnPayment.disabled = false;
    toggleCheckoutBtnSpinner();
    alert("error occured: " + error);
    return;
  }

  try {
    let res = await axios.post("/api/make-payment", {
      token: yocoToken.id,
      amountInCents: paymentIntentObj.amountInCents,
      currency: paymentIntentObj.currency,
    });
    // console.log(res);
  } catch (err) {
    btnPayment.disabled = false;
    toggleCheckoutBtnSpinner();
    alert(err.message);
    return;
  }

  let order = await captureOder(tokenCommerceJs.id, orderOptions);

  let transactionId = order.transactions[0].id;

  let updateOrderUrl = `/api/update-order-status?orderId=${order.id}&transactionId=${transactionId}`;
  try {
    let res = await axios.get(updateOrderUrl);
    toggleCheckoutBtnSpinner();
    hide(btnPayment, paymentForm);
    show(btnPaymentComplete);
    await deleteCart();
    await initializeCart();
  } catch (err) {
    console.log(err);
  }
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

async function removeItemFromCart(event) {
  if (!event.target.closest(".summary__item-btn-delete")) return;
  let productId = event.target.closest(".summary__item-btn-delete").dataset
    .prodictid;
  let res = await removeFromCart(productId);
  updateCartState(res);
}

async function addProductsToCart(event) {
  if (!event.target.classList.contains("card__btn")) return;
  openCartSummaryUI(currentCart);
  let productId = event.target.dataset.productid;
  let quantity = document.querySelector(`.${productId}`).value;
  let res = await addToCart(productId, quantity);
  updateCartState(res);
}

function updateCartState(res) {
  currentCart = res.cart;
  updateCartSummaryUI(currentCart);
}

function initPaymentForm(amount) {
  document.querySelector(
    ".btn-complete-payment span"
  ).textContent = `Pay ${amount.formatted_with_symbol}`;

  var sdk = new window.YocoSDK({
    publicKey: "pk_test_079a8dbeJn7lOKO66024",
  });

  paymentIntentObj = {
    layout: "basic",
    amountInCents: amount.raw * 100,
    currency: "ZAR",
  };

  // Create a new dropin form instance
  yocoInline = sdk.inline(paymentIntentObj);

  // this ID matches the id of the element we created earlier.
  yocoInline.mount("#card-frame");
}
