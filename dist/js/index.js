import { getProductsAsync } from "./commonjs";
import createCard from "./cardTemplate";

let cardsContainer = document.querySelector(".container");

getProductsAsync().then((products) => {
  let cardStrings = products.data.map((product, index) => {
    let isCardLeft = (index + 1) % 2 === 0 ? true : false; // alternate type of card
    return createCard(product, isCardLeft);
  });
  debugger;
  cardsContainer.insertAdjacentHTML("afterbegin", cardStrings.join("\n"));
});
