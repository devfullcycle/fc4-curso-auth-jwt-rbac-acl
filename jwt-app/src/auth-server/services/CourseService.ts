import { Repository } from "typeorm";
import { Course } from "../entities/Course";
import { Teacher } from "../entities/Teacher";
import { createDatabaseConnection } from "../database";
import { NotFoundError } from "../errors";

export class CourseService {
  constructor(
    private courseRepository: Repository<Course>,
    private teacherRepository: Repository<Teacher>
  ) {}

  async create(data: {
    name: string;
    code: string;
    description: string;
    credits: number;
    semester: string;
    teacherId: number;
  }): Promise<Course> {
    const teacher = await this.teacherRepository.findOneBy({
      id: data.teacherId,
    });
    if (!teacher) {
      throw new NotFoundError({ message: "Teacher not found" });
    }

    const course = this.courseRepository.create({
      name: data.name,
      code: data.code,
      description: data.description,
      credits: data.credits,
      semester: data.semester,
      teacher,
    });

    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ["teacher", "enrollments"],
    });
  }

  async findById(id: number): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { id },
    });
  }

  async findByTeacher(teacherId: number): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ["teacher", "enrollments"],
    });
  }

  async findByStudent(studentId: number): Promise<Course[]> {
    return this.courseRepository.find({
      where: { enrollments: { student: { id: studentId } } },
      relations: ["teacher", "enrollments"],
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      credits?: number;
      semester?: string;
      teacherId?: number;
    }
  ): Promise<Course | null> {
    const course = await this.findById(id);
    if (!course) {
      throw new NotFoundError({ message: "Course not found" });
    }

    if (data.teacherId) {
      const teacher = await this.teacherRepository.findOneBy({
        id: data.teacherId,
      });
      if (!teacher) {
        throw new Error("Teacher not found");
      }
      course.teacher = teacher;
    }

    Object.assign(course, {
      name: data.name ?? course.name,
      code: data.code ?? course.code,
      description: data.description ?? course.description,
      credits: data.credits ?? course.credits,
      semester: data.semester ?? course.semester,
    });

    return this.courseRepository.save(course);
  }

  async delete(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}

export async function createCourseService(): Promise<CourseService> {
  const { courseRepository, teacherRepository } =
    await createDatabaseConnection();
  return new CourseService(courseRepository, teacherRepository);
}
