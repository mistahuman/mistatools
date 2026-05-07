export type LineKind = 'equal' | 'added' | 'removed';

export type DiffLine = {
	kind: LineKind;
	text: string;
};

export type DiffHunk = DiffLine[];

// Myers-style LCS diff via dynamic programming backtrack.
export function computeDiff(left: string, right: string): DiffHunk {
	const a = left ? left.split('\n') : [];
	const b = right ? right.split('\n') : [];
	const m = a.length;
	const n = b.length;

	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = 1; i <= m; i++)
		for (let j = 1; j <= n; j++)
			dp[i][j] =
				a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

	const result: DiffLine[] = [];
	let i = m,
		j = n;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
			result.unshift({ kind: 'equal', text: a[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			result.unshift({ kind: 'added', text: b[j - 1] });
			j--;
		} else {
			result.unshift({ kind: 'removed', text: a[i - 1] });
			i--;
		}
	}
	return result;
}
