"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ImagePicker } from "@/components/image-picker";
import { AppSidebar } from "@/components/app-sidebar";
import { useTelegram } from "@/components/telegram-provider";
import { cn } from "@/lib/utils";
import {
  loadMessages,
  saveMessages,
  clearMessages,
  saveLastPrompt,
  getLastPrompt,
  clearLastPrompt,
  type ChatMessage,
} from "@/lib/chat-history";
import {
  Settings, Plus, Zap, ArrowUp, X,
  CornerDownRight, Target, Copy, Check, Pin,
  RefreshCw, ThumbsUp, ThumbsDown, ChevronDown, Calendar,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Orb, type AgentState } from "@/components/ui/orb";
import {
  addPrediction,
  loadHistory,
  type PredictionHistoryItem,
} from "@/lib/prediction-history";
import { useTranslation } from "@/lib/i18n";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Prediction {
  match: string;
  league: string;
  date: string;
  market: string;
  odds: number;
  confidence: number;
  reasoning: string;
}

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  prediction?: Prediction;
  predictions?: Prediction[];
  streaming?: boolean;
  rating?: "up" | "down";
  timestamp: string;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────
// Image resize
// ─────────────────────────────────────────────────────────
async function compressImage(file: File, maxSize = 1280, quality = 0.85): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    if (width >= height) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    } else {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

// ─────────────────────────────────────────────────────────
// Streaming
// ─────────────────────────────────────────────────────────
async function streamAgentReply(
  history: Message[],
  text: string,
  imageBase64: string | undefined,
  onToken: (chunk: string) => void
): Promise<{ content: string; prediction?: Prediction; predictions?: Prediction[] }> {
  const res = await fetch("/api/football/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: text,
      imageBase64,
      messages: history.map(({ role, content }) => ({
        role: role === "ai" ? "assistant" : "user",
        content,
      })),
    }),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Chat API failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";

    for (const block of blocks) {
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "text") {
            full += evt.delta;
            onToken(evt.delta);
          } else if (evt.type === "done") {
            if (evt.content) full = evt.content;
          }
        } catch {}
      }
    }
  }

  let prediction: Prediction | undefined;
  let predictions: Prediction[] | undefined;

  const singleMatch = full.match(/<PREDICTION>([\s\S]*?)<\/PREDICTION>/);
  const multiMatch = full.match(/<PREDICTIONS>([\s\S]*?)<\/PREDICTIONS>/);

  if (singleMatch) {
    try { prediction = JSON.parse(singleMatch[1].trim()); } catch {}
  }
  if (multiMatch) {
    try {
      const arr = JSON.parse(multiMatch[1].trim());
      if (Array.isArray(arr)) predictions = arr;
    } catch {}
  }

  const content = full
    .replace(/<PREDICTION>[\s\S]*?<\/PREDICTION>/g, "")
    .replace(/<PREDICTIONS>[\s\S]*?<\/PREDICTIONS>/g, "")
    .trim();

  return { content, prediction, predictions };
}

// ─────────────────────────────────────────────────────────
// useTypingPlaceholder
// ─────────────────────────────────────────────────────────
function useTypingPlaceholder(texts: string[]) {
  const [textIndex, setTextIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    if (!current) return;
    if (!deleting && subIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), 1400);
      return () => clearTimeout(t);
    }
    if (deleting && subIndex === 0) {
      setDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }
    const t = setTimeout(() => setSubIndex((p) => p + (deleting ? -1 : 1)), deleting ? 15 : 35);
    return () => clearTimeout(t);
  }, [subIndex, deleting, textIndex, texts]);

  return (texts[textIndex] ?? "").slice(0, subIndex);
}

// ─────────────────────────────────────────────────────────
// PredictionCard
// ─────────────────────────────────────────────────────────
function PredictionCard({
  prediction, index, onRegenerate, onRate, rating,
}: {
  prediction: Prediction;
  index?: number;
  onRegenerate?: () => void;
  onRate?: (r: "up" | "down") => void;
  rating?: "up" | "down";
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { match, league, date, market, odds, confidence, reasoning } = prediction;

  const level =
    confidence >= 80 ? "emerald" :
    confidence >= 65 ? "amber" :
    confidence >= 50 ? "orange" : "red";

  const palette = {
    emerald: { strip: "bg-emerald-500", bar: "from-emerald-400 to-emerald-600", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    amber:   { strip: "bg-amber-500",   bar: "from-amber-400 to-amber-600",     text: "text-amber-600",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
    orange:  { strip: "bg-orange-500",  bar: "from-orange-400 to-orange-600",   text: "text-orange-600",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
    red:     { strip: "bg-red-500",     bar: "from-red-400 to-red-600",         text: "text-red-600",     badge: "bg-red-50 text-red-700 border-red-200" },
  }[level];

  const copy = async () => {
    const text =
      `⚽ ${match}\n` +
      `🏆 ${league} · ${date}\n` +
      `📊 ${t("prediction.pick")}: ${market} · ${t("prediction.odds")} ${odds.toFixed(2)} · ${t("prediction.confidence")} ${confidence}%\n\n` +
      `💡 ${reasoning}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${palette.strip}`} />
      <div className="pl-4 pr-3 sm:pl-5 sm:pr-4 py-3 sm:py-4">

        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {index !== undefined && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-foreground text-background text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
            )}
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded-md border ${palette.badge}`}>
              {league}
            </span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground mr-1">
              <Calendar size={10} />
              <span>{date}</span>
            </div>
            <IconBtn onClick={copy} title={t("prediction.copy")}>
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </IconBtn>
            {onRegenerate && (
              <IconBtn onClick={onRegenerate} title={t("prediction.regenerate")}>
                <RefreshCw size={13} />
              </IconBtn>
            )}
            {onRate && (
              <>
                <IconBtn onClick={() => onRate("up")} title={t("prediction.good")} active={rating === "up"} activeClass="bg-emerald-100 text-emerald-700">
                  <ThumbsUp size={13} />
                </IconBtn>
                <IconBtn onClick={() => onRate("down")} title={t("prediction.bad")} active={rating === "down"} activeClass="bg-red-100 text-red-600">
                  <ThumbsDown size={13} />
                </IconBtn>
              </>
            )}
          </div>
        </div>

        <h3 className="text-sm sm:text-[15px] font-semibold text-foreground leading-snug mb-1">{match}</h3>
        <div className="sm:hidden flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
          <Calendar size={10} />
          <span>{date}</span>
        </div>

        <div className="flex items-stretch gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-medium mb-1">{t("prediction.pick")}</div>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-foreground text-background text-[11px] sm:text-xs font-semibold">
                <Target size={10} />
                {market}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-medium">{t("prediction.confidence")}</span>
                <span className={`text-[11px] sm:text-xs font-bold ${palette.text}`}>{confidence}%</span>
              </div>
              <div className="h-1 sm:h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${palette.bar} transition-all duration-700`} style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center px-2.5 sm:px-4 rounded-xl bg-muted/50 border border-border min-w-[64px] sm:min-w-[88px]">
            <div className="text-[8px] sm:text-[9px] uppercase text-muted-foreground font-medium mb-0.5">{t("prediction.odds")}</div>
            <div className="text-lg sm:text-2xl font-bold text-foreground tabular-nums leading-none">{odds.toFixed(2)}</div>
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between mt-2 sm:mt-3 py-1.5 text-[10px] sm:text-[11px] text-muted-foreground hover:text-foreground transition"
        >
          <span className="font-medium">{t("prediction.why")}</span>
          <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-2.5 sm:p-3 mt-1 border border-border">
            {reasoning}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  onClick, title, children, active, activeClass,
}: {
  onClick: () => void; title: string; children: React.ReactNode;
  active?: boolean; activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition
        ${active && activeClass ? activeClass : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Background
// ─────────────────────────────────────────────────────────
function InteractiveDotPattern({ className }: { className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <svg ref={svgRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <defs>
        <pattern id="dot-pattern-full" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
        <radialGradient id="spotlight-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="spotlight-mask">
          <circle cx={mousePos.x} cy={mousePos.y} r="80" fill="url(#spotlight-gradient)" />
          <circle cx="50%" cy="50%" r="220" fill="url(#spotlight-gradient)" opacity="0.5" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern-full)" mask="url(#spotlight-mask)" className="text-muted-foreground/40" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// Inner component
// ─────────────────────────────────────────────────────────
function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { isTelegram, tg, user: tgUser, haptic } = useTelegram();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orbState, setOrbState] = useState<AgentState>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pinned, setPinned] = useState<PredictionHistoryItem | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sentPromptRef = useRef<string | null>(null);

  const displayName = tgUser?.first_name?.trim() || "Player";
  const displayInitials =
    ((tgUser?.first_name?.[0] || "") + (tgUser?.last_name?.[0] || "")).toUpperCase() || "P";

  const placeholder = useTypingPlaceholder([
    t("input.placeholder1"),
    t("input.placeholder2"),
    t("input.placeholder3"),
  ]);

  const quickPrompts = [
    { text: t("prompt.today"), icon: CornerDownRight },
    { text: t("prompt.top5"), icon: CornerDownRight },
    { text: t("prompt.epl"), icon: CornerDownRight },
    { text: t("prompt.risk"), icon: CornerDownRight },
  ];

  // Восстановление
  useEffect(() => {
    const saved = loadMessages();
    if (saved.length > 0) {
      setMessages(saved as Message[]);
    }
    const lastPrompt = getLastPrompt();
    if (lastPrompt) {
      sentPromptRef.current = lastPrompt;
    }
    setHydrated(true);
  }, []);

  // Сохранение
  useEffect(() => {
    if (!hydrated) return;
    if (messages.some((m) => m.streaming)) return;
    saveMessages(messages as ChatMessage[]);
  }, [messages, hydrated]);

  // Автоскролл
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Telegram BackButton — появляется, когда есть активный чат
  useEffect(() => {
    if (!isTelegram || !tg?.BackButton) return;

    const handleBack = () => {
      haptic?.("light");
      if (messages.length > 0) {
        // сброс текущего чата
        setMessages([]);
        setPinned(null);
        sentPromptRef.current = null;
        clearMessages();
        clearLastPrompt();
        router.replace("/chat");
      } else {
        tg.close?.();
      }
    };

    if (messages.length > 0) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.BackButton?.offClick(handleBack);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTelegram, tg, messages.length]);

  // handleSend
  const handleSend = async (prompt?: string, imageOverride?: string) => {
    haptic?.("medium");

    const textToSend = prompt ?? input;
    const img = imageOverride ?? pendingImage ?? undefined;

    if ((!textToSend.trim() && !img) || isLoading) return;

    if (textToSend.trim()) {
      sentPromptRef.current = textToSend.trim();
      saveLastPrompt(textToSend.trim());
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: textToSend || "📎 Image analysis",
      imageUrl: img,
      timestamp: nowTime(),
    };
    const history = messages;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);
    setOrbState("talking");

    const aiId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: aiId, role: "ai", content: "", streaming: true, timestamp: nowTime() },
    ]);

    try {
      const result = await streamAgentReply(history, textToSend, img, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: m.content + chunk } : m))
        );
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? {
                ...m,
                content: result.content,
                prediction: result.prediction,
                predictions: result.predictions,
                streaming: false,
              }
            : m
        )
      );

      // Успешное завершение — лёгкая вибрация
      haptic?.("light");

      if (result.prediction) {
        addPrediction({
          match: result.prediction.match,
          league: result.prediction.league,
          date: result.prediction.date,
          market: result.prediction.market,
          odds: result.prediction.odds,
          confidence: result.prediction.confidence,
          reasoning: result.prediction.reasoning,
        });
      }
      if (result.predictions?.length) {
        result.predictions.forEach((p) =>
          addPrediction({
            match: p.match,
            league: p.league,
            date: p.date,
            market: p.market,
            odds: p.odds,
            confidence: p.confidence,
            reasoning: p.reasoning,
          })
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("error.failed");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: `⚠️ ${msg}`, streaming: false } : m
        )
      );
    } finally {
      setIsLoading(false);
      setOrbState(null);
    }
  };

  // URL: prompt + pinned
  useEffect(() => {
    if (!hydrated) return;

    const prompt = searchParams.get("prompt");
    const pinnedId = searchParams.get("pinned");

    if (pinnedId) {
      const found = loadHistory().find((p) => p.id === pinnedId);
      if (found) setPinned(found);
    } else {
      setPinned(null);
    }

    if (prompt && sentPromptRef.current !== prompt) {
      sentPromptRef.current = prompt;
      saveLastPrompt(prompt);

      setMessages([]);
      clearMessages();

      const timer = setTimeout(() => {
        handleSend(prompt);
      }, 250);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hydrated]);

  // misc
  const handleFile = async (file: File) => {
    haptic?.("light");
    if (!file.type.startsWith("image/")) return alert(t("error.imagesOnly"));
    if (file.size > 15 * 1024 * 1024) return alert(t("error.maxSize"));
    try {
      const compressed = await compressImage(file);
      setPendingImage(compressed);
    } catch {
      alert(t("error.imageProcess"));
    }
  };

  const regenerate = (id: number) => {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx <= 0) return;
    const prevUser = [...messages.slice(0, idx)].reverse().find((m) => m.role === "user");
    if (!prevUser) return;
    setMessages((m) => m.filter((x) => x.id !== id));
    handleSend(prevUser.content, prevUser.imageUrl);
  };

  const rate = (id: number, r: "up" | "down") => {
    haptic?.("light");
    setMessages((m) =>
      m.map((x) => (x.id === id ? { ...x, rating: x.rating === r ? undefined : r } : x))
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFile(f);
  };

  const handleNewChat = () => {
    haptic?.("light");
    setMessages([]);
    setPinned(null);
    sentPromptRef.current = null;
    clearMessages();
    clearLastPrompt();
    router.replace("/chat");
  };

  // inputBox
  const inputBox = (
    <div className="w-full rounded-2xl bg-card/80 shadow-2xl backdrop-blur-md border border-border/50">
      {pendingImage && (
        <div className="flex items-center gap-2 sm:gap-3 border-b border-border p-2 sm:p-3">
          <img src={pendingImage} alt="preview" className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover border border-border" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-medium">{t("input.imageReady")}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t("input.imageHint")}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" onClick={() => setPendingImage(null)}>
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        rows={2}
        className="min-h-[48px] sm:min-h-[60px] w-full resize-none border-none bg-transparent p-3 sm:p-4 text-sm sm:text-base outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between gap-2 px-2 sm:px-4 pb-2 sm:pb-4 pt-1">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <ImagePicker
            onPick={(file) => handleFile(file)}
            disabled={isLoading}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 rounded-full px-2 text-xs shrink-0">
                <Zap className="w-3.5 h-3.5 text-[#e72930]" />
                <span className="font-medium hidden xs:inline sm:inline">{t("input.auto")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>{t("input.mode")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Zap className="mr-2 h-4 w-4 text-[#e72930]" />
                {t("input.mode.fast")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bot className="mr-2 h-4 w-4" />
                {t("input.mode.deep")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 rounded-full px-2 text-xs hidden sm:flex shrink-0"
            onClick={() => router.push("/trading/ai-settings")}
          >
            <Settings className="w-3.5 h-3.5 text-[#e72930]" />
            <span>{t("nav.settings")}</span>
          </Button>
        </div>

        <Button
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#e72930] hover:bg-[#c4212a] text-white shrink-0"
          onClick={() => handleSend()}
          disabled={isLoading || (!input.trim() && !pendingImage)}
        >
          {isLoading ? (
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-white animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:0.3s]" />
            </div>
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: tgUser?.id?.toString() || "guest",
          name: displayName,
          email: tgUser?.username ? `@${tgUser.username}` : "",
        }}
        onLogout={() => {
          tg?.close?.();
        }}
      />
      <SidebarInset className="overflow-hidden flex flex-col">

        {/* TOP HEADER */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/app">{t("nav.dashboard")}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{t("nav.chat")}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-muted-foreground hidden md:block">
              {t("nav.welcome")}, <span className="font-medium text-foreground">{displayName}</span>
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* CHAT AREA */}
        <div
          className="relative flex flex-col overflow-hidden flex-1 min-h-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {messages.length === 0 && <InteractiveDotPattern />}

          {dragOver && (
            <div className="absolute inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="bg-card rounded-3xl px-10 py-8 shadow-2xl border-2 border-dashed border-border">
                <div className="text-4xl mb-2 text-center">📸</div>
                <p className="text-foreground font-semibold text-center">{t("drag.title")}</p>
                <p className="text-muted-foreground text-xs mt-1 text-center">{t("drag.subtitle")}</p>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            // EMPTY STATE
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 sm:px-4">
              <div className="flex w-full max-w-3xl flex-col items-center justify-center">
                <div className="mb-4 sm:mb-6 flex flex-col items-center">
                  <div className="relative h-20 w-20 sm:h-28 sm:w-28">
                    <div className="bg-muted/30 h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                      <div className="bg-background/80 h-full w-full overflow-hidden rounded-full backdrop-blur-sm">
                        <Orb colors={["#e72930", "#ff6b6b"]} seed={1000} agentState={orbState} />
                      </div>
                    </div>
                  </div>
                  <h1 className="mt-3 sm:mt-4 text-xl sm:text-3xl font-bold uppercase tracking-wide text-center">
                    {t("empty.title")}
                  </h1>
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground text-center">
                    {t("empty.subtitle")}
                  </p>
                </div>

                <div className="w-full rounded-t-2xl bg-card p-2 sm:p-3 shadow-2xl backdrop-blur-md">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {quickPrompts.map((p) => (
                      <Button
                        key={p.text}
                        variant="outline"
                        size="sm"
                        className="h-7 sm:h-8 gap-1 sm:gap-1.5 rounded-full border-border/50 bg-background/50 px-2.5 sm:px-3 text-[10px] sm:text-xs backdrop-blur-sm hover:border-[#e72930]/40 hover:bg-[#e72930]/5"
                        onClick={() => handleSend(p.text)}
                      >
                        <p.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {p.text}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="w-full pb-3 pt-2 safe-bottom">
                  {inputBox}
                </div>
              </div>
            </div>
          ) : (
            // CHAT MODE
            <div className="relative z-10 flex flex-1 flex-col min-h-0">

              {/* FIXED HEADER */}
              <div className="w-full shrink-0 pt-3 sm:pt-4 pb-2 sm:pb-3 px-3 sm:px-4 border-b bg-background/80 backdrop-blur-md z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                      <div className="bg-muted/30 h-full w-full rounded-full p-1">
                        <div className="bg-background/80 h-full w-full overflow-hidden rounded-full">
                          <Orb colors={["#e72930", "#ff6b6b"]} seed={1000} agentState={orbState} />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold truncate">{t("chat.title")}</h2>
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 inline-block" />
                        {isLoading ? t("chat.analyzing") : t("chat.online")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={handleNewChat} className="h-8 text-xs sm:text-sm px-2 sm:px-3">
                      <Plus className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">{t("nav.newChat")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push("/trading/ai-settings")}
                      className="h-8 w-8 sm:w-auto sm:px-3 sm:gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">{t("nav.settings")}</span>
                    </Button>
                  </div>
                </div>

                {/* PINNED */}
                {pinned && (
                  <div className="max-w-3xl mx-auto pt-2 sm:pt-3">
                    <div className="rounded-lg sm:rounded-xl border border-[#e72930]/30 bg-[#e72930]/5 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#e72930]/15 flex items-center justify-center shrink-0">
                        <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e72930]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#e72930] font-bold block truncate">
                          {t("pinned.label")} · {pinned.league}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold truncate mt-0.5">
                          {pinned.match}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                          <span className="truncate">{pinned.market}</span>
                          <span>·</span>
                          <span className="font-mono">@{pinned.odds.toFixed(2)}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline text-emerald-600 font-semibold">
                            {pinned.confidence}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPinned(null)}
                        className="w-7 h-7 rounded-lg hover:bg-[#e72930]/10 flex items-center justify-center text-muted-foreground hover:text-[#e72930] transition shrink-0"
                        aria-label="Unpin"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SCROLLABLE MESSAGES */}
              <div className="flex-1 w-full overflow-y-auto py-4 sm:py-6 px-3 sm:px-4 min-h-0">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "ai" && (
                        <div className="relative h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0">
                          <div className="bg-muted/30 h-full w-full rounded-full p-[2px]">
                            <div className="bg-background/80 h-full w-full overflow-hidden rounded-full">
                              <Orb colors={["#e72930", "#ff6b6b"]} seed={1000} agentState={null} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col gap-2 max-w-[88%] sm:max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="upload"
                            className="rounded-2xl border border-border max-w-[240px] sm:max-w-xs shadow-md"
                          />
                        )}

                        {(message.content || message.streaming) && (
                          <div
                            className={`text-[13px] sm:text-sm whitespace-pre-wrap leading-relaxed
                              ${message.role === "user"
                                ? "px-1 py-1 text-foreground text-right"
                                : "p-3 rounded-2xl bg-card border border-border/50 shadow-sm"}`}
                          >
                            {message.content}
                            {message.streaming && (
                              <span className="inline-block w-1.5 h-4 bg-muted-foreground/60 ml-0.5 align-middle animate-pulse" />
                            )}
                          </div>
                        )}

                        {message.prediction && (
                          <PredictionCard
                            prediction={message.prediction}
                            onRegenerate={() => regenerate(message.id)}
                            onRate={(r) => rate(message.id, r)}
                            rating={message.rating}
                          />
                        )}

                        {message.predictions && message.predictions.length > 0 && (
                          <div className="w-full space-y-2 sm:space-y-3">
                            {message.predictions.map((p, i) => (
                              <PredictionCard key={i} prediction={p} index={i} />
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-[10px] sm:text-xs">
                            {displayInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  <div ref={bottomRef} />

                  {isLoading && !messages.some((m) => m.role === "ai" && m.content) && (
                    <div className="flex gap-2 sm:gap-3">
                      <div className="relative h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0">
                        <div className="bg-muted/30 h-full w-full rounded-full p-[2px]">
                          <div className="bg-background/80 h-full w-full overflow-hidden rounded-full">
                            <Orb colors={["#e72930", "#ff6b6b"]} seed={1000} agentState="talking" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center bg-muted p-3 rounded-2xl">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FIXED INPUT */}
              <div className="w-full shrink-0 px-3 sm:px-4 pt-2 bg-gradient-to-t from-background via-background to-transparent safe-bottom">
                <div className="max-w-3xl mx-auto pb-3 sm:pb-4">
                  {inputBox}
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─────────────────────────────────────────────────────────
// Export with Suspense
// ─────────────────────────────────────────────────────────
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}