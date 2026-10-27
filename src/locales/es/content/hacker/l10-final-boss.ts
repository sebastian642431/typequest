import type { Lesson } from "../../../../content/types.ts";

const TIPO_DE = `type TipoDe<S> = S extends "number" ? number : S extends "string" ? string : S extends "boolean" ? boolean : S extends "void" ? void : unknown;
type Plano<T> = { [K in keyof T]: T[K] };
`;

const PARAMS = `type Params<S extends string, Acc = {}> = S extends \`\${infer N}: \${infer T}, \${infer Resto}\`
  ? Params<Resto, Acc & { [K in N]: TipoDe<T> }>
  : S extends \`\${infer N}: \${infer T}\`
    ? Plano<Acc & { [K in N]: TipoDe<T> }>
    : Plano<Acc>;
`;

const NOMBRES_RUTA = `type NombresRuta<S extends string> = S extends \`\${string}:\${infer P}/\${infer R}\`
  ? P | NombresRuta<R>
  : S extends \`\${string}:\${infer P}\`
    ? P
    : never;
`;

const PARAMS_RUTA = `${NOMBRES_RUTA}type ParamsDeRuta<S extends string> = Plano<
  { [K in NombresRuta<S> as K extends \`\${string}?\` ? never : K]: string } & {
    [K in NombresRuta<S> as K extends \`\${infer N}?\` ? N : never]?: string;
  }
>;
`;

const ROUTER = (modificador: string) => `function crearRouter<${modificador}T extends Record<string, string>>(rutas: T) {
  return {
    ir<N extends keyof T & string>(nombre: N, params: ParamsDeRuta<T[N]>): string {
      const valores = params as Record<string, string | undefined>;
      return rutas[nombre].replace(/\\/:(\\w+)\\??/g, (_, k: string) => (valores[k] === undefined ? "" : "/" + valores[k]));
    },
  };
}
`;
const lesson: Lesson = {
  id: "final-boss",
  title: "El jefe final",
  summary: "Parsers de firmas, rutas tipadas y fusiones profundas: todo junto contra los jefes.",
  idea: "No hay técnicas nuevas: se combinan todas las anteriores.",
  theory: [
    { title: "Solo combinaciones", text: "Templates con `infer` para parsear, recursión para construir, mapped types para dar forma y condicionales para decidir." },
    { title: "Cómo atacar un jefe", text: "Primero el caso más chico que tiene que andar. Después el caso base. Al final, el paso recursivo." },
    { title: "Probá por partes", text: "Si algo da `never`, probá cada pedazo con un `type X = ...`. Acá `R` es `[\"a\", \"b\", \"c\"]`.", code: "type Cortar<S extends string> = S extends `${infer A}, ${infer B}` ? [A, ...Cortar<B>] : [S];\ntype R = Cortar<\"a, b, c\">;" },
    { title: "Plano aplana", text: "`Plano<T>` junta intersecciones como `{ a: 1 } & { b: 2 }` en un solo objeto. Sirve para comparar resultados." },
  ],
  exercises: [
    {
      type: "complete",
      id: "boss-params",
      prompt: "Jefe: pasá una lista de parámetros en texto a un objeto con sus tipos. `TipoDe` traduce los nombres.",
      code: `${TIPO_DE}type Params<S extends string, Acc = {}> = ___;`,
      tests: "type _1 = Expect<Equal<Params<\"a: number, b: string\">, { a: number; b: string }>>;\ntype _2 = Expect<Equal<Params<\"vivo: boolean\">, { vivo: boolean }>>;\ntype _3 = Expect<Equal<Params<\"\">, {}>>;\ntype _4 = Expect<Equal<Params<\"x: number, y: number, z: number\">, { x: number; y: number; z: number }>>;",
      solution: "S extends `${infer N}: ${infer T}, ${infer Resto}` ? Params<Resto, Acc & { [K in N]: TipoDe<T> }> : S extends `${infer N}: ${infer T}` ? Plano<Acc & { [K in N]: TipoDe<T> }> : Plano<Acc>",
      hint: "Tres casos: varios parámetros, uno solo o ninguno. Acumulá en `Acc` y aplaná con `Plano`.",
      explanation: "Cada vuelta se come un parámetro y lo suma a `Acc`. `infer` corta en la primera `\", \"`, así salen en orden.",
    },
    {
      type: "complete",
      id: "boss-signature",
      prompt: "Jefe: pasá `\"suma(a: number, b: number): number\"` a `{ nombre, params, retorno }`. `Params` ya está.",
      code: `${TIPO_DE}${PARAMS}type Firma<S extends string> = ___;`,
      tests: "type _1 = Expect<Equal<Firma<\"suma(a: number, b: number): number\">, { nombre: \"suma\"; params: { a: number; b: number }; retorno: number }>>;\ntype _2 = Expect<Equal<Firma<\"saludar(nick: string): void\">, { nombre: \"saludar\"; params: { nick: string }; retorno: void }>>;\ntype _3 = Expect<Equal<Firma<\"reset(): boolean\">, { nombre: \"reset\"; params: {}; retorno: boolean }>>;\ntype _4 = Expect<Equal<Firma<\"esto no es una firma\">, never>>;",
      solution: "S extends `${infer Nombre}(${infer P}): ${infer R}` ? { nombre: Nombre; params: Params<P>; retorno: TipoDe<R> } : never",
      hint: "Un template alcanza: nombre hasta `(`, params hasta `): `, y el retorno es lo que sobra.",
      explanation: "El patrón separa las tres partes. `Params` hace la lista y `TipoDe` el retorno. Si no encaja, da `never`.",
    },
    {
      type: "complete",
      id: "boss-optional-route",
      prompt: "Jefe: en `\"/clanes/:clan/:pagina?\"` el `?` marca un opcional. Armá el objeto con obligatorios y opcionales.",
      code: `${TIPO_DE}${NOMBRES_RUTA}type ParamsDeRuta<S extends string> = ___;`,
      tests: "type _1 = Expect<Equal<ParamsDeRuta<\"/clanes/:clan/:pagina?\">, { clan: string; pagina?: string }>>;\ntype _2 = Expect<Equal<ParamsDeRuta<\"/perfil/:nick\">, { nick: string }>>;\ntype _3 = Expect<Equal<ParamsDeRuta<\"/tienda\">, {}>>;\ntype _4 = Expect<Equal<ParamsDeRuta<\"/ranking/:temporada?/:region?\">, { temporada?: string; region?: string }>>;",
      solution: "Plano<{ [K in NombresRuta<S> as K extends `${string}?` ? never : K]: string } & { [K in NombresRuta<S> as K extends `${infer N}?` ? N : never]?: string }>",
      hint: "Dos mapped types con `as`: uno saca los que terminan en `?`, el otro deja solo esos, sin el `?`.",
      explanation: "El `as` filtra con `never` y renombra con `infer`. `Plano` respeta el `?` de cada propiedad.",
    },
    {
      type: "fix",
      id: "boss-router-const",
      prompt: "Jefe: `ir()` acepta cualquier `params` porque las rutas se infieren como `string`. Arreglalo con una palabra.",
      code: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });`,
      tests: "type _1 = Expect<Equal<Parameters<typeof router.ir<\"perfil\">>[1], { nick: string }>>;\ntype _2 = Expect<Equal<Parameters<typeof router.ir<\"clan\">>[1], { clan: string; pagina?: string }>>;",
      solution: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("const ")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });`,
      hint: "Un parámetro de tipo puede inferirse como si el argumento tuviera `as const`.",
      explanation: "Sin `const`, cada ruta es `string` y no hay parámetros. Con `<const T>` quedan literales y cada ruta dicta los suyos.",
    },
    {
      type: "predict",
      id: "boss-router-value",
      prompt: "Jefe: ¿compila? Si compila, ¿qué devuelve?",
      code: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("const ")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });
router.ir("clan", { clan: "perugius" });`,
      answer: "\"/clanes/perugius\"",
      explanation: "`pagina` es opcional: alcanza con `clan`. En runtime, el segmento sin valor desaparece con su barra.",
    },
    {
      type: "complete",
      id: "boss-merge",
      prompt: "Jefe: `Fusionar<A, B>` mezcla dos objetos en profundidad. Si en los dos es objeto, se fusiona; si no, gana `B`.",
      code: "type Fusionar<A, B> = ___;",
      tests: "type Base = { audio: { musica: number; efectos: number }; idioma: string; graficos: { calidad: \"baja\" | \"alta\" } };\ntype Cambios = { audio: { musica: 0 }; graficos: \"auto\"; fps: number };\ntype _1 = Expect<Equal<Fusionar<Base, Cambios>, { audio: { musica: 0; efectos: number }; idioma: string; graficos: \"auto\"; fps: number }>>;\ntype _2 = Expect<Equal<Fusionar<{ a: 1 }, {}>, { a: 1 }>>;\ntype _3 = Expect<Equal<Fusionar<{ a: { b: { c: 1; d: 2 } } }, { a: { b: { d: 3 } } }>, { a: { b: { c: 1; d: 3 } } }>>;",
      solution: "{ [K in keyof A | keyof B]: K extends keyof B ? K extends keyof A ? A[K] extends object ? B[K] extends object ? Fusionar<A[K], B[K]> : B[K] : B[K] : B[K] : K extends keyof A ? A[K] : never }",
      hint: "Mapeá `keyof A | keyof B`. ¿Está en B? ¿También en A? ¿Los dos son objeto? Solo ahí recursás.",
      explanation: "Entran las claves de los dos lados y los condicionales deciden quién gana. Como es un mapeado, ya queda plano.",
    },
    {
      type: "complete",
      id: "boss-signature-to-function",
      prompt: "Jefe final: `Args<S>` da la tupla de tipos de los parámetros, en orden. `Funcion` arma la función con eso.",
      code: `${TIPO_DE}type Args<S extends string> = ___;
type Funcion<S extends string> = S extends \`\${string}(\${infer P}): \${infer R}\` ? (...args: Args<P>) => TipoDe<R> : never;`,
      tests: "type _1 = Expect<Equal<Args<\"a: number, b: string, c: boolean\">, [number, string, boolean]>>;\ntype _2 = Expect<Equal<Args<\"\">, []>>;\ntype _3 = Expect<Equal<Funcion<\"suma(a: number, b: number): number\">, (...args: [number, number]) => number>>;\nconst gritar: Funcion<\"gritar(nick: string, veces: number): string\"> = (nick, veces) => nick.toUpperCase().repeat(veces);",
      solution: "S extends `${string}: ${infer T}, ${infer Resto}` ? [TipoDe<T>, ...Args<Resto>] : S extends `${string}: ${infer T}` ? [TipoDe<T>] : []",
      hint: "Como `Params`, pero armá una tupla: `[TipoDe<T>, ...Args<Resto>]`. Salteá el nombre con `${string}`.",
      explanation: "Una tupla en `...args` se vuelve la lista de parámetros. Así `gritar` conoce los tipos sin anotar nada.",
    },
  ],
};

export default lesson;
