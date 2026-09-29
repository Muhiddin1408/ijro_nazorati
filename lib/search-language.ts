const cyrillic: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "'", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};
const latin: Record<string, string> = { a: "а", b: "б", v: "в", g: "г", d: "д", e: "е", j: "ж", z: "з", i: "и", y: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", r: "р", s: "с", t: "т", u: "у", f: "ф", x: "х", q: "қ", h: "ҳ", "'": "ъ" };
export function normalizeSearch(value: string): string {
  return [...value.normalize("NFKC").toLowerCase().replace(/[‘’ʻʼ`´]/g, "'")]
    .map((character) => cyrillic[character] ?? character).join("").replace(/\s+/g, " ").trim();
}
function toCyrillic(value: string) {
  return value.replace(/yo'|o'|g'|sh|ch|yo|yu|ya|ts|[a-z']/g, (part) => ({ "yo'": "йў", "o'": "ў", "g'": "ғ", sh: "ш", ch: "ч", yo: "ё", yu: "ю", ya: "я", ts: "ц" }[part] ?? latin[part] ?? part));
}
const stopWords = new Set(["menga", "bizga", "top", "topib", "ber", "bering", "ko'rsat", "ko'rsating", "qidir", "qidiring", "qaysi", "qayer", "qayerda", "nima", "haqida", "bo'yicha", "uchun", "va", "yoki", "bilan", "ham", "bor", "bormi", "mavjud", "qancha", "nechta", "jami", "barcha", "hamma", "malumot", "ma'lumot", "iltimos", "hisobot", "yil", "kerak", "bo'lgan", "bo'ldi", "qanday", "tizim", "shu"]);
const synonyms = [
  ["oylik", "maosh", "ish haqi", "зарплата"], ["safar", "safarl", "komandirovka"],
  ["xorij", "xorijiy", "chet el"], ["budjet", "byudjet", "бюджет"],
  ["raqamlashtirish", "axborot tizim", "digital"], ["ilmiy", "tadqiqot", "research"],
  ["xodim", "kadr", "personal"], ["shartnoma", "kontrakt", "договор"],
  ["ta'mir", "tamir", "ta'mirlash", "ремонт"], ["xarajat", "sarf", "расход"],
];
function stem(word: string) {
  if (word.length < 6 || /\d/.test(word)) return word;
  const reduced = word.replace(/(?:lar(?:i(?:ning|ni|ga|da|dan)?|ning|ni|ga|da|dan)?|ning|dagi|dan|ni|ga|da)$/u, "");
  return reduced.length >= 3 ? reduced : word;
}
/** Only quoted literal terms reach MATCH; user text can never become FTS syntax. */
export function searchPlan(query: string) {
  const normalized = normalizeSearch(query).replace(/ish\s+haqi/g, "oylik");
  const published = /\b(tasdiqlangan|tasdiqlangani|nashr|yakunlangan|bajarilgan)\b/.test(normalized);
  const words = normalized.replace(/\b(tasdiqlangan|tasdiqlangani|nashr|yakunlangan|bajarilgan)\b/g, " ").match(/[\p{L}\p{N}]+(?:'[\p{L}]+)*/gu) ?? [];
  const terms = [...new Set(words.filter(word => !stopWords.has(word)).map(stem).filter(word => word.length >= 2 && !stopWords.has(word)))].slice(0, 10);
  const groups = terms.map(term => {
    const synonym = synonyms.find(group => group.some(word => normalizeSearch(word) === term));
    const variants = new Set((synonym ?? [term]).flatMap(word => { const normal = normalizeSearch(word); return [normal, toCyrillic(normal), ...(normal.startsWith("e") ? ["э" + toCyrillic(normal.slice(1))] : [])]; }));
    return `(${[...variants].map(word => `"${word.replaceAll('"', '""')}"*`).join(" OR ")})`;
  });
  return { terms, expression: groups.join(" AND "), published };
}

export function searchExcerpt(text: string, terms: string[], limit = 420) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const normalized = normalizeSearch(clean);
  const hits = terms.map(term => normalized.indexOf(term)).filter(index => index >= 0);
  // Transliteration changes offsets; return a safe sentence window, never HTML.
  const start = Math.max(0, (hits.length ? Math.min(...hits) : 0) - 70);
  const bounded = Math.min(start, clean.length - limit);
  return `${bounded ? "…" : ""}${clean.slice(bounded, bounded + limit)}…`;
}
