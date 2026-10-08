import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const revalidate = 3600; // кэш на 1 час

const client = new OpenAI({
  apiKey: process.env.ROUTERAI_API_KEY!,
  baseURL: 'https://routerai.ru/api/v1',
  timeout: 30_000,
});

const MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `Ты — футбольный аналитик. Твоя задача — выбрать ОДИН самый интересный матч,
который играется СЕГОДНЯ или завтра. Ответ строго в формате JSON без markdown:

{
  "home": "Название команды хозяев",
  "away": "Название команды гостей",
  "league": "Название лиги",
  "date": "ДД мес ЧЧ:ММ",
  "pick": "П1 | П2 | Ничья | ТБ 2.5 | ТМ 2.5 | Обе забьют | Фора",
  "confidence": 0-100,
  "odds": 1.5-3.5,
  "reasoning": "1-2 предложения, почему этот матч интересен"
}

Правила:
- Выбирай матч из топ-5 лиг или ЛЧ/ЛЕ
- Кэф указывай приблизительный, реалистичный
- Уверенность ставь честно, не завышай
- Если не знаешь актуальное расписание — выбери классическое противостояние`;

export async function GET() {
  try {
    if (!process.env.ROUTERAI_API_KEY) {
      return NextResponse.json(
        { error: 'ROUTERAI_API_KEY не задан' },
        { status: 500 }
      );
    }

    const today = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Сегодня ${today}. Выбери матч дня.` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const data = JSON.parse(raw);

    // валидация минимальная
    if (!data.home || !data.away) throw new Error('Invalid response');

    return NextResponse.json({
      home: data.home,
      away: data.away,
      league: data.league || 'League',
      date: data.date || 'Today',
      pick: data.pick || 'П1',
      confidence: Number(data.confidence) || 75,
      odds: Number(data.odds) || 1.85,
      reasoning: data.reasoning || '',
      source: 'ai',
    });
  } catch (err: any) {
    console.error('[match-of-the-day] error:', err);
    // fallback
    return NextResponse.json(
      {
        home: 'Реал Мадрид',
        away: 'Барселона',
        league: 'Ла Лига',
        date: 'Today 21:00',
        pick: 'П1',
        confidence: 82,
        odds: 1.85,
        reasoning: 'Классико — обе команды в форме, но у хозяев преимущество поля.',
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}