<script lang="ts">
	import type { PageData } from './$types';
	// import { uiStore } from '$stores/ui.svelte';
	// import { formatDate, truncate, slugify } from '$utils/format';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Playground — sveltekit-skeleton-starter</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<pre class="card p-4">{JSON.stringify(data.post, null, 2)}</pre>
</div>
