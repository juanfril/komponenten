import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '@app/models/product';
import { ProductService } from '@app/services/product.service';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, AlertComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  confirmDeleteMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  serviceStatus = this.productService.status;

  get product(): Product | undefined {
    return this.productService.getCurrentProduct();
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.router.navigate(['/products']);
      return;
    }

    const productFromCache = this.productService.getProductById(productId);
  }

  deleteProduct(): void {
    if (this.product) {
      this.confirmDeleteMessage.set(
        `Are you sure you want to delete product "${this.product.name}"?`,
      );
    }
  }

  confirmDelete(): void {
    if (this.product) {
      const productName = this.product.name;
      this.productService.deleteProduct(this.product.id);
      this.confirmDeleteMessage.set(null);
      this.successMessage.set(`Product "${productName}" deleted successfully`);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/products']);
      }, 2000);
    }
  }

  cancelDelete(): void {
    this.confirmDeleteMessage.set(null);
  }

  clearSuccess(): void {
    this.successMessage.set(null);
  }

  clearError(): void {
    this.productService.clearError();
  }
}
