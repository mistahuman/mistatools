<script lang="ts">
	import WelcomeHome from '$lib/components/WelcomeHome.svelte';

	import Card from '$lib/components/generic/Card.svelte';

	const stack = [
		{ label: 'SvelteKit', description: 'Full-stack framework for building web apps.' },
		{ label: 'Skeleton UI', description: 'UI toolkit built for Svelte and Tailwind.' },
		{ label: 'TailwindCSS', description: 'Utility-first CSS framework.' },
		{ label: 'TypeScript', description: 'Typed JavaScript for safer code.' },
		{ label: 'ESLint + Prettier', description: 'Linting and formatting out of the box.' }
	];
</script>

<div class="gradient-homepage-one">
	<section>
		<div class="container mx-auto flex justify-center p-10 pt-20 pb-5">
			<WelcomeHome />
		</div>
	</section>
</div>
<div class="gradient-homepage-two">
	<section>
		<!-- Stack -->
		<div class="space-y-4">
			<div class="container mx-auto max-w-3xl space-y-12 px-4 py-16">
				<h2 class="text-center h3 font-semibold">What's inside</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each stack as item (item.label)}
						<Card title={item.label}>
							<p>{item.description}</p>
						</Card>
					{/each}
				</div>
			</div>
		</div>
	</section>
</div>
