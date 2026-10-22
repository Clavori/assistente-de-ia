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
        name: 'Administrador Atende',
        role: 'admin'
      }
    });
    console.log(`✅ Administrador criado: ${adminEmail}`);
  }

  // 2. Check or update Business (Clínica Dental Lumen)
  const existingBusiness = await prisma.business.findFirst();
  if (!existingBusiness) {
    await prisma.business.create({
      data: {
        name: 'Clínica Dental Lumen',
        activity: 'Odontologia integral avançada, estética dental e implantologia',
        address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
        phone: '+55 11 91234-5678',
        website: 'https://clinicalumen.com.br',
        agencyName: 'Andrade Studio AI',
        timeZone: 'America/Sao_Paulo',
        hoursConfig: {
          segunda: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          terca: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          quarta: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          quinta: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          sexta: { open: '09:00', close: '20:00', lunchBreak: '14:00-16:00', active: true },
          sabado: { open: '09:00', close: '13:00', active: false },
          domingo: { open: 'fechado', active: false }
        },
        afterHoursAction: 'continue_booking'
      }
    });
    console.log('✅ Empresa criada: Clínica Dental Lumen');
  } else {
    await prisma.business.update({
      where: { id: existingBusiness.id },
      data: {
        address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
        phone: '+55 11 91234-5678',
        website: 'https://clinicalumen.com.br',
        timeZone: 'America/Sao_Paulo'
      }
    });
  }

  // 3. Assistant Config
  const existingConfig = await prisma.assistantConfig.findFirst();
  const welcomePtBr = 'Olá! Seja bem-vindo à Clínica Dental Lumen ✨ Sou a assistente virtual da equipe do Dr. Carlos. Como posso ajudar com o seu sorriso hoje? Posso tirar dúvidas sobre procedimentos, valores ou agendar sua consulta!';
  const instructionsPtBr = `Você é a assistente virtual da Clínica Dental Lumen (São Paulo - SP), um centro odontológico de referência.
Seu objetivo é atender os pacientes por WhatsApp e Web com cordialidade, profissionalismo e rapidez.
Horário de atendimento: Segunda a Sexta das 9:00 às 14:00 e das 16:00 às 20:00.
Diretrizes fundamentais:
1. Seja objetiva, empática e natural, com respostas concisas como em uma conversa real de WhatsApp.
2. Ao informar valores, forneça sempre os preços base orientativos e esclareça quando for necessária avaliação clínica presencial.
3. Incentive o agendamento de consultas nos horários disponíveis.
4. Em caso de dor aguda, hemorragia ou emergência, oriente contato imediato pelo telefone +55 11 91234-5678 e transfira a conversa para um atendente humano.`;

  const neverDoRulesPtBr = [
    'Nunca fechar diagnósticos médicos nem prescrever medicamentos ou analgésicos.',
    'Nunca garantir resultados estéticos milagrosos sem avaliação clínica presencial.',
    'Nunca inventar preços ou promoções fora da tabela oficial.',
    'Nunca discutir com o paciente; em caso de insatisfação, transferir educadamente para um atendente humano.'
  ];

  if (!existingConfig) {
    await prisma.assistantConfig.create({
      data: {
        name: 'Lúcia AI',
        tone: 'cercano',
        welcomeMessage: welcomePtBr,
        instructions: instructionsPtBr,
        neverDoRules: neverDoRulesPtBr,
        escalateTriggers: {
          complaint: true,
          urgent: true,
          asksHuman: true,
          unknownAnswer: true,
          customRule: 'Paciente relata dor insuportável, sangramento ou trauma recente'
        },
        active: true,
        modelSelected: 'anthropic/claude-haiku-5.5',
        safeMode: false
      }
    });
    console.log('✅ Configuração do Assistente criada');
  } else {
    await prisma.assistantConfig.update({
      where: { id: existingConfig.id },
      data: {
        welcomeMessage: welcomePtBr,
        instructions: instructionsPtBr,
        neverDoRules: neverDoRulesPtBr
      }
    });
  }

  // 4. Serviços (8 serviços em R$)
  await prisma.service.deleteMany({});
  const services = [
    {
      name: 'Primeira consulta e avaliação completa',
      description: 'Check-up bucal completo com raio-x panorâmico digital e plano de tratamento personalizado.',
      durationMinutes: 30,
      price: 0.00,
      priceFrom: false,
      requiresTriage: false
    },
    {
      name: 'Limpeza dental e profilaxia com ultrassom',
      description: 'Remoção de tártaro com ultrassom, jato de bicarbonato, polimento coronário e aplicação de flúor.',
      durationMinutes: 45,
      price: 220.00,
      priceFrom: true,
      requiresTriage: false
    },
    {
      name: 'Restauração dental estética (resina nanohíbrida)',
      description: 'Restauração estética de alta resistência na cor exata do esmalte dental.',
      durationMinutes: 40,
      price: 250.00,
      priceFrom: true,
      requiresTriage: false
    },
    {
      name: 'Tratamento de canal (Endodontia digital)',
      description: 'Tratamento endodôntico com instrumentação rotatória digital para preservação do dente natural.',
      durationMinutes: 60,
      price: 650.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Clareamento dental a laser & moldeira combinada',
      description: 'Protocolo de clareamento dental de alta eficácia com tecnologia dessensibilizante.',
      durationMinutes: 60,
      price: 980.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Ortodontia invisível (Alinhadores transparentes)',
      description: 'Alinhamento dental sem brackets através de alinhadores transparentes com escaneamento 3D iTero.',
      durationMinutes: 45,
      price: 4900.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Implante dentário unitário em titânio Cone Morse',
      description: 'Substituição definitiva de dente ausente com pino de titânio biocompatível e coroa de porcelana.',
      durationMinutes: 60,
      price: 2400.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Atendimento de urgência odontológica',
      description: 'Consulta prioritária no mesmo dia para alívio imediato de dor aguda ou fratura dental.',
      durationMinutes: 30,
      price: 180.00,
      priceFrom: true,
      requiresTriage: false
    }
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log('✅ 8 Serviços criados em PT-BR');

  // 5. Perguntas Frequentes (10 FAQs em PT-BR)
  await prisma.faq.deleteMany({});
  const faqs = [
    {
      question: 'A primeira consulta de avaliação tem algum custo?',
      answer: 'Nossa primeira consulta inclui avaliação clínica completa e raio-x panorâmico digital sem custo inicial ou compromisso.'
    },
    {
      question: 'Quais são as condições de pagamento e parcelamento?',
      answer: 'Oferecemos parcelamento em até 12x sem juros no cartão de crédito, PIX com 5% de desconto à vista e opções de financiamento próprio.'
    },
    {
      question: 'A clínica atende por convênio odontológico?',
      answer: 'Atendemos na modalidade particular e emitimos toda a documentação, recibos e relatórios para você solicitar reembolso junto ao seu plano de saúde.'
    },
    {
      question: 'Há estacionamento próximo à clínica?',
      answer: 'Sim, o edifício conta com serviço de valet com manobrista no local, e temos fácil acesso pela estação de metrô Trianon-Masp.'
    },
    {
      question: 'Como faço para agendar um horário com urgência?',
      answer: 'Casos de dor aguda ou trauma são atendidos no mesmo dia com prioridade. Envie uma mensagem por aqui ou ligue para +55 11 91234-5678.'
    },
    {
      question: 'Vocês atendem crianças (Odontopediatria)?',
      answer: 'Sim! Temos profissionais especializados em odontopediatria com ambiente acolhedor para que as crianças se sintam seguras e tranquilas.'
    },
    {
      question: 'O procedimento de implante dentário dói?',
      answer: 'Não, o procedimento é realizado com anestesia local computadorizada e é totalmente indolor. No pós-operatório, as orientações e medicações garantem recuperação suave.'
    },
    {
      question: 'Quanto tempo dura o tratamento com alinhadores transparentes?',
      answer: 'Dependendo do caso, varia entre 6 e 18 meses. Na primeira consulta realizamos o escaneamento intraoral para simular o resultado antes de iniciar.'
    },
    {
      question: 'Posso me alimentar normalmente após fazer uma restauração?',
      answer: 'Sim! Como utilizamos resinas nanohíbridas fotopolimerizadas com luz LED, o material atinge resistência total imediatamente após o procedimento.'
    },
    {
      question: 'O clareamento dental causa sensibilidade?',
      answer: 'Utilizamos fórmulas modernas com agentes dessensibilizantes pré e pós-aplicação para minimizar qualquer desconforto e garantir máxima segurança ao esmalte.'
    }
  ];

  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }
  console.log('✅ 10 FAQs criadas em PT-BR');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Atualização para PT-BR concluída.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao atualizar seed:', err);
      process.exit(1);
    });
}
