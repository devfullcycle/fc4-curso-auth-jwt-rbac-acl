import { Repository } from "typeorm";
import { User } from "../entities/User";
import { createDatabaseConnection } from "../database";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
    }
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.password) user.password = data.password;

    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

export async function createUserService(): Promise<UserService> {
  const { userRepository } = await createDatabaseConnection();
  return new UserService(userRepository);
}
