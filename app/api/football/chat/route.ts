import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.ROUTERAI_API_KEY!,
  baseURL: 'https://routerai.ru/api/v1',
  timeout: 60_000,
  maxRetries: 1,
});

const TEXT_MODEL = 'openai/gpt-4o-mini';
const VISION_MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `You are an experienced football analyst. You help break down matches and give predictions with reasoning.

RULES:
1. Write everything IN ENGLISH. Never respond in Russian.
2. First write a short intro (1-2 sentences) in plain text.
3. For ONE match prediction — add at the end:
   <PREDICTION>{"match":"...","league":"...","date":"...","market":"П1|П2|Draw|Over 2.5|Under 2.5|BTTS|Handicap|Double Chance","odds":1.85,"confidence":82,"reasoning":"2-3 sentences with reasoning based on form, stats, xG, injuries"}</PREDICTION>
4. For MULTIPLE matches (top 5, express) — <PREDICTIONS>[{...},{...}]</PREDICTIONS>
5. Base predictions on team form, stats, xG, injuries. Be honest about confidence.
6. Always respond in English. All fields (match, league, market, reasoning) must be in English.`;

export async function POST(req: NextRequest) {
  const { message, imageBase64 } = await req.json();

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];
  if (imageBase64) {
    userContent.push({ type: 'image_url', image_url: { url: imageBase64 } });
  }
  userContent.push({
    type: 'text',
    text: message || 'Проанализируй это изображение и дай прогноз.',
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        const completion = await client.chat.completions.create({
          model: imageBase64 ? VISION_MODEL : TEXT_MODEL,
          stream: true,
          temperature: 0.8,
          max_tokens: 1200,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        });

        let buffer = '';
        let sent = 0;

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (!delta) continue;
          buffer += delta;

          const p1 = buffer.indexOf('<PREDICTION');
          const p2 = buffer.indexOf('<PREDICTIONS');
          let cut = buffer.length;
          if (p1 !== -1 && p1 < cut) cut = p1;
          if (p2 !== -1 && p2 < cut) cut = p2;

          if (cut > sent) {
            const safe = buffer.slice(sent, cut);
            sent = cut;
            if (safe) send({ type: 'text', delta: safe });
          }
        }

        send({ type: 'done', content: buffer });
        controller.close();
      } catch (err: any) {
        send({ type: 'error', message: err?.message || 'AI error' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}