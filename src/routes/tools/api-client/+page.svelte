<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { fade, slide } from 'svelte/transition';
	import { pipeline } from '$lib/stores/pipeline.svelte';

	type KVPair = { key: string; value: string };
	type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	type AppState = 'idle' | 'loading' | 'success' | 'error';

	const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
	const METHODS_WITH_BODY = new Set<HttpMethod>(['POST', 'PUT', 'PATCH']);

	const METHOD_COLORS: Record<HttpMethod, string> = {
		GET: 'preset-tonal-success',
		POST: 'preset-tonal-primary',
		PUT: 'preset-tonal-warning',
		PATCH: 'preset-tonal-warning',
		DELETE: 'preset-tonal-error'
	};

	let method = $state<HttpMethod>('GET');
	let url = $state('');
	let params = $state<KVPair[]>([{ key: '', value: '' }]);
	let headers = $state<KVPair[]>([{ key: '', value: '' }]);
	let bodyText = $state('');
	let activeTab = $state<'params' | 'headers' | 'body'>('params');
	let showMethodPicker = $state(false);

	let status = $state<AppState>('idle');
	let responseStatus = $state<number | null>(null);
	let responseText = $state('');
	let responseJson = $state<unknown>(null);
	let errorMessage = $state('');
	let responseView = $state<'pretty' | 'raw'>('pretty');
	let copied = $state(false);

	let filledParamCount = $derived(params.filter((p) => p.key.trim()).length);
	let filledHeaderCount = $derived(headers.filter((h) => h.key.trim()).length);
	let hasBody = $derived(METHODS_WITH_BODY.has(method));
	let canSend = $derived(url.trim().length > 0 && status !== 'loading');

	function buildUrl(): string {
		const filled = params.filter((p) => p.key.trim());
		if (!filled.length) return url.trim();
		const qs = new URLSearchParams(filled.map((p) => [p.key.trim(), p.value])).toString();
		return `${url.trim().split('?')[0]}?${qs}`;
	}

	function buildHeaders(): Record<string, string> {
		return Object.fromEntries(
			headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value])
		);
	}

	async function sendRequest() {
		const finalUrl = buildUrl();
		if (!finalUrl) return;

		status = 'loading';
		responseStatus = null;
		responseText = '';
		responseJson = null;
		errorMessage = '';
		responseView = 'pretty';

		try {
			const fetchOptions: RequestInit = { method, headers: buildHeaders() };
			if (hasBody && bodyText.trim()) fetchOptions.body = bodyText.trim();

			const res = await fetch(finalUrl, fetchOptions);
			responseStatus = res.status;
			const text = await res.text();
			responseText = text;

			let parsedJson: unknown = null;
			try {
				parsedJson = JSON.parse(text);
			} catch {
				/* not JSON */
			}

			// Store in pipeline regardless of JSON validity so Formatter/Differ can use raw body too
			pipeline.lastResponse = {
				url: finalUrl,
				method,
				status: res.status,
				statusText: res.statusText,
				body: text,
				json: parsedJson,
				timestamp: Date.now()
			};

			if (!res.ok) {
				errorMessage = `HTTP ${res.status} ${res.statusText}`;
				status = 'error';
				return;
			}

			if (parsedJson !== null) {
				responseJson = parsedJson;
				status = 'success';
			} else {
				errorMessage = 'Response is not valid JSON.';
				status = 'error';
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : String(err);
			status = 'error';
		}
	}

	async function copyToClipboard() {
		if (!responseText) return;
		await navigator.clipboard.writeText(responseText);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function statusBadgeClass(code: number): string {
		if (code >= 200 && code < 300) return 'badge preset-tonal-success';
		if (code >= 400) return 'badge preset-tonal-error';
		return 'badge preset-outlined';
	}

	function setMethod(m: HttpMethod) {
		method = m;
		showMethodPicker = false;
		if (!METHODS_WITH_BODY.has(m) && activeTab === 'body') activeTab = 'params';
	}

	function addParam() {
		params = [...params, { key: '', value: '' }];
	}
	function removeParam(i: number) {
		params = params.filter((_, idx) => idx !== i);
	}
	function addHeader() {
		headers = [...headers, { key: '', value: '' }];
	}
	function removeHeader(i: number) {
		headers = headers.filter((_, idx) => idx !== i);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="h3 font-semibold">API Client</h1>
		<p class="mt-1 text-sm text-surface-500-400">
			Send HTTP requests and pipe responses to other tools.
		</p>
	</div>

	<!-- Request bar -->
	<div class="flex items-stretch gap-2">
		<div class="relative">
			<button
				onclick={() => (showMethodPicker = !showMethodPicker)}
				class="badge {METHOD_COLORS[method]} flex h-full cursor-pointer select-none items-center gap-1 px-3 font-mono text-xs font-semibold"
			>
				{method}<span class="text-[9px]">{showMethodPicker ? '▴' : '▾'}</span>
			</button>
			{#if showMethodPicker}
				<div
					transition:fade={{ duration: 100 }}
					class="card preset-filled-surface-100-900 border border-surface-200-800 absolute top-full left-0 z-50 mt-1 min-w-[6rem] space-y-0.5 p-1 shadow-xl"
				>
					{#each METHODS as m (m)}
						<button
							onclick={() => setMethod(m)}
							class="btn btn-sm w-full justify-start font-mono text-xs {m === method
								? 'preset-tonal-primary'
								: 'hover:preset-tonal'}"
						>{m}</button>
					{/each}
				</div>
			{/if}
		</div>
		<input
			type="url"
			placeholder="https://api.example.com/endpoint"
			bind:value={url}
			onkeydown={(e) => e.key === 'Enter' && canSend && sendRequest()}
			class="input min-w-0 flex-1 font-mono text-sm"
		/>
		<button
			onclick={sendRequest}
			disabled={!canSend}
			class="btn preset-filled-primary-500 shrink-0 transition-opacity disabled:opacity-50"
		>
			{status === 'loading' ? 'Sending…' : 'Send'}
		</button>
	</div>

	<!-- Params / Headers / Body tabs -->
	<div class="card preset-filled-surface-100-900 border border-surface-200-800 overflow-hidden">
		<div class="flex gap-1 border-b border-surface-200-800 px-2 pt-2">
			<button
				onclick={() => (activeTab = 'params')}
				class="btn btn-sm rounded-b-none {activeTab === 'params'
					? 'preset-tonal-primary'
					: 'hover:preset-tonal'}"
			>
				Params{filledParamCount > 0 ? ` (${filledParamCount})` : ''}
			</button>
			<button
				onclick={() => (activeTab = 'headers')}
				class="btn btn-sm rounded-b-none {activeTab === 'headers'
					? 'preset-tonal-primary'
					: 'hover:preset-tonal'}"
			>
				Headers{filledHeaderCount > 0 ? ` (${filledHeaderCount})` : ''}
			</button>
			{#if hasBody}
				<button
					onclick={() => (activeTab = 'body')}
					class="btn btn-sm rounded-b-none {activeTab === 'body'
						? 'preset-tonal-primary'
						: 'hover:preset-tonal'}"
				>
					Body{bodyText.trim() ? ' ●' : ''}
				</button>
			{/if}
		</div>

		<div class="space-y-2 p-3">
			{#if activeTab === 'params'}
				{#each params as pair, i (i)}
					<div in:slide={{ duration: 180 }} out:fade={{ duration: 150 }} class="flex gap-2">
						<input
							type="text"
							placeholder="key"
							bind:value={pair.key}
							class="input w-1/3 min-w-0 text-sm"
						/>
						<input
							type="text"
							placeholder="value"
							bind:value={pair.value}
							class="input min-w-0 flex-1 text-sm"
						/>
						<button
							onclick={() => removeParam(i)}
							class="btn-icon preset-tonal shrink-0"
							aria-label="Remove param">×</button
						>
					</div>
				{/each}
				<button onclick={addParam} class="btn btn-sm preset-tonal">+ Add param</button>
			{:else if activeTab === 'headers'}
				{#each headers as pair, i (i)}
					<div in:slide={{ duration: 180 }} out:fade={{ duration: 150 }} class="flex gap-2">
						<input
							type="text"
							placeholder="key"
							bind:value={pair.key}
							class="input w-1/3 min-w-0 text-sm"
						/>
						<input
							type="text"
							placeholder="value"
							bind:value={pair.value}
							class="input min-w-0 flex-1 text-sm"
						/>
						<button
							onclick={() => removeHeader(i)}
							class="btn-icon preset-tonal shrink-0"
							aria-label="Remove header">×</button
						>
					</div>
				{/each}
				<button onclick={addHeader} class="btn btn-sm preset-tonal">+ Add header</button>
			{:else if activeTab === 'body'}
				<textarea
					bind:value={bodyText}
					placeholder="Request body (raw text or JSON)…"
					rows="8"
					spellcheck="false"
					class="w-full resize-y rounded border border-surface-200-800 bg-surface-50-950 p-3 font-mono text-sm
					       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
				></textarea>
			{/if}
		</div>
	</div>

	<!-- Response panel -->
	<div class="card preset-filled-surface-100-900 border border-surface-200-800 min-h-48">
		{#key status}
			<div transition:fade={{ duration: 150 }}>
				{#if status === 'idle'}
					<p class="p-6 text-sm text-surface-500-400">Response will appear here.</p>
				{:else if status === 'loading'}
					<div class="animate-pulse space-y-3 p-6">
						<div class="bg-surface-300-700 h-3 w-3/4 rounded"></div>
						<div class="bg-surface-200-800 h-3 w-1/2 rounded"></div>
						<div class="bg-surface-200-800 h-3 w-2/3 rounded"></div>
					</div>
				{:else if status === 'error'}
					<div class="space-y-3 p-5">
						<div class="flex flex-wrap items-center gap-2">
							{#if responseStatus}
								<span class={statusBadgeClass(responseStatus)}>{responseStatus}</span>
							{/if}
							<span class="text-sm font-medium text-error-500">{errorMessage}</span>
						</div>
						{#if responseText}
							<pre class="overflow-x-auto whitespace-pre-wrap break-all text-xs">{responseText}</pre>
						{/if}
						{#if errorMessage.includes('Failed to fetch') || errorMessage.toLowerCase().includes('cors')}
							<p class="border-l-2 border-surface-200-800 pl-3 text-xs text-surface-400-600">
								Tip: This may be a CORS restriction. A server-side proxy (<code>+server.ts</code>) can
								bypass it — see the architecture docs.
							</p>
						{/if}
					</div>
				{:else if status === 'success'}
					<div class="space-y-4 p-5">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								{#if responseStatus}
									<span class={statusBadgeClass(responseStatus)}>{responseStatus}</span>
								{/if}
								<div class="flex gap-1">
									<button
										onclick={() => (responseView = 'pretty')}
										class="btn btn-sm {responseView === 'pretty'
											? 'preset-tonal-primary'
											: 'hover:preset-tonal'}"
									>Pretty</button>
									<button
										onclick={() => (responseView = 'raw')}
										class="btn btn-sm {responseView === 'raw'
											? 'preset-tonal-primary'
											: 'hover:preset-tonal'}"
									>Raw</button>
								</div>
							</div>
							<button onclick={copyToClipboard} class="btn btn-sm preset-tonal shrink-0">
								{copied ? 'Copied!' : 'Copy'}
							</button>
						</div>

						{#if responseView === 'pretty'}
							<pre
								class="max-h-[50vh] overflow-x-auto whitespace-pre-wrap break-all text-xs"
							>{JSON.stringify(responseJson, null, 2)}</pre>
						{:else}
							<pre
								class="max-h-[50vh] overflow-x-auto whitespace-pre-wrap break-all text-xs"
							>{responseText}</pre>
						{/if}

						<div class="flex flex-wrap items-center gap-2 border-t border-surface-200-800 pt-3">
							<span class="text-xs text-surface-500-400">Send to:</span>
							<button
								onclick={() => goto(resolve('/tools/formatter'))}
								class="btn btn-sm preset-tonal">Formatter ↗</button
							>
							<button
								onclick={() => goto(resolve('/tools/differ'))}
								class="btn btn-sm preset-tonal">Differ ↗</button
							>
						</div>
					</div>
				{/if}
			</div>
		{/key}
	</div>
</div>
