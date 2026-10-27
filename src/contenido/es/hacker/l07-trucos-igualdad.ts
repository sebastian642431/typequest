import type { Leccion } from "../../tipos.ts";

const IGUAL = "type Igual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n";
const INGENUO = "type IgualIngenuo<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;\n";
const A_INTER = "type UnionAInterseccion<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;\n";
const ULTIMO = "type UltimoDeUnion<U> = UnionAInterseccion<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;\n";
const ES_UNION = "type EsUnion<T, C = T> = [T] extends [never] ? false : T extends unknown ? ([C] extends [T] ? false : true) : never;\n";

const leccion: Leccion = {
  id: "trucos-igualdad",
  titulo: "Magia negra de comparación",
  resumen: "Cómo funciona Igual por dentro y los conjuros para detectar any, never, uniones y desarmarlas.",
  teoria: [
    { texto: "El `Igual` que usás en todas las pruebas no es un chequeo de asignabilidad. `[A] extends [B]` en las dos direcciones parece suficiente, pero `any` se asigna a todo y todo se asigna a `any`: con ese método `any` sería igual a `number`. Fraude." },
    { codigo: IGUAL },
    { texto: "El truco: dos funciones genéricas cuyo retorno es un condicional sobre un `T` que todavía no existe. TypeScript no puede resolverlos, así que para comparar las dos firmas exige que los condicionales sean idénticos, y eso incluye que `A` y `B` sean el mismo tipo exacto. Ahí `any` no engaña a nadie." },
    { texto: "Más conjuros: `any` es el único tipo que hace que `1 & T` deje de ser imposible. `never` se detecta envuelto en tupla, porque un condicional pelado sobre `never` no reparte nada y devuelve `never`. Y una unión se reconoce porque, al repartirla, cada pedazo es más chico que el todo." },
    { texto: "Las posiciones de parámetro son contravariantes: si inferís un solo tipo desde varias funciones `(x: A) => void | (x: B) => void`, TypeScript busca algo que sirva para todas y devuelve `A & B`. Con eso una unión se convierte en intersección, y una intersección de funciones se comporta como sobrecargas, de donde `infer` saca la última." },
    { codigo: A_INTER + ULTIMO },
  ],
  ejercicios: [
    {
      tipo: "elegir",
      id: "elegir-ingenuo",
      enunciado: "Con `type IgualIngenuo<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false`, ¿qué da `IgualIngenuo<any, number>`?",
      opciones: ["true", "false", "boolean", "never"],
      correcta: 0,
      explicacion: "any se asigna a number y number se asigna a any. Los dos extends pasan y el ingenuo cae en la trampa.",
    },
    {
      tipo: "predecir",
      id: "ingenuo-readonly",
      codigo: `${INGENUO}const r: IgualIngenuo<{ hp: number }, { readonly hp: number }> = true;
r;`,
      respuesta: "true",
      explicacion: "readonly no afecta la asignabilidad, así que para el ingenuo son iguales.",
    },
    {
      tipo: "predecir",
      id: "igual-readonly",
      codigo: `${IGUAL}const r: Igual<{ hp: number }, { readonly hp: number }> = true;
r;`,
      respuesta: "type error",
      explicacion: "El Igual con funciones genéricas compara por identidad, y una propiedad readonly no es idéntica a una mutable. Da false, y false no entra en true.",
    },
    {
      tipo: "completar",
      id: "es-any",
      enunciado: "Detectá any. Pista de oro: para casi cualquier T, 1 & T da 1 o never; solo con any da any.",
      codigo: "type EsAny<T> = ___;",
      pruebas: "type _1 = Esperar<Igual<EsAny<any>, true>>;\ntype _2 = Esperar<Igual<EsAny<unknown>, false>>;\ntype _3 = Esperar<Igual<EsAny<never>, false>>;\ntype _4 = Esperar<Igual<EsAny<number>, false>>;",
      solucion: "0 extends 1 & T ? true : false",
      explicacion: "1 & any es any, y 0 entra en any. Para cualquier otro T, 1 & T es 1 o never, y 0 no entra en ninguno.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-es-never",
      enunciado: "Este EsNever devuelve never cuando le pasás never. Arreglalo sin cambiar el nombre.",
      codigo: "type EsNever<T> = T extends never ? true : false;",
      pruebas: "type _1 = Esperar<Igual<EsNever<never>, true>>;\ntype _2 = Esperar<Igual<EsNever<undefined>, false>>;\ntype _3 = Esperar<Igual<EsNever<string | never>, false>>;",
      solucion: "type EsNever<T> = [T] extends [never] ? true : false;",
      explicacion: "Un condicional con T pelado reparte la unión, y never es la unión vacía: no hay nada que repartir y el resultado es never. Con la tupla no reparte.",
    },
    {
      tipo: "completar",
      id: "es-union",
      enunciado: "Detectá si T es una unión. C es una copia de T que no se reparte.",
      codigo: "type EsUnion<T, C = T> = ___;",
      pruebas: "type _1 = Esperar<Igual<EsUnion<string>, false>>;\ntype _2 = Esperar<Igual<EsUnion<1 | 2>, true>>;\ntype _3 = Esperar<Igual<EsUnion<never>, false>>;\ntype _4 = Esperar<Igual<EsUnion<boolean>, true>>;\ntype _5 = Esperar<Igual<EsUnion<{ a: 1 | 2 }>, false>>;",
      solucion: "[T] extends [never] ? false : T extends unknown ? ([C] extends [T] ? false : true) : never",
      pista: "Repartí T con T extends unknown. Adentro, T es un solo miembro pero C sigue siendo la unión entera: si [C] extends [T] no pasa, había más de uno.",
      explicacion: "Para una unión, cada miembro es más chico que la unión completa y todas las ramas dan true. boolean cuenta porque es true | false. never se descarta primero, si no daría never.",
    },
    {
      tipo: "completar",
      id: "union-a-interseccion",
      enunciado: "Convertí una unión en intersección usando la contravarianza de los parámetros.",
      codigo: "type UnionAInterseccion<U> = ___;",
      pruebas: "type _1 = Esperar<Igual<UnionAInterseccion<{ a: 1 } | { b: 2 }>, { a: 1 } & { b: 2 }>>;\ntype _2 = Esperar<Igual<UnionAInterseccion<string | number>, never>>;\ntype _3 = Esperar<Igual<UnionAInterseccion<{ x: 0 }>, { x: 0 }>>;",
      solucion: "(U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never",
      pista: "Primero repartí U en una unión de funciones que reciben cada miembro. Después inferí el parámetro de esa unión.",
      explicacion: "Para que una sola función sirva como cualquiera de las de la unión, su parámetro tiene que aceptar todos los miembros a la vez: la intersección. string & number no tiene habitantes, por eso es never.",
    },
    {
      tipo: "completar",
      id: "ultimo-de-union",
      enunciado: "Sacá un miembro de la unión: el último, según TypeScript. Usá UnionAInterseccion.",
      codigo: `${A_INTER}${ES_UNION}type UltimoDeUnion<U> = ___;`,
      pruebas: "type _1 = Esperar<Igual<UltimoDeUnion<\"x\">, \"x\">>;\ntype _2 = Esperar<Igual<EsUnion<UltimoDeUnion<\"a\" | \"b\" | \"c\">>, false>>;\ntype _3 = Esperar<Igual<UltimoDeUnion<\"a\" | \"b\" | \"c\"> extends \"a\" | \"b\" | \"c\" ? true : false, true>>;",
      solucion: "UnionAInterseccion<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never",
      pista: "Una intersección de funciones es una función sobrecargada, e infer sobre una sobrecarga usa la última firma.",
      explicacion: "UnionAInterseccion arma ((x: \"a\") => void) & ((x: \"b\") => void) & ... y al inferir el parámetro de una sobrecarga, TypeScript mira solo la última. Cuál es la última depende del orden interno de la unión, por eso las pruebas no apuestan por un miembro puntual.",
    },
    {
      tipo: "completar",
      id: "jefe-union-a-tupla",
      enunciado: "Jefe: UnionATupla<U> arma una tupla con todos los miembros de la unión, sacando el último una y otra vez. El orden no importa, que no se pierda ni se repita nadie.",
      codigo: `${A_INTER}${ULTIMO}type UnionATupla<U, L = UltimoDeUnion<U>> = ___;`,
      pruebas: "type _1 = Esperar<Igual<UnionATupla<never>, []>>;\ntype _2 = Esperar<Igual<UnionATupla<\"solo\">, [\"solo\"]>>;\ntype _3 = Esperar<Igual<UnionATupla<\"a\" | \"b\" | \"c\">[\"length\"], 3>>;\ntype _4 = Esperar<Igual<UnionATupla<\"a\" | \"b\" | \"c\">[number], \"a\" | \"b\" | \"c\">>;",
      solucion: "[U] extends [never] ? [] : [...UnionATupla<Exclude<U, L>>, L]",
      pista: "Caso base: si U es never, tupla vacía. Si no, poné L al final y recursá con U sin L.",
      explicacion: "Cada vuelta saca un miembro con UltimoDeUnion y lo descarta con Exclude, hasta vaciar la unión. Un hack famoso, pero no lo uses en producción con uniones gigantes: el orden no está garantizado y la recursión tiene techo.",
    },
  ],
};

export default leccion;
