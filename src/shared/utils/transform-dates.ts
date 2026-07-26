export const transformDates = (obj: unknown): unknown => {
  if (obj instanceof Date) {
    return obj.toISOString().slice(0, -1);
  }

  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(obj)) {
    return obj.slice(0, -1);
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDates);
  }

  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;

    Object.keys(record).forEach(key => {
      record[key] = transformDates(record[key]);
    });

    return record;
  }

  return obj;
};
