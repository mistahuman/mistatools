<script lang="ts">
	type ViewType = 'gallery' | 'table' | 'tree' | 'raw';
	type GalleryItem = { imageUrl: string | null; label: string };
	type Suggestion = { type: ViewType; reason: string };

	interface Props {
		data: unknown;
	}
	let { data }: Props = $props();

	const IMAGE_KEYS = [
		'url',
		'image',
		'img',
		'src',
		'thumbnail',
		'avatar',
		'photo',
		'picture',
		'icon'
	];
	const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)(\?.*)?$/i;
	const LABEL_KEYS = ['name', 'title', 'label', 'username', 'full_name', 'display_name'];

	function looksLikeImageUrl(v: unknown): boolean {
		if (typeof v !== 'string') return false;
		return IMAGE_EXT.test(v) || IMAGE_KEYS.some((k) => v.includes(k));
	}

	function getImageUrl(item: Record<string, unknown>): string | null {
		for (const k of IMAGE_KEYS) {
			const entry = Object.entries(item).find(([key]) => key.toLowerCase().includes(k));
			if (entry && typeof entry[1] === 'string' && entry[1].startsWith('http')) return entry[1];
		}
		for (const [, v] of Object.entries(item)) {
			if (looksLikeImageUrl(v)) return v as string;
		}
		return null;
	}

	function getLabel(item: Record<string, unknown>): string {
		for (const k of LABEL_KEYS) {
			const entry = Object.entries(item).find(([key]) => key.toLowerCase().includes(k));
			if (entry && entry[1] != null) return String(entry[1]).slice(0, 60);
		}
		for (const [, v] of Object.entries(item)) {
			if (typeof v === 'string' && v.length > 1 && v.length < 80) return v;
		}
		return '';
	}

	function analyzeData(d: unknown): Suggestion {
		if (Array.isArray(d) && d.length > 0) {
			const item = d[0];
			if (typeof item === 'object' && item !== null) {
				const entries = Object.entries(item as Record<string, unknown>);
				const hasImgKey = entries.some(([k]) =>
					IMAGE_KEYS.some((ik) => k.toLowerCase().includes(ik))
				);
				const hasImgVal = entries.some(([, v]) => looksLikeImageUrl(v));
				if (hasImgKey || hasImgVal)
					return { type: 'gallery', reason: 'Array of objects with image URLs → Gallery view' };
				const flat = entries.every(([, v]) => typeof v !== 'object' || v === null);
				return flat
					? { type: 'table', reason: 'Array of flat objects → Data Table view' }
					: { type: 'tree', reason: 'Array of nested objects → Tree view' };
			}
			return { type: 'table', reason: 'Flat array → Table view' };
		}
		if (d !== null && typeof d === 'object' && !Array.isArray(d)) {
			const flat = Object.values(d as Record<string, unknown>).every(
				(v) => typeof v !== 'object' || v === null
			);
			return flat
				? { type: 'table', reason: 'Flat key-value object → Data Table view' }
				: { type: 'tree', reason: 'Nested object → Tree view' };
		}
		return { type: 'raw', reason: 'Primitive value → Raw view' };
	}

	let suggestion = $derived(analyzeData(data));
	let activeView = $state<ViewType | null>(null);
	let currentView = $derived<ViewType>(activeView ?? suggestion.type);

	let columns = $derived.by<string[]>(() => {
		if (!Array.isArray(data) || !data.length || typeof data[0] !== 'object') return [];
		return Object.keys(data[0] as Record<string, unknown>).slice(0, 10);
	});

	let tableRows = $derived.by<Record<string, unknown>[]>(() => {
		if (!Array.isArray(data)) return [];
		return (data as Record<string, unknown>[]).slice(0, 50);
	});

	let galleryItems = $derived.by<GalleryItem[]>(() => {
		if (!Array.isArray(data)) return [];
		return (data as Record<string, unknown>[]).slice(0, 24).map((item) => ({
			imageUrl: getImageUrl(item),
			label: getLabel(item)
		}));
	});

	const VIEW_TYPES: ViewType[] = ['gallery', 'table', 'tree', 'raw'];
	const VIEW_LABELS: Record<ViewType, string> = {
		gallery: 'Gallery',
		table: 'Table',
		tree: 'Tree',
		raw: 'Raw'
	};
</script>

{#snippet jsonNode(value: unknown, depth: number)}
	{#if value === null}
		<span class="text-surface-400">null</span>
	{:else if typeof value === 'boolean'}
		<span class="text-amber-400">{String(value)}</span>
	{:else if typeof value === 'number'}
		<span class="text-blue-400">{value}</span>
	{:else if typeof value === 'string'}
		<span class="text-green-400">"{value.length > 80 ? value.slice(0, 80) + '…' : value}"</span>
	{:else if Array.isArray(value)}
		{#if depth >= 3 || value.length === 0}
			<span class="text-surface-400">[{value.length === 0 ? '' : `…${value.length}`}]</span>
		{:else}
			<span class="text-surface-300">[</span>
			{#each value.slice(0, 10) as item, idx (idx)}
				<div class="pl-4">
					{@render jsonNode(item, depth + 1)}{idx < Math.min(value.length, 10) - 1 ? ',' : ''}
				</div>
			{/each}
			{#if value.length > 10}
				<div class="pl-4 text-xs text-surface-500">…{value.length - 10} more</div>
			{/if}
			<span class="text-surface-300">]</span>
		{/if}
	{:else if typeof value === 'object'}
		{#if depth >= 3}
			<span class="text-surface-400">&#123; … &#125;</span>
		{:else}
			{@const entries = Object.entries(value as Record<string, unknown>).slice(0, 15)}
			<span class="text-surface-300">&#123;</span>
			{#each entries as [k, v], idx (k)}
				<div class="pl-4">
					<span class="text-primary-400">"{k}"</span><span class="text-surface-300">: </span>{@render jsonNode(
						v,
						depth + 1
					)}{idx < entries.length - 1 ? ',' : ''}
				</div>
			{/each}
			{#if Object.keys(value as object).length > 15}
				<div class="pl-4 text-xs text-surface-500">
					…{Object.keys(value as object).length - 15} more
				</div>
			{/if}
			<span class="text-surface-300">&#125;</span>
		{/if}
	{/if}
{/snippet}

<div class="card preset-filled-surface-100-900 border border-surface-200-800 overflow-hidden">
	<div
		class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-200-800 px-4 py-2.5"
	>
		<div class="flex items-center gap-2">
			<span class="text-xs font-medium">Smart Preview</span>
			<span class="badge preset-tonal-secondary text-xs">{VIEW_LABELS[suggestion.type]}</span>
			<span class="hidden text-xs text-surface-500-400 sm:inline">{suggestion.reason}</span>
		</div>
		<div class="flex gap-1">
			{#each VIEW_TYPES as vt (vt)}
				<button
					onclick={() => (activeView = vt === suggestion.type && activeView === null ? null : vt)}
					class="btn btn-sm text-xs {currentView === vt
						? 'preset-tonal-primary'
						: 'hover:preset-tonal'}"
				>{VIEW_LABELS[vt]}</button>
			{/each}
		</div>
	</div>

	<div class="max-h-[400px] overflow-auto p-4">
		{#if currentView === 'gallery'}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				{#each galleryItems as item, i (i)}
					<div class="card preset-filled-surface-200-800 overflow-hidden text-xs">
						{#if item.imageUrl}
							<img
								src={item.imageUrl}
								alt={item.label || 'item'}
								class="aspect-square w-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div
								class="aspect-square w-full flex items-center justify-center bg-surface-300-700"
							>
								<span class="text-xl text-surface-400">□</span>
							</div>
						{/if}
						{#if item.label}
							<p class="truncate p-1.5">{item.label}</p>
						{/if}
					</div>
				{/each}
			</div>
		{:else if currentView === 'table'}
			{#if columns.length > 0}
				<table class="w-full border-collapse text-xs font-mono">
					<thead>
						<tr class="border-b border-surface-200-800">
							{#each columns as col (col)}
								<th
									class="whitespace-nowrap px-2 py-1.5 text-left font-semibold text-surface-500-400"
									>{col}</th
								>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each tableRows as row, i (i)}
							<tr class="border-b border-surface-200-800/40 hover:bg-surface-200-800/30">
								{#each columns as col (col)}
									<td class="max-w-[160px] truncate px-2 py-1">
										{#if typeof row[col] === 'object' && row[col] !== null}
											<span class="italic text-surface-400">[object]</span>
										{:else if row[col] == null}
											<span class="italic text-surface-400">—</span>
										{:else}
											{String(row[col])}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
				{#if Array.isArray(data) && (data as unknown[]).length > 50}
					<p class="mt-2 text-xs text-surface-400-600">
						Showing 50 of {(data as unknown[]).length} rows.
					</p>
				{/if}
			{:else if typeof data === 'object' && data !== null && !Array.isArray(data)}
				<table class="w-full border-collapse text-xs font-mono">
					<tbody>
						{#each Object.entries(data as Record<string, unknown>) as [k, v] (k)}
							<tr class="border-b border-surface-200-800/40">
								<td class="w-1/3 whitespace-nowrap px-2 py-1 font-semibold text-surface-500-400"
									>{k}</td
								>
								<td class="px-2 py-1"
									>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		{:else if currentView === 'tree'}
			<div class="font-mono text-xs leading-relaxed">
				{@render jsonNode(data, 0)}
			</div>
		{:else}
			<pre class="whitespace-pre-wrap break-all font-mono text-xs">{JSON.stringify(
					data,
					null,
					2
				)}</pre>
		{/if}
	</div>
</div>
