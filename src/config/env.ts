import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.SERVER_PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  secretKey: process.env.SECRET_KEY!,
};