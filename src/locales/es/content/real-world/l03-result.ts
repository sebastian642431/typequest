import type { Lesson } from "../../../../content/types.ts";

const RESULT = "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n";

const HELPERS = `function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
`;

const BASE = `${RESULT}${HELPERS}`;

const AND_THEN = `function andThen<T, U, E, F>(r: Result<T, E>, f: (v: T) => Result<U, F>): Result<U, E | F> {
  return r.ok ? f(r.value) : r;
}
`;

const STEPS = `function parsear(s: string): Result<number, "no-numero"> {
  const n = Number(s);
  return Number.isNaN(n) ? err("no-numero") : ok(n);
}
function mitad(n: number): Result<number, "impar"> {
  return n % 2 === 0 ? ok(n / 2) : err("impar");
}
`;

const lesson: Lesson = {
  id: "result",
  title: "Errores que se ven en el tipo",
  summary: "`Result<T, E>`: devolver el error en vez de tirarlo, y que el compilador te lo recuerde.",
  idea: "Devolvé el error como valor: así queda en el tipo y nadie lo puede ignorar.",
  theory: [
    { title: "`throw` no se ve", text: "La firma `cobrar(): Recibo` no avisa que puede explotar. Y nadie te obliga a usar `try`." },
    { title: "El error como valor", text: "Una unión discriminada por `ok`: el éxito de un lado, el error del otro.", code: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\nfunction ok<T>(value: T): Result<T, never> {\n  return { ok: true, value };\n}\nfunction err<E>(error: E): Result<never, E> {\n  return { ok: false, error };\n}" },
    { title: "`never` encaja en todo", text: "`ok` devuelve `Result<T, never>`. Como `never` encaja en cualquier tipo, entra en cualquier `Result<T, E>`." },
    { title: "Errores con nombre", text: "Si `E` es una unión de errores, el que llama hace un `switch`. Si se olvida uno, el compilador avisa." },
    { title: "Encadenar pasos", text: "`andThen` corre el paso siguiente solo si el anterior salió bien. Los errores de los dos quedan en el tipo.", code: "function andThen<T, U, E, F>(r: Result<T, E>, f: (v: T) => Result<U, F>): Result<U, E | F> {\n  return r.ok ? f(r.value) : r;\n}" },
  ],
  exercises: [
    {
      type: "predict",
      id: "direct-value",
      code: `${BASE}const r: Result<number, string> = ok(5);\nr.value;`,
      answer: "type error",
      explanation: "El tipo es la unión entera, aunque vos sepas que es ok. Y el error no tiene `value`.",
    },
    {
      type: "predict",
      id: "ternary",
      code: `${BASE}const r: Result<number, string> = err("no");\nr.ok ? r.value : r.error.length;`,
      answer: "2",
      explanation: "Es un error, así que va por la rama de `error`: el string \"no\".",
    },
    {
      type: "predict",
      id: "divide",
      code: `${BASE}function dividir(a: number, b: number): Result<number, "division-por-cero"> {\n  return b === 0 ? err("division-por-cero") : ok(a / b);\n}\nconst r = dividir(1, 0);\nr.ok ? r.value : r.error;`,
      answer: "\"division-por-cero\"",
      explanation: "Con `b` en cero devuelve el error. Como el retorno pide el literal, `err` lo infiere literal.",
    },
    {
      type: "complete",
      id: "helper-ok",
      prompt: "Completá el retorno de `ok` para que entre en cualquier `Result`, sea cual sea su error.",
      code: `${RESULT}function ok<T>(value: T): ___ {\n  return { ok: true, value };\n}`,
      tests: "const a: Result<number, string> = ok(1);\nconst b: Result<number, { tipo: \"timeout\" }> = ok(2);",
      solution: "Result<T, never>",
      explanation: "Un éxito no tiene error: su `E` es `never`, y `never` se asigna a cualquier error.",
    },
    {
      type: "choose",
      id: "why-never",
      prompt: "¿Por qué `err` devuelve `Result<never, E>` y no `Result<unknown, E>`?",
      options: ["Porque `never` es más rápido de chequear", "Porque `never` encaja en cualquier `T`, así entra en `Result<Usuario, E>` o el que sea", "Porque con `unknown` no compila el `return`", "Da igual, son equivalentes"],
      correct: 1,
      explanation: "`unknown` no entra donde se espera un `Usuario`. `never` entra en todo, así el error encaja en cualquier `Result`.",
    },
    {
      type: "fix",
      id: "no-throw",
      prompt: "`parsearEdad` promete un `Result`, pero tira y devuelve el número pelado. Usá `ok` y `err`.",
      code: `${BASE}function parsearEdad(s: string): Result<number, string> {\n  const n = Number(s);\n  if (Number.isNaN(n)) throw new Error("no es un número");\n  return n;\n}`,
      tests: "const r = parsearEdad(\"x\");\nconst texto: string = r.ok ? String(r.value) : r.error;",
      solution: `${BASE}function parsearEdad(s: string): Result<number, string> {\n  const n = Number(s);\n  if (Number.isNaN(n)) return err("no es un número");\n  return ok(n);\n}`,
      explanation: "El error vuelve como valor y el éxito va envuelto. Ahora la firma dice la verdad.",
    },
    {
      type: "complete",
      id: "and-then",
      prompt: "`andThen` encadena un paso que puede fallar. Completá el retorno: se tienen que ver los errores de los dos pasos.",
      code: `${BASE}function andThen<T, U, E, F>(r: Result<T, E>, f: (v: T) => Result<U, F>): ___ {\n  return r.ok ? f(r.value) : r;\n}\n${STEPS}`,
      tests: "const x = andThen(parsear(\"8\"), mitad);\ntype _1 = Expect<Equal<typeof x, Result<number, \"no-numero\" | \"impar\">>>;",
      solution: "Result<U, E | F>",
      hint: "El valor final sale de `f`. El error puede venir del primer `Result` o de `f`.",
      explanation: "Si el primero falla, su error pasa de largo. Si no, decide `f`. Por eso el error es `E | F`.",
    },
    {
      type: "predict",
      id: "chain",
      code: `${BASE}${AND_THEN}${STEPS}const r = andThen(parsear("7"), mitad);\nr.ok ? r.value : r.error;`,
      answer: "\"impar\"",
      explanation: "\"7\" se parsea bien, pero 7 es impar. El segundo paso falla y la cadena pasa ese error.",
    },
    {
      type: "fix",
      id: "uncovered-error",
      prompt: "Se sumó el error `sin-cupo` y `mensaje` dejó de compilar. Cubrilo.",
      code: "type ErrorAlta = { tipo: \"email-invalido\" } | { tipo: \"duplicado\"; id: number } | { tipo: \"sin-cupo\" };\nfunction mensaje(e: ErrorAlta): string {\n  switch (e.tipo) {\n    case \"email-invalido\":\n      return \"Revisá el email\";\n    case \"duplicado\":\n      return \"Ya existe la cuenta \" + e.id;\n  }\n}",
      tests: "const m: string = mensaje({ tipo: \"sin-cupo\" });",
      solution: "type ErrorAlta = { tipo: \"email-invalido\" } | { tipo: \"duplicado\"; id: number } | { tipo: \"sin-cupo\" };\nfunction mensaje(e: ErrorAlta): string {\n  switch (e.tipo) {\n    case \"email-invalido\":\n      return \"Revisá el email\";\n    case \"duplicado\":\n      return \"Ya existe la cuenta \" + e.id;\n    case \"sin-cupo\":\n      return \"No quedan lugares\";\n  }\n}",
      explanation: "Con un caso sin cubrir, la función puede no devolver nada. Con un `throw`, esto pasaba en silencio.",
    },
    {
      type: "complete",
      id: "all",
      prompt: "Jefe: `todos` junta resultados. Si uno falla, devuelve ese error; si no, todos los valores. Completá el retorno.",
      code: `${BASE}function todos<T, E>(rs: Result<T, E>[]): ___ {\n  const valores: T[] = [];\n  for (const r of rs) {\n    if (!r.ok) return r;\n    valores.push(r.value);\n  }\n  return ok(valores);\n}\n${STEPS}`,
      tests: "const r = todos([parsear(\"1\"), parsear(\"2\"), parsear(\"x\")]);\ntype _1 = Expect<Equal<typeof r, Result<number[], \"no-numero\">>>;\nconst cuantos: number = r.ok ? r.value.length : 0;",
      solution: "Result<T[], E>",
      hint: "Del lado bueno, una lista de `T`. Del lado malo, un error del mismo tipo que los de entrada.",
      explanation: "`return r` devuelve el error tal cual, y `ok(valores)` es `Result<T[], never>`. Los dos encajan en `Result<T[], E>`.",
    },
  ],
};

export default lesson;
