import { Repository } from "typeorm";
import { Course } from "../entities/Course";
import { Teacher } from "../entities/Teacher";
import { createDatabaseConnection } from "../database";
import { NotFoundError, UnauthorizedError } from "../errors";
import { Ability } from "@casl/ability";
import { AppAbility } from "../permissions";
import { CourseRepository } from "../entities/CourseRepository";

export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
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

  async findById(
    id: number,
    options?: { ability?: AppAbility }
  ): Promise<Course | null> {
    const ability = options?.ability;
    if (ability && !ability.can("get", "Course")) {
      throw new UnauthorizedError();
    }

    if (!ability) {
      return this.courseRepository.findOne({
        where: { id },
      });
    }

    return this.courseRepository
      .withAbility(ability, "get")
      .andWhere("course.id = :id", { id })
      .getOne();
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
