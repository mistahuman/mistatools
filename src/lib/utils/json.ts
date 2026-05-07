// NOTE: serializeNode / parseXML use browser DOM APIs (DOMParser, XMLSerializer).
// Only import this file from pages with `export const ssr = false`.

export type Lang = 'json' | 'xml';

export type FormatResult =
	| { ok: true; output: string; lang: Lang }
	| { ok: false; error: string; lang: Lang };

function serializeNode(node: Node, depth: number): string {
	const pad = '  '.repeat(depth);
	if (node.nodeType === Node.DOCUMENT_NODE)
		return Array.from(node.childNodes)
			.map((n) => serializeNode(n, depth))
			.filter(Boolean)
			.join('\n');
	if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
		const pi = node as ProcessingInstruction;
		return `${pad}<?${pi.target} ${pi.data}?>`;
	}
	if (node.nodeType === Node.TEXT_NODE) {
		const t = node.textContent?.trim() ?? '';
		return t ? `${pad}${t}` : '';
	}
	if (node.nodeType === Node.ELEMENT_NODE) {
		const el = node as Element;
		const attrs = Array.from(el.attributes)
			.map((a) => ` ${a.name}="${a.value}"`)
			.join('');
		const tag = el.tagName;
		const kids = Array.from(el.childNodes);
		if (kids.length === 0) return `${pad}<${tag}${attrs}/>`;
		if (kids.length === 1 && kids[0].nodeType === Node.TEXT_NODE) {
			const t = kids[0].textContent?.trim() ?? '';
			if (!t) return `${pad}<${tag}${attrs}/>`;
			return `${pad}<${tag}${attrs}>${t}</${tag}>`;
		}
		const inner = kids
			.map((n) => serializeNode(n, depth + 1))
			.filter(Boolean)
			.join('\n');
		return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
	}
	return '';
}

export function formatText(input: string, pretty: boolean): FormatResult {
	const s = input.trim();
	if (!s) return { ok: true, output: '', lang: 'json' };

	if (s.startsWith('<')) {
		try {
			const doc = new DOMParser().parseFromString(s, 'text/xml');
			const err = doc.querySelector('parsererror');
			if (err) throw new Error(err.textContent?.split('\n')[0] ?? 'Invalid XML');
			const output = pretty
				? serializeNode(doc, 0)
				: new XMLSerializer().serializeToString(doc).replace(/>\s+</g, '><').trim();
			return { ok: true, output, lang: 'xml' };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Invalid XML', lang: 'xml' };
		}
	}

	try {
		const parsed = JSON.parse(s);
		return {
			ok: true,
			output: pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed),
			lang: 'json'
		};
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON', lang: 'json' };
	}
}
