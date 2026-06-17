import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.realRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can toggle Thanos mode.' }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !['CANDIDATE', 'EMPLOYER', 'SUPERADMIN'].includes(String(role).toUpperCase())) {
      return NextResponse.json({ error: 'Invalid role specified. Must be CANDIDATE, EMPLOYER or SUPERADMIN.' }, { status: 400 });
    }

    const targetRole = String(role).toUpperCase();
    const cookieStore = cookies();

    if (targetRole === 'SUPERADMIN') {
      // Clear Thanos mode override
      cookieStore.set('thanos-role', '', { 
        path: '/', 
        maxAge: -1, // Expire immediately
        httpOnly: true,
        sameSite: 'lax'
      });
      return NextResponse.json({ success: true, role: 'SUPERADMIN', message: 'Thanos mode deactivated. Returned to Super Admin dashboard.' });
    } else {
      // Set Thanos override
      cookieStore.set('thanos-role', targetRole, { 
        path: '/', 
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
      });
      return NextResponse.json({ success: true, role: targetRole, message: `Thanos Mode: Simulating '${targetRole}' workspace.` });
    }
  } catch (error: any) {
    console.error('Error toggling Thanos role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
