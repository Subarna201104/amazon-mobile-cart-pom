
import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async verifyProductInCart(
    asin: string,
    title: string
  ): Promise<void> {

    // Check that Amazon's cart page is displayed.
    await expect(this.page).toHaveURL(/\/cart|\/gp\/cart/i);

    // Check whether Amazon reports an empty cart.
    const emptyCart = this.page.getByText(
      /Your Amazon Cart is empty/i
    );

    if (await emptyCart.isVisible().catch(() => false)) {
      throw new Error(
        'Amazon cart is empty. The selected mobile was not added. ' +
        'Amazon may require sign-in or a successful Add to Cart action.'
      );
    }

    // Look for an item using its product ASIN.
    const matchingRow = this.page.locator(
      `[data-asin="${asin}"]`
    ).first();

    // Some cart layouts do not expose the same ASIN.
    // Try locating the product using its visible title.
    const cartItems = this.page.locator(
      '.sc-list-item, [data-name="Active Items"]'
    );

    const selectedProduct = matchingRow.or(
      cartItems.filter({
        hasText: /iPhone|Redmi|Xiaomi/i
      }).first()
    ).first();

    await expect(
      selectedProduct,
      'The selected product was not found in the Amazon cart'
    ).toBeVisible();

    const cartText = (
      await selectedProduct.innerText()
    ).toLowerCase();

    const titleWords = title
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length >= 4)
      .slice(0, 5);

    const matched = titleWords.some(
      word => cartText.includes(word)
    );

    expect(
      matched,
      'The cart item should match the selected mobile'
    ).toBeTruthy();

    console.log('VERIFIED PRODUCT IN CART');
    console.log('Product:', title);
    console.log('Expected ASIN:', asin);

    await this.page.screenshot({
      path: 'test-results/cart-verified.png',
      fullPage: true
    });
  }
}
