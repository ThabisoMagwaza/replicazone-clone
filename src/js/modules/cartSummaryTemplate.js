export default function createCartSummaryCard(item) {
  return `<div class="cart-summary__item">
    <div class="cart-summary__item-header">
      <img
        src="${item.media.source}"
        alt="${item.name} image"
      />
      <h4>${item.name}</h4>
    </div>
    <button class="summary__item-btn-delete" data-prodictId=${item.id}>
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 4v6.47H12v3.236h40V10.47H42V4H22zm3.333 6.47V7.235H38.67v3.235H25.333zm20.001 9.707h3.333V59H15.334V20.177h3.333v35.588h26.667V20.177zm-15 29.116V23.412h3.334v25.881h-3.334z"
        ></path>
      </svg>
    </button>
    <div class="cart-summary__quantity">
      <h5>Quantity</h5>
      <div class="cart-summary__quantity-btns">
        <button class="cart-summary__quantity-btn" data-action="dec" data-productId=${item.id}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M48 31H16v2.462h32V31z" fill="currentColor"></path>
          </svg>
        </button>
        <span class="val">${item.quantity}</span>
        <button class="cart-summary__quantity-btn" data-action="inc" data-productId=${item.id}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M33.23 30.77H48v2.46H33.23V48h-2.46V33.23H16v-2.46h14.77V16h2.46v14.77z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
    <p class="cart-summary__item-price">${item.line_total.formatted_with_symbol}</p>
  </div>`;
}
