<script lang="ts">
	import { onMount } from 'svelte';
	import { pipeline } from '$lib/stores/pipeline.svelte';
	import { computeDiff, type DiffLine } from '$lib/utils/diff';
	import CodePanel from '$lib/components/editor/CodePanel.svelte';

	type NumberedLine = DiffLine & { leftN: number | null; rightN: number | null };
	type SplitRow = {
		left: { kind: DiffLine['kind']; text: string; n: number } | null;
		right: { kind: DiffLine['kind']; text: string; n: number } | null;
	};

	let left = $state('');
	let right = $state('');
	let unified = $state(false);

	onMount(() => {
		if (pipeline.lastResponse?.body) {
			left = pipeline.lastResponse.body;
		}
	});

	const isEmpty = $derived(!left && !right);

	const numberedLines = $derived.by<NumberedLine[]>(() => {
		let ln = 0;
		let rn = 0;
		return computeDiff(left, right).map((line) => {
			if (line.kind === 'equal') {
				ln++;
				rn++;
				return { ...line, leftN: ln, rightN: rn };
			}
			if (line.kind === 'removed') {
				ln++;
				return { ...line, leftN: ln, rightN: null };
			}
			rn++;
			return { ...line, leftN: null, rightN: rn };
		});
	});

	const splitRows = $derived.by<SplitRow[]>(() => {
		const rows: SplitRow[] = [];
		let i = 0;
		while (i < numberedLines.length) {
			const line = numberedLines[i];
			if (line.kind === 'equal') {
				rows.push({
					left: { kind: 'equal', text: line.text, n: line.leftN! },
					right: { kind: 'equal', text: line.text, n: line.rightN! }
				});
				i++;
			} else if (line.kind === 'removed') {
				const next = numberedLines[i + 1];
				if (next?.kind === 'added') {
					rows.push({
						left: { kind: 'removed', text: line.text, n: line.leftN! },
						right: { kind: 'added', text: next.text, n: next.rightN! }
					});
					i += 2;
				} else {
					rows.push({ left: { kind: 'removed', text: line.text, n: line.leftN! }, right: null });
					i++;
				}
			} else {
				rows.push({ left: null, right: { kind: 'added', text: line.text, n: line.rightN! } });
				i++;
			}
		}
		return rows;
	});

	function flashClass(kind: DiffLine['kind'] | undefined): string {
		if (!kind || kind === 'equal') return '';
		return kind === 'added' ? 'diff-added' : 'diff-removed';
	}

	function gutter(kind: DiffLine['kind']): string {
		return kind === 'added' ? '+' : kind === 'removed' ? '-' : ' ';
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="h3 font-semibold">Differ</h1>
		<p class="mt-1 text-sm text-surface-500-400">
			Compare two texts line by line. The left panel is pre-filled from the pipeline.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<CodePanel bind:value={left} title="Original" height="280px" />
		<CodePanel bind:value={right} title="Modified" height="280px" />
	</div>

	<div class="flex gap-1">
		<button
			onclick={() => (unified = false)}
			class="btn btn-sm {!unified ? 'preset-tonal-primary' : 'hover:preset-tonal'}"
		>Split</button>
		<button
			onclick={() => (unified = true)}
			class="btn btn-sm {unified ? 'preset-tonal-primary' : 'hover:preset-tonal'}"
		>Unified</button>
	</div>

	<div
		class="card preset-filled-surface-100-900 border border-surface-200-800 min-h-16 max-h-[55vh] overflow-y-auto"
	>
		{#if isEmpty}
			<p class="p-6 text-sm text-surface-400-600">
				Paste text into both panels above to see the diff.
			</p>
		{:else if unified}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse font-mono text-sm">
					<tbody>
						{#each numberedLines as line, i (i)}
							<tr class={flashClass(line.kind)}>
								<td class="num-col border-r border-surface-200-800 text-right">{line.leftN ?? ''}</td>
								<td class="num-col border-r border-surface-200-800 text-right"
									>{line.rightN ?? ''}</td
								>
								<td class="gutter-col border-r border-surface-200-800 text-center select-none"
									>{gutter(line.kind)}</td
								>
								<td class="whitespace-pre px-3 py-0.5">{line.text}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<table class="w-full border-collapse font-mono text-sm">
				<tbody>
					{#each splitRows as row, i (i)}
						<tr>
							<td
								class="w-1/2 border-r border-surface-200-800 p-0 {row.left
									? flashClass(row.left.kind)
									: 'bg-surface-200-800/20'}"
							>
								<div class="flex">
									<span
										class="num-col shrink-0 border-r border-surface-200-800 text-right select-none"
										>{row.left?.n ?? ''}</span
									>
									<span class="min-w-0 whitespace-pre-wrap break-all px-3 py-0.5"
										>{row.left?.text ?? ''}</span
									>
								</div>
							</td>
							<td
								class="w-1/2 p-0 {row.right
									? flashClass(row.right.kind)
									: 'bg-surface-200-800/20'}"
							>
								<div class="flex">
									<span
										class="num-col shrink-0 border-r border-surface-200-800 text-right select-none"
										>{row.right?.n ?? ''}</span
									>
									<span class="min-w-0 whitespace-pre-wrap break-all px-3 py-0.5"
										>{row.right?.text ?? ''}</span
									>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.num-col {
		width: 2.5rem;
		padding: 0.125rem 0.5rem;
		font-size: 0.7rem;
		color: var(--color-surface-400);
		white-space: nowrap;
	}
	.gutter-col {
		width: 1.5rem;
		padding: 0.125rem 0.25rem;
		font-size: 0.7rem;
		color: var(--color-surface-400);
		white-space: nowrap;
	}
	.diff-added {
		background-color: color-mix(in oklab, var(--color-success-500) 10%, transparent);
	}
	.diff-removed {
		background-color: color-mix(in oklab, var(--color-error-500) 10%, transparent);
	}
</style>
