import type { Leccion } from "../../tipos.ts";

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

const leccion: Leccion = {
  id: "caminos-objeto",
  titulo: "GPS de tipos",
  resumen: "Listar todos los caminos de un objeto anidado como strings y sacar el tipo que vive al final de cada uno.",
  teoria: [
    { texto: "Misión: que `get(partida, \"mapa.zona.x\")` sepa que devuelve `number`, y que `get(partida, \"mapa.zona.w\")` ni compile. Para eso hacen falta dos armas: un tipo que liste todos los caminos válidos y otro que siga un camino hasta el fondo." },
    { texto: "`Caminos<T>` recorre cada clave. La clave sola ya es un camino, y si lo que cuelga es un objeto, le pega un punto y todos los caminos de adentro. El truco `{ [K in ...]: ... }[keyof T & string]` arma un objeto y lo aplasta en la unión de sus valores." },
    { codigo: CAMINOS + "type C = Caminos<{ a: { b: { c: 1 } } }>;" },
    { texto: "`C` es `\"a\" | \"a.b\" | \"a.b.c\"`. El `& string` deja afuera claves numéricas y símbolos, que no se pueden meter en un template literal." },
    { texto: "`Obtener<T, P>` hace al revés: corta el camino en el primer punto con `infer`, baja una clave y sigue con el resto. Cuando ya no hay punto, es la última clave." },
    { codigo: OBTENER + "type X = Obtener<{ a: { b: { c: 1 } } }, \"a.b.c\">;" },
  ],
  ejercicios: [
    {
      tipo: "elegir",
      id: "elegir-caminos",
      enunciado: "Con el `Caminos` de la teoría, ¿qué da `Caminos<{ vida: number; arma: { dano: number } }>`?",
      opciones: [
        "\"vida\" | \"arma\" | \"arma.dano\"",
        "\"vida\" | \"arma.dano\"",
        "\"arma.dano\"",
        "\"vida\" | \"arma\" | \"dano\"",
      ],
      correcta: 0,
      explicacion: "Cada clave es un camino por sí misma, y arma además abre la puerta a arma.dano. dano solo, sin el prefijo, no es un camino desde la raíz.",
    },
    {
      tipo: "completar",
      id: "claves-texto",
      enunciado: "Calentamiento: quedate solo con las claves que son string. Las numéricas no entran en un camino con puntos.",
      codigo: "type ClavesTexto<T> = ___;",
      pruebas: "type _1 = Esperar<Igual<ClavesTexto<{ a: 1; 2: 3; b: 4 }>, \"a\" | \"b\">>;\ntype _2 = Esperar<Igual<ClavesTexto<{ 0: 1 }>, never>>;",
      solucion: "keyof T & string",
      explicacion: "keyof T da \"a\" | 2 | \"b\". Intersecar con string borra el 2. También anda Extract<keyof T, string>.",
    },
    {
      tipo: "completar",
      id: "prefijar",
      enunciado: "Pegale un prefijo con punto a cada camino de una unión.",
      codigo: "type Prefijar<P extends string, K extends string> = ___;",
      pruebas: "type _1 = Esperar<Igual<Prefijar<\"mapa\", \"nombre\" | \"zona\">, \"mapa.nombre\" | \"mapa.zona\">>;\ntype _2 = Esperar<Igual<Prefijar<\"a\", never>, never>>;",
      solucion: "`${P}.${K}`",
      explicacion: "Un template literal con una unión adentro se reparte solo: una variante por cada miembro. Y con never no queda ninguna.",
    },
    {
      tipo: "completar",
      id: "caminos",
      enunciado: "Escribí Caminos<T>: todas las rutas con puntos de un objeto, a cualquier profundidad.",
      codigo: `${PARTIDA}type Caminos<T> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Caminos<{ a: { b: { c: 1 } } }>, \"a\" | \"a.b\" | \"a.b.c\">>;\ntype _2 = Esperar<Igual<Caminos<{ ronda: number; jugador: { nick: string } }>, \"ronda\" | \"jugador\" | \"jugador.nick\">>;\ntype _3 = Esperar<Igual<Extract<Caminos<Partida>, `mapa.zona.${string}`>, \"mapa.zona.x\" | \"mapa.zona.y\">>;",
      solucion: "T extends object ? { [K in keyof T & string]: K | (T[K] extends object ? `${K}.${Caminos<T[K]>}` : never) }[keyof T & string] : never",
      pista: "Para cada clave K: K, y si T[K] es objeto, también `${K}.${Caminos<T[K]>}`. Después indexá el objeto mapeado con sus propias claves para quedarte con la unión.",
      explicacion: "El objeto mapeado guarda en cada clave sus caminos; indexarlo con [keyof T & string] los junta a todos en una unión.",
    },
    {
      tipo: "completar",
      id: "obtener",
      enunciado: "Escribí Obtener<T, P>: seguí el camino P dentro de T y devolvé el tipo que hay al final. Si el camino no existe, never.",
      codigo: `${PARTIDA}type Obtener<T, P> = ___;`,
      pruebas: "type _1 = Esperar<Igual<Obtener<Partida, \"mapa.zona.x\">, number>>;\ntype _2 = Esperar<Igual<Obtener<Partida, \"jugador\">, { nick: string; nivel: number }>>;\ntype _3 = Esperar<Igual<Obtener<Partida, \"mapa.techo\">, never>>;\ntype _4 = Esperar<Igual<Obtener<Partida, \"ronda\">, number>>;",
      solucion: "P extends `${infer Cabeza}.${infer Resto}` ? Cabeza extends keyof T ? Obtener<T[Cabeza], Resto> : never : P extends keyof T ? T[P] : never",
      pista: "infer en un template literal agarra lo más corto posible antes del punto: `${infer Cabeza}.${infer Resto}` corta en el primero.",
      explicacion: "Se come una clave por vuelta. Cuando no queda ningún punto, P es la última clave y alcanza con T[P].",
    },
    {
      tipo: "arreglar",
      id: "arreglar-indice",
      enunciado: "Este Obtener no compila: TypeScript no sabe si Cabeza es una clave de T. Agregá el chequeo que falta.",
      codigo: `${PARTIDA}type Obtener<T, P> = P extends \`\${infer Cabeza}.\${infer Resto}\`
  ? Obtener<T[Cabeza], Resto>
  : P extends keyof T
    ? T[P]
    : never;`,
      pruebas: "type _1 = Esperar<Igual<Obtener<Partida, \"jugador.nivel\">, number>>;",
      solucion: `${PARTIDA}${OBTENER}`,
      explicacion: "Cabeza es un string cualquiera sacado con infer. Hasta que no se confirma Cabeza extends keyof T, T[Cabeza] no es un acceso válido.",
    },
    {
      tipo: "predecir",
      id: "get-valor",
      codigo: `${PARTIDA}${CAMINOS}${OBTENER}${GET}const p: Partida = { mapa: { nombre: "muelle", zona: { x: 4, y: 9 } }, jugador: { nick: "rys", nivel: 12 }, ronda: 3 };
const y: number = get(p, "mapa.zona.y");
y + p.ronda;`,
      respuesta: "12",
      explicacion: "\"mapa.zona.y\" es un camino válido y Obtener dice que es number, así que la anotación encaja. En ejecución vale 9, más la ronda 3.",
    },
    {
      tipo: "predecir",
      id: "get-invalido",
      codigo: `${PARTIDA}${CAMINOS}${OBTENER}${GET}const p: Partida = { mapa: { nombre: "muelle", zona: { x: 4, y: 9 } }, jugador: { nick: "rys", nivel: 12 }, ronda: 3 };
get(p, "jugador.vida");`,
      respuesta: "type error",
      explicacion: "\"jugador.vida\" no está en Caminos<Partida>. El error salta en el editor, antes de que nadie lea un undefined en producción.",
    },
    {
      tipo: "completar",
      id: "jefe-caminos-de",
      enunciado: "Jefe: CaminosDe<T, V> devuelve solo los caminos cuyo valor es asignable a V. Ideal para un get que solo acepte rutas a números.",
      codigo: `${PARTIDA}type CaminosDe<T, V> = ___;`,
      pruebas: "type _1 = Esperar<Igual<CaminosDe<Partida, number>, \"mapa.zona.x\" | \"mapa.zona.y\" | \"jugador.nivel\" | \"ronda\">>;\ntype _2 = Esperar<Igual<CaminosDe<Partida, string>, \"mapa.nombre\" | \"jugador.nick\">>;\ntype _3 = Esperar<Igual<CaminosDe<{ a: { b: boolean } }, number>, never>>;",
      solucion: "T extends object ? { [K in keyof T & string]: (T[K] extends V ? K : never) | (T[K] extends object ? `${K}.${CaminosDe<T[K], V>}` : never) }[keyof T & string] : never",
      pista: "Es Caminos con un filtro: la clave sola entra solo si T[K] extends V. La parte recursiva queda igual, pasando V hacia abajo.",
      explicacion: "Las ramas intermedias ya no aparecen solas porque un objeto no es number. Un template literal con never adentro también es never, así que las ramas sin premio desaparecen.",
    },
  ],
};

export default leccion;
