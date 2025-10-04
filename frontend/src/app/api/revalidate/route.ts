import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Set in environment: REVALIDATE_SECRET=super-secret

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret || body?.secret !== secret) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }
    const paths: string[] = Array.isArray(body.paths) && body.paths.length ? body.paths : ['/'];
    const unique = Array.from(new Set(paths));
    unique.forEach(p => {
      try { revalidatePath(p); } catch (e) { console.warn('Failed to revalidate path', p, e); }
    });
    return NextResponse.json({ revalidated: true, paths: unique });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
