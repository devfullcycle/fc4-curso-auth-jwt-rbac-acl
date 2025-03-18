import { Repository } from "typeorm";
import { Teacher } from "../entities/Teacher";
import { Roles, User } from "../entities/User";
import { createDatabaseConnection } from "../database";

export class TeacherService {
  constructor(
    private teacherRepository: Repository<Teacher>,
    private userRepository: Repository<User>
  ) {}

  async create(data: {
    user: { name: string; email: string; password: string };
    department: string;
    registration: string;
  }): Promise<Teacher> {
    const teacherFound = await this.teacherRepository.findOne({
      where: { user: { email: data.user.email } },
    });

    if (teacherFound) {
      throw new Error("Professor já cadastrado");
    }

    const userFound = await this.userRepository.findOne({
      where: { email: data.user.email },
    });

    // Create user first
    const user = userFound
      ? userFound
      : this.userRepository.create({ ...data.user, roles: [] });
    if (!user.roles.includes(Roles.Teacher)) {
      user.roles.push(Roles.Teacher);
    }
    await this.userRepository.save(user);

    // Create teacher with user reference
    const teacher = this.teacherRepository.create({
      user,
      department: data.department,
      registration: data.registration,
    });

    return this.teacherRepository.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return this.teacherRepository.find({
      relations: ["user", "courses"],
    });
  }

  async findById(id: number): Promise<Teacher | null> {
    return this.teacherRepository.findOne({
      where: { id },
      relations: ["user", "courses"],
    });
  }

  async update(
    id: number,
    data: {
      department?: string;
      registration?: string;
    }
  ): Promise<Teacher | null> {
    await this.teacherRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.teacherRepository.delete(id);
  }
}

export async function createTeacherService(): Promise<TeacherService> {
  const { teacherRepository, userRepository } =
    await createDatabaseConnection();
  return new TeacherService(teacherRepository, userRepository);
}
