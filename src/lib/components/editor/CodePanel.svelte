<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import MonacoEditor from './MonacoEditor.svelte';

	type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black';

	interface Props {
		value?: string;
		language?: string;
		title?: string;
		readonly?: boolean;
		height?: string;
		theme?: MonacoTheme;
	}

	let {
		value = $bindable(''),
		language = 'plaintext',
		title = '',
		readonly = false,
		height = '300px',
		theme = 'vs-dark'
	}: Props = $props();

	let copied = $state(false);

	async function copy() {
		if (!value) return;
		await navigator.clipboard.writeText(value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="card preset-filled-surface-100-900 border border-surface-200-800 overflow-hidden">
	<div class="flex items-center justify-between gap-2 border-b border-surface-200-800 px-3 py-2">
		<div class="flex items-center gap-2">
			{#if title}
				<span class="text-xs font-medium">{title}</span>
			{/if}
			{#if language !== 'plaintext'}
				<span class="badge preset-tonal-secondary text-xs uppercase">{language}</span>
			{/if}
			{#if readonly}
				<span class="badge preset-tonal text-xs">readonly</span>
			{/if}
		</div>
		<button onclick={copy} disabled={!value} class="btn btn-sm hover:preset-tonal gap-1">
			{#if copied}
				<Check size={13} />
				<span>Copied</span>
			{:else}
				<Copy size={13} />
			{/if}
		</button>
	</div>
	<MonacoEditor bind:value {language} {theme} {readonly} {height} />
</div>
