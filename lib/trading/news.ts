const BYBIT_BASE =
  process.env.BYBIT_BASE_URL?.replace(/\/$/, "") || "https://api.bybit.com";

export interface NewsItem {
  source: string;
  title: string;
  url?: string;
  publishedAt?: string;
  summary?: string;
  tags?: string[];
}

async function fetchBybitAnnouncements(): Promise<NewsItem[]> {
  const url = new URL(`${BYBIT_BASE}/v5/announcements/index`);
  url.searchParams.set("locale", "en-US");
  url.searchParams.set("limit", "12");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const body = await res.json();
  const list = body?.result?.list || [];
  return list.map((item: Record<string, unknown>) => {
    const type = item.type as { title?: string } | undefined;
    return {
      source: "bybit-announcement",
      title: String(item.title || ""),
      url: item.url ? String(item.url) : undefined,
      publishedAt: item.publishTime
        ? new Date(Number(item.publishTime)).toISOString()
        : undefined,
      summary: String(item.description || item.title || ""),
      tags: type?.title ? [type.title] : undefined,
    };
  });
}

async function fetchRssNews(): Promise<NewsItem[]> {
  const feeds = [
    { source: "cointelegraph", url: "https://cointelegraph.com/rss" },
    { source: "coindesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  ];
  const items: NewsItem[] = [];
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        cache: "no-store",
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const blocks = xml.split("<item").slice(1, 9);
      for (const block of blocks) {
        const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
        const heading = (titleMatch?.[1] || titleMatch?.[2] || "").replace(/<[^>]+>/g, "").trim();
        if (!heading) continue;
        items.push({
          source: feed.source,
          title: heading,
          url: (linkMatch?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
          publishedAt: dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : undefined,
          summary: (descMatch?.[1] || descMatch?.[2] || "").replace(/<[^>]+>/g, "").slice(0, 400),
        });
      }
    } catch {
      /* optional source */
    }
  }
  return items;
}

async function fetchCryptoCompareNews(query?: string): Promise<NewsItem[]> {
  const url = new URL("https://min-api.cryptocompare.com/data/v2/news/");
  url.searchParams.set("lang", "EN");
  if (query) url.searchParams.set("categories", query.toUpperCase());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const body = await res.json();
  const list = Array.isArray(body?.Data) ? body.Data : [];
  return list.slice(0, 15).map((item: Record<string, unknown>) => {
    const sourceInfo = item.source_info as { name?: string } | undefined;
    return {
      source: String(sourceInfo?.name || item.source || "cryptocompare"),
      title: String(item.title || ""),
      url: item.url ? String(item.url) : undefined,
      publishedAt: item.published_on
        ? new Date(Number(item.published_on) * 1000).toISOString()
        : undefined,
      summary: item.body ? String(item.body).slice(0, 400) : undefined,
      tags: Array.isArray(item.categories)
        ? (item.categories as string[])
        : String(item.categories || "")
            .split("|")
            .filter(Boolean),
    };
  });
}

function relevanceScore(item: NewsItem, query?: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const hay = `${item.title} ${item.summary || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
  return hay.includes(q) ? 3 : hay.split(/\s+/).some((w) => q.includes(w)) ? 2 : 0;
}

export async function getMarketNews(query?: string): Promise<{
  fetchedAt: string;
  query?: string;
  items: NewsItem[];
}> {
  const [announcements, headlines, rss] = await Promise.all([
    fetchBybitAnnouncements().catch(() => [] as NewsItem[]),
    fetchCryptoCompareNews(query).catch(() => [] as NewsItem[]),
    fetchRssNews().catch(() => [] as NewsItem[]),
  ]);

  const merged = [...announcements, ...headlines, ...rss]
    .filter((item) => item.title)
    .sort((a, b) => {
      const score = relevanceScore(b, query) - relevanceScore(a, query);
      if (score !== 0) return score;
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    })
    .slice(0, 20);

  return {
    fetchedAt: new Date().toISOString(),
    query,
    items: merged,
  };
}
