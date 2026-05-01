import { MESSAGES_BASE } from "./errors.messages.base";

export type ErrorKey = keyof typeof MESSAGES_BASE;

export type Var = string | number;

export type NamedPlaceholders<S extends string> = S extends `${string}{${infer P}}${infer Rest}` ? (P extends `${number}` ? NamedPlaceholders<Rest> : P | NamedPlaceholders<Rest>) : never;

export type NamedParamsFor<K extends ErrorKey> = Record<NamedPlaceholders<(typeof MESSAGES_BASE)[K]>, Var>;
