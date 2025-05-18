import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { productAdapter } from '@app/adapters/product.adapter';
import { Product } from '@app/models/product';
import { catchError, finalize, map, Observable, of } from 'rxjs';

export interface ServiceStatus {
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';
  private http = inject(HttpClient);

  private products = signal<Map<string, Product>>(new Map());
  private selectedProduct = signal<Product | undefined>(undefined);

  // Estado del servicio con signals
  private _status = signal<ServiceStatus>({ loading: false, error: null });
  status = computed(() => this._status());

  getFormattedProducts(): Product[] {
    return Array.from(this.products().values());
  }

  getProducts(): void {
    this._status.set({ loading: true, error: null });

    this.http
      .get<Product[]>(this.apiUrl)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this._status.set({ loading: false, error: errorMessage });
          console.error('Error fetching products:', error);
          return of([]);
        }),
        finalize(() => {
          if (!this._status().error) {
            this._status.update(current => ({ ...current, loading: false }));
          }
        }),
      )
      .subscribe(products => {
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

    this._status.set({ loading: true, error: null });

    this.http
      .get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        map(product => productAdapter(product)),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this._status.set({ loading: false, error: errorMessage });
          console.error(`Error fetching product with id ${id}:`, error);
          return of(undefined);
        }),
        finalize(() => {
          if (!this._status().error) {
            this._status.update(current => ({ ...current, loading: false }));
          }
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
    this._status.set({ loading: true, error: null });

    this.http
      .post<Product>(this.apiUrl, product)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this._status.set({ loading: false, error: errorMessage });
          console.error('Error creating product:', error);
          return of(null);
        }),
        finalize(() => {
          if (!this._status().error) {
            this._status.update(current => ({ ...current, loading: false }));
          }
        }),
      )
      .subscribe(newProduct => {
        if (newProduct) {
          const updatedProducts = new Map(this.products());
          updatedProducts.set(newProduct.id, productAdapter(newProduct));
          this.products.set(updatedProducts);
        }
      });
  }

  updateProduct(product: Product): void {
    this._status.set({ loading: true, error: null });

    this.http
      .put<Product>(`${this.apiUrl}/${product.id}`, product)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this._status.set({ loading: false, error: errorMessage });
          console.error(`Error updating product with id ${product.id}:`, error);
          return of(null);
        }),
        finalize(() => {
          if (!this._status().error) {
            this._status.update(current => ({ ...current, loading: false }));
          }
        }),
      )
      .subscribe(updatedProduct => {
        if (updatedProduct) {
          const updatedProducts = new Map(this.products());
          updatedProducts.set(updatedProduct.id, productAdapter(updatedProduct));
          this.products.set(updatedProducts);
        }
      });
  }

  deleteProduct(id: string): void {
    this._status.set({ loading: true, error: null });

    this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error);
          this._status.set({ loading: false, error: errorMessage });
          console.error(`Error deleting product with id ${id}:`, error);
          return of(undefined);
        }),
        finalize(() => {
          if (!this._status().error) {
            this._status.update(current => ({ ...current, loading: false }));
          }
        }),
      )
      .subscribe(() => {
        const updatedProducts = new Map(this.products());
        updatedProducts.delete(id);
        this.products.set(updatedProducts);

        if (this.selectedProduct()?.id === id) {
          this.selectedProduct.set(undefined);
        }
      });
  }

  // Helper para generar mensajes de error significativos
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      // Error de conexión, el servidor no está respondiendo
      return 'No se pudo conectar al servidor. Verifique que el servidor API esté ejecutándose (pnpm run api).';
    }

    switch (error.status) {
      case 400:
        return 'Solicitud incorrecta. Por favor revise los datos enviados.';
      case 404:
        return 'El producto solicitado no existe.';
      case 500:
        return 'Error en el servidor. Por favor intente más tarde.';
      default:
        return error.message || 'Error desconocido al procesar la solicitud.';
    }
  }

  // Método para limpiar errores manualmente
  clearError(): void {
    this._status.update(current => ({ ...current, error: null }));
  }
}
