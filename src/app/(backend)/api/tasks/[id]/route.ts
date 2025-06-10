import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const taskId = params.id;
  const { date, content, order, tagIds } = await request.json();

  try {
    const data: any = { updatedAt: new Date() }; 
    if (date !== undefined) data.date = new Date(date);
    if (content !== undefined) data.content = content;
    if (order !== undefined) data.order = order;
    if (tagIds !== undefined) {
      data.tags = {
        set: tagIds.map((id: string) => ({ id })),
      };
    }

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data,
      include: {
        tags: true, 
      },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const taskId = params.id;

  try {
    await db.task.delete({
      where: { id: taskId },
    });
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}