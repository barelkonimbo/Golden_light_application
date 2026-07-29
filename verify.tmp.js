const { chromium } = require("playwright");
const fs = require("fs");

async function main() {
  fs.mkdirSync("verify-shots", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1300 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // item 6: filter/sort bar present between search and table
  const filterBarSelects = await page.locator('main').first().locator('button[role="combobox"]').count();
  console.log("FILTER/SORT SELECTS ON LIST PAGE (expect 3):", filterBarSelects);
  await page.screenshot({ path: "verify-shots/list-with-filters.png", fullPage: true });

  // sort by price ascending
  const sortSelect = page.locator('button[role="combobox"]').last();
  await sortSelect.click();
  await page.waitForTimeout(150);
  await page.click('div[role="option"]:has-text("מחיר (מהנמוך לגבוה)")');
  await page.waitForTimeout(150);
  const firstRowName = await page.locator("tbody tr").first().locator("button").first().innerText();
  console.log("FIRST ROW AFTER SORT BY PRICE ASC:", firstRowName);

  // filter by category
  const categorySelect = page.locator('button[role="combobox"]').first();
  await categorySelect.click();
  await page.waitForTimeout(150);
  await page.click('div[role="option"]:has-text("תאורת חוץ")');
  await page.waitForTimeout(150);
  const rowsAfterCategoryFilter = await page.locator("tbody tr").count();
  console.log("ROWS AFTER FILTER BY 'תאורת חוץ':", rowsAfterCategoryFilter);

  // item 2: thumbnail column present (placeholder icon since no image set)
  const thumbCells = await page.locator("tbody tr td svg").count();
  console.log("THUMBNAIL PLACEHOLDER ICONS IN ROWS:", thumbCells);

  // reset filters, open edit for prod-2 (variant product) to test images/inventory fields
  await page.reload({ waitUntil: "networkidle" });
  await page.click('button:has-text("אנדזו")');
  await page.waitForSelector("text=עדכון מוצר");

  // father image via URL
  const urlInput = page.locator('input[placeholder*="הדבקת כתובת"]').first();
  await urlInput.fill("https://picsum.photos/200");
  await page.waitForTimeout(150);
  await page.screenshot({ path: "verify-shots/edit-product-image.png", fullPage: true });

  // inventory tab: package amount + warehouse (product-level for variant type)
  await page.click('button[role="tab"]:has-text("מלאי")');
  await page.waitForTimeout(150);
  await page.screenshot({ path: "verify-shots/variant-inventory-tab.png", fullPage: true });
  const packageAmountVisible = await page.locator("text=כמות באריזה").count();
  const warehouseVisible = await page.locator("text=בחירת מחסן").count();
  console.log("VARIANT INVENTORY: package amount label count, warehouse label count:", packageAmountVisible, warehouseVisible);

  // variants tab: expand first row, check managed inventory / backorder checkboxes + variant image
  await page.click('button[role="tab"]:has-text("וריאציות")');
  await page.waitForTimeout(150);
  await page.click('button[aria-label="הרחבת וריאציה"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: "verify-shots/variant-row-inventory-fields.png", fullPage: true });
  const managedInventoryLabel = await page.locator("text=ניהול מלאי").count();
  const backorderLabel = await page.locator("text=אפשר הזמנה מראש כשאין מלאי").count();
  console.log("VARIANT ROW: managed-inventory count, backorder count:", managedInventoryLabel, backorderLabel);

  // organization tab: type single-select, tags multi-select
  await page.click('button[role="tab"]:has-text("ארגון")');
  await page.waitForTimeout(150);
  await page.screenshot({ path: "verify-shots/organization-tab-final.png", fullPage: true });

  console.log("CONSOLE/PAGE ERRORS:", JSON.stringify(errors));
  await browser.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
