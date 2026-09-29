/** Random positive 48-bit integer id (fits a JS number and an SQLite INTEGER). */
export function random48BitId() {
  const words = crypto.getRandomValues(new Uint32Array(2));
  return Math.max(1, (words[0] & 0xffff) * 0x1_0000_0000 + words[1]);
}
