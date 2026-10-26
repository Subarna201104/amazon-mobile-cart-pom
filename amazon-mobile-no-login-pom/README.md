# Amazon mobile cart automation — no login step

Playwright + TypeScript + POM. Opens Amazon.in as a guest -> searches **mobile phones** -> applies brand filters **Redmi** and **Apple** (iPhone) -> opens first eligible non-sponsored phone -> adds it to cart -> opens cart -> checks that phone appears. It never checks out.

## Windows CMD instructions

Unzip the project. Open the **inner folder containing `package.json`** in File Explorer, click its address bar, enter `cmd`, press Enter. Then run:

```cmd
npm install
npm run test:headed
```

To view the test report afterward:

```cmd
npm run report
```

**No `npm run login`, no OTP, no saved cookies.** The test launches installed Chrome through Playwright (`channel: 'chrome'`).

## Practical limits

- Amazon sometimes insists on signing in when you try to add something to a cart. An unauthenticated Playwright browser has its own session and cannot reuse the account logged into your ordinary Chrome automatically. If Amazon insists on login, the test will fail rather than try to bypass it.
- Brand names in Amazon filters can change or be unavailable. Selecting two checkboxes depends on Amazon's current filter layout; the test intentionally fails if it cannot find one instead of pretending it selected both.
- Products may require variant selection or be temporarily unavailable. Such products can cause a failure, which the HTML report can help diagnose.
- This project chooses a **mobile phone**, not slippers: slippers conflict with the Redmi/Apple mobile brand-filter request.
- Screenshots and HTML reports are generated in `test-results/` and `playwright-report/`. Cart verification checks the selected item's ASIN and part of its title.
