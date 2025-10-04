export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
let t: number | undefined;
return (...args: Parameters<T>) => {
window.clearTimeout(t);
t = window.setTimeout(() => fn(...args), wait);
};
}