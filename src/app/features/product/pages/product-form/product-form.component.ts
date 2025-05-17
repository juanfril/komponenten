import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompatibleModels, Product, ProductCategory } from '@app/models/product';
import { ProductService } from '@app/services/product.service';

@Component({
  selector: 'app-product-form',
  imports: [RouterModule, ReactiveFormsModule],
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
    } else {
      this.productService.createProduct(formValue as Product);
    }

    this.router.navigate(['/products']);
  }
}
