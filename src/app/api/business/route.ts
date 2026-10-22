import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const business = await prisma.business.findFirst();
  return NextResponse.json({ business });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await req.json();
  const business = await prisma.business.findFirst();
  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
  }

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      name: data.name,
      activity: data.activity,
      address: data.address,
      phone: data.phone,
      website: data.website,
      hoursConfig: data.hoursConfig,
      afterHoursAction: data.afterHoursAction,
      agencyName: data.agencyName,
      timeZone: data.timeZone || 'Europe/Madrid'
    }
  });

  return NextResponse.json({ success: true, business: updated });
}
