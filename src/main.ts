import { fetchCharacters, ApiError } from "./api";
import { buildPageWindow } from "./pagination";
import { debounce } from "./utils/debounce";
import type { Character } from "./types";
import "../style.css";


interface State { q: string; page: number }
let state: State = { q: "", page: 1 };
let controller: AbortController | null = null;

// --- DOM refs + mała asercja, żeby TS nie marudził ---
function assertEl<T extends Element>(el: T | null, id: string): T {
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}
const $input      = assertEl(document.getElementById("q") as HTMLInputElement | null, "q");
const $list       = assertEl(document.getElementById("list") as HTMLDivElement | null, "list");
const $pagination = assertEl(document.getElementById("pagination") as HTMLElement | null, "pagination");
const $status     = assertEl(document.getElementById("status") as HTMLElement | null, "status");
const $error      = assertEl(document.getElementById("error") as HTMLDivElement | null, "error");
const $offline    = assertEl(document.getElementById("offline") as HTMLElement | null, "offline");

// --- Init ---
initFromUrl();
render();

// --- Events ---
$input.addEventListener("input", debounce(onSearchInput, 300));
window.addEventListener("popstate", () => { initFromUrl(); render(); });
$pagination.addEventListener("click", onPaginationClick);
window.addEventListener("online", updateOfflineBanner);
window.addEventListener("offline", updateOfflineBanner);
updateOfflineBanner();

// --- URL <-> state ---
function initFromUrl(): void {
  const p = new URLSearchParams(location.search);
  const q = p.get("q") ?? "";
  const page = Math.max(1, parseInt(p.get("page") ?? "1", 10) || 1);
  state = { q, page };
  $input.value = q;
}

function pushUrl(): void {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.page > 1) p.set("page", String(state.page));
  history.pushState({}, "", `${location.pathname}?${p.toString()}`);
}

// --- Render ---
async function render(): Promise<void> {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  $list.innerHTML = skeletonCards(8);
  $error.classList.add("hidden");
  setStatus("Ładowanie…");

  try {
    const data = await fetchCharacters(state.q, state.page, signal);
    if (signal.aborted) return;

    renderList(data.results);
    renderPagination(data.info.pages, state.page);

    const txt = data.results.length
      ? `Znaleziono ${data.info.count.toLocaleString()} pozycji; strona ${state.page}/${data.info.pages || 1}`
      : "Brak wyników";
    setStatus(txt);

    (document.getElementById("results-heading") as HTMLElement | null)?.focus();
    document.title = state.q ? `Wyniki dla „${state.q}” — Mini-Dashboard` : "Mini-Dashboard";
  } catch (err) {
    if ((err as any)?.name === "AbortError") return;
    const e = err as ApiError;
    showError(e.message || "Coś poszło nie tak.");
  }
}

function setStatus(text: string): void {
  $status.textContent = text;
}

// --- Handlers ---
function onSearchInput(): void {
  state.page = 1;
  state.q = $input.value.trim();
  pushUrl();
  render();
}

function onPaginationClick(e: Event): void {
  const btn = (e.target as HTMLElement).closest("button[data-page]") as HTMLButtonElement | null;
  if (!btn) return;
  const page = parseInt(btn.dataset.page || "1", 10);
  if (Number.isNaN(page)) return;
  state.page = page;
  pushUrl();
  render();
}

// --- List + cards ---
function renderList(items: Character[]): void {
  if (!items.length) {
    $list.innerHTML = `<p style="color:var(--muted)">Nie znaleziono wyników dla „${escapeHtml(state.q)}”.</p>`;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const ch of items) frag.appendChild(card(ch));
  $list.replaceChildren(frag);
}

function card(ch: Character): HTMLElement {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="media">
      <img src="${ch.image}" alt="${escapeHtml(ch.name)}" loading="lazy" />
    </div>
    <div class="body">
      <h3>${escapeHtml(ch.name)}</h3>
      <p>${escapeHtml(ch.species)} • ${escapeHtml(ch.status)}</p>
      <p>Skąd: ${escapeHtml(ch.origin.name)} · Gdzie: ${escapeHtml(ch.location.name)}</p>
    </div>
  `;
  return el;
}

// --- Pagination ---
function renderPagination(totalPages: number, current: number): void {
  if (!totalPages || totalPages === 1) {
    $pagination.innerHTML = "";
    return;
  }
  const windowPages = buildPageWindow(current, totalPages, 2);
  const frag = document.createDocumentFragment();

  const prev = pageButton("◀ Poprzednia", current - 1);
  prev.disabled = current === 1;
  prev.setAttribute("aria-label", "Poprzednia strona");
  frag.appendChild(prev);

  for (const p of windowPages) {
    if (p === "…") {
      const span = document.createElement("span");
      span.className = "ellipsis";
      span.textContent = "…";
      frag.appendChild(span);
    } else {
      const btn = pageButton(String(p), p);
      if (p === current) btn.setAttribute("aria-current", "page");
      btn.setAttribute("aria-label", `Strona ${p}`);
      frag.appendChild(btn);
    }
  }

  const next = pageButton("Następna ▶", current + 1);
  next.disabled = current === totalPages;
  next.setAttribute("aria-label", "Następna strona");
  frag.appendChild(next);

  $pagination.replaceChildren(frag);
}

function pageButton(label: string, page: number): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "page-btn";
  btn.textContent = label;
  btn.dataset.page = String(page);
  return btn;
}

// --- UI helpers ---
function skeletonCards(n: number): string {
  return Array.from({ length: n }, () => `
    <article class="card">
      <div class="media skeleton"></div>
      <div class="body">
        <div class="skeleton" style="height:1.1rem; width:70%; border-radius:.4rem"></div>
        <div class="skeleton" style="height:.9rem; width:50%; margin-top:.5rem; border-radius:.4rem"></div>
        <div class="skeleton" style="height:.9rem; width:60%; margin-top:.4rem; border-radius:.4rem"></div>
      </div>
    </article>`).join("");
}

function showError(msg: string): void {
  setStatus("");
  $error.classList.remove("hidden");
  $error.innerHTML = `${escapeHtml(msg)} <button type="button" class="page-btn retry" id="retry">Spróbuj ponownie</button>`;
  (document.getElementById("retry") as HTMLButtonElement | null)
    ?.addEventListener("click", () => render());
}

function updateOfflineBanner(): void {
  $offline.classList.toggle("hidden", navigator.onLine);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>\"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as const
  )[c as "&" | "<" | ">" | '"' | "'"]);
}
