import { CompatibleModels, Product, ProductCategory } from '@app/models/product';

export class ProductBuilder {
  private product: Product = {
    id: '1',
    name: 'Default Product',
    category: ProductCategory.ELECTRONICS,
    price: 100,
    stock: 10,
    description: 'Default description',
    compatibleModels: [],
  };

  withId(id: string): ProductBuilder {
    this.product.id = id;
    return this;
  }

  withName(name: string): ProductBuilder {
    this.product.name = name;
    return this;
  }

  withCategory(category: ProductCategory): ProductBuilder {
    this.product.category = category;
    return this;
  }

  withPrice(price: number): ProductBuilder {
    this.product.price = price;
    return this;
  }

  withStock(stock: number): ProductBuilder {
    this.product.stock = stock;
    return this;
  }

  withDescription(description: string): ProductBuilder {
    this.product.description = description;
    return this;
  }

  withCompatibleModels(models: CompatibleModels[]): ProductBuilder {
    this.product.compatibleModels = models;
    return this;
  }

  build(): Product {
    return { ...this.product };
  }

  static aDefaultProduct(): Product {
    return new ProductBuilder().build();
  }

  static aProductList(count: number): Product[] {
    return Array.from({ length: count }, (_, i) =>
      new ProductBuilder()
        .withId(`${i + 1}`)
        .withName(`Product ${i + 1}`)
        .build(),
    );
  }
}
