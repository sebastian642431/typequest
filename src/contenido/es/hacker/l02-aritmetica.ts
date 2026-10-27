import type { Leccion } from "../../tipos.ts";

const CONSTRUIR = "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;\n";

const leccion: Leccion = {
  id: "aritmetica",
  titulo: "Una calculadora hecha de tuplas",
  resumen: "El compilador no sabe sumar. Le enseñás vos, contando elementos.",
  teoria: [
    { texto: "Los tipos no traen `+` ni `-`. Pero hay un lugar donde aparecen números exactos: el `length` de una tupla. `[0, 0, 0][\"length\"]` es el literal `3`. Entonces, si sabés fabricar una tupla de N elementos, sabés representar N." },
    { codigo: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> =\n  Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;" },
    { texto: "El acumulador `Acc` crece de a uno hasta que su largo coincide con N. Con eso, sumar es pegar dos tuplas y medir; restar es sacarle a una tupla el pedazo que mide lo mismo que la otra." },
    { codigo: "type Sumar<A extends number, B extends number> =\n  [...ConstruirTupla<A>, ...ConstruirTupla<B>][\"length\"];" },
    { texto: "Advertencia de seguridad: cada elemento es una vuelta de recursión, y el compilador tiene un tope. Esta calculadora es para números chicos. Si la usás para 5000, explota (en el compilador, no en tu cara)." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "largo-literal",
      codigo: "type Tres = [\"x\", \"y\", \"z\"][\"length\"];\nconst n: Tres = 3;\nn * 2;",
      respuesta: "6",
      explicacion: "El largo de una tupla de tres elementos es el literal `3`, así que `n` solo puede valer 3.",
    },
    {
      tipo: "completar",
      id: "construir",
      enunciado: "Fabricá `ConstruirTupla<N>`: una tupla de N elementos `unknown`. Usá el acumulador.",
      codigo: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = ___;",
      pruebas: "type _1 = Esperar<Igual<ConstruirTupla<3>, [unknown, unknown, unknown]>>;\ntype _2 = Esperar<Igual<ConstruirTupla<0>, []>>;\ntype _3 = Esperar<Igual<ConstruirTupla<12>[\"length\"], 12>>;",
      solucion: "Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>",
      explicacion: "Mientras el largo de `Acc` no sea N, se le agrega un elemento y se vuelve a llamar. Cuando coincide, se devuelve el acumulador.",
    },
    {
      tipo: "arreglar",
      id: "construir-anidada",
      enunciado: "Esta versión cuelga el compilador para N = 3. Encontrá por qué y arreglala.",
      codigo: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [unknown, Acc]>;",
      pruebas: "type _1 = Esperar<Igual<ConstruirTupla<3>[\"length\"], 3>>;\ntype _2 = Esperar<Igual<ConstruirTupla<5>[\"length\"], 5>>;",
      solucion: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;",
      pista: "¿Cuánto mide `[unknown, Acc]`, sin importar cuánto mida `Acc`?",
      explicacion: "`[unknown, Acc]` siempre mide 2: mete la tupla vieja como un solo elemento. Nunca llega a 3 y la recursión no termina. Con `...Acc` sí crece.",
    },
    {
      tipo: "completar",
      id: "sumar",
      enunciado: "Con `ConstruirTupla` ya lista, implementá `Sumar<A, B>`.",
      codigo: `${CONSTRUIR}type Sumar<A extends number, B extends number> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Sumar<2, 3>, 5>>;\ntype _2 = Esperar<Igual<Sumar<0, 7>, 7>>;\ntype _3 = Esperar<Igual<Sumar<12, 20>, 32>>;",
      solucion: "[...ConstruirTupla<A>, ...ConstruirTupla<B>][\"length\"]",
      explicacion: "Pegás una tupla de A con una de B y medís. El `length` de la tupla resultante es el literal de la suma.",
    },
    {
      tipo: "predecir",
      id: "suma-mentirosa",
      codigo: `${CONSTRUIR}type Sumar<A extends number, B extends number> = [...ConstruirTupla<A>, ...ConstruirTupla<B>]["length"];\nconst total: Sumar<3, 4> = 8;\ntotal;`,
      respuesta: "type error",
      explicacion: "`Sumar<3, 4>` es el literal `7`. Asignarle 8 es tan error como asignarle un string.",
    },
    {
      tipo: "arreglar",
      id: "restar",
      enunciado: "`Restar<A, B>` debería dar un número, pero devuelve otra cosa. Arreglalo.",
      codigo: `${CONSTRUIR}type Restar<A extends number, B extends number> = ConstruirTupla<A> extends [...ConstruirTupla<B>, ...infer R extends unknown[]] ? R : never;`,
      pruebas: "type _1 = Esperar<Igual<Restar<5, 2>, 3>>;\ntype _2 = Esperar<Igual<Restar<9, 9>, 0>>;\ntype _3 = Esperar<Igual<Restar<2, 5>, never>>;",
      solucion: `${CONSTRUIR}type Restar<A extends number, B extends number> = ConstruirTupla<A> extends [...ConstruirTupla<B>, ...infer R extends unknown[]] ? R["length"] : never;`,
      explicacion: "El patrón le saca a la tupla de A un pedazo del tamaño de B, y lo que sobra es `R`. Pero `R` es una tupla: hay que medirla con `R[\"length\"]`.",
    },
    {
      tipo: "elegir",
      id: "tope",
      enunciado: "¿Qué pasa si hacés `ConstruirTupla<5000>`?",
      opciones: [
        "Da una tupla de 5000 elementos, solo tarda un poco más",
        "El compilador corta con un error de recursión demasiado profunda",
        "Da `never` sin avisar",
        "Da `number`",
      ],
      correcta: 1,
      explicacion: "El compilador limita cuántas instancias recursivas acepta y tira un error. Por eso esta aritmética es para números chicos.",
    },
    {
      tipo: "completar",
      id: "mayor-que",
      enunciado: "`MayorQue<A, B>` da `true` si A es estrictamente mayor que B, y `false` si no.",
      codigo: `${CONSTRUIR}type MayorQue<A extends number, B extends number> = ___;`,
      pruebas: "type _1 = Esperar<Igual<MayorQue<5, 3>, true>>;\ntype _2 = Esperar<Igual<MayorQue<3, 3>, false>>;\ntype _3 = Esperar<Igual<MayorQue<2, 9>, false>>;\ntype _4 = Esperar<Igual<MayorQue<1, 0>, true>>;",
      solucion: "ConstruirTupla<A> extends [...ConstruirTupla<B>, unknown, ...unknown[]] ? true : false",
      pista: "A es mayor que B si su tupla empieza con la de B y todavía le queda por lo menos un elemento.",
      explicacion: "El patrón `[...ConstruirTupla<B>, unknown, ...unknown[]]` exige todo lo de B más al menos uno extra. Si son iguales, falta ese extra y da `false`.",
    },
    {
      tipo: "completar",
      id: "multiplicar",
      enunciado: "Jefe: `Multiplicar<A, B>`. Tenés dos acumuladores: `Cont` cuenta cuántas veces sumaste y `Acc` junta el resultado. Completá el cuerpo.",
      codigo: `${CONSTRUIR}type Multiplicar<A extends number, B extends number, Cont extends unknown[] = [], Acc extends unknown[] = []> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Multiplicar<3, 4>, 12>>;\ntype _2 = Esperar<Igual<Multiplicar<0, 5>, 0>>;\ntype _3 = Esperar<Igual<Multiplicar<5, 0>, 0>>;\ntype _4 = Esperar<Igual<Multiplicar<6, 6>, 36>>;",
      solucion: "Cont[\"length\"] extends B ? Acc[\"length\"] : Multiplicar<A, B, [...Cont, unknown], [...Acc, ...ConstruirTupla<A>]>",
      pista: "Multiplicar es sumar A, B veces. Cuando `Cont` mida B, devolvé el largo de `Acc`; si no, sumale una tupla de A a `Acc` y un elemento a `Cont`.",
      explicacion: "Cada vuelta agrega A elementos a `Acc` y uno a `Cont`. Después de B vueltas, `Acc` mide A × B. Con B = 0 corta de entrada y da 0.",
    },
  ],
};

export default leccion;
