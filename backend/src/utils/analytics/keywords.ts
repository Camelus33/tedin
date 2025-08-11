import KO_STOPWORDS from './koStopwords';
import EN_STOPWORDS from './enStopwords';

function sanitize(text: string): string {
  return (text || '')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ' ')
    .replace(/#[\w가-힣]+/g, ' ')
    .replace(/[^A-Za-z0-9가-힣\s]/g, ' ')
    .toLowerCase();
}

function tokenize(text: string): string[] {
  const s = sanitize(text);
  const tokens = s.split(/\s+/).filter(Boolean);
  return tokens.filter(t => {
    const isKo = /[가-힣]/.test(t);
    const isEn = /[a-z]/.test(t);
    if (isKo && t.length < 2) return false;
    if (isEn && t.length < 3) return false;
    if (KO_STOPWORDS.has(t) || EN_STOPWORDS.has(t)) return false;
    if (/^\d+$/.test(t)) return false;
    return true;
  });
}

export function topTerms(
  documents: string[],
  topK: number = 5
): Array<{ term: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const doc of documents) {
    for (const tok of tokenize(doc)) {
      counts[tok] = (counts[tok] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, Math.min(10, topK)))
    .map(([term, count]) => ({ term, count }));
}


