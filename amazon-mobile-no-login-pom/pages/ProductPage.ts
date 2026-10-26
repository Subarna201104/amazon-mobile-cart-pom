
import { Page, expect } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async addToCart(): Promise<string> {
    const productTitle = this.page.locator('#productTitle');

    await expect(productTitle).toBeVisible();

    const title =
      (await productTitle.textContent())?.trim() ?? '';

    console.log('Selected product:', title);

    // Find the visible Add to Cart button.
    const addButton = this.page.locator(
      '#add-to-cart-button:visible, ' +
      '#add-to-cart-button-ubb:visible, ' +
      'input[name="submit.add-to-cart"]:visible'
    ).first();

    const available = await addButton
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!available) {
      await this.page.screenshot({
        path: 'test-results/add-to-cart-unavailable.png',
        fullPage: true
      });

      throw new Error(
        'Add to Cart button is not available. ' +
        'Amazon may require a product variation or sign-in.'
      );
    }

    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();

    console.log('Clicked Add to Cart:', title);

    // Check whether Amazon displays a confirmation.
    const confirmation = this.page.getByText(
      /Added to Cart|Added to Basket/i
    ).first();

    const confirmed = await confirmation
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (confirmed) {
      console.log('Amazon confirmed Add to Cart.');
    } else {
      console.log(
        'No confirmation displayed. Checking the cart next.'
      );
    }

    return title;
  }

  async goToCart(): Promise<void> {
    // Avoid clicking Amazon's cart icon because another
    // element may intercept the mouse click.

    if (/\/cart|\/gp\/cart/i.test(this.page.url())) {
      console.log('Already on the cart page.');
      return;
    }

    await this.page.goto(
      'https://www.amazon.in/gp/cart/view.html',
      { waitUntil: 'domcontentloaded' }
    );

    await expect(this.page).toHaveURL(
      /\/cart|\/gp\/cart/i
    );

    console.log('Amazon cart page opened successfully.');
  }
}
