import type { Leccion } from "../../tipos.ts";

const PAR = "type Par<S extends string> = S extends `${infer K}=${infer V}` ? { [P in K]: V } : {};\n";

const APLANAR = "type Aplanar<T> = { [K in keyof T]: T[K] };\n";

const DE_NOMBRE = "type DeNombre = { string: string; number: number; boolean: boolean };\n";

const leccion: Leccion = {
  id: "query-tipada",
  titulo: "El parser final",
  resumen: "Convertir \"a=1&b=2\" en un objeto y armar un validador que infiere su propio tipo.",
  teoria: [
    { texto: "Último nivel del sótano. Juntás todo: templates para cortar, recursión para recorrer y mapped types para armar objetos. El objetivo: que `\"modo=duelo&mapa=mansion\"` se convierta en `{ modo: \"duelo\"; mapa: \"mansion\" }` sin ejecutar nada." },
    { codigo: "type Par<S extends string> = S extends `${infer K}=${infer V}` ? { [P in K]: V } : {};\ntype P = Par<\"modo=duelo\">;" },
    { texto: "Al juntar pedazos con `&` queda una intersección: `{ a: \"1\" } & { b: \"2\" }`. Se comporta como un objeto, pero no es idéntico a `{ a: \"1\"; b: \"2\" }`. Un mapped type que copia propiedad por propiedad la aplana." },
    { codigo: "type Aplanar<T> = { [K in keyof T]: T[K] };" },
    { texto: "El bonus: un `esquema` que recibe nombres de tipos como strings (`\"string\"`, `\"number\"`) y devuelve una función cuyo tipo de salida se calcula de esos strings. Es la idea detrás de las librerías de validación, en miniatura." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "par-ok",
      codigo: `${PAR}const p: Par<"mapa=mansion"> = { mapa: "mansion" };\np.mapa;`,
      respuesta: "\"mansion\"",
      explicacion: "`Par<\"mapa=mansion\">` es `{ mapa: \"mansion\" }`. El objeto encaja justo.",
    },
    {
      tipo: "completar",
      id: "par",
      enunciado: "`Par<S>` convierte `\"clave=valor\"` en `{ clave: \"valor\" }`. Si no hay `=`, da un objeto vacío.",
      codigo: "type Par<S extends string> = ___;",
      pruebas: "type _1 = Esperar<Igual<Par<\"a=1\">, { a: \"1\" }>>;\ntype _2 = Esperar<Igual<Par<\"modo=duelo\">, { modo: \"duelo\" }>>;\ntype _3 = Esperar<Igual<Par<\"suelto\">, {}>>;",
      solucion: "S extends `${infer K}=${infer V}` ? { [P in K]: V } : {}",
      explicacion: "El template separa clave y valor. Un mapped type sobre una sola clave arma el objeto con esa propiedad.",
    },
    {
      tipo: "elegir",
      id: "interseccion-igual",
      enunciado: "¿Qué tipo queda en `R`?",
      codigo: "type Igual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\ntype R = Igual<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>;",
      opciones: ["true", "false", "never", "boolean"],
      correcta: 1,
      explicacion: "Para usarlos son intercambiables, pero `Igual` compara si son idénticos, y una intersección no es idéntica a un objeto plano.",
    },
    {
      tipo: "completar",
      id: "aplanar",
      enunciado: "Escribí `Aplanar<T>` para que una intersección de objetos quede como un solo objeto.",
      codigo: "type Aplanar<T> = ___;",
      pruebas: "type _1 = Esperar<Igual<Aplanar<{ a: 1 } & { b: 2 }>, { a: 1; b: 2 }>>;\ntype _2 = Esperar<Igual<Aplanar<{ x: string } & { y?: number }>, { x: string; y?: number }>>;",
      solucion: "{ [K in keyof T]: T[K] }",
      explicacion: "El mapped type recorre todas las claves de la intersección y arma un objeto nuevo con ellas, conservando el `?`.",
    },
    {
      tipo: "completar",
      id: "query",
      enunciado: "`Query<S>` parsea una query string entera. Tenés `Par` y `Aplanar` listos.",
      codigo: `${PAR}${APLANAR}type Query<S extends string> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Query<\"a=1&b=2\">, { a: \"1\"; b: \"2\" }>>;\ntype _2 = Esperar<Igual<Query<\"modo=duelo\">, { modo: \"duelo\" }>>;\ntype _3 = Esperar<Igual<Query<\"x=1&y=2&z=3\">, { x: \"1\"; y: \"2\"; z: \"3\" }>>;",
      solucion: "S extends `${infer P}&${infer Resto}` ? Aplanar<Par<P> & Query<Resto>> : Par<S>",
      pista: "Cortá en el primer `&`, convertí el pedazo con `Par` y juntalo con lo que da el resto. Sin `Aplanar` las pruebas no pasan.",
      explicacion: "Cada vuelta procesa un par y lo intersecta con el resultado del resto. `Aplanar` deja todo en un objeto plano.",
    },
    {
      tipo: "arreglar",
      id: "a-numero",
      enunciado: "`ANumero<S>` debería convertir `\"42\"` en el literal `42` y dejar el resto como está. Ahora no convierte nada.",
      codigo: "type ANumero<S extends string> = S extends `${infer N}` ? N : S;",
      pruebas: "type _1 = Esperar<Igual<ANumero<\"42\">, 42>>;\ntype _2 = Esperar<Igual<ANumero<\"7\">, 7>>;\ntype _3 = Esperar<Igual<ANumero<\"hola\">, \"hola\">>;",
      solucion: "type ANumero<S extends string> = S extends `${infer N extends number}` ? N : S;",
      pista: "Un `infer` puede llevar su propia restricción.",
      explicacion: "Con `infer N extends number`, el compilador intenta leer el texto como número. Si puede, `N` es el literal numérico; si no, el patrón no encaja.",
    },
    {
      tipo: "predecir",
      id: "de-nombre",
      codigo: `${DE_NOMBRE}const edad: DeNombre["number"] = "7";\nedad;`,
      respuesta: "type error",
      explicacion: "`DeNombre[\"number\"]` es el tipo `number`. El string `\"7\"` no entra, por más que parezca un número.",
    },
    {
      tipo: "arreglar",
      id: "esquema",
      enunciado: "`esquema` no compila: con esa restricción, `E[K]` puede ser cualquier string y no sirve para indexar `DeNombre`. Arreglá la restricción de `E`.",
      codigo: `${DE_NOMBRE}type Inferir<E extends Record<string, string>> = { [K in keyof E]: DeNombre[E[K]] };\nfunction esquema<E extends Record<string, string>>(forma: E) {\n  return (dato: Record<string, unknown>): Inferir<E> => {\n    for (const k in forma) if (typeof dato[k] !== forma[k]) throw new TypeError(k);\n    return dato as Inferir<E>;\n  };\n}`,
      pruebas: "const validar = esquema({ nombre: \"string\", edad: \"number\" });\ntype _1 = Esperar<Igual<ReturnType<typeof validar>, { nombre: string; edad: number }>>;",
      solucion: `${DE_NOMBRE}type Inferir<E extends Record<string, keyof DeNombre>> = { [K in keyof E]: DeNombre[E[K]] };\nfunction esquema<E extends Record<string, keyof DeNombre>>(forma: E) {\n  return (dato: Record<string, unknown>): Inferir<E> => {\n    for (const k in forma) if (typeof dato[k] !== forma[k]) throw new TypeError(k);\n    return dato as Inferir<E>;\n  };\n}`,
      pista: "Hay que cambiarla en dos lugares.",
      explicacion: "Con `Record<string, keyof DeNombre>`, cada valor es `\"string\" | \"number\" | \"boolean\"`, así que indexa bien. Y de yapa, el compilador conserva los literales al inferir `E`, en vez de ensancharlos a `string`.",
    },
    {
      tipo: "completar",
      id: "esquema-opcional",
      enunciado: "Jefe: el esquema ahora acepta campos opcionales con `?` al final (`\"number?\"`). `Inferir<E>` tiene que dar `edad?: number` para esos y propiedades obligatorias para el resto, sin `readonly`, todo en un objeto plano. Tenés `Base` para sacar el nombre del tipo.",
      codigo: `${DE_NOMBRE}${APLANAR}type Campo = keyof DeNombre | \`\${keyof DeNombre}?\`;\ntype Base<C> = C extends \`\${infer B extends keyof DeNombre}?\` ? B : C extends keyof DeNombre ? C : never;\ntype Inferir<E extends Record<string, Campo>> = ___;\nfunction esquema<const E extends Record<string, Campo>>(forma: E): (dato: Record<string, unknown>) => Inferir<E> {\n  return (dato) => dato as Inferir<E>;\n}`,
      pruebas: "type _1 = Esperar<Igual<Inferir<{ nombre: \"string\"; edad: \"number?\" }>, { nombre: string; edad?: number }>>;\ntype _2 = Esperar<Igual<Inferir<{ activo: \"boolean\" }>, { activo: boolean }>>;\nconst validar = esquema({ nick: \"string\", clan: \"string?\", nivel: \"number\" });\ntype _3 = Esperar<Igual<ReturnType<typeof validar>, { nick: string; nivel: number; clan?: string }>>;",
      solucion: "Aplanar<{ -readonly [K in keyof E as E[K] extends `${string}?` ? never : K]: DeNombre[Base<E[K]>] } & { -readonly [K in keyof E as E[K] extends `${string}?` ? K : never]?: DeNombre[Base<E[K]>] }>",
      pista: "Partilo en dos mapped types con `as` para filtrar claves: uno con las obligatorias y otro, con `?`, con las opcionales. Después aplaná la intersección. El `const` del genérico deja todo `readonly`: sacáselo con `-readonly`.",
      explicacion: "El `as` con condicional filtra las claves: `never` las saca. Un mapped type tiene las obligatorias y el otro, con el modificador `?`, las opcionales. `Base` saca el `?` del nombre para indexar `DeNombre`, y `Aplanar` junta todo en un objeto plano.",
    },
  ],
};

export default leccion;
