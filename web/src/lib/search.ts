export type SearchEntry = {
  type: string;
  group: string;
  title: string;
  subtitle: string;
  url: string;
  keywords: string;
};

export type SearchResult = SearchEntry & { score: number };

/** Map a few common latin keyboard letters to cyrillic for typo-tolerant search. */
const LAT_TO_CYR: Record<string, string> = {
  a: "а", b: "б", c: "с", e: "е", h: "н", k: "к", m: "м", o: "о",
  p: "р", t: "т", x: "х", y: "у",
};

export function normalize(input: string): string {
  let s = (input || "").toLowerCase().replace(/ё/g, "е").trim();
  // collapse whitespace
  s = s.replace(/\s+/g, " ");
  return s;
}

/** Secondary normalized form where stray latin lookalikes become cyrillic. */
function latinFold(input: string): string {
  return normalize(input)
    .split("")
    .map((ch) => LAT_TO_CYR[ch] ?? ch)
    .join("");
}

/** Does `needle` appear as an in-order subsequence of `haystack`? */
function isSubsequence(needle: string, haystack: string): boolean {
  if (!needle) return true;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (needle[i] === haystack[j]) i++;
  }
  return i === needle.length;
}

/** Score a single token against a normalized haystack; 0 = no match. */
function scoreToken(token: string, hayTitle: string, hayKeywords: string): number {
  if (!token) return 0;

  // Title matches are worth the most.
  if (hayTitle === token) return 100;
  if (hayTitle.startsWith(token)) return 80;
  // word-boundary start inside title
  if (new RegExp(`(^|\\s)${escapeRe(token)}`).test(hayTitle)) return 65;
  if (hayTitle.includes(token)) return 50;

  // Keyword field matches (substring only — never subsequence: the keywords
  // field concatenates long intro/description text, so a subsequence match
  // there turns almost any short query into a false positive).
  if (new RegExp(`(^|\\s)${escapeRe(token)}`).test(hayKeywords)) return 35;
  if (hayKeywords.includes(token)) return 25;

  // Fuzzy subsequence fallback for typos — restricted to short titles only
  // (a single concept), so it can't match arbitrary long strings.
  if (token.length >= 4 && hayTitle.length <= 32 && isSubsequence(token, hayTitle)) return 10;

  return 0;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchEntries(
  query: string,
  entries: SearchEntry[],
  limit = 24,
): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];
  const qFold = latinFold(query);
  const tokens = Array.from(new Set([...q.split(" "), ...qFold.split(" ")])).filter(Boolean);

  const results: SearchResult[] = [];
  for (const e of entries) {
    const title = normalize(e.title);
    const titleFold = latinFold(e.title);
    const keywords = normalize(e.keywords);
    const keywordsFold = latinFold(e.keywords);

    let total = 0;
    let allMatched = true;
    // Require every primary-query token to match somewhere (AND semantics).
    for (const token of q.split(" ").filter(Boolean)) {
      const best = Math.max(
        scoreToken(token, title, keywords),
        scoreToken(latinFold(token), titleFold, keywordsFold),
      );
      if (best === 0) {
        allMatched = false;
        break;
      }
      total += best;
    }
    if (!allMatched) continue;

    // Small boost for shorter titles (more specific) and exact full-query title hits.
    if (title === q) total += 50;
    if (title.startsWith(q)) total += 20;
    total += Math.max(0, 12 - title.length / 8);

    results.push({ ...e, score: total });
  }

  results.sort((a, b) => b.score - a.score || a.title.length - b.title.length);
  return results.slice(0, limit);
}

const GROUP_ORDER = [
  "Направления",
  "Услуги",
  "Цены",
  "Врачи",
  "Полезное",
  "Акции",
  "Отзывы",
];

export function groupResults(results: SearchResult[]): Array<{ group: string; items: SearchResult[] }> {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.group)) map.set(r.group, []);
    map.get(r.group)!.push(r);
  }
  const groups = Array.from(map.keys()).sort(
    (a, b) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    },
  );
  return groups.map((group) => ({ group, items: map.get(group)! }));
}
