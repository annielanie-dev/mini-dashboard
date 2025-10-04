/** Tworzy okno stron z elipsami: np. 1 … 4 5 [6] 7 8 … 20 */
export function buildPageWindow(current: number, total: number, span = 2): (number | "…")[] {
if (total <= 1) return [1];
const pages = new Set<number>();
const push = (n: number) => { if (n >= 1 && n <= total) pages.add(n); };


// stałe brzegi
[1, 2, total - 1, total].forEach(push);
// okno wokół bieżącej
for (let i = current - span; i <= current + span; i++) push(i);


const sorted = Array.from(pages).sort((a, b) => a - b);
const out: (number | "…")[] = [];
for (let i = 0; i < sorted.length; i++) {
out.push(sorted[i]);
if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
}
return out;
}