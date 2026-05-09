<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Trash2 } from 'lucide-svelte';
	import CodePanel from '$lib/components/editor/CodePanel.svelte';

	interface Note {
		id: string;
		title: string;
		content: string;
		language: string;
		updatedAt: number;
	}

	const STORAGE_KEY = 'mistatools:notes';
	const LANGUAGES = [
		'plaintext',
		'json',
		'javascript',
		'typescript',
		'markdown',
		'html',
		'css',
		'python',
		'bash',
		'xml'
	];

	function newNote(): Note {
		return {
			id: crypto.randomUUID(),
			title: 'Untitled',
			content: '',
			language: 'plaintext',
			updatedAt: Date.now()
		};
	}

	let notes = $state<Note[]>([]);
	let activeId = $state('');

	onMount(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			notes = stored ? JSON.parse(stored) : [newNote()];
		} catch {
			notes = [newNote()];
		}
		activeId = notes[0].id;
	});

	let active = $derived(notes.find((n) => n.id === activeId) ?? null);

	function addNote() {
		const note = newNote();
		notes = [note, ...notes];
		activeId = note.id;
	}

	function deleteNote(id: string) {
		if (notes.length <= 1) return;
		const idx = notes.findIndex((n) => n.id === id);
		notes = notes.filter((n) => n.id !== id);
		if (activeId === id) {
			activeId = notes[Math.min(idx, notes.length - 1)].id;
		}
	}

	function relativeTime(ts: number): string {
		const diff = Math.floor((Date.now() - ts) / 1000);
		if (diff < 60) return `${diff}s ago`;
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		return new Date(ts).toLocaleDateString();
	}

	$effect(() => {
		if (notes.length === 0) return;
		const snapshot = JSON.stringify(notes);
		const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, snapshot), 400);
		return () => clearTimeout(t);
	});
</script>

<div class="space-y-4">
	<div>
		<h1 class="h3 font-semibold">Notes</h1>
		<p class="mt-1 text-sm text-surface-500-400">Scratch pad saved in your browser.</p>
	</div>

	<div class="flex items-start gap-4">
		<!-- Sidebar -->
		<div class="w-52 shrink-0">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-medium uppercase tracking-widest text-surface-500-400">
					{notes.length}
					{notes.length === 1 ? 'note' : 'notes'}
				</span>
				<button onclick={addNote} class="btn-icon btn-sm hover:preset-tonal" aria-label="New note">
					<Plus size={14} />
				</button>
			</div>
			<div class="max-h-[calc(100vh-240px)] space-y-0.5 overflow-y-auto">
				{#each notes as note (note.id)}
					<div
						class="group relative cursor-pointer rounded px-2.5 py-2 {activeId === note.id
							? 'preset-tonal-primary'
							: 'hover:preset-tonal'}"
						onclick={() => (activeId = note.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && (activeId = note.id)}
					>
						<p class="truncate pr-5 text-sm font-medium">{note.title || 'Untitled'}</p>
						<p class="text-xs text-surface-500-400">{relativeTime(note.updatedAt)}</p>
						{#if notes.length > 1}
							<button
								onclick={(e) => {
									e.stopPropagation();
									deleteNote(note.id);
								}}
								class="btn-icon absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 hover:preset-tonal-error"
								aria-label="Delete note"
							>
								<Trash2 size={12} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Editor -->
		{#if active}
			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex items-center gap-2">
					<input
						type="text"
						value={active.title}
						oninput={(e) => {
							active.title = e.currentTarget.value;
							active.updatedAt = Date.now();
						}}
						placeholder="Untitled"
						class="input flex-1 text-sm font-medium"
					/>
					<select
						value={active.language}
						onchange={(e) => {
							active.language = e.currentTarget.value;
							active.updatedAt = Date.now();
						}}
						class="select w-36 text-xs"
					>
						{#each LANGUAGES as lang (lang)}
							<option value={lang}>{lang}</option>
						{/each}
					</select>
				</div>
				<CodePanel
					value={active.content}
					language={active.language}
					height="calc(100vh - 300px)"
					onchange={(v) => {
						if (active) {
							active.content = v;
							active.updatedAt = Date.now();
						}
					}}
				/>
			</div>
		{/if}
	</div>
</div>
