import type { Lesson } from "../../../../content/types.ts";

const CART = `type Item = { sku: string; cantidad: number };
type Estado = { items: Item[]; cupon: string | null };
type Accion =
  | { type: "agregar"; sku: string }
  | { type: "quitar"; sku: string }
  | { type: "aplicarCupon"; codigo: string }
  | { type: "vaciar" };
`;

const REDUCER = `function reducer(estado: Estado, accion: Accion): Estado {
  switch (accion.type) {
    case "agregar": {
      const ya = estado.items.find((i) => i.sku === accion.sku);
      if (ya) return { ...estado, items: estado.items.map((i) => (i.sku === accion.sku ? { ...i, cantidad: i.cantidad + 1 } : i)) };
      return { ...estado, items: [...estado.items, { sku: accion.sku, cantidad: 1 }] };
    }
    case "quitar":
      return { ...estado, items: estado.items.filter((i) => i.sku !== accion.sku) };
    case "aplicarCupon":
      return { ...estado, cupon: accion.codigo };
    case "vaciar":
      return { items: [], cupon: null };
  }
}
const inicial: Estado = { items: [], cupon: null };
`;

const lesson: Lesson = {
  id: "reducers",
  title: "Reducers sin sorpresas",
  summary: "Acciones como unión discriminada, un `switch` que cubre todo y creators sin errores.",
  idea: "Las acciones son una unión: cada `case` del `switch` sabe exactamente qué trae.",
  theory: [
    { title: "Qué es un reducer", text: "Una función pura: recibe el estado y una acción, y devuelve el estado nuevo. Sirve en el front y en el back." },
    { title: "Acciones como unión", text: "Cada acción se distingue por `type` y trae solo su payload.", code: "type Item = { sku: string; cantidad: number };\ntype Estado = { items: Item[]; cupon: string | null };\ntype Accion =\n  | { type: \"agregar\"; sku: string }\n  | { type: \"quitar\"; sku: string }\n  | { type: \"aplicarCupon\"; codigo: string }\n  | { type: \"vaciar\" };" },
    { title: "Cada `case` estrecha", text: "En `\"aplicarCupon\"` existe `accion.codigo`. En `\"vaciar\"` no hay nada que leer. Un payload equivocado no compila.", code: "switch (accion.type) {\n  case \"aplicarCupon\":\n    return { ...estado, cupon: accion.codigo };\n  case \"vaciar\":\n    return { items: [], cupon: null };\n}" },
    { title: "Action creators", text: "Funciones chiquitas que arman la acción. Tipalas con `Extract<Accion, { type: \"...\" }>` y nunca se desincronizan." },
  ],
  exercises: [
    {
      type: "predict",
      id: "add-two",
      code: `${CART}${REDUCER}const s = [
  { type: "agregar", sku: "YERBA" },
  { type: "agregar", sku: "YERBA" },
  { type: "agregar", sku: "BOMBILLA" },
] satisfies Accion[];
s.reduce(reducer, inicial).items.length;`,
      answer: "2",
      explanation: "La segunda YERBA no agrega otro ítem: sube la cantidad. Quedan YERBA y BOMBILLA.",
    },
    {
      type: "predict",
      id: "wrong-payload",
      code: `${CART}${REDUCER}reducer(inicial, { type: "aplicarCupon", sku: "YERBA" }).cupon;`,
      answer: "type error",
      explanation: "`aplicarCupon` pide `codigo`, no `sku`. El objeto no encaja en ninguna variante.",
    },
    {
      type: "predict",
      id: "clear-without-payload",
      code: `${CART}${REDUCER}const lleno = reducer(reducer(inicial, { type: "agregar", sku: "TERMO" }), { type: "aplicarCupon", codigo: "MATE10" });
reducer(lleno, { type: "vaciar" });`,
      answer: "{ items: [], cupon: null }",
      explanation: "`vaciar` no lleva payload y vuelve al estado inicial, cupón incluido.",
    },
    {
      type: "predict",
      id: "read-outside-case",
      code: `${CART}function cupon(accion: Accion) {
  return accion.codigo;
}
cupon({ type: "aplicarCupon", codigo: "X" });`,
      answer: "type error",
      explanation: "Sin mirar `type`, la acción puede ser cualquiera. Solo `aplicarCupon` tiene `codigo`.",
    },
    {
      type: "complete",
      id: "complete-variant",
      prompt: "Falta la acción para cambiar la cantidad de un ítem. Completá la variante para que compile.",
      code: `type Item = { sku: string; cantidad: number };
type Accion =
  | { type: "agregar"; sku: string }
  | ___;`,
      tests: `function reducer(items: Item[], a: Accion): Item[] {
  switch (a.type) {
    case "agregar":
      return [...items, { sku: a.sku, cantidad: 1 }];
    case "setCantidad":
      return items.map((i) => (i.sku === a.sku ? { ...i, cantidad: a.cantidad } : i));
  }
}
reducer([], { type: "setCantidad", sku: "TERMO", cantidad: 3 });`,
      solution: "{ type: \"setCantidad\"; sku: string; cantidad: number }",
      explanation: "La variante lleva su literal en `type` y los dos datos que usa el `case`.",
    },
    {
      type: "complete",
      id: "creator-extract",
      prompt: "Tipá el retorno del creator sacando la variante justa de la unión, sin repetir su forma.",
      code: `${CART}function aplicarCupon(codigo: string): ___ {
  return { type: "aplicarCupon", codigo };
}`,
      tests: `const a = aplicarCupon("MATE10");
type _1 = Expect<Equal<typeof a, { type: "aplicarCupon"; codigo: string }>>;
const lista: Accion[] = [a];`,
      solution: "Extract<Accion, { type: \"aplicarCupon\" }>",
      explanation: "`Extract` se queda con la variante que encaja en `{ type: \"aplicarCupon\" }`. Si la acción cambia, el creator se entera solo.",
    },
    {
      type: "fix",
      id: "fix-exhaustive",
      prompt: "Se sumó `vaciar` a la unión y el chequeo con `never` salta. Cubrí el caso que falta.",
      code: `type Accion = { type: "sumar"; n: number } | { type: "restar"; n: number } | { type: "vaciar" };
function contador(estado: number, a: Accion): number {
  switch (a.type) {
    case "sumar":
      return estado + a.n;
    case "restar":
      return estado - a.n;
    default: {
      const resto: never = a;
      return resto;
    }
  }
}`,
      tests: "const r: number = contador(5, { type: \"vaciar\" });",
      solution: `type Accion = { type: "sumar"; n: number } | { type: "restar"; n: number } | { type: "vaciar" };
function contador(estado: number, a: Accion): number {
  switch (a.type) {
    case "sumar":
      return estado + a.n;
    case "restar":
      return estado - a.n;
    case "vaciar":
      return 0;
    default: {
      const resto: never = a;
      return resto;
    }
  }
}`,
      explanation: "Con `vaciar` cubierto, en el `default` no queda nada y `a` es `never`. Esa alarma salta si alguien suma una acción.",
    },
    {
      type: "fix",
      id: "fix-string-type",
      prompt: "El `type` del creator se ensancha a `string` y el reducer no lo acepta. Arreglalo sin tocar el reducer.",
      code: `type Accion = { type: "login"; usuario: string } | { type: "logout" };
function reducer(s: string | null, a: Accion): string | null {
  return a.type === "login" ? a.usuario : null;
}
function login(usuario: string) {
  const accion = { type: "login", usuario };
  return accion;
}`,
      tests: "const s: string | null = reducer(null, login(\"rys\"));",
      solution: `type Accion = { type: "login"; usuario: string } | { type: "logout" };
function reducer(s: string | null, a: Accion): string | null {
  return a.type === "login" ? a.usuario : null;
}
function login(usuario: string): Accion {
  const accion = { type: "login" as const, usuario };
  return accion;
}`,
      hint: "Sin anotar, \"login\" pasa a `string`. Fijá el literal o anotá el retorno.",
      explanation: "En un `const` sin anotar, `type` se ensancha a `string`. Con `as const` (o anotando `Accion`) queda \"login\".",
    },
    {
      type: "choose",
      id: "choose-creators",
      prompt: "Querés un creator por acción que reciba el payload sin `type`. ¿Cuál lo arma desde la unión?",
      code: CART,
      options: [
        "{ [A in Accion as A[\"type\"]]: (p: Omit<A, \"type\">) => A }",
        "{ [K in Accion[\"type\"]]: (p: Accion) => Accion }",
        "Record<string, (p: Omit<Accion, \"type\">) => Accion>",
        "{ [K in keyof Accion]: (p: Accion[K]) => Accion }",
      ],
      correct: 0,
      explanation: "`as A[\"type\"]` da una clave por variante y conserva cada `A`. Las otras pierden el vínculo entre clave y payload.",
    },
    {
      type: "complete",
      id: "boss-payload",
      prompt: "Jefe: armá `Payload<T>` para que `despachar(tipo, payload)` solo acepte el payload de esa acción, sin `type`.",
      code: `${CART}type Payload<T extends Accion["type"]> = ___;
function despachar<T extends Accion["type"]>(tipo: T, payload: Payload<T>): Accion {
  return { type: tipo, ...payload } as Accion;
}`,
      tests: `despachar("agregar", { sku: "TERMO" });
despachar("vaciar", {});
type _1 = Expect<Equal<Payload<"aplicarCupon">, { codigo: string }>>;
type _2 = Expect<Equal<Payload<"vaciar">, {}>>;
type _3 = Expect<Equal<Payload<"quitar">, { sku: string }>>;`,
      solution: "Omit<Extract<Accion, { type: T }>, \"type\">",
      hint: "Sacá la variante con `Extract` usando `T`, y después borrale `type`.",
      explanation: "`Extract` encuentra la variante y `Omit` le saca `type`. Un payload equivocado rompe al compilar, no en producción.",
    },
  ],
};

export default lesson;
