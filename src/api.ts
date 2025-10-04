import type { ApiResponse } from "./types";


const API_URL = "https://rickandmortyapi.com/api/character" as const;


export class ApiError extends Error {
constructor(message: string, public status?: number) { super(message); }
}


export async function fetchCharacters(query: string, page: number, signal?: AbortSignal): Promise<ApiResponse> {
const url = new URL(API_URL);
if (query) url.searchParams.set("name", query);
url.searchParams.set("page", String(page));


const res = await fetch(url, { signal });


// API zwraca 404 bez wyników 
if (res.status === 404) {
return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
}


if (!res.ok) {
throw new ApiError(`Błąd API (${res.status})`, res.status);
}


const data = (await res.json()) as ApiResponse;
return data;
}