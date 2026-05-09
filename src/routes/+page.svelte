<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '$lib/components/icons/Logo.svelte';

	const tools = [
		{
			href: resolve('/tools/notes'),
			label: 'Notes',
			description: 'Scratch pad with syntax highlighting, saved in your browser.'
		},
		{
			href: resolve('/tools/api-client'),
			label: 'API Client',
			description: 'Send HTTP requests and pipe responses to Formatter or Differ.'
		},
		{
			href: resolve('/tools/formatter'),
			label: 'Formatter',
			description: 'Format and validate JSON or XML with a Smart Previewer.'
		},
		{
			href: resolve('/tools/differ'),
			label: 'Differ',
			description: 'Compare two texts line by line — split or unified view.'
		}
	];
</script>

<div class="gradient-homepage-one">
	<div class="container mx-auto flex flex-col items-center gap-10 px-4 py-20 text-center">
		<div class="flex aspect-square size-32 items-center justify-center md:size-48">
			<Logo width="160" height="160" />
		</div>
		<div class="space-y-4">
			<h1 class="text-4xl font-bold md:text-6xl">mistatools</h1>
			<p class="mx-auto max-w-md text-surface-600-400">
				Developer utilities wired through a shared pipeline — send, format, compare.
			</p>
		</div>
	</div>
</div>

<div class="gradient-homepage-two">
	<div class="container mx-auto max-w-3xl space-y-6 px-4 py-16">
		<h2 class="text-center text-sm font-medium uppercase tracking-widest text-surface-500-400">
			tools
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each tools as tool (tool.label)}
				<a
					href={tool.href}
					class="card preset-filled-surface-100-900 border border-surface-200-800 space-y-2 p-5 transition-colors hover:border-primary-500/50"
				>
					<h3 class="font-semibold">{tool.label}</h3>
					<p class="text-sm text-surface-500-400">{tool.description}</p>
				</a>
			{/each}
		</div>
	</div>
</div>
