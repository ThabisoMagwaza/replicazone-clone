export function toggleVisble(...elements) {
  elements.forEach((el) => el.classList.toggle("hidden"));
}
export function hide(...elements) {
  elements.forEach((el) => el.classList.add("hidden"));
}
export function show(...elements) {
  elements.forEach((el) => el.classList.remove("hidden"));
}
