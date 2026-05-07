export function formatDate(date: Date | string, locale = 'en-US'): string {
	return new Date(date).toLocaleDateString(locale, {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
}

export function truncate(str: string, maxLength: number): string {
	return str.length > maxLength ? str.slice(0, maxLength - 1) + '…' : str;
}

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]/g, '');
}
