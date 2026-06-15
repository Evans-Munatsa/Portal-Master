import { headers, cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * Extracts the tenantId from the request context or custom headers.
 * Provides a standard way to scope Prisma queries within API routes.
 * 
 * @param req Optional NextRequest object. If not provided, uses Next.js `headers()` and `cookies()`
 * @returns The resolved tenantId
 */
export function getTenantId(req?: NextRequest): string {
  if (req) {
    return (
      req.headers.get('x-resolved-tenant-id') ||
      req.headers.get('x-tenant-id') ||
      req.cookies.get('tenant_id')?.value ||
      'default-tenant'
    );
  }

  // Fallback to Next.js server context if req is not provided
  try {
    const headersList = headers();
    const resolvedTenantId = headersList.get('x-resolved-tenant-id');
    if (resolvedTenantId) return resolvedTenantId;

    const tenantHeader = headersList.get('x-tenant-id');
    if (tenantHeader) return tenantHeader;

    const cookieStore = cookies();
    const tenantCookie = cookieStore.get('tenant_id');
    if (tenantCookie?.value) return tenantCookie.value;
  } catch (error) {
    // headers() and cookies() might throw if used outside of server context
    console.warn(`[getTenantId] Could not use next/headers: ${error}`);
  }

  return 'default-tenant';
}
