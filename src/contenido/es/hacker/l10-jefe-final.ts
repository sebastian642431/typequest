import type { Leccion } from "../../tipos.ts";

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
const leccion: Leccion = {
  id: "jefe-final",
  titulo: "El jefe final",
  resumen: "Parsers de firmas, rutas tipadas, fusiones profundas: todo lo aprendido contra los jefes más duros del juego.",
  teoria: [
    { texto: "Llegaste al último piso. Acá no hay técnicas nuevas: hay combinaciones. Template literals con `infer` para parsear, recursión con acumulador para construir, objetos mapeados para dar forma y condicionales para decidir." },
    { texto: "Estrategia para cualquier jefe: primero escribí el caso más chico que tiene que andar, después el caso base de la recursión, y recién ahí el paso recursivo. Si algo da `never` donde no debería, probá cada pedazo por separado con un `type X = ...` y mirá qué sale." },
    { codigo: "type Cortar<S extends string> = S extends `${infer A}, ${infer B}` ? [A, ...Cortar<B>] : [S];\ntype R = Cortar<\"a, b, c\">;" },
    { texto: "`Plano<T>` (un mapeado identidad) aplana intersecciones como `{ a: 1 } & { b: 2 }` en un solo objeto. Lo vas a necesitar para comparar resultados acumulados." },
  ],
  ejercicios: [
    {
      tipo: "completar",
      id: "jefe-params",
      enunciado: "Jefe: convertí una lista de parámetros escrita como string en un objeto con sus tipos. TipoDe ya traduce \"number\", \"string\" y \"boolean\".",
      codigo: `${TIPO_DE}type Params<S extends string, Acc = {}> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Params<\"a: number, b: string\">, { a: number; b: string }>>;\ntype _2 = Esperar<Igual<Params<\"vivo: boolean\">, { vivo: boolean }>>;\ntype _3 = Esperar<Igual<Params<\"\">, {}>>;\ntype _4 = Esperar<Igual<Params<\"x: number, y: number, z: number\">, { x: number; y: number; z: number }>>;",
      solucion: "S extends `${infer N}: ${infer T}, ${infer Resto}` ? Params<Resto, Acc & { [K in N]: TipoDe<T> }> : S extends `${infer N}: ${infer T}` ? Plano<Acc & { [K in N]: TipoDe<T> }> : Plano<Acc>",
      pista: "Tres casos: quedan varios (nombre: tipo, resto), queda uno solo (nombre: tipo), o no queda nada. Acumulá en Acc y aplaná con Plano al final.",
      explicacion: "Cada vuelta se come un parámetro y lo suma al acumulador. infer corta en el primer \": \" y en la primera \", \", así que los parámetros salen en orden.",
    },
    {
      tipo: "completar",
      id: "jefe-firma",
      enunciado: "Jefe: parseá una firma completa como \"suma(a: number, b: number): number\" a { nombre, params, retorno }. Params ya está hecho.",
      codigo: `${TIPO_DE}${PARAMS}type Firma<S extends string> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Firma<\"suma(a: number, b: number): number\">, { nombre: \"suma\"; params: { a: number; b: number }; retorno: number }>>;\ntype _2 = Esperar<Igual<Firma<\"saludar(nick: string): void\">, { nombre: \"saludar\"; params: { nick: string }; retorno: void }>>;\ntype _3 = Esperar<Igual<Firma<\"reset(): boolean\">, { nombre: \"reset\"; params: {}; retorno: boolean }>>;\ntype _4 = Esperar<Igual<Firma<\"esto no es una firma\">, never>>;",
      solucion: "S extends `${infer Nombre}(${infer P}): ${infer R}` ? { nombre: Nombre; params: Params<P>; retorno: TipoDe<R> } : never",
      pista: "Un solo template literal alcanza: nombre hasta el paréntesis, parámetros hasta \"): \", y el retorno es lo que sobra.",
      explicacion: "El patrón separa las tres partes de una, y cada parte se delega: Params para la lista, TipoDe para el retorno. Si el string no tiene la forma, no matchea y da never.",
    },
    {
      tipo: "completar",
      id: "jefe-ruta-opcional",
      enunciado: "Jefe: las rutas ahora aceptan parámetros opcionales con ? al final, como \"/clanes/:clan/:pagina?\". NombresRuta ya junta los nombres crudos; armá el objeto con los obligatorios y los opcionales.",
      codigo: `${TIPO_DE}${NOMBRES_RUTA}type ParamsDeRuta<S extends string> = ___;`,
      pruebas: "type _1 = Esperar<Igual<ParamsDeRuta<\"/clanes/:clan/:pagina?\">, { clan: string; pagina?: string }>>;\ntype _2 = Esperar<Igual<ParamsDeRuta<\"/perfil/:nick\">, { nick: string }>>;\ntype _3 = Esperar<Igual<ParamsDeRuta<\"/tienda\">, {}>>;\ntype _4 = Esperar<Igual<ParamsDeRuta<\"/ranking/:temporada?/:region?\">, { temporada?: string; region?: string }>>;",
      solucion: "Plano<{ [K in NombresRuta<S> as K extends `${string}?` ? never : K]: string } & { [K in NombresRuta<S> as K extends `${infer N}?` ? N : never]?: string }>",
      pista: "Dos objetos mapeados con remapeo de claves (as): uno descarta los nombres que terminan en ? y el otro se queda solo con esos, sin el ?, y les pone el modificador opcional. Plano los junta.",
      explicacion: "El as dentro del mapeado filtra (devolviendo never) y renombra (con infer) en el mismo paso. Como Plano es homomórfico, respeta el ? de cada propiedad al aplanar.",
    },
    {
      tipo: "arreglar",
      id: "jefe-router-const",
      enunciado: "Jefe: el router recibe una tabla de rutas, pero ir() acepta cualquier cosa como params: las rutas se infieren como string a secas. Arreglalo con una sola palabra, sin tocar la llamada.",
      codigo: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });`,
      pruebas: "type _1 = Esperar<Igual<Parameters<typeof router.ir<\"perfil\">>[1], { nick: string }>>;\ntype _2 = Esperar<Igual<Parameters<typeof router.ir<\"clan\">>[1], { clan: string; pagina?: string }>>;",
      solucion: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("const ")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });`,
      pista: "Un parámetro de tipo puede pedir que lo infieran como si el argumento tuviera as const.",
      explicacion: "Sin const, T es { perfil: string; clan: string } y ParamsDeRuta<string> no encuentra ningún parámetro. Con <const T ...> los valores quedan como literales y cada ruta dicta sus params.",
    },
    {
      tipo: "predecir",
      id: "jefe-router-valor",
      enunciado: "Jefe: ¿compila? Si compila, ¿qué devuelve?",
      codigo: `${TIPO_DE}${PARAMS_RUTA}${ROUTER("const ")}const router = crearRouter({ perfil: "/perfil/:nick", clan: "/clanes/:clan/:pagina?" });
router.ir("clan", { clan: "perugius" });`,
      respuesta: "\"/clanes/perugius\"",
      explicacion: "pagina es opcional, así que alcanza con clan. En ejecución, el segmento opcional sin valor desaparece con su barra.",
    },
    {
      tipo: "completar",
      id: "jefe-fusionar",
      enunciado: "Jefe: Fusionar<A, B> mezcla dos objetos en profundidad. Si una clave está en los dos y en los dos es objeto, se fusiona adentro; si no, gana B.",
      codigo: "type Fusionar<A, B> = ___;",
      pruebas: "type Base = { audio: { musica: number; efectos: number }; idioma: string; graficos: { calidad: \"baja\" | \"alta\" } };\ntype Cambios = { audio: { musica: 0 }; graficos: \"auto\"; fps: number };\ntype _1 = Esperar<Igual<Fusionar<Base, Cambios>, { audio: { musica: 0; efectos: number }; idioma: string; graficos: \"auto\"; fps: number }>>;\ntype _2 = Esperar<Igual<Fusionar<{ a: 1 }, {}>, { a: 1 }>>;\ntype _3 = Esperar<Igual<Fusionar<{ a: { b: { c: 1; d: 2 } } }, { a: { b: { d: 3 } } }>, { a: { b: { c: 1; d: 3 } } }>>;",
      solucion: "{ [K in keyof A | keyof B]: K extends keyof B ? K extends keyof A ? A[K] extends object ? B[K] extends object ? Fusionar<A[K], B[K]> : B[K] : B[K] : B[K] : K extends keyof A ? A[K] : never }",
      pista: "Mapeá sobre keyof A | keyof B. Para cada K, preguntá en orden: ¿está en B? ¿también en A? ¿los dos son objeto? Solo en ese último caso recursás.",
      explicacion: "Las claves de los dos lados entran al mapeado, y los condicionales anidados deciden quién gana. Como el resultado sale de un mapeado, ya es un objeto plano y se puede comparar directo.",
    },
    {
      tipo: "completar",
      id: "jefe-firma-a-funcion",
      enunciado: "Jefe final: de la firma en texto al tipo de función real. Args<S> tiene que dar la tupla de tipos de los parámetros, en orden; Funcion ya la usa para armar la función entera.",
      codigo: `${TIPO_DE}type Args<S extends string> = ___;
type Funcion<S extends string> = S extends \`\${string}(\${infer P}): \${infer R}\` ? (...args: Args<P>) => TipoDe<R> : never;`,
      pruebas: "type _1 = Esperar<Igual<Args<\"a: number, b: string, c: boolean\">, [number, string, boolean]>>;\ntype _2 = Esperar<Igual<Args<\"\">, []>>;\ntype _3 = Esperar<Igual<Funcion<\"suma(a: number, b: number): number\">, (...args: [number, number]) => number>>;\nconst gritar: Funcion<\"gritar(nick: string, veces: number): string\"> = (nick, veces) => nick.toUpperCase().repeat(veces);",
      solucion: "S extends `${string}: ${infer T}, ${infer Resto}` ? [TipoDe<T>, ...Args<Resto>] : S extends `${string}: ${infer T}` ? [TipoDe<T>] : []",
      pista: "Igual que Params, pero en vez de acumular un objeto armá una tupla: [TipoDe<T>, ...Args<Resto>]. El nombre del parámetro no importa, saltealo con ${string}.",
      explicacion: "Una tupla como tipo de ...args se convierte en la lista de parámetros, así que el callback de gritar recibe nick: string y veces: number sin anotar nada. Un string entró y salió una función tipada: juego terminado, ahora el compilador trabaja para vos.",
    },
  ],
};

export default leccion;
