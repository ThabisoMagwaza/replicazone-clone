import { getProductsAsync } from "./modules/commonjs";
import { updateProductsUI } from "./modules/updateUI";
let allProducts = [];

getProductsAsync().then((products) => {
  allProducts = products; //cache products
  updateProductsUI(products);
});
