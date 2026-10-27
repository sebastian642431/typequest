import type { Lesson } from "../../../../content/types.ts";

const CONFIG = `type Entorno = "dev" | "staging" | "prod";
type Config = { entorno: Entorno; puerto: number; reintentos: number };
const config = {
  entorno: "prod",
  puerto: 8080,
  reintentos: 3,
} as const satisfies Config;
`;

const ENV = `const env: Record<string, string | undefined> = {
  PUERTO: "3000",
  DB_URL: "postgres://localhost/tienda",
  MODO: "staging",
};
`;

const lesson: Lesson = {
  id: "config-and-env",
  title: "Config, env y tsconfig",
  summary: "Config que se chequea sola, env validado al arrancar y las opciones clave del tsconfig.",
  idea: "`satisfies` chequea la config sin perder literales. El env se valida al arrancar.",
  theory: [
    { title: "`as const` + `satisfies`", text: "`as const` congela los literales. `satisfies` chequea la forma sin ensanchar el tipo.", code: "type Entorno = \"dev\" | \"staging\" | \"prod\";\ntype Config = { entorno: Entorno; puerto: number; reintentos: number };\nconst config = {\n  entorno: \"prod\",\n  puerto: 8080,\n  reintentos: 3,\n} as const satisfies Config;" },
    { title: "No pierde los literales", text: "`config.entorno` sigue siendo `\"prod\"`, no `Entorno`. Y un typo como `\"produccion\"` salta en la línea justa." },
    { title: "El env llega como texto", text: "Las variables de entorno son texto y pueden faltar. Validalas una vez, al arrancar, y salí con tipos de verdad.", code: "const env: Record<string, string | undefined> = { PUERTO: \"3000\" };\nfunction leer(nombre: string): string {\n  const v = env[nombre];\n  if (v === undefined) throw new Error(\"falta \" + nombre);\n  return v;\n}" },
    { title: "El tsconfig manda", text: "`strict` prende lo básico. `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` van aparte y aprietan más." },
  ],
  exercises: [
    {
      type: "predict",
      id: "satisfies-literal",
      code: `${CONFIG}const esProd: "prod" = config.entorno;
esProd;`,
      answer: "\"prod\"",
      explanation: "`satisfies` no ensancha: `config.entorno` sigue siendo el literal \"prod\".",
    },
    {
      type: "predict",
      id: "satisfies-typo",
      code: `type Entorno = "dev" | "staging" | "prod";
const config = { entorno: "produccion", puerto: 8080 } as const satisfies { entorno: Entorno; puerto: number };
config.puerto;`,
      answer: "type error",
      explanation: "\"produccion\" no está en `Entorno`. `satisfies` lo marca ahí mismo.",
    },
    {
      type: "complete",
      id: "complete-env",
      prompt: "`cargarEnv` valida el env al arrancar. Completá su retorno para que la app reciba datos ya convertidos.",
      code: `${ENV}function cargarEnv(e: Record<string, string | undefined>): ___ {
  const puerto = Number(e.PUERTO ?? "8080");
  const dbUrl = e.DB_URL;
  if (!Number.isInteger(puerto) || puerto <= 0) throw new Error("PUERTO inválido");
  if (dbUrl === undefined) throw new Error("falta DB_URL");
  return { puerto, dbUrl };
}`,
      tests: `const cfg = cargarEnv(env);
const siguiente: number = cfg.puerto + 1;
const url: string = cfg.dbUrl;`,
      solution: "{ puerto: number; dbUrl: string }",
      explanation: "Afuera de `cargarEnv` nadie ve `string | undefined`: el puerto ya es número y la URL existe. Se valida una vez.",
    },
    {
      type: "complete",
      id: "complete-flags",
      prompt: "Las flags son un objeto `as const`. Completá el parámetro para que solo acepte flags que existen.",
      code: `const flags = { checkoutNuevo: true, modoOscuro: false, pagoConQr: true } as const;
function activa(nombre: ___): boolean {
  return flags[nombre];
}`,
      tests: `activa("pagoConQr");
type _1 = Expect<Equal<Parameters<typeof activa>[0], "checkoutNuevo" | "modoOscuro" | "pagoConQr">>;`,
      solution: "keyof typeof flags",
      explanation: "`typeof flags` da el tipo del objeto y `keyof`, sus claves. Sumás una flag y el parámetro se actualiza solo.",
    },
    {
      type: "complete",
      id: "complete-mode",
      prompt: "Completá el retorno del validador de `MODO`: tiene que ser un entorno válido, nunca un string cualquiera.",
      code: `${ENV}const ENTORNOS = ["dev", "staging", "prod"] as const;
function modo(): ___ {
  const v = env.MODO;
  const e = ENTORNOS.find((x) => x === v);
  if (e === undefined) throw new Error("MODO inválido: " + v);
  return e;
}`,
      tests: `const m = modo();
type _1 = Expect<Equal<typeof m, "dev" | "staging" | "prod">>;`,
      solution: "(typeof ENTORNOS)[number]",
      explanation: "Indexar la tupla con `number` da la unión de sus elementos. Una sola lista sirve para validar y para tipar.",
    },
    {
      type: "fix",
      id: "fix-env-undefined",
      prompt: "`crearDb` pide un string, pero `env.DB_URL` puede faltar. Validala y cortá con un error si no está.",
      code: `${ENV}function crearDb(url: string) {
  return { url, conectada: false };
}
function arrancar() {
  return crearDb(env.DB_URL);
}`,
      tests: "const db: { url: string; conectada: boolean } = arrancar();",
      solution: `${ENV}function crearDb(url: string) {
  return { url, conectada: false };
}
function arrancar() {
  const url = env.DB_URL;
  if (url === undefined) throw new Error("falta DB_URL");
  return crearDb(url);
}`,
      explanation: "Después del `if` que tira, `url` ya es string. Mejor fallar al arrancar que en la primera query.",
    },
    {
      type: "fix",
      id: "fix-satisfies",
      prompt: "Anotar la config perdió los literales y no entra donde piden la región exacta. Cambiá la anotación por `satisfies`.",
      code: `type Region = "sa-east" | "us-east";
type Config = { region: Region; replicas: number };
const config: Config = { region: "sa-east", replicas: 2 };
function soloBrasil(r: "sa-east") {
  return r;
}`,
      tests: "soloBrasil(config.region);",
      solution: `type Region = "sa-east" | "us-east";
type Config = { region: Region; replicas: number };
const config = { region: "sa-east", replicas: 2 } as const satisfies Config;
function soloBrasil(r: "sa-east") {
  return r;
}`,
      hint: "Con `: Config` el tipo ES `Config`. Con `satisfies`, es el del literal, chequeado contra `Config`.",
      explanation: "`: Config` ensancha `region` a `Region`. `as const satisfies Config` valida y deja `region` como \"sa-east\".",
    },
    {
      type: "choose",
      id: "choose-unchecked",
      prompt: "Con `noUncheckedIndexedAccess` prendido, ¿qué tipo tiene `x`?",
      code: "const precios: Record<string, number> = { mate: 900 };\nconst x = precios[\"termo\"];",
      options: [
        "number | undefined",
        "number",
        "undefined",
        "unknown",
      ],
      correct: 0,
      explanation: "Con la opción, cada acceso por índice suma `undefined` y te obliga a chequear. `strict` no la prende.",
    },
    {
      type: "choose",
      id: "choose-exact",
      prompt: "Con `exactOptionalPropertyTypes` prendido, ¿qué pasa al asignar `{ timeout: undefined }` a `Opciones`?",
      code: "type Opciones = { timeout?: number };",
      options: ["Da error: la clave puede faltar, pero no puede valer `undefined`", "Compila igual que siempre: `?` y `| undefined` son lo mismo", "Da error porque `timeout` es obligatorio", "Convierte `timeout` en readonly"],
      correct: 0,
      explanation: "La opción separa clave ausente de clave con `undefined`. Si querés las dos: `timeout?: number | undefined`.",
    },
    {
      type: "choose",
      id: "choose-strict",
      prompt: "Jefe: ¿cuál de estas NO prende `strict: true` en el tsconfig?",
      options: [
        "noUncheckedIndexedAccess",
        "strictNullChecks",
        "noImplicitAny",
        "strictFunctionTypes",
      ],
      correct: 0,
      explanation: "`strict` agrupa `strictNullChecks`, `noImplicitAny` y otras. `noUncheckedIndexedAccess` va a mano: rompe mucho código.",
    },
  ],
};

export default lesson;
