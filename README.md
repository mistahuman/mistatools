# SvelteKit Skeleton Starter

A starter template for building web apps with [SvelteKit](https://kit.svelte.dev) and [Skeleton UI](https://skeleton.dev).

## Getting started

Clone this repository and install dependencies:

```sh
git clone https://github.com/mistahuman/sveltekit-skeleton-starter
cd sveltekit-skeleton-starter
npm install
```

Or recreate it from scratch with the same configuration:

```sh
npx sv@0.15.2 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" mcp="ide:claude-code+setup:remote" --install npm sveltekit-skeleton-starter
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
