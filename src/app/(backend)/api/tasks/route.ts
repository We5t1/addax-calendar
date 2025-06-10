import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const calendarId = searchParams.get('calendarId');

  if (!year || !month || !calendarId) {
    return NextResponse.json({ error: 'Year, month, and calendarId are required' }, { status: 400 });
  }

  try {
    const startOfMonthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonthDate = new Date(parseInt(year), parseInt(month), 0);

    const tasks = await db.task.findMany({
      where: {
        calendarId: calendarId,
        date: {
          gte: startOfMonthDate,
          lte: endOfMonthDate,
        },
      },
      orderBy: {
        order: 'asc',
      },
      include: { 
        tags: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { date, content, calendarId, order, tagIds } = await request.json();

  if (!date || !content || !calendarId) {
    return NextResponse.json({ error: 'Date, content, and calendarId are required' }, { status: 400 });
  }

  try {
    const newTask = await db.task.create({
      data: {
        date: new Date(date),
        content,
        calendarId,
        order: order !== undefined ? order : 0,
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [], 
        },
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}