import type { Lesson } from "../../../../content/types.ts";

const RESULT = `type Result<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };
const ok = <T>(valor: T): Result<T, never> => ({ ok: true, valor });
const falla = <E>(error: E): Result<never, E> => ({ ok: false, error });
`;

const MODELS = `type Linea = { sku: string; cantidad: number; precio: number };
type Orden =
  | { estado: "borrador"; id: string; lineas: Linea[] }
  | { estado: "pagada"; id: string; lineas: Linea[]; pagoId: string }
  | { estado: "enviada"; id: string; lineas: Linea[]; pagoId: string; tracking: string }
  | { estado: "cancelada"; id: string; lineas: Linea[]; motivo: string };
`;

const ACTIONS = `type Accion =
  | { type: "pagar"; pagoId: string }
  | { type: "enviar"; tracking: string }
  | { type: "cancelar"; motivo: string };
`;

const REDUCER = `function avanzar(o: Orden, a: Accion): Result<Orden> {
  switch (a.type) {
    case "pagar":
      return o.estado === "borrador" ? ok({ ...o, estado: "pagada", pagoId: a.pagoId }) : falla("solo se paga un borrador");
    case "enviar":
      return o.estado === "pagada" ? ok({ ...o, estado: "enviada", tracking: a.tracking }) : falla("solo se envía lo pagado");
    case "cancelar":
      return o.estado === "enviada" ? falla("ya salió") : ok({ estado: "cancelada", id: o.id, lineas: o.lineas, motivo: a.motivo });
  }
}
`;

const DRAFT = `const b: Orden = { estado: "borrador", id: "A-1", lineas: [{ sku: "YERBA", cantidad: 2, precio: 3000 }, { sku: "MATE", cantidad: 1, precio: 9000 }] };
`;

const lesson: Lesson = {
  id: "final-project",
  title: "Proyecto final: pedidos",
  summary: "Un mini sistema de órdenes de punta a punta. Todo el mundo real en una lección.",
  idea: "Todo junto: `Result`, uniones, reducer y cliente tipado en un sistema de pedidos.",
  theory: [
    { title: "Último tramo", text: "Vas a armar un sistema de pedidos chico pero serio, como el de cualquier tienda online." },
    { title: "Errores con `Result`", text: "Un pago rechazado no se tira: se devuelve. Así queda en el tipo y nadie lo ignora.", code: "type Result<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };\nconst ok = <T>(valor: T): Result<T, never> => ({ ok: true, valor });\nconst falla = <E>(error: E): Result<never, E> => ({ ok: false, error });" },
    { title: "Una orden por estado", text: "Cada estado trae solo lo suyo. Un borrador no tiene `tracking`, y el compilador no te deja inventarlo.", code: "type Linea = { sku: string; cantidad: number; precio: number };\ntype Orden =\n  | { estado: \"borrador\"; id: string; lineas: Linea[] }\n  | { estado: \"pagada\"; id: string; lineas: Linea[]; pagoId: string }\n  | { estado: \"enviada\"; id: string; lineas: Linea[]; pagoId: string; tracking: string }\n  | { estado: \"cancelada\"; id: string; lineas: Linea[]; motivo: string };" },
    { title: "Modo jefe", text: "Cada ejercicio es un jefe. Si te trabás, volvé a reducers, formularios, config o migrar." },
  ],
  exercises: [
    {
      type: "complete",
      id: "boss-dispatch",
      prompt: "Jefe: completá el tipo de orden que acepta `despachar`: solo las que tienen `pagoId`, o sea las pagadas.",
      code: `${MODELS}function despachar(o: ___, tracking: string): Orden {
  return { ...o, estado: "enviada", tracking };
}`,
      tests: `const p: Orden = { estado: "pagada", id: "A-1", lineas: [], pagoId: "MP-9" };
if (p.estado === "pagada") despachar(p, "OCA-123");
type _1 = Expect<Equal<Parameters<typeof despachar>[0], { estado: "pagada"; id: string; lineas: Linea[]; pagoId: string }>>;`,
      solution: "Extract<Orden, { estado: \"pagada\" }>",
      explanation: "`Extract` saca la variante pagada. `despachar` no recibe borradores ni canceladas, y ya trae `pagoId`.",
    },
    {
      type: "complete",
      id: "boss-count",
      prompt: "Jefe: el panel cuenta órdenes por estado. Completá la clave del `Record` sacándola de `Orden`, sin repetir estados.",
      code: `${MODELS}const conteo: Record<___, number> = { borrador: 0, pagada: 0, enviada: 0, cancelada: 0 };
function contar(o: Orden) {
  conteo[o.estado] += 1;
}`,
      tests: `type _1 = Expect<Equal<keyof typeof conteo, "borrador" | "pagada" | "enviada" | "cancelada">>;`,
      solution: "Orden[\"estado\"]",
      explanation: "Indexar `Orden` por `estado` da todas las etiquetas. Si sumás un estado, `conteo` no compila hasta agregarlo.",
    },
    {
      type: "predict",
      id: "boss-draft-tracking",
      prompt: "Jefe: ¿compila leer el `tracking` de cualquier orden?",
      code: `${MODELS}function seguimiento(o: Orden) {
  return o.tracking;
}
seguimiento({ estado: "enviada", id: "A-2", lineas: [], pagoId: "MP-1", tracking: "OCA-9" });`,
      answer: "type error",
      explanation: "Solo la variante enviada tiene `tracking`. Primero preguntá por `estado`.",
    },
    {
      type: "complete",
      id: "boss-result",
      prompt: "Jefe: completá la variante de error de `Result` para que el error sea de tipo `E`.",
      code: `type Result<T, E> = { ok: true; valor: T } | ___;
function dividirEnCuotas(total: number, cuotas: number): Result<number, "cuotas inválidas"> {
  if (!Number.isInteger(cuotas) || cuotas < 1) return { ok: false, error: "cuotas inválidas" };
  return { ok: true, valor: total / cuotas };
}`,
      tests: `const r = dividirEnCuotas(12000, 3);
const msj: "cuotas inválidas" | number = r.ok ? r.valor : r.error;`,
      solution: "{ ok: false; error: E }",
      explanation: "Con `ok` como etiqueta, en la rama `false` el compilador sabe que hay un `error` de tipo `E`.",
    },
    {
      type: "fix",
      id: "boss-validate",
      prompt: "Jefe: `parsearLinea` recibe `unknown` y lee sin chequear. Validá cada campo y devolvé `falla` si algo no cierra.",
      code: `${RESULT}type Linea = { sku: string; cantidad: number; precio: number };
function parsearLinea(x: unknown): Result<Linea> {
  return ok({ sku: x.sku, cantidad: x.cantidad, precio: x.precio });
}`,
      tests: "const r = parsearLinea({ sku: \"TERMO\", cantidad: 1, precio: 25000 });\nconst l: Linea | string = r.ok ? r.valor : r.error;",
      solution: `${RESULT}type Linea = { sku: string; cantidad: number; precio: number };
function parsearLinea(x: unknown): Result<Linea> {
  if (typeof x !== "object" || x === null) return falla("no es un objeto");
  if (!("sku" in x) || typeof x.sku !== "string") return falla("sku inválido");
  if (!("cantidad" in x) || typeof x.cantidad !== "number" || x.cantidad < 1) return falla("cantidad inválida");
  if (!("precio" in x) || typeof x.precio !== "number") return falla("precio inválido");
  return ok({ sku: x.sku, cantidad: x.cantidad, precio: x.precio });
}`,
      hint: "Primero, objeto no null. Después, por cada campo, `in` más `typeof`.",
      explanation: "Cada chequeo con `in` y `typeof` estrecha `x`. Al final todo tipa, y los datos malos vuelven como error, no como excepción.",
    },
    {
      type: "predict",
      id: "boss-reducer",
      prompt: "Jefe: corré el reducer con `pagar` y después `enviar`. ¿Qué estado queda?",
      code: `${RESULT}${MODELS}${ACTIONS}${REDUCER}${DRAFT}const r1 = avanzar(b, { type: "pagar", pagoId: "MP-77" });
const r2 = r1.ok ? avanzar(r1.valor, { type: "enviar", tracking: "OCA-5" }) : r1;
r2.ok ? r2.valor.estado : r2.error;`,
      answer: "\"enviada\"",
      explanation: "Borrador pasa a pagada, y pagada a enviada. Al revés, enviar un borrador daba error.",
    },
    {
      type: "fix",
      id: "boss-client",
      prompt: "Jefe: el cliente devuelve `Promise<any>`. Hacelo genérico sobre `Rutas` para que la respuesta dependa de la ruta.",
      code: `${MODELS}type Rutas = {
  "/ordenes": Orden[];
  "/stock": Record<string, number>;
};
type Transporte = (ruta: string) => Promise<unknown>;
function crearCliente(t: Transporte) {
  return {
    get(ruta: keyof Rutas): Promise<any> {
      return t(ruta);
    },
  };
}
const cliente = crearCliente(async () => []);`,
      tests: `type _1 = Expect<Equal<Awaited<ReturnType<typeof cliente.get<"/stock">>>, Record<string, number>>>;
type _2 = Expect<Equal<Awaited<ReturnType<typeof cliente.get<"/ordenes">>>, Orden[]>>;`,
      solution: `${MODELS}type Rutas = {
  "/ordenes": Orden[];
  "/stock": Record<string, number>;
};
type Transporte = (ruta: string) => Promise<unknown>;
function crearCliente(t: Transporte) {
  return {
    get<R extends keyof Rutas>(ruta: R): Promise<Rutas[R]> {
      return t(ruta) as Promise<Rutas[R]>;
    },
  };
}
const cliente = crearCliente(async () => []);`,
      hint: "Un genérico `R` sobre `keyof Rutas` y `Rutas[R]` en la promesa. Un solo `as`, adentro.",
      explanation: "El `as` queda encerrado en el cliente: es el único lugar donde se confía en el servidor.",
    },
    {
      type: "choose",
      id: "boss-design",
      prompt: "Jefe: sumás el estado \"reembolsada\" a la unión `Orden`. ¿Qué te avisa el compilador?",
      code: `${RESULT}${MODELS}${ACTIONS}${REDUCER}`,
      options: ["Solo donde hay chequeo exhaustivo, como un `switch` con `never` en el default", "Marca solo y siempre todos los `if` sobre `estado`", "Tira un error en runtime la primera vez que llega una orden reembolsada", "No compila la unión porque reembolsada no tiene `tracking`"],
      correct: 0,
      explanation: "Un `if` o `switch` sin chequeo exhaustivo ignora el caso nuevo. El `never` del default te lista qué revisar.",
    },
  ],
};

export default lesson;
