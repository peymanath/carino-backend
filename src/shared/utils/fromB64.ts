export const fromB64 = (value?: string): Buffer | undefined => (value ? Buffer.from(value, "base64") : undefined);
