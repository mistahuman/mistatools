<script lang="ts">
	import CodePanel from '$lib/components/editor/CodePanel.svelte';

	let input = $state('{\n  "hello": "world",\n  "count": 42\n}');
</script>

<div class="space-y-6">
	<div>
		<h1 class="h3 font-semibold">Editor</h1>
		<p class="mt-1 text-sm text-surface-500-400">
			Monaco Editor playground. Bind values between panels or use standalone.
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<CodePanel bind:value={input} language="json" title="Input" height="400px" />
		<CodePanel value={input} language="json" title="Mirror" readonly height="400px" />
	</div>
</div>
