export type ApiResponse = {
	url: string;
	method: string;
	status: number;
	statusText: string;
	body: string;
	json: unknown;
	timestamp: number;
};

// Shared reactive state across all tools. Export the object, never reassign it —
// this satisfies Svelte 5's constraint on cross-module $state exports.
export const pipeline = $state<{
	lastResponse: ApiResponse | null;
}>({
	lastResponse: null
});
