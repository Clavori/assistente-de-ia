import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const faqs = await prisma.faq.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json({ faqs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await req.json();
  const faq = await prisma.faq.create({
    data: {
      question: data.question,
      answer: data.answer
    }
  });

  return NextResponse.json({ success: true, faq });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  await prisma.faq.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
