<script lang="ts">
	import { Maximize2, Minimize2, Copy, Check } from 'lucide-svelte';
	import MonacoEditor from './MonacoEditor.svelte';

	type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black';

	interface Props {
		value?: string;
		language?: string;
		title?: string;
		readonly?: boolean;
		height?: string;
		theme?: MonacoTheme;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		language = 'plaintext',
		title = '',
		readonly = false,
		height = '300px',
		theme = 'vs-dark',
		onchange
	}: Props = $props();

	let copied = $state(false);
	let fullscreen = $state(false);

	async function copy() {
		if (!value) return;
		await navigator.clipboard.writeText(value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (fullscreen && e.key === 'Escape') fullscreen = false;
	}

	$effect(() => {
		document.body.style.overflow = fullscreen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="card preset-filled-surface-100-900 border border-surface-200-800 overflow-hidden flex flex-col
	       {fullscreen ? 'fixed inset-0 z-[9999] rounded-none border-0' : ''}"
>
	<div
		class="flex items-center justify-between gap-2 border-b border-surface-200-800 px-3 py-2 shrink-0"
	>
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
		<div class="flex items-center gap-1">
			<button onclick={copy} disabled={!value} class="btn btn-sm hover:preset-tonal gap-1">
				{#if copied}
					<Check size={13} />
					<span>Copied</span>
				{:else}
					<Copy size={13} />
				{/if}
			</button>
			<button onclick={() => (fullscreen = !fullscreen)} class="btn btn-sm hover:preset-tonal">
				{#if fullscreen}
					<Minimize2 size={13} />
				{:else}
					<Maximize2 size={13} />
				{/if}
			</button>
		</div>
	</div>
	<div class="min-h-0 flex-1" style:height={fullscreen ? undefined : height}>
		<MonacoEditor bind:value {language} {theme} {readonly} height={fullscreen ? '100%' : height} {onchange} />
	</div>
</div>
