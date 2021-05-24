export default function (lineItem) {
  return `<div class="order__item">
    <span class="name">${lineItem.name}</span>
    <span class="quantity"> x${lineItem.quantity}</span>
    <span class="price">${lineItem.line_total.formatted_with_symbol}</span>
  </div>`;
}
