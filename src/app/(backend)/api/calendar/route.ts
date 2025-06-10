import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Calendar name is required' }, { status: 400 });
  }

  try {
    const newCalendar = await db.calendar.create({
      data: { name },
    });
    return NextResponse.json(newCalendar, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar:', error);
    return NextResponse.json({ error: 'Failed to create calendar' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('id');

  try {
    let calendar;
    if (calendarId) {
      calendar = await db.calendar.findUnique({
        where: { id: calendarId },
      });
    } else {
      calendar = await db.calendar.findFirst();
    }

    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }
    return NextResponse.json(calendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}