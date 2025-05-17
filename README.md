# Komponenten - Angular 19 Technical Test

A product management application built with Angular 19, featuring a responsive UI with Tailwind CSS and following clean architecture principles.

**Author:** Juan Frias

## Project Overview

This application allows users to manage products through a clean and intuitive interface. It provides the following features:

- List products in a responsive data table
- Sort products by any field using Angular 19 signals
- Search products across all fields with reactive filtering
- View detailed information about a product
- Create new products with categorization and model compatibility
- Edit existing products
- Delete products

## Technical Stack

- **Framework**: Angular 19
- **Package Manager**: Bun
- **CSS Framework**: Tailwind CSS 4
- **State Management**: Angular Signals
- **HTTP Client**: Angular's built-in HttpClient with fetch
- **Mock API**: JSON Server
- **Change Detection**: Zoneless (experimental)

## Modern Angular 19 Features

This project showcases several modern Angular 19 features:

1. **New Control Flow Syntax**: Using `@if`, `@for`, and `@empty` instead of traditional structural directives
2. **Signals API**: Reactive state management with signals
3. **Zoneless Change Detection**: Experimental zoneless change detection for better performance
4. **Standalone Components**: All components are standalone
5. **Typed Forms**: Fully typed reactive forms

## Clean Architecture

The project follows clean architecture principles with a clear separation of concerns:

1. **Models**: Data structures representing the core business entities
2. **Services**: Business logic and data access layer
3. **Adapters**: Transform data between different layers
4. **Components**: UI layer organized by features

## Project Structure

```
src/
├── app/
│   ├── adapters/            # Data transformation adapters
│   ├── features/            # Feature modules
│   │   └── product/         # Product feature
│   │       ├── components/  # Reusable product components
│   │       └── pages/       # Product pages (list, detail, form)
│   ├── models/              # Data models
│   ├── services/            # Services for business logic
│   └── shared/              # Shared components, directives, and pipes
└── mock-api/               # Mock API data
```

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun run start
   ```
4. Start the mock API server:
   ```
   bun run api
   ```
5. Open your browser and navigate to `http://localhost:4200`

## Development Decisions

### State Management with Angular Signals

I chose to use Angular Signals for state management because:

1. It's the latest recommended approach in Angular 19
2. It provides a reactive way to manage state without external libraries
3. It integrates well with Angular's change detection
4. It enables efficient updates with fine-grained reactivity

### Modern Control Flow

The application uses Angular 19's new control flow syntax:

```html
@if (product) {
  <!-- content -->
} @else {
  <!-- alternative content -->
}

@for (item of items(); track item.id) {
  <!-- content -->
} @empty {
  <!-- empty state -->
}
```

This provides a more readable and maintainable alternative to traditional structural directives.

### Responsive Design Approach

The application is fully responsive, with different layouts for mobile and desktop:

- **Desktop**: Traditional table layout with sortable columns
- **Mobile**: Card-based layout optimized for touch interaction

### Form Validation

Form validation is implemented using Angular's reactive forms with:

- Required field validation
- Minimum length validation for text fields
- Minimum value validation for numeric fields
- Visual feedback for invalid fields
- Dropdown selectors for enum values

## AI Tool Usage

During the development of this project, I used the following AI tools:

- **Claude 3.7 Sonnet**: Used for generating initial component structure, helping with Tailwind CSS classes, and providing guidance on implementing Angular Signals.

The AI suggestions were integrated with my own input by:

1. Reviewing and adjusting the generated code to match the project requirements
2. Ensuring proper implementation of clean architecture principles
3. Customizing the UI to create a better user experience
4. Fixing any issues or bugs in the generated code

## Future Improvements

- Add unit and integration tests
- Implement authentication and authorization
- Add pagination for the product list
- Create a more sophisticated filtering system
- Implement caching for better performance

## Technical Decisions

### Application Configuration

- **Zoneless Change Detection**: Implemented experimental zoneless change detection for better performance
- **Component Input Binding**: Used for simplified route parameter handling
- **Native Fetch API**: Leveraged for HTTP requests through Angular's HttpClient

### Architecture Patterns

- **Stream Architecture**: Each component handles its own error states
- **Single Source of Truth**: All product data is managed from a central service using signals

For more detailed technical decisions, please see the [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) file.
