export default function makeCard(product, isCardLeft) {
  return `<div class="card ${isCardLeft ? "card--left" : ""}">
  <h2 class="card__heading">${product.name}</h2>
  <p class="card__description">${product.description.replace(
    new RegExp("</?p>", "g"),
    ""
  )}</p>
  <div class="card__purchase-block">
    <div class="card__input-group card__input-group--quantity">
      <label for="quantity" class="card__label">Quantity</label>
      <input
        type="number"
        name="quantity"
        id="quantity"
        class="card__input"
        value="1"
      />
    </div>
    <div class="card__input-group">
      <label for="format" class="card__label">Format</label>
      <select name="format" id="format" class="card__input">
        <option value="physical" selected>Physical Copy</option>
        <option value="digital">Digital Copy (.jpg)</option>
      </select>
    </div>

    <p class="card__price">${product.price.formatted_with_symbol}</p>
    <button class="card__btn" data-productId="${
      product.id
    }">Add to cart</button>
  </div>
  <div class="card__image-box ${isCardLeft ? "card__image-box--left" : ""}">
    <img
      src="${product.media.source}"
      alt="High-quality replica of The Starry Night"
      class="card__image  ${isCardLeft ? "card__image--left" : ""}"
    />
  </div>
</div>`;
}
