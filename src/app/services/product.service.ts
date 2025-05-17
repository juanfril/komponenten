import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { productAdapter } from '@app/adapters/product.adapter';
import { Product } from '@app/models/product';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';
  private http = inject(HttpClient);

  private products = signal<Map<string, Product>>(new Map());
  private selectedProduct = signal<Product | undefined>(undefined);

  getFormattedProducts(): Product[] {
    return Array.from(this.products().values());
  }

  getProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe(products => {
      const productMap = new Map<string, Product>();
      products.forEach(product => {
        productMap.set(product.id, productAdapter(product));
      });
      this.products.set(productMap);
    });
  }

  getProductById(id: string): Product | undefined {
    const cachedProduct = this.products().get(id);

    if (cachedProduct) {
      this.selectedProduct.set(cachedProduct);
      return cachedProduct;
    }

    this.http
      .get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        map(product => productAdapter(product)),
        catchError(error => {
          console.error(`Error fetching product with id ${id}:`, error);
          return of(undefined);
        }),
      )
      .subscribe(product => {
        if (product) {
          const updatedProducts = new Map(this.products());
          updatedProducts.set(id, product);
          this.products.set(updatedProducts);
        }

        this.selectedProduct.set(product);
      });

    return undefined;
  }

  getCurrentProduct(): Product | undefined {
    return this.selectedProduct();
  }

  createProduct(product: Product): void {
    this.http.post<Product>(this.apiUrl, product).subscribe(newProduct => {
      const updatedProducts = new Map(this.products());
      updatedProducts.set(newProduct.id, productAdapter(newProduct));
      this.products.set(updatedProducts);
    });
  }

  updateProduct(product: Product): void {
    this.http.put<Product>(`${this.apiUrl}/${product.id}`, product).subscribe(updatedProduct => {
      const updatedProducts = new Map(this.products());
      updatedProducts.set(updatedProduct.id, productAdapter(updatedProduct));
      this.products.set(updatedProducts);
    });
  }

  deleteProduct(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => {
      const updatedProducts = new Map(this.products());
      updatedProducts.delete(id);
      this.products.set(updatedProducts);

      if (this.selectedProduct()?.id === id) {
        this.selectedProduct.set(undefined);
      }
    });
  }
}
