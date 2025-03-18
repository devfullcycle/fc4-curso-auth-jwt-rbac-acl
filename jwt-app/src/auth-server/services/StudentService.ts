import { Repository } from "typeorm";
import { Student } from "../entities/Student";
import { Roles, User } from "../entities/User";
import { createDatabaseConnection } from "../database";

export class StudentService {
    constructor(
        private studentRepository: Repository<Student>,
        private userRepository: Repository<User>
    ) {}

    async create(data: { 
        user: { name: string; email: string; password: string; }; 
        registration: string;
    }): Promise<Student> {
        const studentFound = await this.studentRepository.findOne({
            where: { user: { email: data.user.email } },
        });

        if (studentFound) {
            throw new Error("Estudante já cadastrado");
        }

        const userFound = await this.userRepository.findOne({
            where: { email: data.user.email },
        });

        // Create user first
        const user = userFound
            ? userFound
            : this.userRepository.create({ ...data.user, roles: [] });
        if (!user.roles.includes(Roles.Student)) {
            user.roles.push(Roles.Student);
        }
        await this.userRepository.save(user);

        // Create student with user reference
        const student = this.studentRepository.create({
            user,
            registration: data.registration,
        });

        return this.studentRepository.save(student);
    }

    async findAll(): Promise<Student[]> {
        return this.studentRepository.find({
            relations: ['user', 'enrollments']
        });
    }

    async findById(id: number): Promise<Student | null> {
        return this.studentRepository.findOne({
            where: { id },
            relations: ['user', 'enrollments']
        });
    }

    async update(id: number, data: {
        registration?: string;
    }): Promise<Student | null> {
        await this.studentRepository.update(id, data);
        return this.findById(id);
    }

    async delete(id: number): Promise<void> {
        await this.studentRepository.delete(id);
    }
}

export async function createStudentService(): Promise<StudentService> {
    const { studentRepository, userRepository } = await createDatabaseConnection();
    return new StudentService(studentRepository, userRepository);
}