export type Primitive = string | number | boolean | null | undefined;

export type DeepKey<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive ? K : K | `${K}.${DeepKey<T[K]>}`;
    }[keyof T & string];

export type DeepValue<T, P extends string> = T extends Primitive ? never : P extends `${infer K}.${infer Rest}` ? (K extends keyof T ? DeepValue<T[K], Rest> : never) : P extends keyof T ? T[P] : never;
