import type { Lesson } from "../../../../content/types.ts";

const MODELS = `type Usuario = { id: number; nombre: string };
type NuevoUsuario = Omit<Usuario, "id">;
`;

const ENDPOINTS = `type Endpoints = {
  "GET /usuarios": { respuesta: Usuario[] };
  "POST /usuarios": { body: NuevoUsuario; respuesta: Usuario };
  "DELETE /usuarios/:id": { respuesta: { borrado: boolean } };
};
`;

const RESPONSE = "type Respuesta<K extends keyof Endpoints> = Endpoints[K][\"respuesta\"];\n";
const ARGS = "type Args<K extends keyof Endpoints> = Endpoints[K] extends { body: infer B } ? [body: B] : [];\n";

const SERVER = `const db: Usuario[] = [{ id: 1, nombre: "Ana" }];
function servidor(endpoint: string, body: unknown): unknown {
  if (endpoint === "GET /usuarios") return db;
  if (endpoint === "POST /usuarios") {
    const nuevo = { id: db.length + 1, ...(body as NuevoUsuario) };
    db.push(nuevo);
    return nuevo;
  }
  return { borrado: true };
}
`;

const REQUEST = `function pedir<K extends keyof Endpoints>(endpoint: K, ...args: Args<K>): Respuesta<K> {
  return servidor(endpoint, args[0]) as Respuesta<K>;
}
`;

const CLIENT = `${MODELS}${ENDPOINTS}${RESPONSE}${ARGS}${SERVER}${REQUEST}`;

const lesson: Lesson = {
  id: "api-client",
  title: "Un cliente HTTP que no se deja engañar",
  summary: "Un mapa de endpoints como fuente de verdad: cada ruta sabe su body y su respuesta.",
  idea: "Un mapa de endpoints dice qué pide y qué devuelve cada ruta. El cliente lo obedece.",
  theory: [
    { title: "El genérico a mano miente", text: "En `pedir<Usuario[]>(\"/usuarios\")` el tipo lo elegís vos. Podés poner cualquiera: es un `as` disfrazado." },
    { title: "Un contrato para la API", text: "Cada clave es método + ruta. Su valor dice qué body lleva y qué responde.", code: "type Endpoints = {\n  \"GET /usuarios\": { respuesta: Usuario[] };\n  \"POST /usuarios\": { body: NuevoUsuario; respuesta: Usuario };\n  \"DELETE /usuarios/:id\": { respuesta: { borrado: boolean } };\n};" },
    { title: "Los typos no compilan", text: "Con `keyof Endpoints`, el endpoint es una unión de strings. Con acceso indexado sacás su respuesta.", code: "type Respuesta<K extends keyof Endpoints> = Endpoints[K][\"respuesta\"];" },
    { title: "El body, con rest de tupla", text: "Si el endpoint tiene `body`, el rest es `[body: B]` y es obligatorio. Si no, es `[]` y no pasás nada.", code: "type Args<K extends keyof Endpoints> = Endpoints[K] extends { body: infer B } ? [body: B] : [];\nfunction pedir<K extends keyof Endpoints>(endpoint: K, ...args: Args<K>): Respuesta<K> {\n  return servidor(endpoint, args[0]) as Respuesta<K>;\n}" },
  ],
  exercises: [
    {
      type: "predict",
      id: "get",
      code: `${CLIENT}pedir("GET /usuarios").length;`,
      answer: "1",
      explanation: "El GET no pide body y responde `Usuario[]`. La base arranca con un usuario.",
    },
    {
      type: "predict",
      id: "post",
      code: `${CLIENT}pedir("POST /usuarios", { nombre: "Beto" }).id;`,
      answer: "2",
      explanation: "El body es un `NuevoUsuario` válido. Vuelve un `Usuario` con el id que le dio el servidor.",
    },
    {
      type: "predict",
      id: "post-without-body",
      code: `${CLIENT}pedir("POST /usuarios").id;`,
      answer: "type error",
      explanation: "En el POST, `Args` es `[body: NuevoUsuario]`: el body es obligatorio.",
    },
    {
      type: "predict",
      id: "typo",
      code: `${CLIENT}pedir("GET /usuario");`,
      answer: "type error",
      explanation: "\"GET /usuario\" no es una clave de `Endpoints`. El typo salta antes del 404.",
    },
    {
      type: "complete",
      id: "response",
      prompt: "Completá `Respuesta<K>` con lo que responde cada endpoint.",
      code: `${MODELS}${ENDPOINTS}type Respuesta<K extends keyof Endpoints> = ___;`,
      tests: "type _1 = Expect<Equal<Respuesta<\"GET /usuarios\">, Usuario[]>>;\ntype _2 = Expect<Equal<Respuesta<\"DELETE /usuarios/:id\">, { borrado: boolean }>>;",
      solution: "Endpoints[K][\"respuesta\"]",
      explanation: "Dos accesos indexados: primero la entrada del endpoint, después su campo `respuesta`.",
    },
    {
      type: "complete",
      id: "args",
      prompt: "Completá `Args<K>`: una tupla con el body si el endpoint lo pide, o vacía si no.",
      code: `${MODELS}${ENDPOINTS}type Args<K extends keyof Endpoints> = ___;`,
      tests: "type _1 = Expect<Equal<Args<\"GET /usuarios\">[\"length\"], 0>>;\ntype _2 = Expect<Equal<Args<\"POST /usuarios\">[\"length\"], 1>>;\ntype _3 = Expect<Equal<Args<\"POST /usuarios\">[0], NuevoUsuario>>;",
      solution: "Endpoints[K] extends { body: infer B } ? [body: B] : []",
      hint: "Preguntá si la entrada tiene `body` y capturalo con `infer`.",
      explanation: "Si la entrada encaja con `{ body: infer B }`, el rest lleva ese body. Si no, queda vacío.",
    },
    {
      type: "choose",
      id: "rest-vs-optional",
      prompt: "¿Qué gana `...args: Args<K>` frente a un simple `body?: unknown`?",
      options: ["Nada, es lo mismo con más letras", "Body obligatorio donde va, prohibido donde no, y del tipo exacto de cada endpoint", "Hace la llamada más rápida en runtime", "Permite pasar varios bodies a la vez"],
      correct: 1,
      explanation: "Con `body?: unknown` podés olvidar el body del POST o mandarle uno al GET. La tupla cierra las dos puertas.",
    },
    {
      type: "fix",
      id: "direct-body",
      prompt: "Esta `pedir` lee el body directo del mapa y no compila. Arreglala con un rest de tupla.",
      code: `${MODELS}${ENDPOINTS}${RESPONSE}${SERVER}function pedir<K extends keyof Endpoints>(endpoint: K, body: Endpoints[K]["body"]): Respuesta<K> {\n  return servidor(endpoint, body) as Respuesta<K>;\n}`,
      tests: "const lista: Usuario[] = pedir(\"GET /usuarios\");\nconst nuevo: Usuario = pedir(\"POST /usuarios\", { nombre: \"Caro\" });",
      solution: `${CLIENT}`,
      hint: "No todos tienen `body`: `Endpoints[K][\"body\"]` no existe para cualquier `K`.",
      explanation: "`body` solo existe en algunas entradas. `Args<K>` primero pregunta si está, y el rest se adapta.",
    },
    {
      type: "fix",
      id: "patch",
      prompt: "El front llama a un PATCH que el contrato no tiene. Sumalo: recibe parte de `NuevoUsuario` y responde el `Usuario`.",
      code: `${CLIENT}`,
      tests: "const editado: Usuario = pedir(\"PATCH /usuarios/:id\", { nombre: \"Caro\" });\nconst vacio: Usuario = pedir(\"PATCH /usuarios/:id\", {});",
      solution: `${MODELS}${ENDPOINTS.replace(/\n\};\n$/, "\n  \"PATCH /usuarios/:id\": { body: Partial<NuevoUsuario>; respuesta: Usuario };\n};\n")}${RESPONSE}${ARGS}${SERVER}${REQUEST}`,
      explanation: "Una línea en el mapa y `pedir` ya conoce el PATCH. `Partial` vuelve opcionales todos los campos.",
    },
    {
      type: "complete",
      id: "reads",
      prompt: "Jefe: la caché solo guarda GET. Completá `Lecturas` con las claves que empiezan con \"GET \", sin escribirlas.",
      code: `${MODELS}type Endpoints = {\n  "GET /usuarios": { respuesta: Usuario[] };\n  "GET /usuarios/:id": { respuesta: Usuario };\n  "POST /usuarios": { body: NuevoUsuario; respuesta: Usuario };\n  "DELETE /usuarios/:id": { respuesta: { borrado: boolean } };\n};\n${RESPONSE}type Lecturas = ___;\nfunction leerCacheado<K extends Lecturas>(endpoint: K, cache: Map<string, unknown>): Respuesta<K> | undefined {\n  return cache.get(endpoint) as Respuesta<K> | undefined;\n}`,
      tests: "type _1 = Expect<Equal<Lecturas, \"GET /usuarios\" | \"GET /usuarios/:id\">>;\nconst u: Usuario | undefined = leerCacheado(\"GET /usuarios/:id\", new Map());",
      solution: "Extract<keyof Endpoints, `GET ${string}`>",
      hint: "`` `GET ${string}` `` describe los strings que empiezan así. Filtrá las claves con ese patrón.",
      explanation: "`Extract` deja los miembros que encajan en el patrón. Si mañana sumás un GET, entra solo.",
    },
  ],
};

export default lesson;
