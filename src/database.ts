import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { Product } from "./entities/Product";

export let dataSource: DataSource | null = null;

export async function createDatabaseConnection() {
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [User, Cart, CartProduct, Product],
      synchronize: true,
    });
    await dataSource.initialize();
  }

  return {
    userRepository: dataSource.getRepository(User),
    cartRepository: dataSource.getRepository(Cart),
    productRepository: dataSource.getRepository(Product),
    cartProductRepository: dataSource.getRepository(CartProduct),
  };
}

export async function closeDatabaseConnection() {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}
