import { getProductsAsync } from "./commonjs";
import createCard from "./cardTemplate";
import anime from "animejs/lib/anime.es.js";

let cardsContainer = document.querySelector(".container");
let loader = document.querySelector(".loader");
let allProducts = [];

getProductsAsync().then((products) => {
  loader.classList.add("hidden");
  allProducts = products; //cache products
  let altenator = 0;
  let cardStrings = products.data.map((product, index) => {
    if (product.is.sold_out) return;
    let isCardLeft = (altenator + 1) % 2 === 0 ? true : false; // alternate type of card
    altenator++;
    return createCard(product, isCardLeft);
  });
  cardsContainer.insertAdjacentHTML("afterbegin", cardStrings.join("\n"));
  anime({
    targets: ".card",
    translateY: ["10rem", "0rem"],
    duration: 2000,
    easing: "easeOutExpo",
    delay: anime.stagger(300),
  });
});
