import { getSession } from '@/lib/auth';
import { autofillJobPosting } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const aiData = await autofillJobPosting(title);
    return NextResponse.json(aiData);
  } catch (error) {
    console.error('Autofill Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
