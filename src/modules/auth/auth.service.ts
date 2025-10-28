import { UsersRepository } from "../users/users.repository";
import { RegisterInput, LoginInput } from "./auth.dto";
import { hashPassword, comparePassword } from "../../utils/bcrypt.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../common/exceptions";

export class AuthService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Check if user is active
    if (!user.status) {
      throw new UnauthorizedException("Account is suspended");
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded:any = verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.usersRepository.findById(decoded.id);
      if (!user || !user.status) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }
}