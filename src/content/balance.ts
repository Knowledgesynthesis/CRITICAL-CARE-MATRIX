/**
 * Answer-position balancing.
 * Authors tend to place the correct option in the same slot; test-wise learners exploit that.
 * - All-numeric option sets are sorted ascending (natural order).
 * - Otherwise the correct option is moved to a slot chosen deterministically from the item id,
 *   keeping the distractors in their authored order.
 */

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const LEADING_NUMBER = /^[<>≥≤~≈]?\s*(-?\d+(?:\.\d+)?)/;

function leadingNumber(text: string): number | null {
  const m = LEADING_NUMBER.exec(text.trim());
  return m ? Number(m[1]) : null;
}

/** Returns the permutation (new order of original indices). */
export function balancedOrder(id: string, labels: string[], correctIndex: number): number[] {
  const nums = labels.map(leadingNumber);
  const idx = labels.map((_, i) => i);
  if (nums.every((n) => n !== null)) {
    return idx.sort((a, b) => (nums[a] as number) - (nums[b] as number) || a - b);
  }
  const target = hash(id) % labels.length;
  const others = idx.filter((i) => i !== correctIndex);
  others.splice(target, 0, correctIndex);
  return others;
}

export function balanceQuestion<T extends { id: string; options: string[]; answer: number }>(q: T): T {
  const order = balancedOrder(q.id, q.options, q.answer);
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

export function balanceOptions<O extends { text: string; correct: boolean }>(id: string, options: O[]): O[] {
  const correct = options.findIndex((o) => o.correct);
  if (correct < 0) return options;
  const order = balancedOrder(id, options.map((o) => o.text), correct);
  return order.map((i) => options[i]);
}
