import { MESSAGES_BASE } from "./errors.messages.base";
import type { ErrorKey, Var, NamedParamsFor } from "./errors.types";

function formatNumeric(template: string, values: Var[]): string {
  return values.reduce<string>((msg, v, i): string => msg.split(`{${i + 1}}`).join(String(v)), template);
}

function formatNamed<T extends Record<string, Var>>(template: string, params: T): string {
  let msg = template;
  for (const [k, v] of Object.entries(params)) {
    msg = msg.split(`{${k}}`).join(String(v));
  }
  return msg;
}

export const MESSAGES: Readonly<typeof MESSAGES_BASE> & {
  /**
   * Format numeric placeholders. Example:
   *   MESSAGES.fmt("CATEGORY_NAME_EXISTS", dto.name)
   */
  fmt: <K extends ErrorKey>(key: K, ...values: Var[]) => string;

  /**
   * Format named placeholders. Example:
   *   MESSAGES.fmtNamed("CATEGORY_NOT_FOUND", { id })
   */
  fmtNamed: <K extends ErrorKey>(key: K, params: NamedParamsFor<K>) => string;
} = Object.freeze({
  ...MESSAGES_BASE,

  fmt: (key, ...values) => formatNumeric(MESSAGES_BASE[key], values),

  fmtNamed: (key, params) => formatNamed(MESSAGES_BASE[key], params as Record<string, Var>)
});
