import type { Lesson } from "../../../../content/types.ts";

const PARTIDA = `type Partida = {
  mapa: { nombre: string; zona: { x: number; y: number } };
  jugador: { nick: string; nivel: number };
  ronda: number;
};
`;

const CAMINOS = `type Caminos<T> = T extends object
  ? { [K in keyof T & string]: K | (T[K] extends object ? \`\${K}.\${Caminos<T[K]>}\` : never) }[keyof T & string]
  : never;
`;

const OBTENER = `type Obtener<T, P> = P extends \`\${infer Cabeza}.\${infer Resto}\`
  ? Cabeza extends keyof T
    ? Obtener<T[Cabeza], Resto>
    : never
  : P extends keyof T
    ? T[P]
    : never;
`;

const GET = `function get<T, P extends Caminos<T>>(obj: T, camino: P): Obtener<T, P> {
  return camino.split(".").reduce<any>((acc, k) => acc[k], obj);
}
`;

const lesson: Lesson = {
  id: "object-paths",
  title: "GPS de tipos",
  summary: "Listar los caminos de un objeto anidado y sacar el tipo al final de cada uno.",
  idea: "Un tipo lista todos los caminos `\"a.b.c\"` y otro sigue uno hasta el fondo.",
  theory: [
    { title: "La misión", text: "`get(partida, \"mapa.zona.x\")` tiene que saber que da `number`. Un camino que no existe no compila." },
    { title: "Listar caminos", text: "Cada clave es un camino. Si adentro hay un objeto, se le pega un punto y sus caminos. `C` es `\"a\" | \"a.b\" | \"a.b.c\"`.", code: CAMINOS + "type C = Caminos<{ a: { b: { c: 1 } } }>;" },
    { title: "Solo claves de texto", text: "`& string` deja afuera números y símbolos. No entran en un template literal." },
    { title: "Seguir un camino", text: "`Obtener` corta en el primer punto, baja una clave y sigue con el resto. Acá `X` es `1`.", code: OBTENER + "type X = Obtener<{ a: { b: { c: 1 } } }, \"a.b.c\">;" },
  ],
  exercises: [
    {
      type: "choose",
      id: "choose-paths",
      prompt: "Con el `Caminos` de la teoría, ¿qué da `Caminos<{ vida: number; arma: { dano: number } }>`?",
      options: [
        "\"vida\" | \"arma\" | \"arma.dano\"",
        "\"vida\" | \"arma.dano\"",
        "\"arma.dano\"",
        "\"vida\" | \"arma\" | \"dano\"",
      ],
      correct: 0,
      explanation: "Cada clave es un camino, y `arma` además abre `arma.dano`. `dano` solo no es un camino desde la raíz.",
    },
    {
      type: "complete",
      id: "string-keys",
      prompt: "Quedate solo con las claves que son string. Las numéricas no entran en un camino.",
      code: "type ClavesTexto<T> = ___;",
      tests: "type _1 = Expect<Equal<ClavesTexto<{ a: 1; 2: 3; b: 4 }>, \"a\" | \"b\">>;\ntype _2 = Expect<Equal<ClavesTexto<{ 0: 1 }>, never>>;",
      solution: "keyof T & string",
      explanation: "`keyof T` da `\"a\" | 2 | \"b\"`. Intersecar con `string` borra el 2.",
    },
    {
      type: "complete",
      id: "prefix",
      prompt: "Pegale un prefijo con punto a cada camino de una unión.",
      code: "type Prefijar<P extends string, K extends string> = ___;",
      tests: "type _1 = Expect<Equal<Prefijar<\"mapa\", \"nombre\" | \"zona\">, \"mapa.nombre\" | \"mapa.zona\">>;\ntype _2 = Expect<Equal<Prefijar<\"a\", never>, never>>;",
      solution: "`${P}.${K}`",
      explanation: "Un template con una unión adentro se reparte: una variante por miembro. Con `never` no queda ninguna.",
    },
    {
      type: "complete",
      id: "paths",
      prompt: "Escribí `Caminos<T>`: todas las rutas con puntos de un objeto, a cualquier profundidad.",
      code: `${PARTIDA}type Caminos<T> = ___;`,
      tests: "type _1 = Expect<Equal<Caminos<{ a: { b: { c: 1 } } }>, \"a\" | \"a.b\" | \"a.b.c\">>;\ntype _2 = Expect<Equal<Caminos<{ ronda: number; jugador: { nick: string } }>, \"ronda\" | \"jugador\" | \"jugador.nick\">>;\ntype _3 = Expect<Equal<Extract<Caminos<Partida>, `mapa.zona.${string}`>, \"mapa.zona.x\" | \"mapa.zona.y\">>;",
      solution: "T extends object ? { [K in keyof T & string]: K | (T[K] extends object ? `${K}.${Caminos<T[K]>}` : never) }[keyof T & string] : never",
      hint: "Para cada `K`: `K`, y si `T[K]` es objeto, también `${K}.${Caminos<T[K]>}`. Indexá con sus claves.",
      explanation: "El objeto mapeado guarda los caminos de cada clave. Indexarlo con `[keyof T & string]` los junta en una unión.",
    },
    {
      type: "complete",
      id: "get-at",
      prompt: "Escribí `Obtener<T, P>`: seguí el camino `P` dentro de `T` y da el tipo del final. Si no existe, `never`.",
      code: `${PARTIDA}type Obtener<T, P> = ___;`,
      tests: "type _1 = Expect<Equal<Obtener<Partida, \"mapa.zona.x\">, number>>;\ntype _2 = Expect<Equal<Obtener<Partida, \"jugador\">, { nick: string; nivel: number }>>;\ntype _3 = Expect<Equal<Obtener<Partida, \"mapa.techo\">, never>>;\ntype _4 = Expect<Equal<Obtener<Partida, \"ronda\">, number>>;",
      solution: "P extends `${infer Cabeza}.${infer Resto}` ? Cabeza extends keyof T ? Obtener<T[Cabeza], Resto> : never : P extends keyof T ? T[P] : never",
      hint: "`${infer Cabeza}.${infer Resto}` corta en el primer punto.",
      explanation: "Baja una clave por vuelta. Sin puntos, `P` es la última clave y alcanza con `T[P]`.",
    },
    {
      type: "fix",
      id: "fix-index",
      prompt: "Este `Obtener` no compila: no se sabe si `Cabeza` es clave de `T`. Agregá el chequeo.",
      code: `${PARTIDA}type Obtener<T, P> = P extends \`\${infer Cabeza}.\${infer Resto}\`
  ? Obtener<T[Cabeza], Resto>
  : P extends keyof T
    ? T[P]
    : never;`,
      tests: "type _1 = Expect<Equal<Obtener<Partida, \"jugador.nivel\">, number>>;",
      solution: `${PARTIDA}${OBTENER}`,
      explanation: "`Cabeza` es un string cualquiera. Sin `Cabeza extends keyof T`, `T[Cabeza]` no es válido.",
    },
    {
      type: "predict",
      id: "get-value",
      code: `${PARTIDA}${CAMINOS}${OBTENER}${GET}const p: Partida = { mapa: { nombre: "muelle", zona: { x: 4, y: 9 } }, jugador: { nick: "rys", nivel: 12 }, ronda: 3 };
const y: number = get(p, "mapa.zona.y");
y + p.ronda;`,
      answer: "12",
      explanation: "El camino existe y `Obtener` dice `number`. En runtime vale 9, más la ronda 3.",
    },
    {
      type: "predict",
      id: "get-invalid",
      code: `${PARTIDA}${CAMINOS}${OBTENER}${GET}const p: Partida = { mapa: { nombre: "muelle", zona: { x: 4, y: 9 } }, jugador: { nick: "rys", nivel: 12 }, ronda: 3 };
get(p, "jugador.vida");`,
      answer: "type error",
      explanation: "`\"jugador.vida\"` no está en `Caminos<Partida>`. El error sale en el editor, no en producción.",
    },
    {
      type: "complete",
      id: "boss-paths-of",
      prompt: "Jefe: `CaminosDe<T, V>` da solo los caminos cuyo valor entra en `V`.",
      code: `${PARTIDA}type CaminosDe<T, V> = ___;`,
      tests: "type _1 = Expect<Equal<CaminosDe<Partida, number>, \"mapa.zona.x\" | \"mapa.zona.y\" | \"jugador.nivel\" | \"ronda\">>;\ntype _2 = Expect<Equal<CaminosDe<Partida, string>, \"mapa.nombre\" | \"jugador.nick\">>;\ntype _3 = Expect<Equal<CaminosDe<{ a: { b: boolean } }, number>, never>>;",
      solution: "T extends object ? { [K in keyof T & string]: (T[K] extends V ? K : never) | (T[K] extends object ? `${K}.${CaminosDe<T[K], V>}` : never) }[keyof T & string] : never",
      hint: "Es `Caminos` con un filtro: la clave sola entra si `T[K] extends V`. Pasá `V` hacia abajo.",
      explanation: "Un objeto no es `number`, así que las ramas intermedias no aparecen. Un template con `never` también es `never`.",
    },
  ],
};

export default lesson;
