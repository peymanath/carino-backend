const DEFAULT_OMITS = ['createdAt', 'updatedAt', 'isDeleted'] as const;
const DEFAULT_OMITS_SET: ReadonlySet<string> = new Set(DEFAULT_OMITS);

function isBuffer(value: unknown): value is Buffer {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(value);
}

export function deepOmitKeys<T>(input: T, omitKeys: Iterable<string> = DEFAULT_OMITS_SET): T {
  const omitSet: ReadonlySet<string> =
    omitKeys instanceof Set ? omitKeys : new Set<string>(omitKeys);

  return deepOmitKeysWithSet(input, omitSet);
}

function deepOmitKeysWithSet<T>(input: T, omitSet: ReadonlySet<string>): T {
  if (input == null) return input;

  if (input instanceof Date || isBuffer(input)) {
    return input;
  }

  if (Array.isArray(input)) {
    const result = input.map((v: unknown) => deepOmitKeysWithSet(v, omitSet));
    return result as unknown as T;
  }

  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (omitSet.has(k)) continue;

      out[k] = deepOmitKeysWithSet(v, omitSet);
    }

    return out as T;
  }

  return input;
}