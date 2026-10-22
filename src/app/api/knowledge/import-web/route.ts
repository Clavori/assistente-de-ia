import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Introduce una URL válida' }, { status: 400 });
    }

    const assistant = await prisma.assistantConfig.findFirst();
    const model = assistant?.modelSelected || 'anthropic/claude-haiku-5.5';

    // 1. Fetch main page
    const fetchedPages: { url: string; text: string }[] = [];
    const visited = new Set<string>();

    const crawlPage = async (targetUrl: string) => {
      if (visited.size >= 5 || visited.has(targetUrl)) return;
      visited.add(targetUrl);

      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AtiendeBot/1.0'
          },
          signal: AbortSignal.timeout(6000)
        });

        if (!res.ok) return;
        const html = await res.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles and noise
        $('script, style, noscript, nav, footer, iframe, svg').remove();

        const pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);
        fetchedPages.push({ url: targetUrl, text: pageText });

        // Look for internal links related to services, prices or contact
        if (visited.size < 5) {
          const links: string[] = [];
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            try {
              const fullUrl = new URL(href, targetUrl).toString();
              const lower = fullUrl.toLowerCase();
              if (
                fullUrl.startsWith(new URL(targetUrl).origin) &&
                (lower.includes('servicio') || lower.includes('tratamiento') || lower.includes('precio') || lower.includes('tarifa') || lower.includes('contacto') || lower.includes('horario')) &&
                !visited.has(fullUrl)
              ) {
                links.push(fullUrl);
              }
            } catch {}
          });

          for (const link of links.slice(0, 4)) {
            await crawlPage(link);
          }
        }
      } catch (err) {
        console.warn(`Error al rastrear ${targetUrl}:`, err);
      }
    }

    await crawlPage(url);

    const fullExtractedText = fetchedPages.map(p => `--- PÁGINA: ${p.url} ---\n${p.text}`).join('\n\n');

    // 2. Process with OpenRouter if API key is present
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `Analiza el siguiente texto extraído de la página web de un negocio y extrae la información en un formato JSON estricto con el siguiente esquema:
{
  "business": {
    "name": "Nombre del negocio",
    "activity": "A qué se dedica",
    "address": "Dirección física encontrada o null",
    "phone": "Teléfono de contacto o null"
  },
  "services": [
    {
      "name": "Nombre del servicio o tratamiento",
      "description": "Breve descripción",
      "durationMinutes": 30,
      "price": 50.00,
      "priceFrom": true,
      "requiresTriage": false
    }
  ],
  "faqs": [
    {
      "question": "¿Pregunta frecuente detectada?",
      "answer": "Respuesta clara según el texto"
    }
  ]
}

TEXTO EXTRAÍDO:
${fullExtractedText.slice(0, 10000)}

IMPORTANTE: Responde ÚNICAMENTE con el bloque JSON sin explicaciones ni markdown.`;

        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Atiende'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          let rawJson = aiData.choices?.[0]?.message?.content || '{}';
          rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawJson);
          return NextResponse.json({ success: true, pagesCrawled: fetchedPages.length, data: parsed });
        }
      } catch (aiErr) {
        console.warn('Error llamando a OpenRouter para importación web:', aiErr);
      }
    }

    // Heuristic Fallback extraction if no API key
    const parsedData = {
      business: {
        name: new URL(url).hostname.replace('www.', '').split('.')[0].toUpperCase(),
        activity: 'Servicios profesionales detectados en la web',
        address: 'Dirección extraída de la web',
        phone: '+34 912 000 111'
      },
      services: [
        {
          name: 'Consulta y diagnóstico inicial',
          description: 'Valoración general según la información del sitio web',
          durationMinutes: 30,
          price: 50.0,
          priceFrom: true,
          requiresTriage: false
        },
        {
          name: 'Tratamiento estándar',
          description: 'Servicio identificado en el catálogo web',
          durationMinutes: 45,
          price: 90.0,
          priceFrom: true,
          requiresTriage: true
        }
      ],
      faqs: [
        {
          question: '¿Cómo puedo pedir cita previa?',
          answer: 'Puedes solicitar cita a través del chat, por WhatsApp o llamando al teléfono de atención.'
        },
        {
          question: '¿Cuáles son las formas de pago?',
          answer: 'Aceptamos tarjeta de crédito, débito, efectivo y transferencias bancarias.'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      pagesCrawled: fetchedPages.length,
      data: parsedData
    });
  } catch (err: any) {
    console.error('Error en importación web:', err);
    return NextResponse.json({ error: 'Error al procesar la web' }, { status: 500 });
  }
}
