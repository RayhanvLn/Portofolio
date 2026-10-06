/** "Always *experimenting*" → [{ text: 'Always ', accent: false }, { text: 'experimenting', accent: true }] */
export function parseAccent(line: string) {
  const out: Array<{ text: string; accent: boolean }> = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), accent: false });
    out.push({ text: m[1], accent: true });
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ text: line.slice(last), accent: false });
  return out;
}

/**
 * An accent-marked line split into words for word-by-word animation. Each word is
 * a list of pieces (plain / accent). Punctuation written right after a word
 * ("with cool *things*.") stays in that word, so it can never wrap onto a line of its own.
 */
export function accentWords(line: string) {
  const words: Array<Array<{ text: string; accent: boolean }>> = [];
  let word: Array<{ text: string; accent: boolean }> | null = null;
  for (const seg of parseAccent(line)) {
    for (const part of seg.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        word = null;
        continue;
      }
      if (!word) {
        word = [];
        words.push(word);
      }
      word.push({ text: part, accent: seg.accent });
    }
  }
  return words;
}

/**
 * Splits closing punctuation (". , ! ? : ;" and closing quotes/brackets) off the end
 * of a word from accentWords(), so it can hang just past the word. A word that is
 * only punctuation is left as it is.
 */
export function splitHang(word: Array<{ text: string; accent: boolean }>) {
  const last = word[word.length - 1];
  const m = last?.text.match(/^(.*?)([.,!?:;\u2026'"\u2019\u201D)\]]+)$/);
  if (!last || !m || (!m[1] && word.length === 1)) return { body: word, hang: null };
  const body = m[1] ? [...word.slice(0, -1), { ...last, text: m[1] }] : word.slice(0, -1);
  return { body, hang: { ...last, text: m[2] } };
}

/** Text without the *accent* markers. */
export const stripAccent = (line: string) => line.replace(/\*/g, '');

/**
 * Length class of a display title, used to scale oversized headings down
 * for long titles: 'short' ≤ 12 characters, 'medium' ≤ 22, otherwise 'long'.
 */
export function titleLength(title: string): 'short' | 'medium' | 'long' {
  const n = title.trim().length;
  if (n <= 12) return 'short';
  if (n <= 22) return 'medium';
  return 'long';
}

/**
 * Length class of a project description: short ones read best as a large statement,
 * long ones as a comfortable paragraph. 'short' ≤ 160 characters, 'medium' ≤ 360, otherwise 'long'.
 */
export function descriptionLength(text: string): 'short' | 'medium' | 'long' {
  const n = text.trim().length;
  if (n <= 160) return 'short';
  if (n <= 360) return 'medium';
  return 'long';
}

/** Paragraphs separated by a blank line ("\n\n") in a text field. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
