import type { Leccion } from "../../tipos.ts";

const NOMBRES =
  "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype NombresParams<R extends string> = R extends `${infer Seg}/${infer Resto}` ? NombreParam<Seg> | NombresParams<Resto> : NombreParam<R>;\n";

const PARAMS = `${NOMBRES}type Params<R extends string> = { [K in NombresParams<R>]: string };\n`;

const CUERPO = "{\n  const valores = params as Record<string, string>;\n  return ruta.replace(/:([A-Za-z]+)/g, (_m, k: string) => valores[k]);\n}";

const LINK = `${PARAMS}function link<R extends string>(ruta: R, params: Params<R>): string ${CUERPO}\n`;

const leccion: Leccion = {
  id: "rutas-tipadas",
  titulo: "Rutas que no se dejan romper",
  resumen: "Sacar los parámetros de una ruta como \"/usuarios/:id\" y obligar a pasarlos todos.",
  teoria: [
    { texto: "Misión: que `link(\"/usuarios/:id/posts/:postId\", ...)` exija exactamente `{ id: string; postId: string }`. Si falta uno o sobra otro, que no compile. Todo sale del string de la ruta." },
    { texto: "Paso 1: partir la ruta en segmentos con un template recursivo. Paso 2: quedarse con los que empiezan con `:` y sacarles los dos puntos. Eso da una unión de nombres." },
    { codigo: "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype N = NombreParam<\":id\">;" },
    { texto: "Paso 3: un mapped type convierte esa unión en un objeto. `{ [K in \"id\" | \"postId\"]: string }` es `{ id: string; postId: string }`." },
    { texto: "Paso 4: una función genérica con `R extends string` captura la ruta como literal, y el segundo parámetro se calcula a partir de `R`. El que llama no escribe ningún tipo: lo deduce todo el compilador." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "es-param",
      codigo: "type EsParam<S extends string> = S extends `:${string}` ? true : false;\nconst a: EsParam<\"usuarios\"> = true;\na;",
      respuesta: "type error",
      explicacion: "\"usuarios\" no empieza con dos puntos, así que `EsParam<\"usuarios\">` es `false`, y `true` no entra.",
    },
    {
      tipo: "completar",
      id: "nombre-param",
      enunciado: "`NombreParam<S>` recibe un segmento: si es un parámetro devuelve su nombre sin los dos puntos; si no, `never`.",
      codigo: "type NombreParam<S extends string> = ___;",
      pruebas: "type _1 = Esperar<Igual<NombreParam<\":id\">, \"id\">>;\ntype _2 = Esperar<Igual<NombreParam<\":postId\">, \"postId\">>;\ntype _3 = Esperar<Igual<NombreParam<\"posts\">, never>>;",
      solucion: "S extends `:${infer N}` ? N : never",
      explicacion: "El template `:${infer N}` solo encaja si el segmento arranca con dos puntos, y `N` se queda con el resto.",
    },
    {
      tipo: "completar",
      id: "nombres-params",
      enunciado: "Con `NombreParam` lista, `NombresParams<R>` tiene que recorrer la ruta por `/` y juntar todos los nombres en una unión.",
      codigo: "type NombreParam<S extends string> = S extends `:${infer N}` ? N : never;\ntype NombresParams<R extends string> = ___;",
      pruebas: "type _1 = Esperar<Igual<NombresParams<\"/usuarios/:id/posts/:postId\">, \"id\" | \"postId\">>;\ntype _2 = Esperar<Igual<NombresParams<\"/inicio\">, never>>;\ntype _3 = Esperar<Igual<NombresParams<\":a/:b/:c\">, \"a\" | \"b\" | \"c\">>;",
      solucion: "R extends `${infer Seg}/${infer Resto}` ? NombreParam<Seg> | NombresParams<Resto> : NombreParam<R>",
      pista: "Cortá en la primera barra. El segmento de la izquierda pasa por `NombreParam`, y lo de la derecha vuelve a entrar en la recursión.",
      explicacion: "Cada vuelta procesa un segmento y une el resultado con lo que da el resto. `never` en una unión desaparece, así que los segmentos fijos no suman nada.",
    },
    {
      tipo: "elegir",
      id: "mapped-union",
      enunciado: "¿A qué tipo equivale `Obj`?",
      codigo: "type Obj = { [K in \"id\" | \"postId\"]: string };",
      opciones: ["{ id: string; postId: string }", "{ id: string } | { postId: string }", "Record<string, string>", "{ K: string }"],
      correcta: 0,
      explicacion: "El mapped type crea una propiedad por cada miembro de la unión, todas en el mismo objeto.",
    },
    {
      tipo: "arreglar",
      id: "params",
      enunciado: "`Params<R>` debería dar el objeto de parámetros, pero está usando la ruta entera como clave. Arreglalo.",
      codigo: `${NOMBRES}type Params<R extends string> = { [K in R]: string };`,
      pruebas: "type _1 = Esperar<Igual<Params<\"/usuarios/:id/posts/:postId\">, { id: string; postId: string }>>;\ntype _2 = Esperar<Igual<Params<\"/inicio\">, {}>>;",
      solucion: `${NOMBRES}type Params<R extends string> = { [K in NombresParams<R>]: string };`,
      explicacion: "Las claves tienen que salir de `NombresParams<R>`. Si no hay parámetros la unión es `never` y el objeto queda vacío.",
    },
    {
      tipo: "predecir",
      id: "link-ok",
      codigo: `${LINK}link("/usuarios/:id/posts/:postId", { id: "7", postId: "42" });`,
      respuesta: "\"/usuarios/7/posts/42\"",
      explicacion: "Los dos parámetros están y son strings: compila, y en runtime cada `:nombre` se cambia por su valor.",
    },
    {
      tipo: "predecir",
      id: "link-falta",
      codigo: `${LINK}link("/usuarios/:id/posts/:postId", { id: "7" });`,
      respuesta: "type error",
      explicacion: "Falta `postId`. El tipo del segundo argumento sale de la ruta, y la ruta pide los dos.",
    },
    {
      tipo: "arreglar",
      id: "ultimo-param",
      enunciado: "Esta otra versión de `NombresParams` se olvida del último parámetro de la ruta. Arreglala sin cambiar el enfoque.",
      codigo: "type NombresParams<R extends string> = R extends `${string}:${infer N}/${infer Resto}` ? N | NombresParams<Resto> : never;",
      pruebas: "type _1 = Esperar<Igual<NombresParams<\"/usuarios/:id/posts/:postId\">, \"id\" | \"postId\">>;\ntype _2 = Esperar<Igual<NombresParams<\"/perfil/:nick\">, \"nick\">>;\ntype _3 = Esperar<Igual<NombresParams<\"/inicio\">, never>>;",
      solucion: "type NombresParams<R extends string> = R extends `${string}:${infer N}/${infer Resto}` ? N | NombresParams<Resto> : R extends `${string}:${infer N}` ? N : never;",
      pista: "El último parámetro no tiene una barra después. Hace falta otra rama para ese caso.",
      explicacion: "El patrón exige una `/` después del nombre, y el último parámetro termina la ruta. La rama nueva lo captura cuando ya no queda barra.",
    },
    {
      tipo: "completar",
      id: "link-opcional",
      enunciado: "Jefe: en rutas sin parámetros, `link` no tiene que pedir el segundo argumento; en rutas con parámetros, es obligatorio. Completá el tipo del rest.",
      codigo: `${PARAMS}function link<R extends string>(ruta: R, ...resto: ___): string {\n  const valores = resto[0] as Record<string, string> | undefined;\n  return ruta.replace(/:([A-Za-z]+)/g, (_m, k: string) => valores?.[k] ?? "");\n}`,
      pruebas: "const a: string = link(\"/inicio\");\nconst b: string = link(\"/perfil/:nick\", { nick: \"rys\" });\ntype _1 = Esperar<Igual<Parameters<typeof link<\"/inicio\">>[\"length\"], 1>>;\ntype _2 = Esperar<Igual<Parameters<typeof link<\"/perfil/:nick\">>[\"length\"], 2>>;\ntype _3 = Esperar<Igual<Parameters<typeof link<\"/perfil/:nick\">>[1], { nick: string }>>;",
      solucion: "[NombresParams<R>] extends [never] ? [] : [params: Params<R>]",
      pista: "El rest puede ser una tupla calculada. Para preguntar si algo es `never`, envolvelo en `[...]` de los dos lados: `never` pelado en un condicional genérico se distribuye y desaparece.",
      explicacion: "Si la ruta no tiene nombres, el rest es `[]` y no se puede pasar nada; si tiene, es `[params: Params<R>]` y hay que pasarlo. El `[X] extends [never]` evita que el condicional se distribuya sobre `never`.",
    },
  ],
};

export default leccion;
