import type { Leccion } from "../../tipos.ts";

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

const leccion: Leccion = {
  id: "apis-tipadas",
  titulo: "APIs que no se dejan usar mal",
  resumen: "Event emitters, builders y máquinas de estado donde el uso incorrecto directamente no compila.",
  teoria: [
    { texto: "Una API tipada al extremo convierte bugs en errores de compilación. El patrón base: un mapa de tipos que describe el dominio, y métodos genéricos que eligen una clave y de ahí sacan todo lo demás." },
    { codigo: EVENTOS + EMISOR },
    { texto: "En `on(\"golpe\", fn)`, `K` se infiere como `\"golpe\"` y `fn` recibe `M[\"golpe\"]`. El callback ya sabe que hay `dano` y `critico` sin que anotes nada." },
    { texto: "Un builder puede ir acumulando lo que le cargaste en su propio tipo: cada llamada devuelve un builder nuevo con una intersección más grande. Y una máquina de estados es un mapa de estado a estados siguientes: `H extends Transiciones[D]` hace que una transición prohibida sea un error de tipos." },
    { codigo: TRANSICIONES + IR + "const ok = ir(\"quieto\", \"saltando\");" },
  ],
  ejercicios: [
    {
      tipo: "elegir",
      id: "elegir-on",
      enunciado: "Con el Emisor y los Eventos de la teoría, en `e.on(\"muerte\", (d) => ...)` ¿qué tipo tiene `d`?",
      opciones: [
        "{ quien: string }",
        "{ dano: number; critico: boolean } | { quien: string } | undefined",
        "Eventos",
        "any",
      ],
      correcta: 0,
      explicacion: "K se infiere como \"muerte\" desde el primer argumento, y el callback recibe M[K], o sea Eventos[\"muerte\"].",
    },
    {
      tipo: "completar",
      id: "emit-datos",
      enunciado: "Completá el tipo del payload de emit para que dependa del evento elegido.",
      codigo: `${EVENTOS}class Emisor<M> {
  emit<K extends keyof M>(evento: K, datos: ___) {
    return [evento, datos];
  }
}`,
      pruebas: "const e = new Emisor<Eventos>();\ne.emit(\"muerte\", { quien: \"rys\" });\ntype _1 = Esperar<Igual<Parameters<typeof e.emit<\"muerte\">>[1], { quien: string }>>;\ntype _2 = Esperar<Igual<Parameters<typeof e.emit<\"golpe\">>[1], { dano: number; critico: boolean }>>;",
      solucion: "M[K]",
      explicacion: "K es la clave concreta que se pasó, así que M[K] es exactamente el payload de ese evento. typeof e.emit<\"muerte\"> es una expresión de instanciación: fija K para poder mirar la firma.",
    },
    {
      tipo: "predecir",
      id: "emitir",
      codigo: `${EVENTOS}${EMISOR}const e = new Emisor<Eventos>();
let total = 0;
e.on("golpe", (d) => { total += d.critico ? d.dano * 2 : d.dano; });
e.emit("golpe", { dano: 10, critico: true });
e.emit("golpe", { dano: 5, critico: false });
total;`,
      respuesta: "25",
      explicacion: "El primer golpe es crítico y suma 20, el segundo suma 5. Todo tipa porque d es { dano: number; critico: boolean }.",
    },
    {
      tipo: "predecir",
      id: "emitir-mal",
      codigo: `${EVENTOS}${EMISOR}const e = new Emisor<Eventos>();
e.emit("muerte", { dano: 99, critico: true });
0;`,
      respuesta: "type error",
      explicacion: "Para \"muerte\" el payload tiene que ser { quien: string }. Mandar los datos de un golpe no compila.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-on",
      enunciado: "Este on no es genérico: el callback recibe la unión de todos los payloads y d.dano no compila. Hacelo genérico.",
      codigo: `${EVENTOS}class Emisor<M> {
  private oyentes: ((datos: any) => void)[] = [];
  on(evento: keyof M, fn: (datos: M[keyof M]) => void) {
    this.oyentes.push(fn);
  }
}
const e = new Emisor<Eventos>();`,
      pruebas: "e.on(\"golpe\", (d) => d.dano * 2);\ne.on(\"muerte\", (d) => d.quien.toUpperCase());",
      solucion: `${EVENTOS}class Emisor<M> {
  private oyentes: ((datos: any) => void)[] = [];
  on<K extends keyof M>(evento: K, fn: (datos: M[K]) => void) {
    this.oyentes.push(fn);
  }
}
const e = new Emisor<Eventos>();`,
      explicacion: "Con keyof M suelto se pierde el vínculo entre el evento y el payload. Un K genérico ata los dos parámetros: lo que se infiere del primero se usa en el segundo.",
    },
    {
      tipo: "completar",
      id: "builder",
      enunciado: "Este builder tiene que acumular cada clave cargada en su tipo. Completá el tipo que devuelve con.",
      codigo: `class Armador<T extends object> {
  constructor(private datos: T) {}
  con<K extends string, V>(clave: K, valor: V): Armador<___> {
    return new Armador({ ...this.datos, [clave]: valor } as any);
  }
  armar(): T {
    return this.datos;
  }
}
type Plano<T> = { [K in keyof T]: T[K] };`,
      pruebas: "const heroe = new Armador({}).con(\"nombre\", \"Perugius\").con(\"vida\", 100).armar();\ntype _1 = Esperar<Igual<Plano<typeof heroe>, { nombre: string; vida: number }>>;\nconst n: number = heroe.vida;",
      solucion: "T & { [P in K]: V }",
      explicacion: "Cada con devuelve un Armador con T más la clave nueva. Record<K, V> en vez del objeto mapeado también vale. Plano aplana las intersecciones para poder compararlas.",
    },
    {
      tipo: "predecir",
      id: "transicion-prohibida",
      codigo: `${TRANSICIONES}${IR}ir("saltando", "corriendo");`,
      respuesta: "type error",
      explicacion: "Desde saltando solo se puede ir a quieto. \"corriendo\" no entra en Transiciones[\"saltando\"]: en el aire no se arranca a correr.",
    },
    {
      tipo: "completar",
      id: "maquina",
      enunciado: "Completá la restricción de a() para que la máquina solo acepte transiciones válidas desde su estado actual.",
      codigo: `${TRANSICIONES}class Maquina<E extends keyof Transiciones> {
  constructor(readonly estado: E) {}
  a<H extends ___>(hacia: H): Maquina<H> {
    return new Maquina(hacia);
  }
}`,
      pruebas: "const m = new Maquina(\"quieto\").a(\"caminando\").a(\"corriendo\").a(\"saltando\");\ntype _1 = Esperar<Igual<typeof m.estado, \"saltando\">>;\ntype _2 = Esperar<Igual<Parameters<Maquina<\"corriendo\">[\"a\"]>[0], \"caminando\" | \"saltando\">>;",
      solucion: "Transiciones[E]",
      explicacion: "E es el estado actual guardado en el tipo de la máquina, y Transiciones[E] son los únicos destinos posibles. Cada a() devuelve una máquina con el estado nuevo, así que la cadena se chequea paso por paso.",
    },
    {
      tipo: "completar",
      id: "jefe-secuencia",
      enunciado: "Jefe: validá un combo entero antes de ejecutarlo. SecuenciaValida<E, P> da true si cada estado de la tupla P se puede alcanzar desde el anterior, arrancando en E.",
      codigo: `${TRANSICIONES}type SecuenciaValida<E extends keyof Transiciones, P extends unknown[]> = ___;`,
      pruebas: "type _1 = Esperar<Igual<SecuenciaValida<\"quieto\", [\"caminando\", \"corriendo\", \"saltando\", \"quieto\"]>, true>>;\ntype _2 = Esperar<Igual<SecuenciaValida<\"quieto\", [\"corriendo\"]>, false>>;\ntype _3 = Esperar<Igual<SecuenciaValida<\"caminando\", []>, true>>;\ntype _4 = Esperar<Igual<SecuenciaValida<\"saltando\", [\"quieto\", \"saltando\", \"corriendo\"]>, false>>;",
      solucion: "P extends [infer H, ...infer R] ? (H extends Transiciones[E] ? SecuenciaValida<H, R> : false) : true",
      pista: "Sacá el primer paso con [infer H, ...infer R]. Si H está entre los destinos de E, seguí desde H con el resto. Tupla vacía: combo completo.",
      explicacion: "Es la máquina de estados corrida entera en el compilador: cada paso se chequea contra Transiciones del paso anterior. Saltando a corriendo corta el combo en el tercer paso.",
    },
  ],
};

export default leccion;
