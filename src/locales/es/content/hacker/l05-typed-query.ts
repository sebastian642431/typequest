import type { Lesson } from "../../../../content/types.ts";

const PAR = "type Par<S extends string> = S extends `${infer K}=${infer V}` ? { [P in K]: V } : {};\n";

const APLANAR = "type Aplanar<T> = { [K in keyof T]: T[K] };\n";

const DE_NOMBRE = "type DeNombre = { string: string; number: number; boolean: boolean };\n";

const lesson: Lesson = {
  id: "typed-query",
  title: "El parser final",
  summary: "Convertir \"a=1&b=2\" en un objeto y armar un validador que infiere su tipo.",
  idea: "Templates, recursión y mapped types juntos pasan un texto entero a un objeto.",
  theory: [
    { title: "La meta", text: "`\"modo=duelo&mapa=mansion\"` tiene que dar `{ modo: \"duelo\"; mapa: \"mansion\" }`, sin ejecutar nada.", code: "type Par<S extends string> = S extends `${infer K}=${infer V}` ? { [P in K]: V } : {};\ntype P = Par<\"modo=duelo\">;" },
    { title: "Aplanar intersecciones", text: "`{ a: \"1\" } & { b: \"2\" }` funciona como objeto, pero no es idéntico a uno plano. Un mapped type lo aplana.", code: "type Aplanar<T> = { [K in keyof T]: T[K] };" },
    { title: "Un validador en miniatura", text: "`esquema` recibe nombres de tipos como `\"number\"` y calcula el tipo de salida a partir de esos strings." },
  ],
  exercises: [
    {
      type: "predict",
      id: "pair-ok",
      code: `${PAR}const p: Par<"mapa=mansion"> = { mapa: "mansion" };\np.mapa;`,
      answer: "\"mansion\"",
      explanation: "`Par<\"mapa=mansion\">` es `{ mapa: \"mansion\" }`. El objeto encaja justo.",
    },
    {
      type: "complete",
      id: "pair",
      prompt: "`Par<S>` pasa `\"clave=valor\"` a `{ clave: \"valor\" }`. Sin `=`, da un objeto vacío.",
      code: "type Par<S extends string> = ___;",
      tests: "type _1 = Expect<Equal<Par<\"a=1\">, { a: \"1\" }>>;\ntype _2 = Expect<Equal<Par<\"modo=duelo\">, { modo: \"duelo\" }>>;\ntype _3 = Expect<Equal<Par<\"suelto\">, {}>>;",
      solution: "S extends `${infer K}=${infer V}` ? { [P in K]: V } : {}",
      explanation: "El template separa clave y valor. Un mapped type con una sola clave arma el objeto.",
    },
    {
      type: "choose",
      id: "intersection-equal",
      prompt: "¿Qué tipo queda en `R`?",
      code: "type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\ntype R = Equal<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>;",
      options: ["true", "false", "never", "boolean"],
      correct: 1,
      explanation: "Se usan igual, pero `Igual` pide que sean idénticos. Una intersección no es idéntica a un objeto plano.",
    },
    {
      type: "complete",
      id: "flatten",
      prompt: "Escribí `Aplanar<T>`: una intersección de objetos tiene que quedar como un solo objeto.",
      code: "type Aplanar<T> = ___;",
      tests: "type _1 = Expect<Equal<Aplanar<{ a: 1 } & { b: 2 }>, { a: 1; b: 2 }>>;\ntype _2 = Expect<Equal<Aplanar<{ x: string } & { y?: number }>, { x: string; y?: number }>>;",
      solution: "{ [K in keyof T]: T[K] }",
      explanation: "El mapped type recorre todas las claves y arma un objeto nuevo. Conserva el `?`.",
    },
    {
      type: "complete",
      id: "query",
      prompt: "`Query<S>` parsea una query string entera. Tenés `Par` y `Aplanar` listos.",
      code: `${PAR}${APLANAR}type Query<S extends string> = ___;`,
      tests: "type _1 = Expect<Equal<Query<\"a=1&b=2\">, { a: \"1\"; b: \"2\" }>>;\ntype _2 = Expect<Equal<Query<\"modo=duelo\">, { modo: \"duelo\" }>>;\ntype _3 = Expect<Equal<Query<\"x=1&y=2&z=3\">, { x: \"1\"; y: \"2\"; z: \"3\" }>>;",
      solution: "S extends `${infer P}&${infer Resto}` ? Aplanar<Par<P> & Query<Resto>> : Par<S>",
      hint: "Cortá en el primer `&`, pasá el pedazo por `Par` y juntalo con el resto. Sin `Aplanar` no pasa.",
      explanation: "Cada vuelta procesa un par y lo junta con el resto. `Aplanar` deja todo en un objeto plano.",
    },
    {
      type: "fix",
      id: "to-number",
      prompt: "`ANumero<S>` tiene que pasar `\"42\"` al literal `42` y dejar el resto igual. Hoy no convierte nada.",
      code: "type ANumero<S extends string> = S extends `${infer N}` ? N : S;",
      tests: "type _1 = Expect<Equal<ANumero<\"42\">, 42>>;\ntype _2 = Expect<Equal<ANumero<\"7\">, 7>>;\ntype _3 = Expect<Equal<ANumero<\"hola\">, \"hola\">>;",
      solution: "type ANumero<S extends string> = S extends `${infer N extends number}` ? N : S;",
      hint: "Un `infer` puede llevar su propia restricción.",
      explanation: "Con `infer N extends number`, se intenta leer el texto como número. Si no se puede, el patrón no encaja.",
    },
    {
      type: "predict",
      id: "from-name",
      code: `${DE_NOMBRE}const edad: DeNombre["number"] = "7";\nedad;`,
      answer: "type error",
      explanation: "`DeNombre[\"number\"]` es `number`. El string `\"7\"` no entra, aunque parezca un número.",
    },
    {
      type: "fix",
      id: "schema",
      prompt: "`esquema` no compila: `E[K]` puede ser cualquier string y no indexa `DeNombre`. Arreglá la restricción de `E`.",
      code: `${DE_NOMBRE}type Inferir<E extends Record<string, string>> = { [K in keyof E]: DeNombre[E[K]] };\nfunction esquema<E extends Record<string, string>>(forma: E) {\n  return (dato: Record<string, unknown>): Inferir<E> => {\n    for (const k in forma) if (typeof dato[k] !== forma[k]) throw new TypeError(k);\n    return dato as Inferir<E>;\n  };\n}`,
      tests: "const validar = esquema({ nombre: \"string\", edad: \"number\" });\ntype _1 = Expect<Equal<ReturnType<typeof validar>, { nombre: string; edad: number }>>;",
      solution: `${DE_NOMBRE}type Inferir<E extends Record<string, keyof DeNombre>> = { [K in keyof E]: DeNombre[E[K]] };\nfunction esquema<E extends Record<string, keyof DeNombre>>(forma: E) {\n  return (dato: Record<string, unknown>): Inferir<E> => {\n    for (const k in forma) if (typeof dato[k] !== forma[k]) throw new TypeError(k);\n    return dato as Inferir<E>;\n  };\n}`,
      hint: "Hay que cambiarla en dos lugares.",
      explanation: "Con `Record<string, keyof DeNombre>`, cada valor es una clave válida de `DeNombre`. Y los literales no se ensanchan a `string`.",
    },
    {
      type: "complete",
      id: "schema-optional",
      prompt: "Jefe: `\"number?\"` marca un opcional. `Inferir<E>` da `edad?: number` para esos, sin `readonly`, en un objeto plano.",
      code: `${DE_NOMBRE}${APLANAR}type Campo = keyof DeNombre | \`\${keyof DeNombre}?\`;\ntype Base<C> = C extends \`\${infer B extends keyof DeNombre}?\` ? B : C extends keyof DeNombre ? C : never;\ntype Inferir<E extends Record<string, Campo>> = ___;\nfunction esquema<const E extends Record<string, Campo>>(forma: E): (dato: Record<string, unknown>) => Inferir<E> {\n  return (dato) => dato as Inferir<E>;\n}`,
      tests: "type _1 = Expect<Equal<Inferir<{ nombre: \"string\"; edad: \"number?\" }>, { nombre: string; edad?: number }>>;\ntype _2 = Expect<Equal<Inferir<{ activo: \"boolean\" }>, { activo: boolean }>>;\nconst validar = esquema({ nick: \"string\", clan: \"string?\", nivel: \"number\" });\ntype _3 = Expect<Equal<ReturnType<typeof validar>, { nick: string; nivel: number; clan?: string }>>;",
      solution: "Aplanar<{ -readonly [K in keyof E as E[K] extends `${string}?` ? never : K]: DeNombre[Base<E[K]>] } & { -readonly [K in keyof E as E[K] extends `${string}?` ? K : never]?: DeNombre[Base<E[K]>] }>",
      hint: "Dos mapped types con `as`: obligatorias, y opcionales con `?`. Usá `-readonly` y `Aplanar`.",
      explanation: "El `as` saca claves con `never`. Un mapped type lleva las obligatorias y otro, con `?`, las opcionales. `Base` saca el `?`.",
    },
  ],
};

export default lesson;
