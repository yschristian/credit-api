import { UsersRepository } from "./users.repository";
import { CreateUserInput, UpdateUserInput } from "./users.dto";
import { hashPassword } from "../../utils/bcrypt.util";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async createUser(data: CreateUserInput) {
    // Check if user exists
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { users, total } = await this.repository.findAll(skip, limit);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: string, data: UpdateUserInput) {
    await this.getUserById(id); // Check if user exists
    return this.repository.update(id, data);
  }

  async deleteUser(id: string) {
    await this.getUserById(id); // Check if user exists
    return this.repository.delete(id);
  }
}