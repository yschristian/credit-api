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
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {

    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.status) {
      throw new UnauthorizedException("Account is suspended");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }
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

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded:any = verifyRefreshToken(refreshToken);

      const user = await this.usersRepository.findById(decoded.id);
      if (!user || !user.status) {
        throw new UnauthorizedException("Invalid refresh token");
      }

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