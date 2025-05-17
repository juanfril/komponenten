import { CompatibleModels, Product, ProductCategory } from '@app/models/product';

export const productAdapter = (product: any): Product => {
  let category = product.category;
  if (!Object.values(ProductCategory).includes(category)) {
    category = ProductCategory.ELECTRONICS;
  }

  const compatibleModels = Array.isArray(product.compatibleModels)
    ? product.compatibleModels.filter((model: any) =>
        Object.values(CompatibleModels).includes(model),
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
  };
};
