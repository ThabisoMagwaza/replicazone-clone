import createCard from "./cardTemplate";
import anime from "animejs/lib/anime.es.js";

let cardsContainer = document.querySelector(".container");
let loader = document.querySelector(".loader");

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