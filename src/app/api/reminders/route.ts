import { NextResponse } from 'next/server';
import { getReminders, saveReminder } from '@/lib/reminders';

export async function GET() {
  try {
    const reminders = await getReminders();
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReminder = { ...body, id: Date.now().toString() };
    await saveReminder(newReminder);
    return NextResponse.json(newReminder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
