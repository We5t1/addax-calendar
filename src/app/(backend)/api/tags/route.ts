import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, color } = await request.json();

  if (!name || !color) {
    return NextResponse.json({ error: 'Tag name and color are required' }, { status: 400 });
  }

  try {
    const newTag = await db.tag.create({
      data: { name, color },
    });
    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') { 
      return NextResponse.json({ error: `Tag "${name}" already exists.` }, { status: 409 });
    }
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}