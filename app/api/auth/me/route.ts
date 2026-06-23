import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        professional_title: true,
        experience_level: true,
        resume_text: true,
        phone: true,
        linkedin_url: true,
        github_url: true,
      },
    });

    if (user) {
      // If Thanos override is active, simulate the role on the returned user object
      const activeUser = {
        ...user,
        role: session.role,
        realRole: session.realRole,
      };
      return NextResponse.json({ user: activeUser });
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ user: null });
  }
}
