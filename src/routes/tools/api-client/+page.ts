// Tool pages are client-side only — they rely on browser APIs (clipboard, DOMParser, fetch)
// and the shared pipeline store, neither of which work during SSR.
export const ssr = false;
export const prerender = false;
