import { createDatabaseConnection } from "./database";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { Product } from "./entities/Product";
import { createUserService } from "./services/UserService";

export async function loadFixtures() {
  const { productRepository, cartRepository, cartProductRepository } =
    await createDatabaseConnection();
  const userService = await createUserService();

  const user = await userService.create({
    name: "Admin User",
    email: "admin@user.com",
    password: "admin",
  });

  const product = new Product();
  product.name = "Sample Product";
  product.price = 100.0;
  await productRepository.save(product);

  const cart = new Cart();
  cart.userId = user.id;
  cart.totalPrice = 100.0;
  cart.totalQuantity = 1;
  await cartRepository.save(cart);

  const cartProduct = new CartProduct();
  cartProduct.cart = cart;
  cartProduct.product = product;
  cartProduct.quantity = 1;
  await cartProductRepository.save(cartProduct);
}
