import type { Lesson } from "../../../../content/types.ts";

const IGUAL = "type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n";
const INGENUO = "type IgualIngenuo<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;\n";
const A_INTER = "type UnionAInterseccion<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;\n";
const ULTIMO = "type UltimoDeUnion<U> = UnionAInterseccion<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;\n";
const ES_UNION = "type EsUnion<T, C = T> = [T] extends [never] ? false : T extends unknown ? ([C] extends [T] ? false : true) : never;\n";

const lesson: Lesson = {
  id: "equality-tricks",
  title: "Magia negra de comparación",
  summary: "Cómo funciona `Igual` por dentro y trucos para detectar `any`, `never` y uniones.",
  idea: "Comparar tipos exactos pide trucos: `any`, `never` y las uniones engañan.",
  theory: [
    { title: "El Igual ingenuo falla", text: "`[A] extends [B]` en las dos direcciones parece bastar. Pero `any` se asigna a todo: daría igual a `number`." },
    { title: "El Igual de verdad", text: "Compara dos funciones genéricas con un `T` sin resolver. Eso exige que `A` y `B` sean idénticos.", code: IGUAL },
    { title: "Detectar any y never", text: "Solo con `any`, `1 & T` deja de dar `1` o `never`. `never` se detecta envuelto: `[T] extends [never]`." },
    { title: "Detectar uniones", text: "Al repartir una unión, cada pedazo es más chico que el todo. Así se nota que es una unión." },
    { title: "Unión a intersección", text: "Inferir un parámetro de varias funciones da la intersección. Y en una sobrecarga, `infer` toma la última firma.", code: A_INTER + ULTIMO },
  ],
  exercises: [
    {
      type: "choose",
      id: "choose-naive",
      prompt: "Con el `IgualIngenuo` de doble `[A] extends [B]`, ¿qué da `IgualIngenuo<any, number>`?",
      options: ["true", "false", "boolean", "never"],
      correct: 0,
      explanation: "`any` entra en `number` y `number` entra en `any`. Los dos `extends` pasan y el ingenuo cae.",
    },
    {
      type: "predict",
      id: "naive-readonly",
      code: `${INGENUO}const r: IgualIngenuo<{ hp: number }, { readonly hp: number }> = true;
r;`,
      answer: "true",
      explanation: "`readonly` no cambia la asignabilidad. Para el ingenuo son iguales.",
    },
    {
      type: "predict",
      id: "equal-readonly",
      code: `${IGUAL}const r: Equal<{ hp: number }, { readonly hp: number }> = true;
r;`,
      answer: "type error",
      explanation: "Este `Igual` compara identidad, y `readonly` no es idéntico a mutable. Da `false`, que no entra en `true`.",
    },
    {
      type: "complete",
      id: "is-any",
      prompt: "Detectá `any`. Dato: `1 & T` da `1` o `never`, salvo con `any`, que da `any`.",
      code: "type EsAny<T> = ___;",
      tests: "type _1 = Expect<Equal<EsAny<any>, true>>;\ntype _2 = Expect<Equal<EsAny<unknown>, false>>;\ntype _3 = Expect<Equal<EsAny<never>, false>>;\ntype _4 = Expect<Equal<EsAny<number>, false>>;",
      solution: "0 extends 1 & T ? true : false",
      explanation: "`1 & any` es `any`, y `0` entra en `any`. Con otro `T`, `0` no entra ni en `1` ni en `never`.",
    },
    {
      type: "fix",
      id: "fix-is-never",
      prompt: "Este `EsNever` da `never` cuando le pasás `never`. Arreglalo sin cambiar el nombre.",
      code: "type EsNever<T> = T extends never ? true : false;",
      tests: "type _1 = Expect<Equal<EsNever<never>, true>>;\ntype _2 = Expect<Equal<EsNever<undefined>, false>>;\ntype _3 = Expect<Equal<EsNever<string | never>, false>>;",
      solution: "type EsNever<T> = [T] extends [never] ? true : false;",
      explanation: "Un condicional con `T` pelado reparte, y `never` es la unión vacía: da `never`. La tupla evita el reparto.",
    },
    {
      type: "complete",
      id: "is-union",
      prompt: "Detectá si `T` es una unión. `C` es una copia de `T` que no se reparte.",
      code: "type EsUnion<T, C = T> = ___;",
      tests: "type _1 = Expect<Equal<EsUnion<string>, false>>;\ntype _2 = Expect<Equal<EsUnion<1 | 2>, true>>;\ntype _3 = Expect<Equal<EsUnion<never>, false>>;\ntype _4 = Expect<Equal<EsUnion<boolean>, true>>;\ntype _5 = Expect<Equal<EsUnion<{ a: 1 | 2 }>, false>>;",
      solution: "[T] extends [never] ? false : T extends unknown ? ([C] extends [T] ? false : true) : never",
      hint: "Repartí con `T extends unknown`. Si `[C] extends [T]` falla, había más de un miembro.",
      explanation: "En una unión, cada miembro es más chico que el todo: da `true`. `boolean` es `true | false`. `never` se descarta antes.",
    },
    {
      type: "complete",
      id: "union-to-intersection",
      prompt: "Convertí una unión en intersección usando los parámetros de funciones.",
      code: "type UnionAInterseccion<U> = ___;",
      tests: "type _1 = Expect<Equal<UnionAInterseccion<{ a: 1 } | { b: 2 }>, { a: 1 } & { b: 2 }>>;\ntype _2 = Expect<Equal<UnionAInterseccion<string | number>, never>>;\ntype _3 = Expect<Equal<UnionAInterseccion<{ x: 0 }>, { x: 0 }>>;",
      solution: "(U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never",
      hint: "Repartí `U` en una unión de funciones. Después inferí el parámetro.",
      explanation: "Un parámetro que sirva para todas las funciones tiene que aceptar todos los miembros: la intersección.",
    },
    {
      type: "complete",
      id: "last-of-union",
      prompt: "Sacá un miembro de la unión: el último según TypeScript. Usá `UnionAInterseccion`.",
      code: `${A_INTER}${ES_UNION}type UltimoDeUnion<U> = ___;`,
      tests: "type _1 = Expect<Equal<UltimoDeUnion<\"x\">, \"x\">>;\ntype _2 = Expect<Equal<EsUnion<UltimoDeUnion<\"a\" | \"b\" | \"c\">>, false>>;\ntype _3 = Expect<Equal<UltimoDeUnion<\"a\" | \"b\" | \"c\"> extends \"a\" | \"b\" | \"c\" ? true : false, true>>;",
      solution: "UnionAInterseccion<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never",
      hint: "Una intersección de funciones es una sobrecarga, e `infer` usa la última firma.",
      explanation: "La intersección de funciones es una sobrecarga, e `infer` mira la última. El orden es interno: las pruebas no apuestan.",
    },
    {
      type: "complete",
      id: "boss-union-to-tuple",
      prompt: "Jefe: `UnionATupla<U>` arma una tupla con todos los miembros. El orden no importa; no falta ni sobra nadie.",
      code: `${A_INTER}${ULTIMO}type UnionATupla<U, L = UltimoDeUnion<U>> = ___;`,
      tests: "type _1 = Expect<Equal<UnionATupla<never>, []>>;\ntype _2 = Expect<Equal<UnionATupla<\"solo\">, [\"solo\"]>>;\ntype _3 = Expect<Equal<UnionATupla<\"a\" | \"b\" | \"c\">[\"length\"], 3>>;\ntype _4 = Expect<Equal<UnionATupla<\"a\" | \"b\" | \"c\">[number], \"a\" | \"b\" | \"c\">>;",
      solution: "[U] extends [never] ? [] : [...UnionATupla<Exclude<U, L>>, L]",
      hint: "Si `U` es `never`, tupla vacía. Si no, poné `L` al final y seguí con `U` sin `L`.",
      explanation: "Cada vuelta saca un miembro y lo quita con `Exclude`. No lo uses con uniones gigantes: el orden no está garantizado.",
    },
  ],
};

export default lesson;
