import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-in-production');

export class AuthService {
  /**
   * Validates user credentials and generates a JWT session.
   */
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return this.generateSession(user.id, user.role);
  }

  /**
   * Generates a sign token using Jose
   */
  static async generateSession(userId: number, role: string) {
    const token = await new SignJWT({ userId, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Adjust expiry as needed
      .sign(JWT_SECRET);

    return { token, userId, role };
  }

  static async verifySession(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Example: Google SSO Integration point
   */
  static async googleSSOLogin(googleProfileId: string, email: string, name: string) {
    // Upsert user based on email or googleId
    // Generates a session
  }
}
