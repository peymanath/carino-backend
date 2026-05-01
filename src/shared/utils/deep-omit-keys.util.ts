const DEFAULT_OMITS = ["createdAt", "updatedAt", "isDeleted"] as const;
const DEFAULT_OMITS_SET: ReadonlySet<string> = new Set(DEFAULT_OMITS as readonly string[]);

export function deepOmitKeys<T>(input: T, omitKeys: Iterable<string> = DEFAULT_OMITS_SET): T {
  // Normalize to a Set<string> once
  const omitSet: ReadonlySet<string> = omitKeys instanceof Set ? (omitKeys as ReadonlySet<string>) : new Set<string>(omitKeys);

  return deepOmitKeysWithSet(input, omitSet);
}

function deepOmitKeysWithSet<T>(input: T, omitSet: ReadonlySet<string>): T {
  if (input == null) return input;

  // Treat Dates and Buffers as leaf nodes
  if (input instanceof Date || (typeof Buffer !== "undefined" && Buffer.isBuffer?.(input))) {
    return input;
  }

  if (Array.isArray(input)) {
    return (input as unknown as any[]).map((v) => deepOmitKeysWithSet(v, omitSet)) as unknown as T;
  }

  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (omitSet.has(k)) continue;
      out[k] = deepOmitKeysWithSet(v, omitSet);
    }
    return out as T;
  }

  return input;
}
