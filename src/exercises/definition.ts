import type { ComponentType } from "react";
import type { Exercise } from "../content/types.ts";
import type { Diagnostic } from "../engine/checker.ts";

export type Verdict = { ok: boolean; own?: Diagnostic[]; tests?: Diagnostic[] };

export type BodyProps<E extends Exercise, A> = {
  exercise: E;
  answer: A;
  setAnswer: (a: A) => void;
  locked: boolean;
  submit: () => void;
};

export type TypeDefinition<E extends Exercise, A> = {
  initial: (e: E) => A;
  ready: (a: A) => boolean;
  check: (e: E, a: A) => Verdict | Promise<Verdict>;
  solution: (e: E) => string;
  Body: ComponentType<BodyProps<E, A>>;
};

export function define<E extends Exercise, A>(d: TypeDefinition<E, A>) {
  return d;
}
