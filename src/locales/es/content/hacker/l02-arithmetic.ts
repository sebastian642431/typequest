import type { Lesson } from "../../../../content/types.ts";

const CONSTRUIR = "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;\n";

const lesson: Lesson = {
  id: "arithmetic",
  title: "Una calculadora hecha de tuplas",
  summary: "El compilador no sabe sumar. Le enseñás contando elementos.",
  idea: "Una tupla de N elementos representa el número N. Con eso se hacen cuentas.",
  theory: [
    { title: "Números en tuplas", text: "Los tipos no tienen `+` ni `-`. Pero el `length` de una tupla es exacto: `[0, 0, 0][\"length\"]` es `3`." },
    { title: "Fabricar N", text: "`Acc` crece de a uno hasta que su largo es N.", code: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> =\n  Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;" },
    { title: "Sumar es pegar", text: "Pegás dos tuplas y medís. Restar es sacarle a una tupla un pedazo del largo de la otra.", code: "type Sumar<A extends number, B extends number> =\n  [...ConstruirTupla<A>, ...ConstruirTupla<B>][\"length\"];" },
    { title: "Solo números chicos", text: "Cada elemento es una vuelta de recursión, y hay un tope. Con 5000, el compilador corta con error." },
  ],
  exercises: [
    {
      type: "predict",
      id: "literal-length",
      code: "type Tres = [\"x\", \"y\", \"z\"][\"length\"];\nconst n: Tres = 3;\nn * 2;",
      answer: "6",
      explanation: "La tupla tiene tres elementos: su largo es el literal `3`. `n` solo puede valer 3.",
    },
    {
      type: "complete",
      id: "build",
      prompt: "Hacé `ConstruirTupla<N>`: una tupla de N elementos `unknown`. Usá el acumulador.",
      code: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = ___;",
      tests: "type _1 = Expect<Equal<ConstruirTupla<3>, [unknown, unknown, unknown]>>;\ntype _2 = Expect<Equal<ConstruirTupla<0>, []>>;\ntype _3 = Expect<Equal<ConstruirTupla<12>[\"length\"], 12>>;",
      solution: "Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>",
      explanation: "Si `Acc` no mide N, le sumás un elemento y repetís. Si mide N, lo devolvés.",
    },
    {
      type: "fix",
      id: "build-nested",
      prompt: "Esta versión cuelga el compilador con N = 3. Encontrá por qué y arreglala.",
      code: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [unknown, Acc]>;",
      tests: "type _1 = Expect<Equal<ConstruirTupla<3>[\"length\"], 3>>;\ntype _2 = Expect<Equal<ConstruirTupla<5>[\"length\"], 5>>;",
      solution: "type ConstruirTupla<N extends number, Acc extends unknown[] = []> = Acc[\"length\"] extends N ? Acc : ConstruirTupla<N, [...Acc, unknown]>;",
      hint: "¿Cuánto mide `[unknown, Acc]`, mida lo que mida `Acc`?",
      explanation: "`[unknown, Acc]` siempre mide 2, así que nunca llega a 3. Con `...Acc` sí crece.",
    },
    {
      type: "complete",
      id: "add",
      prompt: "Con `ConstruirTupla` lista, hacé `Sumar<A, B>`.",
      code: `${CONSTRUIR}type Sumar<A extends number, B extends number> = ___;`,
      tests: "type _1 = Expect<Equal<Sumar<2, 3>, 5>>;\ntype _2 = Expect<Equal<Sumar<0, 7>, 7>>;\ntype _3 = Expect<Equal<Sumar<12, 20>, 32>>;",
      solution: "[...ConstruirTupla<A>, ...ConstruirTupla<B>][\"length\"]",
      explanation: "Pegás una tupla de A y una de B. El `length` del resultado es la suma.",
    },
    {
      type: "predict",
      id: "lying-sum",
      code: `${CONSTRUIR}type Sumar<A extends number, B extends number> = [...ConstruirTupla<A>, ...ConstruirTupla<B>]["length"];\nconst total: Sumar<3, 4> = 8;\ntotal;`,
      answer: "type error",
      explanation: "`Sumar<3, 4>` es el literal `7`. El 8 no entra.",
    },
    {
      type: "fix",
      id: "subtract",
      prompt: "`Restar<A, B>` tiene que dar un número, pero da otra cosa. Arreglalo.",
      code: `${CONSTRUIR}type Restar<A extends number, B extends number> = ConstruirTupla<A> extends [...ConstruirTupla<B>, ...infer R extends unknown[]] ? R : never;`,
      tests: "type _1 = Expect<Equal<Restar<5, 2>, 3>>;\ntype _2 = Expect<Equal<Restar<9, 9>, 0>>;\ntype _3 = Expect<Equal<Restar<2, 5>, never>>;",
      solution: `${CONSTRUIR}type Restar<A extends number, B extends number> = ConstruirTupla<A> extends [...ConstruirTupla<B>, ...infer R extends unknown[]] ? R["length"] : never;`,
      explanation: "`R` es lo que sobra, pero es una tupla. Hay que medirla con `R[\"length\"]`.",
    },
    {
      type: "choose",
      id: "cap",
      prompt: "¿Qué pasa si hacés `ConstruirTupla<5000>`?",
      options: [
        "Da una tupla de 5000 elementos, solo tarda más",
        "El compilador corta con un error de recursión muy profunda",
        "Da `never` sin avisar",
        "Da `number`",
      ],
      correct: 1,
      explanation: "El compilador tiene un tope de recursión y tira error. Por eso esto es para números chicos.",
    },
    {
      type: "complete",
      id: "greater-than",
      prompt: "`MayorQue<A, B>` da `true` si A es mayor que B. Si no, `false`.",
      code: `${CONSTRUIR}type MayorQue<A extends number, B extends number> = ___;`,
      tests: "type _1 = Expect<Equal<MayorQue<5, 3>, true>>;\ntype _2 = Expect<Equal<MayorQue<3, 3>, false>>;\ntype _3 = Expect<Equal<MayorQue<2, 9>, false>>;\ntype _4 = Expect<Equal<MayorQue<1, 0>, true>>;",
      solution: "ConstruirTupla<A> extends [...ConstruirTupla<B>, unknown, ...unknown[]] ? true : false",
      hint: "A es mayor si su tupla empieza con la de B y le sobra al menos uno.",
      explanation: "El patrón pide todo B y al menos un elemento extra. Si son iguales, falta el extra y da `false`.",
    },
    {
      type: "complete",
      id: "multiply",
      prompt: "Jefe: `Multiplicar<A, B>`. `Cont` cuenta las vueltas y `Acc` junta el resultado. Completá el cuerpo.",
      code: `${CONSTRUIR}type Multiplicar<A extends number, B extends number, Cont extends unknown[] = [], Acc extends unknown[] = []> = ___;`,
      tests: "type _1 = Expect<Equal<Multiplicar<3, 4>, 12>>;\ntype _2 = Expect<Equal<Multiplicar<0, 5>, 0>>;\ntype _3 = Expect<Equal<Multiplicar<5, 0>, 0>>;\ntype _4 = Expect<Equal<Multiplicar<6, 6>, 36>>;",
      solution: "Cont[\"length\"] extends B ? Acc[\"length\"] : Multiplicar<A, B, [...Cont, unknown], [...Acc, ...ConstruirTupla<A>]>",
      hint: "Si `Cont` mide B, devolvé el largo de `Acc`. Si no, sumá A a `Acc` y uno a `Cont`.",
      explanation: "Cada vuelta suma A elementos a `Acc` y uno a `Cont`. Tras B vueltas, `Acc` mide A × B.",
    },
  ],
};

export default lesson;
