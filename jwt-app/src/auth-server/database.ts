import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Cart } from "./entities/Cart";
import { CartProduct } from "./entities/CartProduct";
import { Product } from "./entities/Product";
import { Teacher } from "./entities/Teacher";
import { Student } from "./entities/Student";
import { Course } from "./entities/Course";
import { StudentCourse } from "./entities/StudentCourse";
import { CourseRepository } from "./entities/CourseRepository";

export let dataSource: DataSource | null = null;

export async function createDatabaseConnection() {
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [
        User,
        Product,
        Cart,
        CartProduct,
        Teacher,
        Student,
        Course,
        StudentCourse,
      ],
      synchronize: true,
      //logging: true
    });
    await dataSource.initialize();
  }

  return {
    userRepository: dataSource.getRepository(User),
    cartRepository: dataSource.getRepository(Cart),
    productRepository: dataSource.getRepository(Product),
    cartProductRepository: dataSource.getRepository(CartProduct),
    teacherRepository: dataSource.getRepository(Teacher),
    studentRepository: dataSource.getRepository(Student),
    courseRepository: new CourseRepository(Course, dataSource.createEntityManager()),
    studentCourseRepository: dataSource.getRepository(StudentCourse),
  };
}

export async function closeDatabaseConnection() {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}
