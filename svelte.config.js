import adapter from '@sveltejs/adapter-static';

// When deploying to GitHub Pages the repo name becomes the base path.
// GITHUB_REPOSITORY is set automatically in Actions (e.g. "mistahuman/svelte-skeleton-starter").
const base = process.env.GITHUB_REPOSITORY ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1] : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base
		},
		prerender: {
			// Static assets (favicon, etc.) aren't served under the base path during local
			// prerendering — they will resolve correctly on GitHub Pages.
			handleHttpError: ({ path, message }) => {
				if (/\.(svg|ico|png|webp|jpg|jpeg|gif|woff2?)$/.test(path)) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
