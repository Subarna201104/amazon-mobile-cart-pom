import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

test('Amazon mobile search -> Redmi and Apple filters -> add first phone -> verify cart', async ({ page }) => {
  const home = new HomePage(page);
  const search = new SearchResultsPage(page);
  const product = new ProductPage(page);
  const cart = new CartPage(page);

  await test.step('Open Amazon and search mobile phones', () => home.searchForMobiles());
  await test.step('Select Redmi and Apple brand filters', () => search.selectBrands());
  const selected = await test.step('Open the first non-sponsored phone', () => search.openFirstRegularProduct());
  const title = await test.step('Add selected phone to cart', () => product.addToCart());
  await test.step('Display cart and verify phone', async () => {
    await product.goToCart();
    await cart.verifyProductInCart(selected.asin, title);
  });
});
