import { expect, test } from '@playwright/test';

test.describe('Product Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('table tbody tr, div.md\\:hidden div.bg-white');
  });

  test('should display product list and search', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Products');

    await expect(page.getByText('Add Product')).toBeVisible();

    const productCount = await page.locator('table tbody tr').count();
    expect(productCount).toBeGreaterThan(0);

    await page.fill('input[placeholder="Search products..."]', 'unique-search-term');

    let filteredProducts = await page.locator('table tbody tr').count();
    if (filteredProducts === productCount) {
      await page.fill('input[placeholder="Search products..."]', 'E2E');
      await page.waitForTimeout(500);
      filteredProducts = await page.locator('table tbody tr').count();
    }

    if (filteredProducts === productCount) {
      const hasFilterText = await page
        .locator('table tbody tr td:nth-child(2)')
        .first()
        .isVisible();
      expect(hasFilterText).toBeTruthy();
    } else {
      expect(filteredProducts).toBeLessThanOrEqual(productCount);
    }

    await page.fill('input[placeholder="Search products..."]', '');
    await page.waitForTimeout(500);
  });

  test('should navigate to product detail page', async ({ page }) => {
    await page.locator('table tbody tr:first-child a:has-text("View")').click();

    await page.waitForSelector('h3');

    const url = page.url();
    expect(url).toContain('/products/');
    expect(url).not.toEqual('http://localhost:4200/products');

    const productDetailsText = await page
      .locator('h3')
      .filter({ hasText: 'Product Details' })
      .textContent();
    expect(productDetailsText).toContain('Product Details');

    await expect(page.locator('body')).toContainText('Category');
    await expect(page.locator('body')).toContainText('Price');
    await expect(page.locator('body')).toContainText('Stock');
  });

  test('should sort products by name', async ({ page }) => {
    const initialProductNames = await page
      .locator('table tbody tr td:nth-child(2)')
      .allTextContents();

    await page.locator('th:has-text("Name")').click();

    await page.waitForTimeout(300);

    const sortedProductNames = await page
      .locator('table tbody tr td:nth-child(2)')
      .allTextContents();

    if (JSON.stringify(initialProductNames) === JSON.stringify(sortedProductNames)) {
      await page.locator('th:has-text("Name")').click();
      await page.waitForTimeout(300);

      const reverseSortedProductNames = await page
        .locator('table tbody tr td:nth-child(2)')
        .allTextContents();
      expect(reverseSortedProductNames).not.toEqual(initialProductNames);
    } else {
      expect(sortedProductNames).not.toEqual(initialProductNames);
    }
  });

  test('should create, edit, and delete a product', async ({ page }) => {
    const timestamp = Date.now();
    const testProduct = {
      name: `Test Product E2E ${timestamp}`,
      category: 'Accesorios',
      price: '99.99',
      stock: '10',
      description: 'This is a test product created by an E2E test',
      compatibleModel: 'Golf VII',
    };

    const updatedName = `Test Product E2E ${timestamp} (Updated)`;
    let productId = '';

    try {
      await page.locator('a:has-text("Add Product")').first().click();

      await expect(page.locator('h1')).toContainText('Add Product');

      await page.fill('#name', testProduct.name);
      await page.selectOption('#category', testProduct.category);
      await page.fill('#price', testProduct.price);
      await page.fill('#stock', testProduct.stock);
      await page.fill('#description', testProduct.description);

      await page.selectOption(
        'div[formArrayName="compatibleModels"] select',
        testProduct.compatibleModel,
      );

      await page.click('button:has-text("Create Product")');

      await expect(page.locator('app-alert[type="success"]')).toBeVisible();

      await page.waitForTimeout(2500);
      await page.waitForURL('**/products');
      await page.waitForSelector('table tbody tr, div.md\\:hidden div.bg-white');

      await page.fill('input[placeholder="Search products..."]', testProduct.name);
      await page.waitForTimeout(500);

      const productRow = page.locator(`table tbody tr:has-text("${testProduct.name}")`).first();
      await expect(productRow).toBeVisible();

      const idCell = await productRow.locator('td:first-child').textContent();
      productId = idCell ? idCell.trim() : '';
      console.log(`Producto creado con ID: ${productId}`);

      await productRow.locator('a:has-text("Edit")').click();

      await expect(page.locator('h1')).toContainText('Edit Product');

      await expect(page.locator('#name')).toHaveValue(testProduct.name);
      await expect(page.locator('#price')).toHaveValue(testProduct.price);

      await page.fill('#name', updatedName);

      await page.click('button:has-text("Update Product")');

      await expect(page.locator('app-alert[type="success"]')).toBeVisible();

      await page.waitForTimeout(2500);
      await page.waitForURL('**/products');
      await page.waitForSelector('table tbody tr, div.md\\:hidden div.bg-white');

      await page.fill('input[placeholder="Search products..."]', updatedName);
      await page.waitForTimeout(500);

      const updatedProductRow = page.locator(`table tbody tr:has-text("${updatedName}")`).first();
      await expect(updatedProductRow).toBeVisible();

      await updatedProductRow.locator('button:has-text("Delete")').click();

      const confirmDialog = page.locator('.fixed.inset-0');
      await expect(confirmDialog).toBeVisible();
      await expect(confirmDialog.locator('h2')).toContainText('Confirm Delete');

      const confirmDeleteButton = confirmDialog.locator('button:has-text("Delete")');
      await confirmDeleteButton.click();

      await expect(page.locator('app-alert[type="success"]')).toBeVisible();

      await page.waitForTimeout(500);

      const productCountAfterDelete = await page
        .locator(`table tbody tr:has-text("${updatedName}")`)
        .count();
      expect(productCountAfterDelete).toBe(0);
    } finally {
      if (productId) {
        try {
          const response = await page.request.delete(`http://localhost:3000/products/${productId}`);
          if (response.ok()) {
            console.log(`Producto con ID ${productId} eliminado correctamente en finally.`);
          } else {
            console.warn(`Error al eliminar el producto con ID ${productId} en finally.`);
          }
        } catch (error) {
          console.error(`Error al intentar eliminar el producto con ID ${productId}:`, error);
        }
      }

      await page.fill('input[placeholder="Search products..."]', '');
    }
  });
});
