import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// In-Memory store for sliding-window rate limiting (extremely fast, compatible with Edge Runtime)
const inMemoryRateLimitStore = new Map<string, { timestamps: number[] }>();

// Sliding Window rate limiting settings (60 requests per minute)
const LIMIT_WINDOW_MS = 60 * 1000;
const LIMIT_MAX_REQUESTS = 60;

/**
 * Validates request count within a sliding window for client keys (Edge compatible)
 */
async function rateLimitCheck(key: string): Promise<{ success: boolean; limit: number; remaining: number; resetMs: number }> {
  const now = Date.now();
  const cleanExpiredBefore = now - LIMIT_WINDOW_MS;

  // Fallback to memory store rate limiter
  let clientData = inMemoryRateLimitStore.get(key);
  if (!clientData) {
    clientData = { timestamps: [] };
    inMemoryRateLimitStore.set(key, clientData);
  }

  clientData.timestamps = clientData.timestamps.filter(ts => ts > cleanExpiredBefore);

  if (clientData.timestamps.length >= LIMIT_MAX_REQUESTS) {
    const oldestTs = clientData.timestamps[0] || now;
    const resetMs = oldestTs + LIMIT_WINDOW_MS - now;
    return {
      success: false,
      limit: LIMIT_MAX_REQUESTS,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  clientData.timestamps.push(now);
  return {
    success: true,
    limit: LIMIT_MAX_REQUESTS,
    remaining: LIMIT_MAX_REQUESTS - clientData.timestamps.length,
    resetMs: LIMIT_WINDOW_MS,
  };
}

/**
 * Appends secure HTTP response headers to defend against security issues
 */
function applySecureHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Required to load within Google AI Studio preview sandbox frame safely
  return res;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-super-secret-key-12345');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CENTRAL sliding window rate limit for any API endpoints
  if (pathname.startsWith('/api')) {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const rateCheck = await rateLimitCheck(ip);
    if (!rateCheck.success) {
      const errRes = NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: `Spam filter activated. Try again in ${Math.ceil(rateCheck.resetMs / 1000)}s.` 
        }, 
        { status: 429 }
      );
      errRes.headers.set('Retry-After', String(Math.ceil(rateCheck.resetMs / 1000)));
      return applySecureHeaders(errRes);
    }
  }

  // 2. TENANT RESOLUTION
  const tenantHeader = req.headers.get('x-tenant-id');
  const tenantCookie = req.cookies.get('tenant_id')?.value;
  const tenantId = tenantHeader || tenantCookie || 'default-tenant';
  
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-resolved-tenant-id', tenantId);

  // 3. AUTHENTICATION & ROUTE GUARDS
  // Public routes to bypass auth
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api/auth');
  const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('.');

  if (isAuthRoute || isPublicAsset) {
    return applySecureHeaders(NextResponse.next({
      request: { headers: requestHeaders },
    }));
  }

  // Verify JWT from cookies
  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect unsigned user to login if accessing protected Portal (optional)
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/employer') || pathname.startsWith('/candidate')) {
      return applySecureHeaders(NextResponse.redirect(new URL('/login', req.url)));
    }
    // Allow pass-through for public marketing pages or handle 401 on APIs
    if (pathname.startsWith('/api')) {
       return applySecureHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: requestHeaders }));
    }
  } else {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      // Inject user metadata into headers for downstream API routes
      requestHeaders.set('x-user-id', String(payload.userId));
      requestHeaders.set('x-user-role', String(payload.role));

      // 4. RBAC / ROUTING GATEWAY LOGIC
      const userRole = String(payload.role).toUpperCase();
      const getPortalUrl = (role: string) => {
        if (role === 'SUPERADMIN') return '/admin/dashboard';
        if (role === 'EMPLOYER' || role === 'CLIENT') return '/employer/dashboard';
        return '/candidate/dashboard';
      };

      // Redirect if accessing the old generic /dashboard
      if (pathname === '/dashboard') {
        return applySecureHeaders(NextResponse.redirect(new URL(getPortalUrl(userRole), req.url)));
      }

      // Restrict route groups based on roles
      if (pathname.startsWith('/admin') && userRole !== 'SUPERADMIN') {
        return applySecureHeaders(NextResponse.redirect(new URL(getPortalUrl(userRole), req.url)));
      }
      if (pathname.startsWith('/employer') && (userRole !== 'EMPLOYER' && userRole !== 'CLIENT' && userRole !== 'SUPERADMIN')) {
        return applySecureHeaders(NextResponse.redirect(new URL(getPortalUrl(userRole), req.url)));
      }
      if (pathname.startsWith('/candidate') && userRole !== 'CANDIDATE') {
        return applySecureHeaders(NextResponse.redirect(new URL(getPortalUrl(userRole), req.url)));
      }

    } catch (err) {
      // Invalid or expired token
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('auth-token');
      if (pathname.startsWith('/api')) {
        return applySecureHeaders(NextResponse.json({ error: 'Session expired' }, { status: 401 }));
      }
      return applySecureHeaders(res);
    }
  }

  return applySecureHeaders(NextResponse.next({
    request: { headers: requestHeaders },
  }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths except static files
};
