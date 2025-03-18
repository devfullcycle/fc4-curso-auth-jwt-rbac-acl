import { createDatabaseConnection } from "./database";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { Product } from "./entities/Product";
import { Roles } from "./entities/User";
import { createStudentService } from "./services/StudentService";
import { createTeacherService } from "./services/TeacherService";
import { createUserService } from "./services/UserService";

export async function loadFixtures() {
  const { productRepository, cartRepository, cartProductRepository } =
    await createDatabaseConnection();
  const userService = await createUserService();

  const user = await userService.create({
    name: "Admin User",
    email: "admin@user.com",
    password: "admin",
    roles: [Roles.Admin]
  });

  const teacherService = await createTeacherService();

  await teacherService.create({
    user: {
      name: "Teacher User1",
      email: "teacher1@user.com",
      password: "teacher1",
    },
    department: "Computer Science",
    registration: "123456",
  });
  await teacherService.create({
    user: {
      name: "Teacher User2",
      email: "teacher2@user.com",
      password: "teacher2",
    },
    department: "Mathematics",
    registration: "654321",
  });
  
  const studentService = await createStudentService();
  
  await studentService.create({
    user: {
      name: "Student User1",
      email: "student1@user.com",
      password: "student1",
    },
    registration: "789012",
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
