<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black';

	interface Props {
		value?: string;
		language?: string;
		theme?: MonacoTheme;
		readonly?: boolean;
		height?: string;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		language = 'plaintext',
		theme = 'vs-dark',
		readonly = false,
		height = '300px',
		onchange
	}: Props = $props();

	let container: HTMLDivElement;
	let editor = $state<any>(undefined);
	let monacoInstance = $state<any>(undefined);
	let ignoreChange = false;

	onMount(async () => {
		const { default: loader } = await import('@monaco-editor/loader');
		monacoInstance = await loader.init();

		editor = monacoInstance.editor.create(container, {
			value,
			language,
			theme,
			readOnly: readonly,
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			fontSize: 13,
			automaticLayout: true
		});

		editor.onDidChangeModelContent(() => {
			if (!ignoreChange) {
				const v = editor.getValue() as string;
				value = v;
				onchange?.(v);
			}
		});
	});

	onDestroy(() => editor?.dispose());

	// Sync external value changes into Monaco (guard prevents infinite loop with onDidChangeModelContent)
	$effect(() => {
		if (editor && editor.getValue() !== value) {
			ignoreChange = true;
			editor.setValue(value);
			ignoreChange = false;
		}
	});

	// Sync reactive props → Monaco imperative API
	$effect(() => { if (editor) editor.updateOptions({ readOnly: readonly }); });
	$effect(() => { if (editor && monacoInstance) monacoInstance.editor.setModelLanguage(editor.getModel(), language); });
	$effect(() => { if (monacoInstance) monacoInstance.editor.setTheme(theme); });
</script>

<div bind:this={container} style:height class="w-full overflow-hidden"></div>
