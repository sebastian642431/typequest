import type { Lesson } from "../../../../content/types.ts";

const NOMBRES =
  "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype NombresParams<R extends string> = R extends `${infer Seg}/${infer Resto}` ? NombreParam<Seg> | NombresParams<Resto> : NombreParam<R>;\n";

const PARAMS = `${NOMBRES}type Params<R extends string> = { [K in NombresParams<R>]: string };\n`;

const CUERPO = "{\n  const valores = params as Record<string, string>;\n  return ruta.replace(/:([A-Za-z]+)/g, (_m, k: string) => valores[k]);\n}";

const LINK = `${PARAMS}function link<R extends string>(ruta: R, params: Params<R>): string ${CUERPO}\n`;

const lesson: Lesson = {
  id: "typed-routes",
  title: "Rutas que no se dejan romper",
  summary: "Sacar los parámetros de una ruta como \"/usuarios/:id\" y exigirlos todos.",
  idea: "El tipo de los parámetros sale del propio string de la ruta.",
  theory: [
    { title: "La misión", text: "`link(\"/usuarios/:id\", ...)` tiene que exigir `{ id: string }`. Si falta o sobra algo, no compila." },
    { title: "Sacar los nombres", text: "Partí la ruta por `/` y quedate con los segmentos que empiezan con `:`. Da una unión de nombres.", code: "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype N = NombreParam<\":id\">;" },
    { title: "De unión a objeto", text: "Un mapped type arma el objeto: `{ [K in \"id\" | \"postId\"]: string }` es `{ id: string; postId: string }`." },
    { title: "La función genérica", text: "`R extends string` captura la ruta como literal. El tipo de `params` sale de `R`, sin anotar nada." },
  ],
  exercises: [
    {
      type: "predict",
      id: "is-param",
      code: "type EsParam<S extends string> = S extends `:${string}` ? true : false;\nconst a: EsParam<\"usuarios\"> = true;\na;",
      answer: "type error",
      explanation: "`\"usuarios\"` no empieza con `:`, así que da `false`. `true` no entra.",
    },
    {
      type: "complete",
      id: "param-name",
      prompt: "`NombreParam<S>`: si el segmento es un parámetro, da su nombre sin `:`. Si no, `never`.",
      code: "type NombreParam<S extends string> = ___;",
      tests: "type _1 = Expect<Equal<NombreParam<\":id\">, \"id\">>;\ntype _2 = Expect<Equal<NombreParam<\":postId\">, \"postId\">>;\ntype _3 = Expect<Equal<NombreParam<\"posts\">, never>>;",
      solution: "S extends `:${infer N}` ? N : never",
      explanation: "El template `:${infer N}` solo encaja si arranca con `:`. `N` se queda con el resto.",
    },
    {
      type: "complete",
      id: "param-names",
      prompt: "`NombresParams<R>` recorre la ruta por `/` y junta todos los nombres en una unión.",
      code: "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype NombresParams<R extends string> = ___;",
      tests: "type _1 = Expect<Equal<NombresParams<\"/usuarios/:id/posts/:postId\">, \"id\" | \"postId\">>;\ntype _2 = Expect<Equal<NombresParams<\"/inicio\">, never>>;\ntype _3 = Expect<Equal<NombresParams<\":a/:b/:c\">, \"a\" | \"b\" | \"c\">>;",
      solution: "R extends `${infer Seg}/${infer Resto}` ? NombreParam<Seg> | NombresParams<Resto> : NombreParam<R>",
      hint: "Cortá en la primera barra. La izquierda pasa por `NombreParam` y la derecha vuelve a entrar.",
      explanation: "Cada vuelta procesa un segmento y lo une con el resto. `never` desaparece en una unión.",
    },
    {
      type: "choose",
      id: "mapped-union",
      prompt: "¿A qué tipo equivale `Obj`?",
      code: "type Obj = { [K in \"id\" | \"postId\"]: string };",
      options: ["{ id: string; postId: string }", "{ id: string } | { postId: string }", "Record<string, string>", "{ K: string }"],
      correct: 0,
      explanation: "El mapped type crea una propiedad por cada miembro de la unión, en un mismo objeto.",
    },
    {
      type: "fix",
      id: "params",
      prompt: "`Params<R>` tiene que dar el objeto de parámetros, pero usa la ruta entera como clave. Arreglalo.",
      code: `${NOMBRES}type Params<R extends string> = { [K in R]: string };`,
      tests: "type _1 = Expect<Equal<Params<\"/usuarios/:id/posts/:postId\">, { id: string; postId: string }>>;\ntype _2 = Expect<Equal<Params<\"/inicio\">, {}>>;",
      solution: `${NOMBRES}type Params<R extends string> = { [K in NombresParams<R>]: string };`,
      explanation: "Las claves salen de `NombresParams<R>`. Sin parámetros, la unión es `never` y el objeto queda vacío.",
    },
    {
      type: "predict",
      id: "link-ok",
      code: `${LINK}link("/usuarios/:id/posts/:postId", { id: "7", postId: "42" });`,
      answer: "\"/usuarios/7/posts/42\"",
      explanation: "Están los dos parámetros: compila. En runtime cada `:nombre` se cambia por su valor.",
    },
    {
      type: "predict",
      id: "link-missing",
      code: `${LINK}link("/usuarios/:id/posts/:postId", { id: "7" });`,
      answer: "type error",
      explanation: "Falta `postId`. El segundo argumento sale de la ruta, y la ruta pide los dos.",
    },
    {
      type: "fix",
      id: "last-param",
      prompt: "Esta `NombresParams` se olvida del último parámetro. Arreglala sin cambiar el enfoque.",
      code: "type NombresParams<R extends string> = R extends `${string}:${infer N}/${infer Resto}` ? N | NombresParams<Resto> : never;",
      tests: "type _1 = Expect<Equal<NombresParams<\"/usuarios/:id/posts/:postId\">, \"id\" | \"postId\">>;\ntype _2 = Expect<Equal<NombresParams<\"/perfil/:nick\">, \"nick\">>;\ntype _3 = Expect<Equal<NombresParams<\"/inicio\">, never>>;",
      solution: "type NombresParams<R extends string> = R extends `${string}:${infer N}/${infer Resto}` ? N | NombresParams<Resto> : R extends `${string}:${infer N}` ? N : never;",
      hint: "El último parámetro no tiene `/` después. Falta una rama para ese caso.",
      explanation: "El patrón pide una `/` después del nombre, y el último no la tiene. La rama nueva lo captura.",
    },
    {
      type: "complete",
      id: "link-optional",
      prompt: "Jefe: sin parámetros, `link` no pide el segundo argumento. Con parámetros, es obligatorio. Completá el rest.",
      code: `${PARAMS}function link<R extends string>(ruta: R, ...resto: ___): string {\n  const valores = resto[0] as Record<string, string> | undefined;\n  return ruta.replace(/:([A-Za-z]+)/g, (_m, k: string) => valores?.[k] ?? "");\n}`,
      tests: "const a: string = link(\"/inicio\");\nconst b: string = link(\"/perfil/:nick\", { nick: \"rys\" });\ntype _1 = Expect<Equal<Parameters<typeof link<\"/inicio\">>[\"length\"], 1>>;\ntype _2 = Expect<Equal<Parameters<typeof link<\"/perfil/:nick\">>[\"length\"], 2>>;\ntype _3 = Expect<Equal<Parameters<typeof link<\"/perfil/:nick\">>[1], { nick: string }>>;",
      solution: "[NombresParams<R>] extends [never] ? [] : [params: Params<R>]",
      hint: "El rest puede ser una tupla calculada. Para chequear `never`, envolvelo: `[X] extends [never]`.",
      explanation: "Sin nombres, el rest es `[]`. Con nombres, es `[params: Params<R>]`. `[X] extends [never]` evita que se distribuya.",
    },
  ],
};

export default lesson;
