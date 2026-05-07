<script lang="ts">
	import { onMount } from 'svelte';
	import { Copy, Check } from 'lucide-svelte';
	import { pipeline } from '$lib/stores/pipeline.svelte';
	import { formatText } from '$lib/utils/json';
	import SmartPreviewer from '$lib/components/tools/SmartPreviewer.svelte';

	let input = $state('');
	let outputMode = $state<'pretty' | 'minify'>('pretty');
	let copied = $state(false);
	let showPreviewer = $state(false);

	onMount(() => {
		if (pipeline.lastResponse?.body) {
			input = pipeline.lastResponse.body;
		}
	});

	let formatResult = $derived(formatText(input, outputMode === 'pretty'));

	let parsedJson = $derived.by<unknown>(() => {
		if (!input.trim()) return null;
		try {
			return JSON.parse(input);
		} catch {
			return null;
		}
	});

	async function copyFormatted() {
		if (!formatResult.ok || !formatResult.output) return;
		await navigator.clipboard.writeText(formatResult.output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="h3 font-semibold">Formatter</h1>
		<p class="mt-1 text-sm text-surface-500-400">
			Format and validate JSON or XML. Pipe output from the API Client.
		</p>
	</div>

	<div class="space-y-1.5">
		<label for="formatter-input" class="text-sm font-medium">Input</label>
		<textarea
			id="formatter-input"
			bind:value={input}
			placeholder="Paste JSON or XML here…"
			rows="10"
			spellcheck="false"
			class="w-full resize-y rounded border border-surface-200-800 bg-surface-50-950 p-3 font-mono text-sm
			       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
		></textarea>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium">Output</span>
			{#if formatResult.ok && formatResult.lang}
				<span class="badge preset-tonal-secondary text-xs uppercase">{formatResult.lang}</span>
			{/if}
		</div>
		<div class="flex items-center gap-1.5">
			<button
				onclick={() => (outputMode = 'pretty')}
				class="btn btn-sm {outputMode === 'pretty' ? 'preset-tonal-primary' : 'hover:preset-tonal'}"
			>Pretty</button>
			<button
				onclick={() => (outputMode = 'minify')}
				class="btn btn-sm {outputMode === 'minify' ? 'preset-tonal-primary' : 'hover:preset-tonal'}"
			>Minify</button>
			<button
				onclick={copyFormatted}
				disabled={!formatResult.ok || !formatResult.output}
				class="btn btn-sm preset-filled-primary-500 gap-1.5 transition-opacity disabled:opacity-40"
			>
				{#if copied}
					<Check size={14} /> Copied!
				{:else}
					<Copy size={14} /> Copy
				{/if}
			</button>
		</div>
	</div>

	{#if !input.trim()}
		<div class="card preset-tonal-surface min-h-24 p-4">
			<p class="text-sm text-surface-500-400">Output will appear here.</p>
		</div>
	{:else if !formatResult.ok}
		<div class="card preset-tonal-error p-4">
			<p class="font-mono text-sm">{formatResult.error}</p>
		</div>
	{:else}
		<div
			class="card preset-filled-surface-100-900 border border-surface-200-800 max-h-[55vh] overflow-y-auto p-4"
		>
			<pre class="whitespace-pre-wrap break-all font-mono text-sm">{formatResult.output}</pre>
		</div>

		{#if formatResult.lang === 'json' && parsedJson !== null}
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Smart Preview</span>
					<button
						onclick={() => (showPreviewer = !showPreviewer)}
						class="btn btn-sm {showPreviewer ? 'preset-tonal-primary' : 'preset-tonal'}"
					>
						{showPreviewer ? 'Hide' : 'Show Preview'}
					</button>
				</div>
				{#if showPreviewer}
					<SmartPreviewer data={parsedJson} />
				{/if}
			</div>
		{/if}
	{/if}
</div>
