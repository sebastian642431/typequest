import type { Lesson } from "../../../../content/types.ts";

const USER_TYPE = `type Usuario = { nombre: string; edad: number };
`;

const lesson: Lesson = {
  id: "external-data",
  title: "Lo que viene de afuera",
  summary: "`JSON.parse` y las APIs no traen tipos. Te los ganás validando.",
  idea: "Lo que viene de afuera no tiene tipo: guardalo como `unknown` y validalo.",
  theory: [
    { title: "Afuera no hay tipos", text: "El compilador no ve tu red ni tu base. Un body, un archivo o un mensaje llegan sin tipo real." },
    { title: "`any` apaga, `unknown` frena", text: "`JSON.parse` devuelve `any`: todo compila y nada se chequea. Con `unknown` no tocás nada hasta probar qué es.", code: "const crudo: unknown = JSON.parse('{\"nombre\":\"Ana\"}');" },
    { title: "`as` no valida", text: "`as Usuario` no mira el dato: solo firma que es un Usuario. Si la API manda otra cosa, el tipo miente.", code: "type Usuario = { nombre: string; edad: number };\nconst mentira = crudo as Usuario;" },
    { title: "Validá con un type guard", text: "Revisá cada campo con `typeof` e `in`. Adentro del `if`, el dato ya es un Usuario. Un if, tipo ganado." },
  ],
  exercises: [
    {
      type: "predict",
      id: "unknown-closed",
      code: `const crudo: unknown = JSON.parse('{"nombre":"Ana"}');\ncrudo.nombre;`,
      answer: "type error",
      explanation: "Con `unknown` no podés leer propiedades. Primero tenés que estrechar el tipo.",
    },
    {
      type: "predict",
      id: "any-open",
      code: `const dato = JSON.parse('{"edad":"30"}');\ndato.edad + 1;`,
      answer: "\"301\"",
      explanation: "`dato` es `any`, así que compila. Pero `edad` vino como string, y string + número concatena.",
    },
    {
      type: "predict",
      id: "as-lies",
      code: `${USER_TYPE}const u = JSON.parse('{"nombre":"Ana"}') as Usuario;\nu.edad;`,
      answer: "undefined",
      explanation: "El tipo jura que hay `edad`, pero el JSON no la trae. El `as` no validó nada.",
    },
    {
      type: "predict",
      id: "as-sum",
      code: `${USER_TYPE}const u = JSON.parse('{"nombre":"Ana","edad":"30"}') as Usuario;\nu.edad + 1;`,
      answer: "\"301\"",
      explanation: "Para TypeScript son dos números y compila. En runtime `edad` es \"30\" y se concatena. El bug se coló.",
    },
    {
      type: "choose",
      id: "honest-type",
      prompt: "Llega el body de un webhook con `JSON.parse`. ¿Qué tipo le das antes de validarlo?",
      options: ["`any`, así se puede usar directo", "`unknown`, y validarlo antes de usarlo", "El tipo esperado con `as`", "`object`, porque siempre es un objeto"],
      correct: 1,
      explanation: "`unknown` te obliga a validar antes de usar. `any` y `as` confían a ciegas, y el JSON ni siquiera tiene que ser un objeto.",
    },
    {
      type: "complete",
      id: "guard-user",
      prompt: "Completá el retorno para que `esUsuario` sea un type guard.",
      code: `${USER_TYPE}function esUsuario(x: unknown): ___ {\n  return typeof x === "object" && x !== null && "nombre" in x && typeof x.nombre === "string" && "edad" in x && typeof x.edad === "number";\n}`,
      tests: `function saludo(x: unknown): string {\n  if (esUsuario(x)) return x.nombre + " tiene " + x.edad;\n  return "dato inválido";\n}\nconst s: string = saludo(JSON.parse('{"nombre":"Ana","edad":30}'));`,
      solution: "x is Usuario",
      explanation: "`x is Usuario` le avisa a TypeScript: si la función da `true`, adentro del `if` `x` es un Usuario.",
    },
    {
      type: "complete",
      id: "guard-list",
      prompt: "`esListaDe` valida un array con un guard por elemento. ¿Qué es `x` si da `true`?",
      code: "function esListaDe<T>(x: unknown, guard: (v: unknown) => v is T): x is ___ {\n  return Array.isArray(x) && x.every(guard);\n}",
      tests: `const datos: unknown = JSON.parse("[3, 4]");\nconst esNumero = (v: unknown): v is number => typeof v === "number";\nif (esListaDe(datos, esNumero)) {\n  const primero: number = datos[0];\n}`,
      solution: "T[]",
      explanation: "Si cada elemento pasa el guard de `T`, el array entero es `T[]`.",
    },
    {
      type: "fix",
      id: "read-name",
      prompt: "`nombreDe` devuelve el nombre del JSON, o \"anónimo\". No compila: validá antes de leer.",
      code: "function nombreDe(texto: string): string {\n  const dato: unknown = JSON.parse(texto);\n  return dato.nombre;\n}",
      tests: `const a: string = nombreDe('{"nombre":"Ana"}');\nconst b: string = nombreDe("42");`,
      solution: "function nombreDe(texto: string): string {\n  const dato: unknown = JSON.parse(texto);\n  if (typeof dato === \"object\" && dato !== null && \"nombre\" in dato && typeof dato.nombre === \"string\") {\n    return dato.nombre;\n  }\n  return \"anónimo\";\n}",
      explanation: "Cada chequeo achica el tipo: objeto, no null, tiene `nombre`, es string. Recién ahí podés devolverlo.",
    },
    {
      type: "fix",
      id: "catch-unknown",
      prompt: "A un `catch` puede llegar cualquier cosa, hasta un string. Arreglá `intentar` para que compile.",
      code: "function intentar(texto: string): string {\n  try {\n    JSON.parse(texto);\n    return \"ok\";\n  } catch (e) {\n    return e.message;\n  }\n}",
      tests: `const r: string = intentar("{roto");`,
      solution: "function intentar(texto: string): string {\n  try {\n    JSON.parse(texto);\n    return \"ok\";\n  } catch (e) {\n    return e instanceof Error ? e.message : String(e);\n  }\n}",
      explanation: "Con `strict`, el error del `catch` es `unknown`. `instanceof Error` deja leer `message`; si no, `String(e)`.",
    },
    {
      type: "complete",
      id: "has-fields",
      prompt: "Jefe: `tieneCampos` revisa que un dato tenga ciertas claves. Completá el predicado para leerlas después del `if`.",
      code: "function tieneCampos<K extends string>(x: unknown, ...campos: K[]): x is ___ {\n  return typeof x === \"object\" && x !== null && campos.every((c) => c in x);\n}",
      tests: `const d: unknown = JSON.parse('{"a":1,"b":2}');\nif (tieneCampos(d, "a", "b")) {\n  type _1 = Expect<Equal<typeof d, Record<"a" | "b", unknown>>>;\n  const v: unknown = d.a;\n}`,
      solution: "Record<K, unknown>",
      hint: "`K` es la unión de claves que pasaste. Armá un objeto con esas claves y valores desconocidos.",
      explanation: "`Record<K, unknown>` asegura que las claves están, pero no promete nada de sus valores. Esos se validan después.",
    },
  ],
};

export default lesson;
