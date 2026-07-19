import { NextResponse } from 'next/server';
import { completeReminder } from '@/lib/history';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const completionDate = body.completionDate || new Date().toISOString();
    
    await completeReminder(id, completionDate);
    return NextResponse.json({ success: true, completionDate });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to complete reminder' }, { status: 500 });
  }
}
