// Minimal word-level diff (LCS) used to show how a script/decision changed
// between revisions. Returns tokens: { value, type: 'same' | 'add' | 'del' }.
function tokenize(text = '') {
  // keep whitespace as part of tokens so we can rejoin faithfully
  return String(text).match(/\S+\s*|\s+/g) || []
}

export function diffWords(before = '', after = '') {
  const a = tokenize(before)
  const b = tokenize(after)
  const n = a.length
  const m = b.length

  // LCS table
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const out = []
  let i = 0
  let j = 0
  const push = (type, value) => {
    const last = out[out.length - 1]
    if (last && last.type === type) last.value += value
    else out.push({ type, value })
  }
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('same', a[i])
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push('del', a[i])
      i++
    } else {
      push('add', b[j])
      j++
    }
  }
  while (i < n) push('del', a[i++])
  while (j < m) push('add', b[j++])
  return out
}

export function hasChanges(tokens) {
  return tokens.some((t) => t.type !== 'same')
}
