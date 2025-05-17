import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CompatibleModels, ProductCategory } from '@app/models/product';
import { ProductBuilder } from '@app/models/__mocks__/createProductBuilder';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  const mockProducts = [
    new ProductBuilder()
      .withId('1')
      .withName('Product 1')
      .withPrice(100)
      .withCategory(ProductCategory.ELECTRONICS)
      .withCompatibleModels([CompatibleModels.GOLF_1, CompatibleModels.GOLF_2])
      .build(),
    new ProductBuilder()
      .withId('2')
      .withName('Product 2')
      .withPrice(200)
      .withCategory(ProductCategory.MOTOR)
      .withCompatibleModels([CompatibleModels.PASSAT_B5])
      .build(),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch()), provideHttpClientTesting(), ProductService],
    });
    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('Return a list of products when it calls getProducts', () => {
    service.getProducts();

    const req = httpTesting.expectOne('http://localhost:3000/products');

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe('http://localhost:3000/products');
    expect(req.request.body).toBe(null);

    req.flush(mockProducts);
    expect(service.getFormattedProducts()).toEqual(mockProducts);
  });

  it('Create a new product', () => {
    service.getProducts();
    const getReq = httpTesting.expectOne('http://localhost:3000/products');
    getReq.flush(mockProducts);

    const newProduct = new ProductBuilder()
      .withId('3')
      .withName('New Product')
      .withPrice(300)
      .withCategory(ProductCategory.ACCESSORIES)
      .withStock(15)
      .withDescription('Nuevo producto')
      .withCompatibleModels([CompatibleModels.GOLF_8])
      .build();

    service.createProduct(newProduct);

    const postReq = httpTesting.expectOne('http://localhost:3000/products');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual(newProduct);
    postReq.flush(newProduct);

    const products = service.getFormattedProducts();
    expect(products.length).toBe(3);
    expect(products).toContainEqual(newProduct);
  });

  it('should handle empty response when getting products', () => {
    service.getProducts();

    const req = httpTesting.expectOne('http://localhost:3000/products');
    req.flush([]);

    expect(service.getFormattedProducts()).toEqual([]);
  });

  it('Delete a product', fakeAsync(() => {
    service.getProducts();
    const getReq = httpTesting.expectOne('http://localhost:3000/products');
    getReq.flush(mockProducts);

    service.getProductById('1');
    expect(service.getCurrentProduct()).toEqual(mockProducts[0]);

    service.deleteProduct('1');

    const deleteReq = httpTesting.expectOne('http://localhost:3000/products/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    tick();

    const products = service.getFormattedProducts();
    expect(products.length).toBe(1);
    expect(products[0].id).toBe('2');

    expect(service.getCurrentProduct()).toBeUndefined();

    const deletedProduct = service.getProductById('1');
    expect(deletedProduct).toBeUndefined();

    const getDeletedReq = httpTesting.expectOne('http://localhost:3000/products/1');
    expect(getDeletedReq.request.method).toBe('GET');
    getDeletedReq.error(new ErrorEvent('Not Found'));

    tick();

    expect(service.getCurrentProduct()).toBeUndefined();
  }));

  it('Return an empty list of products when there is an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    service.getProducts();

    const req = httpTesting.expectOne('http://localhost:3000/products');
    req.error(new ErrorEvent('Network error'));

    expect(service.getFormattedProducts()).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('Update an existing product', () => {
    service.getProducts();
    const getReq = httpTesting.expectOne('http://localhost:3000/products');
    getReq.flush(mockProducts);

    const updatedProduct = {
      ...mockProducts[0],
      name: 'Updated Product',
      price: 150,
    };

    service.updateProduct(updatedProduct);

    const putReq = httpTesting.expectOne(`http://localhost:3000/products/${updatedProduct.id}`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual(updatedProduct);
    putReq.flush(updatedProduct);

    service.getProductById(updatedProduct.id);
    expect(service.getCurrentProduct()).toEqual(updatedProduct);
  });

  describe('getProductById', () => {
    it('Return product from cache if available', () => {
      service.getProducts();
      const req = httpTesting.expectOne('http://localhost:3000/products');
      req.flush(mockProducts);

      const product = service.getProductById('1');

      expect(product).toEqual(mockProducts[0]);
      httpTesting.expectNone('http://localhost:3000/products/1');

      expect(service.getCurrentProduct()).toEqual(mockProducts[0]);
    });

    it('Fetch product from API if not in cache', () => {
      const apiProduct = new ProductBuilder()
        .withId('3')
        .withName('Product 3')
        .withPrice(300)
        .withCategory(ProductCategory.MOTOR)
        .withCompatibleModels([CompatibleModels.PASSAT_B5])
        .build();

      const initialProduct = service.getProductById('3');
      expect(initialProduct).toBeUndefined();
      expect(service.getCurrentProduct()).toBeUndefined();

      const req = httpTesting.expectOne('http://localhost:3000/products/3');
      expect(req.request.method).toBe('GET');
      req.flush(apiProduct);

      expect(service.getCurrentProduct()).toEqual(apiProduct);

      expect(service.getFormattedProducts()).toContainEqual(apiProduct);
    });

    it('Handle product not found error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const product = service.getProductById('999');
      expect(product).toBeUndefined();

      const req = httpTesting.expectOne('http://localhost:3000/products/999');
      req.error(new ErrorEvent('Not Found', { message: 'Product not found' }));

      expect(service.getCurrentProduct()).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
