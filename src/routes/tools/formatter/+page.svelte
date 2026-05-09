<script lang="ts">
	import { onMount } from 'svelte';
	import { pipeline } from '$lib/stores/pipeline.svelte';
	import { formatText } from '$lib/utils/json';
	import CodePanel from '$lib/components/editor/CodePanel.svelte';
	import SmartPreviewer from '$lib/components/tools/SmartPreviewer.svelte';

	let input = $state('');
	let outputMode = $state<'pretty' | 'minify'>('pretty');
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
</script>

<div class="space-y-6">
	<div>
		<h1 class="h3 font-semibold">Formatter</h1>
		<p class="mt-1 text-sm text-surface-500-400">
			Format and validate JSON or XML. Pipe output from the API Client.
		</p>
	</div>

	<div class="space-y-1.5">
		<span class="text-sm font-medium">Input</span>
		<CodePanel bind:value={input} height="180px" />
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
		<CodePanel
			value={formatResult.output ?? ''}
			language={formatResult.lang ?? 'plaintext'}
			readonly
			height="300px"
		/>

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
