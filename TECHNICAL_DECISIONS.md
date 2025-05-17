# Technical Decisions

This document outlines the key technical decisions made during the development of the Komponenten application.

## Architecture

The application follows the Clean Architecture pattern, which separates the codebase into distinct layers with clear responsibilities:

1. **Domain Layer**: Contains the core business logic and entities (models)
2. **Application Layer**: Implements use cases and orchestrates the flow of data
3. **Interface Layer**: Handles UI components and user interactions
4. **Infrastructure Layer**: Manages external dependencies like HTTP requests

### Folder Structure

The application is organized by features, with shared components and services at the root level:

```
src/app/
├── adapters/            # Data transformation adapters
├── features/            # Feature modules
│   └── product/         # Product feature
│       ├── components/  # Reusable product components
│       └── pages/       # Product pages (list, detail, form)
├── models/              # Data models
├── services/            # Services for business logic
└── shared/              # Shared components, directives, and pipes
```

This structure allows for better scalability and maintainability as the application grows.

## Modern Angular 19 Features

### Control Flow Syntax

The application uses Angular 19's new control flow syntax, which replaces traditional structural directives:

```html
<!-- Old way -->
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item }}</div>

<!-- New way -->
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item }}</div>
} @empty {
  <div>No items found</div>
}
```

Benefits of the new control flow syntax:
1. More readable and maintainable code
2. Better type checking and IDE support
3. Improved performance
4. Built-in empty state handling with `@empty`
5. Simplified tracking with `track` expression

### Zoneless Change Detection

The application uses Angular 19's experimental zoneless change detection:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // other providers
  ]
};
```

Benefits of zoneless change detection:
1. Improved performance by reducing unnecessary change detection cycles
2. More predictable application behavior
3. Better integration with signals
4. Reduced bundle size by eliminating Zone.js

## State Management

### Angular Signals

The application uses Angular Signals for state management instead of traditional services with BehaviorSubjects or NgRx. Signals were chosen because:

1. They're the latest state management solution recommended by the Angular team
2. They provide a reactive way to manage state with less boilerplate
3. They integrate seamlessly with Angular's change detection
4. They're lightweight and don't require additional dependencies

Example implementation in the ProductService:

```typescript
private products = signal<Map<string, Product>>(new Map());

getFormattedProducts(): Product[] {
  return Array.from(this.products().values());
}
```

### Reactive Search and Sort

The application implements reactive search and sort functionality using signals:

```typescript
sortField = signal<keyof Product>('name');
sortDirection = signal<'asc' | 'desc'>('asc');
searchTerm = signal('');

products: Signal<Product[]> = computed(() => {
  return this.filterAndSortProducts(
    this.productService.getFormattedProducts(),
    this.searchTerm(),
    this.sortField(),
    this.sortDirection()
  );
});
```

This approach ensures that the UI updates automatically when any of these signals change.

## Domain Modeling

### Enums for Categorization

The application uses TypeScript enums for product categories and compatible models:

```typescript
export enum ProductCategory {
  ELECTRONICS = 'Electrónica',
  MOTOR = 'Motor',
  ACCESSORIES = 'Accesorios'
}

export enum CompatibleModels {
  GOLF_1 = 'Golf I',
  GOLF_2 = 'Golf II',
  // other models...
}
```

Benefits of using enums:
1. Type safety and autocompletion
2. Centralized definition of allowed values
3. Easy to extend with new values
4. Improved maintainability

### Data Adapters

The application uses adapter functions to transform data between the API and the application:

```typescript
export const productAdapter = (product: any): Product => {
  // Ensure category is a valid ProductCategory enum value
  let category = product.category;
  if (!Object.values(ProductCategory).includes(category)) {
    category = ProductCategory.ELECTRONICS; // Default value
  }

  // Ensure compatibleModels are valid CompatibleModels enum values
  const compatibleModels = Array.isArray(product.compatibleModels) 
    ? product.compatibleModels.filter((model: any) => 
        Object.values(CompatibleModels).includes(model)
      )
    : [];

  return {
    id: product.id,
    name: product.name,
    category: category,
    price: product.price,
    stock: product.stock,
    description: product.description,
    compatibleModels: compatibleModels,
  }
}
```

This ensures that the data is always in the expected format and helps prevent runtime errors.

## UI/UX Design

### Responsive Design

The application uses a responsive design approach with different layouts for different screen sizes:

1. **Desktop**: Traditional table layout with sortable columns
2. **Mobile**: Card-based layout optimized for touch interaction

This approach ensures a good user experience across all devices without compromising functionality.

### Tailwind CSS

Tailwind CSS was chosen for styling because:

1. It provides utility-first classes that make it easy to create consistent designs
2. It reduces the need for custom CSS
3. It's highly customizable and can be extended as needed
4. It has excellent documentation and community support

## Form Handling

### Reactive Forms

The application uses Angular's reactive forms for form handling because:

1. They provide more control over form validation
2. They make it easier to handle complex forms with dynamic fields
3. They integrate well with TypeScript for type safety
4. They're more testable than template-driven forms

Example implementation in the ProductFormComponent:

```typescript
this.productForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  category: [ProductCategory.ELECTRONICS, Validators.required],
  price: [0, [Validators.required, Validators.min(0)]],
  stock: [0, [Validators.required, Validators.min(0)]],
  description: ['', Validators.required],
  compatibleModels: this.fb.array([])
});
```

### Dynamic Form Arrays

The application uses FormArrays to handle dynamic lists of compatible models:

```typescript
get compatibleModels(): FormArray {
  return this.productForm.get('compatibleModels') as FormArray;
}

addCompatibleModel(): void {
  this.compatibleModels.push(this.fb.control(''));
}

removeCompatibleModel(index: number): void {
  this.compatibleModels.removeAt(index);
}
```

This allows users to add and remove compatible models dynamically.

## Performance Considerations

Several techniques are used to optimize performance:

1. **OnPush Change Detection**: Used where appropriate to reduce the number of change detection cycles
2. **Lazy Loading**: Routes are configured to load components only when needed
3. **Memoization**: Computed values are cached to avoid unnecessary recalculations
4. **Optimized Rendering**: Using the `track` expression in `@for` blocks to improve rendering performance
5. **Zoneless Change Detection**: Experimental feature to improve performance

## Future Improvements

1. **Pagination**: Implement pagination for the product list to handle large datasets
2. **Caching**: Add a caching layer to reduce API calls
3. **Advanced Filtering**: Implement more sophisticated filtering options
4. **Authentication**: Add user authentication and authorization
5. **Offline Support**: Implement offline support using IndexedDB or similar technologies 
