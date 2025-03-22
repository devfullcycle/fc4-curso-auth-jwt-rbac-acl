import { createDatabaseConnection, dataSource } from "./database";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { Course } from "./entities/Course";
import { CourseRepository } from "./entities/CourseRepository";
import { Product } from "./entities/Product";
import { Roles } from "./entities/User";
import { defineAbilityFor } from "./permissions";
import { createCourseService } from "./services/CourseService";
import { createStudentService } from "./services/StudentService";
import { createTeacherService } from "./services/TeacherService";
import { createUserService } from "./services/UserService";

export async function loadFixtures() {
  const {
    productRepository,
    cartRepository,
    cartProductRepository,
    studentCourseRepository,
    userRepository
  } = await createDatabaseConnection();
  const userService = await createUserService();

  const user = await userService.create({
    name: "Admin User",
    email: "admin@user.com",
    password: "admin",
    roles: [Roles.Admin],
  });

  const teacherService = await createTeacherService();

  const teacher1 = await teacherService.create({
    user: {
      name: "Teacher User1",
      email: "teacher1@user.com",
      password: "teacher1",
    },
    department: "Computer Science",
    registration: "123456",
  });
  const teacher2 = await teacherService.create({
    user: {
      name: "Teacher User2",
      email: "teacher2@user.com",
      password: "teacher2",
    },
    department: "Mathematics",
    registration: "654321",
  });
  teacher2.user.permissions = [
    {
      resource: "Course",
      action: "update",
      attributes: ["description"],
      condition: { id: 1 },
    },
    {
      resource: "Course",
      action: "get",
      condition: { id: 1 },
    },
  ];
  await userRepository.save(teacher2.user);

  const studentService = await createStudentService();

  const student = await studentService.create({
    user: {
      name: "Student User1",
      email: "student1@user.com",
      password: "student1",
    },
    registration: "789012",
  });

  const courseService = await createCourseService();
  const course = await courseService.create({
    name: "Math 101",
    code: "MATH101",
    description: "Basic Math",
    credits: 3,
    semester: "Fall",
    teacherId: 1,
  });

  const studentCourse = await studentCourseRepository.create({
    student,
    course,
    enrollmentDate: new Date(),
    status: "ACTIVE",
  });
  await studentCourseRepository.save(studentCourse);

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
