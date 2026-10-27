import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "object-utilities",
  title: "La caja de herramientas",
  summary: "`Partial`, `Required`, `Readonly`, `Pick`, `Omit` y `Record`: tipos que transforman tipos.",
  idea: "Hay tipos ya hechos que transforman objetos para no reescribirlos.",
  theory: [
    {
      title: "Navaja suiza",
      text: "TypeScript trae tipos que transforman otros tipos. Te ahorran escribir lo mismo diez veces.",
      code: "type Usuario = { id: number; nombre: string; edad?: number };",
    },
    {
      title: "Partial, Required, Readonly",
      text: "`Partial` vuelve todo opcional. `Required` todo obligatorio. `Readonly` todo de solo lectura.",
    },
    {
      title: "Pick y Omit",
      text: "`Pick<Usuario, \"id\">` se queda con esa clave. `Omit<Usuario, \"id\">` con todas menos esa.",
    },
    {
      title: "Record",
      text: "`Record<K, V>` arma un objeto con claves `K` y valores `V`. Con una unión, exige todas las claves.",
      code: "type Votos = Record<\"rojo\" | \"azul\", number>;\nconst v: Votos = { rojo: 10, azul: 7 };",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "required",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\nconst u: Required<Usuario> = { id: 1, nombre: \"Ana\", email: \"ana@mail.com\" };\nu.id;",
      answer: "type error",
      explanation: "`Required` le saca el `?` a `edad`. Ahora es obligatoria y falta.",
    },
    {
      type: "predict",
      id: "readonly",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\nconst u: Readonly<Usuario> = { id: 1, nombre: \"Ana\", email: \"ana@mail.com\" };\nu.nombre = \"Beto\";\nu.nombre;",
      answer: "type error",
      explanation: "Con `Readonly` no se puede reasignar ninguna propiedad.",
    },
    {
      type: "predict",
      id: "omit",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\nconst publico: Omit<Usuario, \"email\"> = { id: 2, nombre: \"Dani\", edad: 30 };\npublico.edad;",
      answer: "30",
      explanation: "`Omit` saca solo `email`. `edad` sigue ahí, y vale 30.",
    },
    {
      type: "predict",
      id: "record-missing",
      code: "type Votos = Record<\"rojo\" | \"azul\" | \"verde\", number>;\nconst v: Votos = { rojo: 3, azul: 1 };\nv.rojo;",
      answer: "type error",
      explanation: "`Record` con una unión exige todas las claves. Falta `verde`.",
    },
    {
      type: "predict",
      id: "record-string",
      code: "const stock: Record<string, number> = { yerba: 12 };\nstock.azucar = 4;\nstock.yerba + stock.azucar;",
      answer: "16",
      explanation: "Con `Record<string, number>` vale cualquier clave. Se agrega `azucar`: 12 + 4 = 16.",
    },
    {
      type: "predict",
      id: "combined",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\ntype Edicion = Partial<Omit<Usuario, \"id\">>;\nconst e: Edicion = { id: 9 };\ne;",
      answer: "type error",
      hint: "Leelo de adentro para afuera.",
      explanation: "`Omit` saca `id` y `Partial` hace opcional el resto. `id` ya no existe, así que sobra.",
    },
    {
      type: "complete",
      id: "complete-pick",
      prompt: "Completá para que `Contacto` tenga solo `nombre` y `email` de `Usuario`.",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\ntype Contacto = ___;",
      tests: "const c: Contacto = { nombre: \"Eli\", email: \"eli@mail.com\" };\ntype _t = Expect<Equal<keyof Contacto, \"nombre\" | \"email\">>;",
      solution: "Pick<Usuario, \"nombre\" | \"email\">",
      explanation: "`Pick` con las dos claves que querés. `Omit<Usuario, \"id\" | \"edad\">` también sirve.",
    },
    {
      type: "complete",
      id: "complete-record",
      prompt: "Completá el tipo de `horarios`: una clave por `Dia`, cada una con un string.",
      code: "type Dia = \"lun\" | \"mie\" | \"vie\";\nconst horarios: ___ = { lun: \"9 a 13\", mie: \"14 a 18\", vie: \"9 a 13\" };",
      tests: "const h: string = horarios.mie;\ntype _t = Expect<Equal<keyof typeof horarios, Dia>>;",
      solution: "Record<Dia, string>",
      explanation: "`Record<Dia, string>` tiene justo las tres claves de `Dia`, con valores string.",
    },
    {
      type: "fix",
      id: "fix-partial",
      prompt: "`actualizar` debería aceptar solo los campos que cambian. Arreglá el tipo de `cambios`.",
      code: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\nfunction actualizar(u: Usuario, cambios: Usuario): Usuario {\n  return { ...u, ...cambios };\n}",
      tests: "const viejo: Usuario = { id: 1, nombre: \"Ana\", email: \"ana@mail.com\" };\nconst nuevo: Usuario = actualizar(viejo, { email: \"ana@nuevo.com\" });",
      solution: "type Usuario = { id: number; nombre: string; email: string; edad?: number };\nfunction actualizar(u: Usuario, cambios: Partial<Usuario>): Usuario {\n  return { ...u, ...cambios };\n}",
      explanation: "`Partial<Usuario>` acepta un objeto con solo algunos campos.",
    },
    {
      type: "choose",
      id: "choose-omit",
      prompt: "¿Qué tipo es igual a `Omit<{ a: 1; b: 2; c: 3 }, \"a\">`?",
      options: [
        "Pick<{ a: 1; b: 2; c: 3 }, \"b\" | \"c\">",
        "Pick<{ a: 1; b: 2; c: 3 }, \"a\">",
        "Partial<{ a: 1; b: 2; c: 3 }>",
        "{ a: 1 }",
      ],
      correct: 0,
      explanation: "Sacar `a` es lo mismo que quedarse con `b` y `c`.",
    },
  ],
};

export default lesson;
