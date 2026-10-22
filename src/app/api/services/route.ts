import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await req.json();
  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description || '',
      durationMinutes: parseInt(data.durationMinutes) || 30,
      price: data.price !== undefined && data.price !== '' ? parseFloat(data.price) : null,
      priceFrom: Boolean(data.priceFrom),
      requiresTriage: Boolean(data.requiresTriage)
    }
  });

  return NextResponse.json({ success: true, service });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await req.json();
  const updated = await prisma.service.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description || '',
      durationMinutes: parseInt(data.durationMinutes) || 30,
      price: data.price !== undefined && data.price !== '' ? parseFloat(data.price) : null,
      priceFrom: Boolean(data.priceFrom),
      requiresTriage: Boolean(data.requiresTriage)
    }
  });

  return NextResponse.json({ success: true, service: updated });
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

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
