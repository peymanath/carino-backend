export const transformDates = (obj: any): any => {
  if (obj instanceof Date) {
    return obj.toISOString().slice(0, -1);
  }
  if (typeof obj === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(obj)) {
    return obj.slice(0, -1);
  }
  if (Array.isArray(obj)) {
    return obj.map(transformDates);
  }
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = transformDates(obj[key]);
      }
    }
    return obj;
  }
  return obj;
};
