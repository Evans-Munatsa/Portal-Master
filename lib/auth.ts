import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-super-secret-key-12345');

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const buffer = scryptSync(password, salt, 64);
  return `${buffer.toString('hex')}.${salt}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [hashedPassword, salt] = storedHash.split('.');
  if (!hashedPassword || !salt) return false;
  
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const passwordBuffer = scryptSync(password, salt, 64);
  
  try {
    return timingSafeEqual(hashedPasswordBuf, passwordBuffer);
  } catch (e) {
    return false;
  }
}

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;
  
  const realRole = (payload.role as string || '').toUpperCase();
  let role = realRole;

  if (realRole === 'SUPERADMIN') {
    const thanosRole = cookieStore.get('thanos-role')?.value;
    if (thanosRole && ['CANDIDATE', 'EMPLOYER', 'SUPERADMIN'].includes(thanosRole.toUpperCase())) {
      role = thanosRole.toUpperCase();
    }
  }
  
  return {
    userId: payload.userId as number,
    role: role,
    realRole: realRole,
  };
}

export async function checkRole(allowedRoles: string[]) {
  const session = await getSession();
  
  if (!session) {
    return { authorized: false, error: 'Unauthorized', status: 401, session: null };
  }

  // Genuinely authenticated SUPERADMIN has god-mode bypass on all portal verification checks!
  if (session.realRole === 'SUPERADMIN' || allowedRoles.includes(session.role)) {
    return { authorized: true, error: null, status: 200, session };
  }

  console.error(`[SECURITY EXCEPTION] User ${session.userId} (Role: ${session.role}) attempted unauthorized access to a protected route requiring roles: ${allowedRoles.join(', ')}.`);
  return { authorized: false, error: 'Forbidden', status: 403, session };
}
