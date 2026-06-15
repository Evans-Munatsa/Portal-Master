import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * A Next.js API Route Wrapper that acts like an Express Global Error Handler.
 * It catches unhandled exceptions, verifies JWT authentication automatically if an array of roles is provided,
 * and ensures production stack traces are hidden from end users.
 */
export function withErrorHandler(
  handler: (req: Request, context: any, session: any) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: Request, context: any) => {
    try {
      let session = null;
      
      // Automatic RBAC Verification Step
      if (allowedRoles) {
        session = await getSession();
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized. Invalid or missing JWT token.' }, { status: 401 });
        }
        if (!allowedRoles.includes(session.role)) {
          console.warn(`[SECURITY WARNING] User ${session.userId} attempted to access protected route without privileges.`);
          return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
        }
      }

      // Execute the actual route handler
      return await handler(req, context, session);

    } catch (error: any) {
      // Catch all unhandled exceptions globally
      console.error('[Global Error Handler] Caught exception:', error);

      // In production, we obscure stack traces
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = isDev ? error.message : 'An unexpected internal server error occurred.';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}
