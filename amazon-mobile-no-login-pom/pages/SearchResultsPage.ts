
import { Page, expect, Locator } from '@playwright/test';

export class SearchResultsPage {
  constructor(private page: Page) {}

  // Find the correct brand filter
  private async brandLink(
    brand: 'Redmi' | 'Apple'
  ): Promise<Locator> {

    const sidebar = this.page.locator('#s-refinements');

    await expect(sidebar).toBeVisible();

    const pattern =
      brand === 'Apple'
        ? /Apply the filter (Apple|iPhone) to narrow results/i
        : /Apply the filter (Redmi|Xiaomi) to narrow results/i;

    let filter = sidebar
      .getByRole('link', { name: pattern })
      .first();

    // Expand brand list if the filter is hidden
    if (!(await filter.isVisible().catch(() => false))) {
      const seeMore = sidebar.getByText(
        /see more|show more/i
      ).first();

      if (await seeMore.isVisible().catch(() => false)) {
        await seeMore.click();
      }
    }

    filter = sidebar
      .getByRole('link', { name: pattern })
      .first();

    await expect(
      filter,
      `${brand} brand filter was not found`
    ).toBeVisible();

    return filter;
  }

  // Apply Redmi and Apple filters
  async selectBrands() {

    for (const brand of ['Redmi', 'Apple'] as const) {

      const filter = await this.brandLink(brand);

      const oldUrl = this.page.url();

      await filter.click();

      await expect
        .poll(
          () => this.page.url(),
          { timeout: 20000 }
        )
        .not.toBe(oldUrl);

      await expect(
        this.page.locator(
          '[data-component-type="s-search-result"]'
        ).first()
      ).toBeVisible();

      console.log(`Applied brand: ${brand}`);
    }

    await this.page.screenshot({
      path: 'test-results/filtered-brands.png',
      fullPage: true
    });
  }

  // Select the first non-sponsored Redmi or iPhone
  async openFirstRegularProduct(): Promise<{
    title: string;
    asin: string;
  }> {

    const results = this.page.locator(
      '[data-component-type="s-search-result"][data-asin]'
    );

    await expect(results.first()).toBeVisible();

    const count = await results.count();

    console.log('Total product cards:', count);

    for (let i = 0; i < count; i++) {

      const card = results.nth(i);

      const asin =
        (await card.getAttribute('data-asin')) || '';

      if (!asin) continue;

      // Read product title
      const heading = card.locator('h2').first();

      const title = (
        (await heading.textContent()) || ''
      ).trim();

      if (!title) continue;

      console.log('Checking product:', title);

      // Check the phone brand
      if (!/redmi|xiaomi|iphone/i.test(title)) {
        continue;
      }

      // Skip sponsored results
      const sponsored = card.locator(
        '[aria-label="Sponsored"], ' +
        '[aria-label^="Sponsored"], ' +
        '.puis-sponsored-label-text'
      );

      if (await sponsored.count()) {
        console.log('Skipping sponsored:', title);
        continue;
      }

      // Find the product link
      const link = card
        .locator(
          'h2 a[href], a.a-link-normal[href*="/dp/"]'
        )
        .first();

      if (!(await link.count())) {
        console.log('Product link missing:', title);
        continue;
      }

      const href = await link.getAttribute('href');

      if (!href) continue;

      console.log('Selected first product:', title);
      console.log('ASIN:', asin);

      // Open product details page
      await this.page.goto(
        new URL(href, this.page.url()).toString(),
        { waitUntil: 'domcontentloaded' }
      );

      return { title, asin };
    }

    throw new Error(
      'No eligible non-sponsored Redmi or iPhone mobile found.'
    );
  }
}
