export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  compatibleModels: CompatibleModels[];
}

export enum ProductCategory {
  ELECTRONICS = 'Electrónica',
  MOTOR = 'Motor',
  ACCESSORIES = 'Accesorios',
}

export enum CompatibleModels {
  GOLF_1 = 'Golf I',
  GOLF_2 = 'Golf II',
  GOLF_3 = 'Golf III',
  GOLF_4 = 'Golf IV',
  GOLF_5 = 'Golf V',
  GOLF_6 = 'Golf VI',
  GOLF_7 = 'Golf VII',
  GOLF_8 = 'Golf VIII',
  PASSAT_B5 = 'Passat B5',
  PASSAT_B6 = 'Passat B6',
  PASSAT_B7 = 'Passat B7',
  PASSAT_B8 = 'Passat B8',
  TIGUAN_1 = 'Tiguan I',
  TIGUAN_2 = 'Tiguan II',
  CADDY_4 = 'Caddy 4',
  CADDY_5 = 'Caddy 5',
}
