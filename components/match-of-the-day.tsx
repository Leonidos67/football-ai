'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Flame } from 'lucide-react';
import { Instrument_Serif } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
});

interface MatchData {
  home: string;
  away: string;
  league: string;
  date: string;
  pick: string;
  confidence: number;
  odds: number;
  reasoning?: string;
}

export function MatchOfTheDay() {
  const router = useRouter();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/football/match-of-the-day')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMatch(data);
      })
      .catch(() => {
        if (!cancelled) {
          setMatch({
            home: 'Реал Мадрид',
            away: 'Барселона',
            league: 'Ла Лига',
            date: 'Today 21:00',
            pick: 'П1',
            confidence: 82,
            odds: 1.85,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !match) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-[#e72930]/10 to-[#e72930]/5 border border-[#e72930]/20 h-full flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#e72930]" />
          <p className="text-xs text-muted-foreground">
            Analyzing today's matches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#e72930]/10 to-[#e72930]/5 border border-[#e72930]/20 h-full relative overflow-hidden">
      <div className="p-6 flex flex-col justify-between h-full min-h-[220px]">

        <div>
          <span className="text-[10px] font-bold text-[#e72930] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Match of the day
          </span>
          <h2 className={`${instrumentSerif.className} text-2xl mt-2 text-foreground leading-tight`}>
            {match.home} — {match.away}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {match.league} · {match.date}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-background/60 backdrop-blur p-3">
            <p className="text-[10px] uppercase text-muted-foreground">AI pick</p>
            <p className="text-base font-bold truncate">{match.pick}</p>
          </div>
          <div className="rounded-lg bg-background/60 backdrop-blur p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Confidence</p>
            <p className="text-base font-bold text-emerald-600">{match.confidence}%</p>
          </div>
          <div className="rounded-lg bg-background/60 backdrop-blur p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Odds</p>
            <p className="text-base font-bold tabular-nums">{match.odds}</p>
          </div>
        </div>

        <button
          onClick={() =>
            router.push(
              `/chat?prompt=дай подробный анализ матча ${match.home} — ${match.away}`
            )
          }
          className="mt-4 px-5 py-2 rounded-md bg-[#e72930] text-white hover:bg-[#e72930]/80 transition-colors text-sm font-medium self-start flex items-center gap-2"
        >
          Detailed analysis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}