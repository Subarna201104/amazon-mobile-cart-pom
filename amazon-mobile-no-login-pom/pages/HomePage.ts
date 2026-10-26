import { Page, expect } from '@playwright/test';
export class HomePage {
  constructor(private page: Page) {}
  async searchForMobiles() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const box = this.page.locator('#twotabsearchtextbox');
    await expect(box).toBeVisible();
    await box.fill('mobile phones');
    await this.page.locator('#nav-search-submit-button').click();
    await expect(this.page.locator('[data-component-type="s-search-result"]').first()).toBeVisible();
  }
}
