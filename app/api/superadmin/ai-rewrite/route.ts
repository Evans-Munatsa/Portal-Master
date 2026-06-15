import { checkRole } from '@/lib/auth';
import { rewriteJobDescription } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const auth = await checkRole(['SUPERADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { htmlContent, mode } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'htmlContent is required' }, { status: 400 });
    }

    const validModes = ['proofread', 'expand', 'summarize'];
    const currentMode = validModes.includes(mode) ? mode : 'proofread';

    const rewritten = await rewriteJobDescription(htmlContent, currentMode as 'proofread' | 'expand' | 'summarize');

    return NextResponse.json({ success: true, rewritten });
  } catch (error: any) {
    console.error('[AI Rewrite Route] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server-side failure during rewriting.' },
      { status: 500 }
    );
  }
}
