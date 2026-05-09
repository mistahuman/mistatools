<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { pipeline } from '$lib/stores/pipeline.svelte';

	let { children } = $props();

	const toolLinks = [
		{ href: resolve('/tools/notes'), label: 'Notes' },
		{ href: resolve('/tools/api-client'), label: 'API Client' },
		{ href: resolve('/tools/formatter'), label: 'Formatter' },
		{ href: resolve('/tools/differ'), label: 'Differ' },
		{ href: resolve('/tools/editor'), label: 'Editor' }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	function relativeTime(ts: number): string {
		const diff = Math.floor((Date.now() - ts) / 1000);
		if (diff < 60) return `${diff}s ago`;
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		return `${Math.floor(diff / 3600)}h ago`;
	}
</script>

<div class="min-h-full">
	<nav
		class="sticky top-[70px] z-40 border-b border-surface-200-800 bg-surface-50-950/95 backdrop-blur"
	>
		<div class="container mx-auto flex items-center gap-1 overflow-x-auto px-4 py-2">
			{#each toolLinks as link (link.href)}
				<a
					href={link.href}
					class="btn btn-sm shrink-0 {isActive(link.href)
						? 'preset-tonal-primary'
						: 'hover:preset-tonal'}"
				>
					{link.label}
				</a>
			{/each}
			{#if pipeline.lastResponse}
				<div class="ml-auto flex shrink-0 items-center gap-2">
					<span class="badge preset-tonal-success text-xs">
						Pipeline: {pipeline.lastResponse.method}
						{pipeline.lastResponse.status} · {relativeTime(pipeline.lastResponse.timestamp)}
					</span>
					<button
						onclick={() => (pipeline.lastResponse = null)}
						class="btn-icon btn-sm hover:preset-tonal text-xs"
						aria-label="Clear pipeline"
					>×</button>
				</div>
			{/if}
		</div>
	</nav>
	<div class="container mx-auto max-w-5xl px-4 py-8">
		{@render children()}
	</div>
</div>
