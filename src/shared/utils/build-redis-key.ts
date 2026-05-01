export const buildRedisKey = (pattern: string, values: (string | number)[]): string => {
  let key = pattern;
  values.forEach((value, index) => {
    key = key.replace(`{${index + 1}}`, value.toString());
  });
  return key;
};
