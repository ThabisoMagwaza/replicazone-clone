import {
  showCheckoutPageUI,
  closeCartSummaryUI,
  populateOrderSummaryUI,
  openCartSummaryUI,
  showShoppingPageUI,
  showErrorUI,
  updateCartPriceUI,
} from "./updateUI";
import {
  createCart,
  generateCheckoutToken,
  deleteCart,
  captureOder,
} from "./commonjs";
import { show, hide } from "./helpers";
import axios from "axios";

let billingForm = document.querySelector(".checkout__form--billing");
let shippingForm = document.querySelector(".checkout__form--shipping");
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
let checkoutBtnText = document.querySelector(".btn-complete-payment span");
let checkoutSpinner = document.querySelector(".btn-complete-payment .spinner");
let orderSummaryEditBtn = document.querySelector(".summary__btn-edit--order");
let checkoutBackBtn = document.querySelector(".checkout__btn-back");

let yocoInline;
let paymentIntentObj;
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

billingForm.onsubmit = submitBilling;
shippingForm.onsubmit = submitShipping;
paymentForm.onsubmit = checkout;
checkoutBackBtn.onclick = () => showShoppingPageUI(currentCart);
btnPaymentComplete.onclick = () => showShoppingPageUI(currentCart);
orderSummaryEditBtn.onclick = () => openCartSummaryUI(currentCart);

billingEdit.addEventListener("click", () => {
  show(billingForm, nextStepShipping, nextStepPayment);
  hide(billingSummary, shippingSummary, btnPayment, paymentForm);
});

shippingEdit.addEventListener("click", () => {
  show(shippingForm, nextStepPayment);
  hide(shippingSummary, btnPayment, paymentForm);
});

export function openCheckoutPageUI(cart) {
  showCheckoutPageUI();
  closeCartSummaryUI(cart);
  populateOrderSummaryUI(cart);

  currentCart = cart;
}

export function initPaymentForm(cart) {
  currentCart = cart;

  document.querySelector(
    ".btn-complete-payment span"
  ).textContent = `Pay ${cart.subtotal.formatted_with_symbol}`;

  var sdk = new window.YocoSDK({
    publicKey: "pk_test_079a8dbeJn7lOKO66024",
  });

  paymentIntentObj = {
    layout: "basic",
    amountInCents: cart.subtotal.raw * 100,
    currency: "ZAR",
  };

  // Create a new dropin form instance
  yocoInline = sdk.inline(paymentIntentObj);

  // this ID matches the id of the element we created earlier.
  yocoInline.mount("#card-frame");
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
    initPaymentForm(currentCart);
  }
}

function submitShipping(event) {
  event.preventDefault();
  updateFormObject(shippingObj, shippingForm);
  hide(shippingForm, nextStepPayment);
  show(shippingSummary, btnPayment, paymentForm);
  initPaymentForm(currentCart);
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
  let order;
  let paymentErrorMessage = "Error processing payment. Please contact support!";

  try {
    let res = await yocoInline.createToken();
    btnPayment.disabled = false;
    if (res.error) {
      let errorMessage = res.error.message;
      return handleApiError(res, errorMessage);
    } else {
      yocoToken = res;
    }
  } catch (err) {
    return handleApiError(err.response, paymentErrorMessage);
  }

  // 1) Process payment

  try {
    let res = await axios.post("/api/make-payment", {
      token: yocoToken.id,
      amountInCents: paymentIntentObj.amountInCents,
      currency: paymentIntentObj.currency,
    });
  } catch (err) {
    return handleApiError(err.response, paymentErrorMessage);
  }

  // 2) Create order

  try {
    order = await captureOder(tokenCommerceJs.id, orderOptions);
  } catch (err) {
    return handleApiError(
      err.response,
      "Error creating the order. Please contact support!"
    );
  }

  // 3) capture order

  let transactionId = order.transactions[0].id;

  let updateOrderUrl = `/api/update-order-status?orderId=${order.id}&transactionId=${transactionId}`;
  try {
    let res = await axios.get(updateOrderUrl);
    hide(btnPayment, paymentForm);
    show(btnPaymentComplete);
    toggleCheckoutBtnSpinner();
  } catch (err) {
    return handleApiError(
      err.response,
      "Error capturing successful payment. Please contact support!"
    );
  }

  try {
    await deleteCart();
    await initializeCart();
  } catch (err) {
    showErrorUI("Error reseting cart. Please hard reflesh (ctr/cmd + F5)");
  }
}

async function initializeCart() {
  try {
    let res = await createCart();
    currentCart = res;
    updateCartPriceUI(currentCart.subtotal.formatted);
  } catch (err) {
    showErrorUI("Error creating cart! Please hard reload page (ctr/cmd + F5).");
    console.error(err);
  }
}

function toggleCheckoutBtnSpinner() {
  checkoutBtnText.classList.toggle("hidden");
  checkoutSpinner.classList.toggle("hidden");
}

function handleApiError(err, message) {
  console.log(err);
  btnPayment.disabled = false;
  toggleCheckoutBtnSpinner();
  showErrorUI(`Checkout error: ${message}`);
}
