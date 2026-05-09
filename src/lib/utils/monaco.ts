let _promise: Promise<typeof import('monaco-editor')> | null = null;

export function getMonaco(): Promise<typeof import('monaco-editor')> {
	if (!_promise) {
		_promise = (async () => {
			const monaco = await import('monaco-editor');
			const { default: EditorWorker } = await import(
				'monaco-editor/esm/vs/editor/editor.worker?worker'
			);
			// MonacoEnvironment is a browser global; runs only once due to singleton
			(self as unknown as Record<string, unknown>).MonacoEnvironment = {
				getWorker() {
					return new EditorWorker();
				}
			};
			return monaco;
		})();
	}
	return _promise;
}
