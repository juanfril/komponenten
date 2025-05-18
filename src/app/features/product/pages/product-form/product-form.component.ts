import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompatibleModels, Product, ProductCategory } from '@app/models/product';
import { ProductService } from '@app/services/product.service';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

@Component({
  selector: 'app-product-form',
  imports: [RouterModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  productForm!: FormGroup;
  isEditMode = false;
  productId?: string;

  successMessage = signal<string | null>(null);
  serviceStatus = this.productService.status;

  productCategories = Object.values(ProductCategory);
  compatibleModelOptions = Object.values(CompatibleModels);

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.loadProduct(this.productId);
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: [ProductCategory.ELECTRONICS, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      compatibleModels: this.fb.array([]),
    });

    this.addCompatibleModel();
  }

  private async loadProduct(id: string): Promise<void> {
    const product = this.productService.getProductById(id);
    if (!product) {
      this.router.navigate(['/products']);
      return;
    }

    this.compatibleModels.clear();

    if (product.compatibleModels && product.compatibleModels.length > 0) {
      product.compatibleModels.forEach(model => {
        this.compatibleModels.push(this.fb.control(model));
      });
    } else {
      this.addCompatibleModel();
    }

    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
    });
  }

  get compatibleModels(): FormArray {
    return this.productForm.get('compatibleModels') as FormArray;
  }

  addCompatibleModel(): void {
    this.compatibleModels.push(this.fb.control(''));
  }

  removeCompatibleModel(index: number): void {
    this.compatibleModels.removeAt(index);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    formValue.compatibleModels = formValue.compatibleModels.filter(
      (model: string) => model.trim() !== '',
    );

    if (this.isEditMode && this.productId) {
      const updatedProduct: Product = {
        ...formValue,
        id: this.productId,
      };
      this.productService.updateProduct(updatedProduct);
      this.successMessage.set(`Product "${updatedProduct.name}" updated successfully`);
    } else {
      this.productService.createProduct(formValue as Product);
      this.successMessage.set(`Product "${formValue.name}" created successfully`);
    }

    // Redirigir después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/products']);
    }, 2000);
  }

  clearSuccess(): void {
    this.successMessage.set(null);
  }

  clearError(): void {
    this.productService.clearError();
  }
}
