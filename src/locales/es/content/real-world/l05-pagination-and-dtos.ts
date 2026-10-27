import type { Lesson } from "../../../../content/types.ts";

const ORDER = `type Orden = { id: number; ticker: string; cantidad: number; precio: number; creada: Date; cuentaInterna: string };
type OrdenDTO = Omit<Orden, "creada" | "cuentaInterna"> & { creada: string };
type OrdenVista = Omit<Orden, "cuentaInterna">;
`;

const TO_MODEL = `function aModelo(dto: OrdenDTO): OrdenVista {
  return { ...dto, creada: new Date(dto.creada) };
}
`;

const PAGINATED = "type Paginado<T> = { items: T[]; page: number; page_size: number; total: number };\n";

const FILTERS = "type FiltrosBlotter = { date_from?: string; date_to?: string; page: number; page_size: number };\n";

const CACHE = `function cacheKey(f: FiltrosBlotter): string {
  return ["blotter", f.date_from ?? "-", f.date_to ?? "-", f.page, f.page_size].join("|");
}
`;

const SAMPLE_DTO = `const dto: OrdenDTO = { id: 7, ticker: "GGAL", cantidad: 100, precio: 4200, creada: "2026-10-02T13:30:00Z" };\n`;

const lesson: Lesson = {
  id: "pagination-and-dtos",
  title: "DTOs, páginas y el blotter",
  summary: "DTOs con `Pick` y `Omit`, `Paginado<T>` y filtros que arman la cache key.",
  idea: "Lo que viaja por la red (el DTO) no es tu modelo: derivalo y convertí lo que haga falta.",
  theory: [
    { title: "DTO no es modelo", text: "El DTO es la forma del dato en la red. El modelo, la forma con la que trabajás. Casi nunca coinciden." },
    { title: "JSON no tiene fechas", text: "Por la red viaja un string ISO, no un `Date`. Si el DTO dice `Date`, miente, y `.getTime()` revienta.", code: "type Orden = { id: number; ticker: string; cantidad: number; precio: number; creada: Date; cuentaInterna: string };\ntype OrdenDTO = Omit<Orden, \"creada\" | \"cuentaInterna\"> & { creada: string };\ntype OrdenVista = Omit<Orden, \"cuentaInterna\">;\nfunction aModelo(dto: OrdenDTO): OrdenVista {\n  return { ...dto, creada: new Date(dto.creada) };\n}" },
    { title: "Derivá con `Omit` y `Pick`", text: "Si el modelo suma un campo, el DTO lo hereda solo. Nada de copiar y pegar." },
    { title: "Páginas genéricas", text: "`Paginado<T>` sirve para órdenes, usuarios o lo que sea. Los filtros arman la cache key: mismos filtros, misma clave.", code: "type Paginado<T> = { items: T[]; page: number; page_size: number; total: number };\ntype FiltrosBlotter = { date_from?: string; date_to?: string; page: number; page_size: number };\nfunction cacheKey(f: FiltrosBlotter): string {\n  return [\"blotter\", f.date_from ?? \"-\", f.date_to ?? \"-\", f.page, f.page_size].join(\"|\");\n}" },
  ],
  exercises: [
    {
      type: "predict",
      id: "dto-with-date",
      code: `${ORDER}const d: OrdenDTO = { id: 1, ticker: "YPF", cantidad: 10, precio: 30000, creada: new Date() };\nd.ticker;`,
      answer: "type error",
      explanation: "En el DTO, `creada` es string. Un `Date` no entra: el DTO describe lo que viaja en JSON.",
    },
    {
      type: "predict",
      id: "to-model",
      code: `${ORDER}${TO_MODEL}${SAMPLE_DTO}aModelo(dto).creada.getUTCDate();`,
      answer: "2",
      explanation: "`aModelo` convierte el string en `Date`. Ahí sí existen los métodos de fecha.",
    },
    {
      type: "predict",
      id: "cache-key",
      code: `${FILTERS}${CACHE}cacheKey({ page: 1, page_size: 50, date_from: "2026-10-01" });`,
      answer: "\"blotter|2026-10-01|-|1|50\"",
      explanation: "El filtro que falta se cambia por un guion. Así cada filtro queda siempre en la misma posición.",
    },
    {
      type: "complete",
      id: "summary",
      prompt: "La grilla solo necesita id, ticker y precio. Completá `Pick` para sacar ese tipo de `Orden`.",
      code: `${ORDER}type OrdenFila = Pick<Orden, ___>;`,
      tests: "type _1 = Expect<Equal<OrdenFila, { id: number; ticker: string; precio: number }>>;",
      solution: "\"id\" | \"ticker\" | \"precio\"",
      explanation: "`Pick` recibe la unión de claves que te querés quedar.",
    },
    {
      type: "complete",
      id: "paginated",
      prompt: "Completá `Paginado<T>` para que sirva con cualquier tipo de item.",
      code: `${ORDER}type Paginado<T> = { items: ___; page: number; page_size: number; total: number };`,
      tests: `${SAMPLE_DTO}const p: Paginado<OrdenDTO> = { items: [dto], page: 1, page_size: 50, total: 1 };\nconst t: string = p.items[0].ticker;`,
      solution: "T[]",
      explanation: "Los items son una lista del tipo que pases.",
    },
    {
      type: "complete",
      id: "map-page",
      prompt: "`mapearPagina` convierte los items y deja igual la metadata. Completá el retorno.",
      code: `${ORDER}${TO_MODEL}${PAGINATED}function mapearPagina<T, U>(p: Paginado<T>, f: (x: T) => U): ___ {\n  return { ...p, items: p.items.map(f) };\n}`,
      tests: `${SAMPLE_DTO}const pagina = mapearPagina({ items: [dto], page: 1, page_size: 50, total: 1 }, aModelo);\ntype _1 = Expect<Equal<typeof pagina, Paginado<OrdenVista>>>;\nconst ms: number = pagina.items[0].creada.getTime();`,
      solution: "Paginado<U>",
      explanation: "Misma página, otros items: de `Paginado<OrdenDTO>` a `Paginado<OrdenVista>`.",
    },
    {
      type: "choose",
      id: "why-string",
      prompt: "¿Por qué el DTO tiene `creada: string` y el modelo `creada: Date`?",
      options: ["Por costumbre, podría ser `Date` en los dos", "Porque JSON no tiene fechas: viaja un string y se convierte en `Date` al mapear", "Porque `Date` no se puede usar en tipos", "Para ahorrar memoria en el modelo"],
      correct: 1,
      explanation: "`JSON.parse` no rearma fechas: te deja el string. El DTO tiene que decir la verdad sobre lo que llega.",
    },
    {
      type: "fix",
      id: "forgotten-mapping",
      prompt: "`aModelo` copia el DTO tal cual y no compila. Arreglalo.",
      code: `${ORDER}function aModelo(dto: OrdenDTO): OrdenVista {\n  return { ...dto };\n}`,
      tests: `${SAMPLE_DTO}const anio: number = aModelo(dto).creada.getUTCFullYear();`,
      solution: `${ORDER}${TO_MODEL}`,
      explanation: "El spread trae `creada` como string. Pisala con `new Date(dto.creada)`.",
    },
    {
      type: "fix",
      id: "query-string",
      prompt: "Los filtros llegan por query string, donde todo es texto. `leerFiltros` no compila: convertí lo necesario.",
      code: `${FILTERS}function leerFiltros(q: Record<string, string | undefined>): FiltrosBlotter {\n  return { date_from: q.date_from, date_to: q.date_to, page: q.page ?? "1", page_size: q.page_size ?? "50" };\n}`,
      tests: "const f = leerFiltros({ page: \"3\" });\nconst siguiente: number = f.page + 1;",
      solution: `${FILTERS}function leerFiltros(q: Record<string, string | undefined>): FiltrosBlotter {\n  return { date_from: q.date_from, date_to: q.date_to, page: Number(q.page ?? "1"), page_size: Number(q.page_size ?? "50") };\n}`,
      explanation: "`page` y `page_size` son números. Como string, `page + 1` daría \"31\" en vez de 4.",
    },
    {
      type: "complete",
      id: "to-dto",
      prompt: "Jefe: `ADTO<T>` cambia todo `Date` por `string`, también en `Date | null`. Completá el valor del mapped type.",
      code: "type ADTO<T> = { [K in keyof T]: ___ };",
      tests: "type Liquidacion = { id: number; operada: Date; liquidada: Date | null; nota?: string };\ntype _1 = Expect<Equal<ADTO<Liquidacion>, { id: number; operada: string; liquidada: string | null; nota?: string }>>;",
      solution: "T[K] extends infer V ? (V extends Date ? string : V) : never",
      hint: "`Date | null` no es un `Date`. Capturá `T[K]` con `infer` para que el condicional vaya por partes.",
      explanation: "Un condicional solo se reparte sobre un tipo genérico pelado. `infer V` crea uno: `Date | null` queda `string | null`.",
    },
  ],
};

export default lesson;
