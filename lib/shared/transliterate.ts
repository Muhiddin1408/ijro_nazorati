// Uzbek Latin → Cyrillic transliteration (pure; shared by UI and tests).
const protectedLatin =
  /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/\S+|\b(?:Excel[’'ʻ]?|Telegram|ChatGPT|BotFather|OpenAI|GitHub|OAuth|API|HTTPS?|URL|Node\.js|TypeScript|React|Cloudflare|D1|R2)\b)/gi;

export function latinToCyrillic(value: string) {
  const protectedParts: string[] = [];
  let text = value.replace(protectedLatin, (match) => {
    protectedParts.push(match);
    return `\uE000${protectedParts.length - 1}\uE001`;
  });

  text = text
    .replace(/O[‘’'ʻ`]/g, "Ў")
    .replace(/o[‘’'ʻ`]/g, "ў")
    .replace(/G[‘’'ʻ`]/g, "Ғ")
    .replace(/g[‘’'ʻ`]/g, "ғ")
    .replace(/SH/g, "Ш")
    .replace(/Sh/g, "Ш")
    .replace(/sh/g, "ш")
    .replace(/CH/g, "Ч")
    .replace(/Ch/g, "Ч")
    .replace(/ch/g, "ч")
    .replace(/YO/g, "Ё")
    .replace(/Yo/g, "Ё")
    .replace(/yo/g, "ё")
    .replace(/YU/g, "Ю")
    .replace(/Yu/g, "Ю")
    .replace(/yu/g, "ю")
    .replace(/YA/g, "Я")
    .replace(/Ya/g, "Я")
    .replace(/ya/g, "я")
    .replace(/YE/g, "Е")
    .replace(/Ye/g, "Е")
    .replace(/ye/g, "е")
    .replace(/TS/g, "Ц")
    .replace(/Ts/g, "Ц")
    .replace(/ts/g, "ц");

  const map: Record<string, string> = {
    A: "А",
    a: "а",
    B: "Б",
    b: "б",
    D: "Д",
    d: "д",
    F: "Ф",
    f: "ф",
    G: "Г",
    g: "г",
    H: "Ҳ",
    h: "ҳ",
    I: "И",
    i: "и",
    J: "Ж",
    j: "ж",
    K: "К",
    k: "к",
    L: "Л",
    l: "л",
    M: "М",
    m: "м",
    N: "Н",
    n: "н",
    O: "О",
    o: "о",
    P: "П",
    p: "п",
    Q: "Қ",
    q: "қ",
    R: "Р",
    r: "р",
    S: "С",
    s: "с",
    T: "Т",
    t: "т",
    U: "У",
    u: "у",
    V: "В",
    v: "в",
    W: "В",
    w: "в",
    X: "Х",
    x: "х",
    Y: "Й",
    y: "й",
    Z: "З",
    z: "з",
    C: "С",
    c: "с",
  };
  let output = "";
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "E" || character === "e") {
      const previous = text[index - 1] ?? "";
      const startsWord = index === 0 || /[\s([{"“”‘’—–-]/.test(previous);
      output += character === "E" ? (startsWord ? "Э" : "Е") : startsWord ? "э" : "е";
    } else if (/[‘’'ʻ`]/.test(character)) {
      output += "ъ";
    } else {
      output += map[character] ?? character;
    }
  }

  return output.replace(/\uE000(\d+)\uE001/g, (_, index: string) => protectedParts[Number(index)] ?? "");
}
