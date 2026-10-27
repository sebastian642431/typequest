import type { Lesson } from "../../../../content/types.ts";

const EVENTOS = `type Eventos = {
  golpe: { dano: number; critico: boolean };
  muerte: { quien: string };
  pausa: undefined;
};
`;

const EMISOR = `class Emisor<M> {
  private oyentes: { [K in keyof M]?: ((datos: M[K]) => void)[] } = {};
  on<K extends keyof M>(evento: K, fn: (datos: M[K]) => void) {
    (this.oyentes[evento] ??= []).push(fn);
  }
  emit<K extends keyof M>(evento: K, datos: M[K]) {
    for (const fn of this.oyentes[evento] ?? []) fn(datos);
  }
}
`;

const TRANSICIONES = `type Transiciones = {
  quieto: "caminando" | "saltando";
  caminando: "quieto" | "corriendo" | "saltando";
  corriendo: "caminando" | "saltando";
  saltando: "quieto";
};
`;

const IR = `function ir<D extends keyof Transiciones, H extends Transiciones[D]>(desde: D, hacia: H): H {
  return hacia;
}
`;

const lesson: Lesson = {
  id: "typed-apis",
  title: "APIs que no se dejan usar mal",
  summary: "Emisores, builders y máquinas de estado donde usar mal la API no compila.",
  idea: "Un mapa de tipos y métodos genéricos convierten el mal uso en error de compilación.",
  theory: [
    { title: "Un mapa del dominio", text: "Un tipo describe cada evento y sus datos. Los métodos eligen una clave y sacan el resto de ahí.", code: EVENTOS },
    { title: "Métodos genéricos", text: "En `on(\"golpe\", fn)`, `K` es `\"golpe\"` y `fn` recibe `M[\"golpe\"]`. No anotás nada.", code: "on<K extends keyof M>(evento: K, fn: (datos: M[K]) => void)\nemit<K extends keyof M>(evento: K, datos: M[K])" },
    { title: "Builders que acumulan", text: "Cada llamada devuelve un builder nuevo con una clave más en su tipo." },
    { title: "Máquinas de estado", text: "Un mapa dice a qué estados se puede ir desde cada uno.", code: TRANSICIONES },
    { title: "Transición prohibida = error", text: "`H extends Transiciones[D]` solo acepta destinos del mapa. Cualquier otro no compila.", code: IR + "const ok = ir(\"quieto\", \"saltando\");" },
  ],
  exercises: [
    {
      type: "choose",
      id: "choose-on",
      prompt: "Con el `Emisor` de la teoría, en `e.on(\"muerte\", (d) => ...)`, ¿qué tipo tiene `d`?",
      options: [
        "{ quien: string }",
        "{ dano: number; critico: boolean } | { quien: string } | undefined",
        "Eventos",
        "any",
      ],
      correct: 0,
      explanation: "`K` se infiere como `\"muerte\"`, y el callback recibe `M[K]`: `Eventos[\"muerte\"]`.",
    },
    {
      type: "complete",
      id: "emit-data",
      prompt: "Completá el tipo de `datos` en `emit` para que dependa del evento elegido.",
      code: `${EVENTOS}class Emisor<M> {
  emit<K extends keyof M>(evento: K, datos: ___) {
    return [evento, datos];
  }
}`,
      tests: "const e = new Emisor<Eventos>();\ne.emit(\"muerte\", { quien: \"rys\" });\ntype _1 = Expect<Equal<Parameters<typeof e.emit<\"muerte\">>[1], { quien: string }>>;\ntype _2 = Expect<Equal<Parameters<typeof e.emit<\"golpe\">>[1], { dano: number; critico: boolean }>>;",
      solution: "M[K]",
      explanation: "`K` es la clave que se pasó, así que `M[K]` es justo el payload de ese evento.",
    },
    {
      type: "predict",
      id: "emit",
      code: `${EVENTOS}${EMISOR}const e = new Emisor<Eventos>();
let total = 0;
e.on("golpe", (d) => { total += d.critico ? d.dano * 2 : d.dano; });
e.emit("golpe", { dano: 10, critico: true });
e.emit("golpe", { dano: 5, critico: false });
total;`,
      answer: "25",
      explanation: "El primer golpe es crítico y suma 20. El segundo suma 5.",
    },
    {
      type: "predict",
      id: "emit-wrong",
      code: `${EVENTOS}${EMISOR}const e = new Emisor<Eventos>();
e.emit("muerte", { dano: 99, critico: true });
0;`,
      answer: "type error",
      explanation: "Para `\"muerte\"` el payload es `{ quien: string }`. Los datos de un golpe no entran.",
    },
    {
      type: "fix",
      id: "fix-on",
      prompt: "Este `on` no es genérico: `d` es la unión de todos los payloads y `d.dano` falla. Hacelo genérico.",
      code: `${EVENTOS}class Emisor<M> {
  private oyentes: ((datos: any) => void)[] = [];
  on(evento: keyof M, fn: (datos: M[keyof M]) => void) {
    this.oyentes.push(fn);
  }
}
const e = new Emisor<Eventos>();`,
      tests: "e.on(\"golpe\", (d) => d.dano * 2);\ne.on(\"muerte\", (d) => d.quien.toUpperCase());",
      solution: `${EVENTOS}class Emisor<M> {
  private oyentes: ((datos: any) => void)[] = [];
  on<K extends keyof M>(evento: K, fn: (datos: M[K]) => void) {
    this.oyentes.push(fn);
  }
}
const e = new Emisor<Eventos>();`,
      explanation: "Con `keyof M` suelto se pierde el vínculo. Un `K` genérico ata el evento con su payload.",
    },
    {
      type: "complete",
      id: "builder",
      prompt: "Este builder acumula cada clave en su tipo. Completá lo que devuelve `con`.",
      code: `class Armador<T extends object> {
  constructor(private datos: T) {}
  con<K extends string, V>(clave: K, valor: V): Armador<___> {
    return new Armador({ ...this.datos, [clave]: valor } as any);
  }
  armar(): T {
    return this.datos;
  }
}
type Plano<T> = { [K in keyof T]: T[K] };`,
      tests: "const heroe = new Armador({}).con(\"nombre\", \"Perugius\").con(\"vida\", 100).armar();\ntype _1 = Expect<Equal<Plano<typeof heroe>, { nombre: string; vida: number }>>;\nconst n: number = heroe.vida;",
      solution: "T & { [P in K]: V }",
      explanation: "Cada `con` devuelve `T` más la clave nueva. `Plano` aplana la intersección para poder compararla.",
    },
    {
      type: "predict",
      id: "forbidden-transition",
      code: `${TRANSICIONES}${IR}ir("saltando", "corriendo");`,
      answer: "type error",
      explanation: "Desde `saltando` solo se va a `quieto`. En el aire no se arranca a correr.",
    },
    {
      type: "complete",
      id: "machine",
      prompt: "Completá la restricción de `a()`: solo transiciones válidas desde el estado actual.",
      code: `${TRANSICIONES}class Maquina<E extends keyof Transiciones> {
  constructor(readonly estado: E) {}
  a<H extends ___>(hacia: H): Maquina<H> {
    return new Maquina(hacia);
  }
}`,
      tests: "const m = new Maquina(\"quieto\").a(\"caminando\").a(\"corriendo\").a(\"saltando\");\ntype _1 = Expect<Equal<typeof m.estado, \"saltando\">>;\ntype _2 = Expect<Equal<Parameters<Maquina<\"corriendo\">[\"a\"]>[0], \"caminando\" | \"saltando\">>;",
      solution: "Transiciones[E]",
      explanation: "`E` es el estado actual y `Transiciones[E]` son sus destinos. Cada `a()` devuelve una máquina con el estado nuevo.",
    },
    {
      type: "complete",
      id: "boss-sequence",
      prompt: "Jefe: `SecuenciaValida<E, P>` da `true` si cada estado de `P` sale del anterior, arrancando en `E`.",
      code: `${TRANSICIONES}type SecuenciaValida<E extends keyof Transiciones, P extends unknown[]> = ___;`,
      tests: "type _1 = Expect<Equal<SecuenciaValida<\"quieto\", [\"caminando\", \"corriendo\", \"saltando\", \"quieto\"]>, true>>;\ntype _2 = Expect<Equal<SecuenciaValida<\"quieto\", [\"corriendo\"]>, false>>;\ntype _3 = Expect<Equal<SecuenciaValida<\"caminando\", []>, true>>;\ntype _4 = Expect<Equal<SecuenciaValida<\"saltando\", [\"quieto\", \"saltando\", \"corriendo\"]>, false>>;",
      solution: "P extends [infer H, ...infer R] ? (H extends Transiciones[E] ? SecuenciaValida<H, R> : false) : true",
      hint: "Sacá el primer paso con `[infer H, ...infer R]`. Si `H` vale desde `E`, seguí desde `H`.",
      explanation: "Cada paso se chequea contra el anterior. De `saltando` a `corriendo` no se puede: corta en el tercer paso.",
    },
  ],
};

export default lesson;
