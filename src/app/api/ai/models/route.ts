import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

let cachedModels: any[] = [];
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  const now = Date.now();
  if (!forceRefresh && cachedModels.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json({ models: cachedModels, cached: true, timestamp: cacheTimestamp });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Atiende'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }

    const json = await res.json();
    const rawList = json.data || [];

    // Filter only models that support tools
    const toolModels = rawList
      .filter((m: any) => {
        const supported = m.supported_parameters || [];
        return supported.includes('tools');
      })
      .map((m: any) => {
        const promptPrice = parseFloat(m.pricing?.prompt || '0') * 1000000;
        const completionPrice = parseFloat(m.pricing?.completion || '0') * 1000000;
        const provider = m.id.split('/')[0] || 'other';

        return {
          id: m.id,
          name: m.name || m.id,
          provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          contextLength: m.context_length || 0,
          inputPricePerM: promptPrice === 0 ? 'Gratis' : `$${promptPrice.toFixed(2)}`,
          outputPricePerM: completionPrice === 0 ? 'Gratis' : `$${completionPrice.toFixed(2)}`,
          rawInputPrice: promptPrice,
          rawOutputPrice: completionPrice,
          isRecommended: m.id.includes('claude-haiku-5.5') || m.id.includes('claude-3.5-haiku')
        };
      });

    cachedModels = toolModels;
    cacheTimestamp = now;

    return NextResponse.json({ models: toolModels, cached: false, timestamp: now });
  } catch (err: any) {
    console.warn('Error fetching OpenRouter models, using local fallback:', err.message);

    // Fallback list of tool-capable models
    const fallback = [
      {
        id: 'anthropic/claude-haiku-5.5',
        name: 'Claude Haiku 5.5',
        provider: 'Anthropic',
        contextLength: 200000,
        inputPricePerM: '$0.25',
        outputPricePerM: '$1.25',
        rawInputPrice: 0.25,
        rawOutputPrice: 1.25,
        isRecommended: true
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        contextLength: 200000,
        inputPricePerM: '$3.00',
        outputPricePerM: '$15.00',
        rawInputPrice: 3.0,
        rawOutputPrice: 15.0,
        isRecommended: false
      },
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        contextLength: 128000,
        inputPricePerM: '$0.15',
        outputPricePerM: '$0.60',
        rawInputPrice: 0.15,
        rawOutputPrice: 0.60,
        isRecommended: false
      },
      {
        id: 'google/gemini-flash-1.5',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        contextLength: 1000000,
        inputPricePerM: '$0.07',
        outputPricePerM: '$0.30',
        rawInputPrice: 0.07,
        rawOutputPrice: 0.30,
        isRecommended: false
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        provider: 'Meta',
        contextLength: 128000,
        inputPricePerM: '$0.12',
        outputPricePerM: '$0.30',
        rawInputPrice: 0.12,
        rawOutputPrice: 0.30,
        isRecommended: false
      }
    ];

    return NextResponse.json({ models: fallback, cached: false, fallback: true });
  }
}
