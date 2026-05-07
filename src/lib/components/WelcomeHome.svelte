<script lang="ts">
	import { ChevronRight as IconChevron } from 'lucide-svelte';
	import Logo from './icons/Logo.svelte';
</script>

<div class="grid grid-cols-1 gap-20">
	<!-- Mascot -->
	<div class="flex items-center justify-center">
		<div class="relative flex aspect-square size-48 items-center justify-center md:size-64">
			<Logo width="200" height="200" />
		</div>
	</div>
	<!-- Hero Text -->
	<div class="space-y-4 self-center text-center">
		<h1 class="heading-font-family text-3xl font-bold md:text-4xl xl:text-balance">
			mistahuman's sveltekit-skeleton-starter
		</h1>
		<p class="xl:text-balance">
			A <strong class="text-primary-900-100">SvelteKit + Skeleton UI</strong> template for building
			web apps <u>quickly</u>.
		</p>
		<a
			href="https://github.com/mistahuman/sveltekit-skeleton-starter"
			class="btn preset-tonal-primary"
		>
			<span>visit code</span>
			<IconChevron class="size-4" />
		</a>
	</div>
</div>
