<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/generic/Header.svelte';
	import Footer from '$lib/components/generic/Footer.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex min-h-0 flex-1 flex-col">
		{@render children()}
	</main>
	<Footer />
</div>
