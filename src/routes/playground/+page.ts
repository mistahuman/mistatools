import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
	const post = await res.json();
	return { post };
};
