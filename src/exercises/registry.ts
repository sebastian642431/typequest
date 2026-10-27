import type { Exercise } from "../content/types.ts";
import type { TypeDefinition } from "./definition.ts";
import { predict } from "./predict.tsx";
import { complete } from "./complete.tsx";
import { fix } from "./fix.tsx";
import { choose } from "./choose.tsx";

type Registry = { [K in Exercise["type"]]: TypeDefinition<Extract<Exercise, { type: K }>, any> };

export const TYPES = { predict, complete, fix, choose } satisfies Registry;

export function definitionFor(e: Exercise) {
  return TYPES[e.type] as TypeDefinition<Exercise, unknown>;
}
