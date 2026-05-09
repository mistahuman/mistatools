<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getMonaco } from '$lib/utils/monaco';

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
		const monaco = await getMonaco();
		monacoInstance = monaco;

		editor = monaco.editor.create(container, {
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

	$effect(() => {
		if (editor && editor.getValue() !== value) {
			ignoreChange = true;
			editor.setValue(value);
			ignoreChange = false;
		}
	});

	$effect(() => {
		if (editor) editor.updateOptions({ readOnly: readonly });
	});
	$effect(() => {
		if (editor && monacoInstance) monacoInstance.editor.setModelLanguage(editor.getModel(), language);
	});
	$effect(() => {
		if (monacoInstance) monacoInstance.editor.setTheme(theme);
	});
</script>

<div bind:this={container} style:height class="w-full overflow-hidden"></div>
