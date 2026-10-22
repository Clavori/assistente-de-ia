import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@atiende.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';

  // 1. Check or create Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Administrador Atiende',
        role: 'admin'
      }
    });
    console.log(`✅ Administrador creado: ${adminEmail}`);
  }

  // 2. Check or create Business (Clínica Dental Lumen)
  const existingBusiness = await prisma.business.findFirst();
  if (!existingBusiness) {
    await prisma.business.create({
      data: {
        name: 'Clínica Dental Lumen',
        activity: 'Odontología integral avanzada, estética dental e implantología',
        address: 'Calle Serrano 45, 1º Izquierda, 28001 Madrid',
        phone: '+34 912 345 678',
        website: 'https://clinicalumen.es',
        agencyName: 'Andrade Studio AI',
        timeZone: 'Europe/Madrid',
        hoursConfig: {
          lunes: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          martes: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          miercoles: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          jueves: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          viernes: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          sabado: { open: '10:00', close: '14:00', active: false },
          domingo: { open: 'cerrado', active: false }
        },
        afterHoursAction: 'continue_booking'
      }
    });
    console.log('✅ Negocio inicial creado: Clínica Dental Lumen');
  }

  // 3. Assistant Config
  const existingConfig = await prisma.assistantConfig.findFirst();
  if (!existingConfig) {
    await prisma.assistantConfig.create({
      data: {
        name: 'Lumen AI',
        tone: 'cercano',
        welcomeMessage: '¡Hola! Te damos la bienvenida a Clínica Dental Lumen en Madrid ✨ Soy el asistente virtual del equipo del Dr. Carlos. ¿En qué podemos ayudarte hoy? Puedo informarte sobre nuestros tratamientos, precios orientativos o concertar tu cita.',
        instructions: `Eres el asistente virtual de la Clínica Dental Lumen (Calle Serrano 45, Madrid), un centro odontológico de referencia en Madrid.
Tu objetivo es atender a los pacientes por WhatsApp y web con calidez, profesionalidad y precisión.
Horario: Lunes a Viernes de 9:00 a 14:00 y de 16:00 a 20:00.
Normas clave:
1. Sé conciso y natural, con mensajes cortos como en una conversación real de WhatsApp.
2. Si el paciente pregunta por precios, proporciona los importes base orientativos y aclara si requiere valoración previa.
3. Propón citas libres dentro de nuestro horario habitual.
4. Si detectas urgencia severa o dolor agudo, indica que acudan de inmediato o llama al +34 912 345 678 y transfiere la conversación a una persona.`,
        neverDoRules: [
          'Nunca diagnosticar enfermedades ni prescribir medicamentos o analgésicos.',
          'Nunca garantizar resultados estéticos exactos sin revisión clínica previa.',
          'Nunca inventar precios, promociones o citas fuera de los datos oficiales.',
          'Nunca discutir con el paciente; en caso de queja o molestia, pasar educadamente a una persona del equipo.'
        ],
        escalateTriggers: {
          complaint: true,
          urgent: true,
          asksHuman: true,
          unknownAnswer: true,
          customRule: 'Paciente menciona dolor insoportable, hemorragia o traumatismo dental reciente'
        },
        active: true,
        modelSelected: 'anthropic/claude-haiku-5.5',
        safeMode: false
      }
    });
    console.log('✅ Configuración del Asistente creada');
  }

  // 4. Servicios (8 servicios con duración, precio y requisitos)
  const servicesCount = await prisma.service.count();
  if (servicesCount === 0) {
    const services = [
      {
        name: 'Primera visita y revisión completa',
        description: 'Revisión bucodental integral con radiografía digital panorámica e informe clínico sin coste inicial.',
        durationMinutes: 30,
        price: 0.00,
        priceFrom: false,
        requiresTriage: false
      },
      {
        name: 'Higiene dental y profilaxis con ultrasonidos',
        description: 'Limpieza profunda con ultrasonidos, eliminación de sarro, pulido dental y aplicación de flúor protector.',
        durationMinutes: 45,
        price: 55.00,
        priceFrom: true,
        requiresTriage: false
      },
      {
        name: 'Empaste dental estético (obturación)',
        description: 'Restauración estética con composite de alta resistencia nanohíbrido del mismo tono que el esmalte.',
        durationMinutes: 40,
        price: 60.00,
        priceFrom: true,
        requiresTriage: false
      },
      {
        name: 'Endodoncia unirradicular / multirradicular',
        description: 'Tratamiento de conductos con instrumentación rotatoria digital para salvar la pieza dental natural.',
        durationMinutes: 60,
        price: 140.00,
        priceFrom: true,
        requiresTriage: true
      },
      {
        name: 'Blanqueamiento dental combinado (clínica + férulas)',
        description: 'Tratamiento estético de alta eficacia con lámpara LED en clínica y refuerzo ambulatorio en casa.',
        durationMinutes: 60,
        price: 290.00,
        priceFrom: true,
        requiresTriage: true
      },
      {
        name: 'Ortodoncia invisible (Invisalign / Spark)',
        description: 'Alineación dental sin brackets mediante férulas transparentes. Planificación digital 3D iTero.',
        durationMinutes: 45,
        price: 2100.00,
        priceFrom: true,
        requiresTriage: true
      },
      {
        name: 'Implante dental de titanio de alta gama',
        description: 'Reposición de pieza dental fija con titanio grado médico osteointegrable y corona cerámica.',
        durationMinutes: 60,
        price: 750.00,
        priceFrom: true,
        requiresTriage: true
      },
      {
        name: 'Atención de urgencia dental',
        description: 'Cita prioritaria el mismo día para alivio del dolor agudo, flemones, roturas o traumatismos.',
        durationMinutes: 30,
        price: 45.00,
        priceFrom: true,
        requiresTriage: false
      }
    ];

    for (const s of services) {
      await prisma.service.create({ data: s });
    }
    console.log('✅ 8 Servicios creados');
  }

  // 5. Preguntas Frecuentes (10 FAQs)
  const faqsCount = await prisma.faq.count();
  if (faqsCount === 0) {
    const faqs = [
      {
        question: '¿La primera consulta y revisión son gratuitas?',
        answer: 'Sí, la primera consulta incluye exploración bucodental completa y radiografía digital de diagnóstico sin coste ni compromiso.'
      },
      {
        question: '¿Ofrecéis facilidades o financiación en los tratamientos?',
        answer: 'Disponemos de financiación a medida de hasta 24 meses sin intereses con aprobación inmediata en clínica, o hasta 60 meses en cuotas cómodas.'
      },
      {
        question: '¿Trabajáis con seguros médicos o pólizas dentales?',
        answer: 'Trabajamos con las principales aseguradoras (Sanitas, Adeslas, Asisa, Mapfre) para tarifas concertadas y reembolso de pólizas dentales.'
      },
      {
        question: '¿Hay aparcamiento cerca de la clínica?',
        answer: 'Sí, hay un parking público a menos de 50 metros en la calle Serrano 48, y la estación de Metro Rubén Darío (Línea 5) está a 3 minutos a pie.'
      },
      {
        question: '¿Cómo puedo llegar en transporte público?',
        answer: 'Estamos muy bien comunicados: Metro Serrano (Línea 4) y Rubén Darío (Línea 5), y líneas de autobús EMT 9, 14, 19, 27 y 51.'
      },
      {
        question: '¿Atendéis a niños y odontopediatría?',
        answer: 'Sí, contamos con un área especializada en odontopediatría con un entorno adaptado para que los más pequeños se sientan cómodos y tranquilos.'
      },
      {
        question: '¿Qué debo hacer si tengo una urgencia con dolor intenso?',
        answer: 'Te atendemos de forma prioritaria el mismo día. Escríbenos por aquí o llámanos directamente al +34 912 345 678 para asignarte un hueco de urgencia de inmediato.'
      },
      {
        question: '¿El tratamiento de implantes dentales duele?',
        answer: 'No, se realiza con anestesia local de última generación y es un procedimiento totalmente indoloro. En el postoperatorio se prescriben pautas analgésicas muy sencillas.'
      },
      {
        question: '¿Cuánto dura el tratamiento con alineadores invisibles?',
        answer: 'Dependiendo de la complejidad de cada caso, suele durar entre 6 y 18 meses. En la primera cita realizamos un escaneado 3D para mostrarte el resultado final antes de empezar.'
      },
      {
        question: '¿Puedo comer con normalidad después de un empaste?',
        answer: 'Sí, al utilizar composites fotopolimerizados con luz LED, el material queda completamente endurecido al terminar la cita. Solo recomendamos esperar a que pase el efecto de la anestesia.'
      }
    ];

    for (const f of faqs) {
      await prisma.faq.create({ data: f });
    }
    console.log('✅ 10 Preguntas Frecuentes creadas');
  }

  // 6. Integraciones (6 tarjetas desconectadas)
  const integrationsCount = await prisma.integration.count();
  if (integrationsCount === 0) {
    const integrations = [
      {
        provider: 'google_calendar',
        status: 'disconnected',
        settings: { defaultDuration: 30, bufferMinutes: 10, maxDaysInAdvance: 30 }
      },
      {
        provider: 'gmail',
        status: 'disconnected',
        settings: { sendConfirmation: true, dailyDigestTime: '20:00' }
      },
      {
        provider: 'google_sheets',
        status: 'disconnected',
        settings: { sheetTitle: 'Contactos — Clínica Dental Lumen' }
      },
      {
        provider: 'slack',
        status: 'disconnected',
        settings: { notifyHandover: true, notifyBooking: true }
      },
      {
        provider: 'stripe',
        status: 'disconnected',
        settings: { defaultDeposit: 30, testMode: true }
      },
      {
        provider: 'webhooks',
        status: 'disconnected',
        settings: { events: ['conversation.new', 'appointment.created', 'handover.requested'] }
      }
    ];

    for (const it of integrations) {
      await prisma.integration.create({ data: it });
    }
    console.log('✅ 6 Integraciones preparadas (desconectadas)');
  }

  // 7. Conversaciones y Contactos de ejemplo en bandeja
  const contactsCount = await prisma.contact.count();
  if (contactsCount === 0) {
    const contact1 = await prisma.contact.create({
      data: {
        name: 'Laura Gómez',
        phone: '+34 654 112 233',
        channel: 'whatsapp',
        interest: 'Ortodoncia invisible'
      }
    });

    const conv1 = await prisma.conversation.create({
      data: {
        channel: 'whatsapp',
        remoteId: '+34 654 112 233',
        status: 'bot_active',
        needsHuman: false,
        contactId: contact1.id
      }
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv1.id,
          sender: 'customer',
          text: 'Buenas tardes, quería pedir información sobre la ortodoncia invisible y los precios'
        },
        {
          conversationId: conv1.id,
          sender: 'assistant',
          text: '¡Hola Laura! Encantado de saludarte. En Clínica Dental Lumen trabajamos con alineadores transparentes de última generación. El tratamiento tiene un precio a partir de 2.100 €, con posibilidad de financiarlo hasta en 24 meses sin intereses. Para darte un presupuesto exacto y simular tu sonrisa en 3D realizamos una primera visita completa con escáner iTero gratuita. ¿Te gustaría que te reserve cita esta semana?'
        },
        {
          conversationId: conv1.id,
          sender: 'customer',
          text: 'Sí, por favor. ¿Qué horarios tenéis el jueves por la tarde?'
        }
      ]
    });

    const contact2 = await prisma.contact.create({
      data: {
        name: 'Javier Morales',
        phone: '+34 612 998 877',
        channel: 'whatsapp',
        interest: 'Urgencia dolor agudo'
      }
    });

    const conv2 = await prisma.conversation.create({
      data: {
        channel: 'whatsapp',
        remoteId: '+34 612 998 877',
        status: 'human_takeover',
        needsHuman: true,
        contactId: contact2.id
      }
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv2.id,
          sender: 'customer',
          text: 'Hola, tengo un dolor insoportable en una muela desde anoche y no puedo comer. ¿Tenéis hueco hoy urgente?'
        },
        {
          conversationId: conv2.id,
          sender: 'assistant',
          text: 'Hola Javier, lamento mucho el dolor. Al tratarse de una urgencia prioritaria, estoy avisando a nuestro equipo clínico para atenderte hoy mismo. Nuestro teléfono directo es el +34 912 345 678. Un compañero del equipo tomará esta conversación en unos instantes.'
        }
      ]
    });

    console.log('✅ Contactos y conversaciones de ejemplo creados');
  }
}

// Run directly when executed
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seed completado con éxito.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error al ejecutar seed:', err);
      process.exit(1);
    });
}
