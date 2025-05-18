import { Component, OnInit, Signal, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertComponent } from '@app/shared/components/alert/alert.component';
import { Product } from '@app/models/product';
import { ProductService } from '@app/services/product.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  imports: [RouterModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  searchControl = new FormControl('');
  sortField = signal<keyof Product>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  searchTerm = signal('');

  serviceStatus = computed(() => this.productService.status());

  products: Signal<Product[]> = computed(() => {
    return this.filterAndSortProducts(
      this.productService.getFormattedProducts(),
      this.searchTerm(),
      this.sortField(),
      this.sortDirection(),
    );
  });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.searchTerm.set(value || '');
      });

    this.productService.getProducts();
  }

  private filterAndSortProducts(
    products: Product[],
    searchTerm: string,
    sortField: keyof Product,
    sortDirection: 'asc' | 'desc',
  ): Product[] {
    const filtered = searchTerm
      ? products.filter(
          product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toString().includes(searchTerm) ||
            product.price.toString().includes(searchTerm) ||
            product.stock.toString().includes(searchTerm),
        )
      : products;

    return [...filtered].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (valueA === valueB) return 0;

      const comparison = valueA < valueB ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  sortBy(field: keyof Product): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
    }
  }

  clearError(): void {
    this.productService.clearError();
  }

  retryConnection(): void {
    this.productService.getProducts();
  }
}
