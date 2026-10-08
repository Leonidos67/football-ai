'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTelegram } from '@/components/telegram-provider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import { Instrument_Serif } from 'next/font/google';
import {
  FootballIcon, TargetIcon, ChartIcon,
  TrophyIcon, TicketIcon, CameraIcon, BrainIcon,
} from '@/components/animated-icons/football-icons';
import { useTranslation } from '@/lib/i18n';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
});

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const { tg, user: tgUser, haptic } = useTelegram();
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});

  const displayName = tgUser?.first_name?.trim() || 'Player';

  // 6 cards — football theme
  const actionItems = [
    {
      id: 'ask-ai',
      title: 'Ask AI',
      icon: BrainIcon,
      iconRef: { current: null as any },
      href: '/chat',
    },
    {
      id: 'top-picks',
      title: 'Top picks',
      icon: TrophyIcon,
      iconRef: { current: null as any },
      href: '/chat?prompt=give me top 5 matches today',
    },
    {
      id: 'express',
      title: 'Express builder',
      icon: TicketIcon,
      iconRef: { current: null as any },
      href: '/chat?prompt=build an express from top 3 predictions',
    },
    {
      id: 'screenshot',
      title: 'Analyze screenshot',
      icon: CameraIcon,
      iconRef: { current: null as any },
      href: '/chat?prompt=analyzing betting line screenshot',
    },
    {
      id: 'match-of-day',
      title: 'Match of the day',
      icon: FootballIcon,
      iconRef: { current: null as any },
      href: '/chat?prompt=give analysis for the match of the day',
    },
    {
      id: 'statistics',
      title: 'Statistics',
      icon: ChartIcon,
      iconRef: { current: null as any },
      href: '/trading/settings/usage',
    },
  ];

  const handleCardClick = (item: typeof actionItems[0]) => {
    haptic?.('medium');
    setLoadingCards((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setLoadingCards((prev) => ({ ...prev, [item.id]: false }));
      router.push(item.href);
    }, 400);
  };

  const handleLogout = () => {
    if (tg?.close) {
      tg.close();
    } else {
      try { localStorage.clear(); } catch {}
      window.location.reload();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good day';
    if (hour >= 18 && hour < 23) return 'Good evening';
    return 'Good night';
  };

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: tgUser?.id?.toString() || 'guest',
          name: displayName,
          email: tgUser?.username ? `@${tgUser.username}` : '',
        }}
        onLogout={handleLogout}
      />
      <SidebarInset className="overflow-hidden flex flex-col">
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
                  <BreadcrumbPage>Overview</BreadcrumbPage>
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

        <div className="flex flex-1 flex-col gap-4 p-4">

          {/* ROW 1: 6 cards + promo */}
          <div className="grid gap-2 md:grid-cols-7">

            {/* Left: 6 action cards */}
            <div className="md:col-span-4">
              <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                {actionItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      onMouseEnter={() => item.iconRef.current?.startAnimation?.()}
                      onMouseLeave={() => item.iconRef.current?.stopAnimation?.()}
                      className="aspect-video rounded-xl bg-card border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:bg-card/80 cursor-pointer group flex flex-col items-center justify-center gap-3 p-2 relative overflow-hidden"
                      disabled={loadingCards[item.id]}
                    >
                      {loadingCards[item.id] ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      ) : (
                        <>
                          <div className="p-2 rounded-xl transition-all group-hover:scale-90">
                            <IconComponent
                              ref={item.iconRef}
                              size={40}
                              className="text-primary"
                            />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-center leading-tight">
                            {item.title}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Promo block */}
            <div className="md:col-span-3">
              <div className="rounded-xl bg-gradient-to-r from-[#e72930]/10 to-[#e72930]/5 border border-[#e72930]/20 h-full relative overflow-hidden">
                <div className="flex gap-6 p-6 h-full">
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <span className={`${instrumentSerif.className} text-4xl font-bold text-[#e72930]`}>
                        100% Bonus
                      </span>
                      <h2 className={`${instrumentSerif.className} text-4xl mb-3 text-foreground`}>
                        on first deposit
                      </h2>
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-muted-foreground">
                          Up to $500 for new players
                          <br />
                          on 1win
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://lknt.pro/e88dbc"
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="px-6 py-2 rounded-md bg-[#e72930] text-white hover:bg-[#e72930]/80 cursor-pointer transition-colors text-sm font-medium self-start"
                    >
                      Claim bonus
                    </a>

                    <p className="text-[9px] text-muted-foreground mt-2">
                      18+ · Play responsibly
                    </p>
                  </div>

                  <div className="absolute bottom-0 right-0 pointer-events-none">
                    <div className="w-64 overflow-hidden rounded-lg" style={{ height: 'calc(100% - 20px)' }}>
                      <img
                        src="https://i.ibb.co/mrJ15MFV/image-Photoroom-6.png"
                        alt="Promo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Greeting */}
          <div className="flex gap-2 items-stretch">
            <h1 className="text-lg font-bold">
              {getGreeting()}, {displayName}
            </h1>
            <button
              onClick={() => router.push('/trading/settings/usage')}
              className="px-3 rounded-md border border-[#e72930]/30 text-[#e72930] hover:bg-[#e72930]/10 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Zap className="h-4 w-4" />
              <span>∞</span>
            </button>
          </div>

          {/* ROW 3: Recent predictions */}
          <div className="rounded-xl bg-card border border-border/50">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-medium">{t("side.predictions")}</span>
              <button
                onClick={() => router.push('/chat')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("side.openChat")} →
              </button>
            </div>
            <div className="flex items-center justify-center min-h-[240px]">
              <div className="text-center">
                <p className="text-md text-muted-foreground">{t("side.noPredictions")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <button
                    onClick={() => router.push('/chat')}
                    className="underline hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t("side.askFirst")}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}