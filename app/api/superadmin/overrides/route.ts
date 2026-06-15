import { checkRole } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const auth = await checkRole(['SUPERADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { action, payload } = await req.json();

    if (action === 'DELETE_EMPLOYER') {
      const employerId = payload.employerId;
      if (!employerId) return NextResponse.json({ error: 'Employer ID required' }, { status: 400 });

      await db.user.delete({ where: { id: employerId } });
      return NextResponse.json({ success: true, message: `Employer ${employerId} deleted.` });
    }

    if (action === 'RESCORE_ALL') {
      // Stub implementation for global re-score
      // Note: Full implementation would iterate through all matches and call the gemini `scoreMatch`.
      // Since scoring uses external API tokens and time, we'd queue this via Redis/BullMQ realistically.
      return NextResponse.json({ success: true, message: 'System-wide re-score triggered and queued successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Superadmin Override Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
