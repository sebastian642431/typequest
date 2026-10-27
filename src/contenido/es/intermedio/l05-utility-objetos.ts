import type { Leccion } from "../../tipos.ts";

const USUARIO = "type Usuario = { id: number; nombre: string; email: string; edad?: number };\n";

const leccion: Leccion = {
  id: "utility-objetos",
  titulo: "La caja de herramientas",
  resumen: "Partial, Required, Readonly, Pick, Omit y Record: transformar objetos sin reescribirlos.",
  teoria: [
    { texto: "TypeScript trae tipos listos para transformar otros tipos. Son como la navaja suiza: no inventan nada nuevo, pero te ahorran escribir lo mismo diez veces." },
    { codigo: USUARIO },
    { texto: "`Partial<Usuario>` vuelve todo opcional (ideal para un formulario a medio llenar). `Required<Usuario>` hace lo contrario: hasta `edad` pasa a ser obligatoria. `Readonly<Usuario>` deja todo en solo lectura." },
    { texto: "`Pick<Usuario, \"id\" | \"nombre\">` se queda solo con esas claves. `Omit<Usuario, \"email\">` se queda con todas menos esa. Pick elige, Omit descarta." },
    { codigo: "type Votos = Record<\"rojo\" | \"azul\", number>;\nconst v: Votos = { rojo: 10, azul: 7 };" },
    { texto: "`Record<K, V>` arma un objeto con las claves K, todas con valores de tipo V. Si K es una unión de literales, te exige todas las claves, ni una menos." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "required",
      codigo: `${USUARIO}const u: Required<Usuario> = { id: 1, nombre: "Ana", email: "ana@mail.com" };\nu.id;`,
      respuesta: "type error",
      explicacion: "Required saca el ? de edad, así que ahora falta.",
    },
    {
      tipo: "predecir",
      id: "readonly",
      codigo: `${USUARIO}const u: Readonly<Usuario> = { id: 1, nombre: "Ana", email: "ana@mail.com" };\nu.nombre = "Beto";\nu.nombre;`,
      respuesta: "type error",
      explicacion: "Con Readonly no se puede reasignar ninguna propiedad.",
    },
    {
      tipo: "predecir",
      id: "omit",
      codigo: `${USUARIO}const publico: Omit<Usuario, "email"> = { id: 2, nombre: "Dani", edad: 30 };\npublico.edad;`,
      respuesta: "30",
      explicacion: "Omit saca solo email. edad sigue estando, opcional como antes.",
    },
    {
      tipo: "predecir",
      id: "record-falta",
      codigo: "type Votos = Record<\"rojo\" | \"azul\" | \"verde\", number>;\nconst v: Votos = { rojo: 3, azul: 1 };\nv.rojo;",
      respuesta: "type error",
      explicacion: "Record con una unión de literales exige todas las claves, y falta verde.",
    },
    {
      tipo: "predecir",
      id: "record-string",
      codigo: "const stock: Record<string, number> = { yerba: 12 };\nstock.azucar = 4;\nstock.yerba + stock.azucar;",
      respuesta: "16",
      explicacion: "Con Record<string, number> cualquier clave string vale, así que se pueden agregar nuevas.",
    },
    {
      tipo: "predecir",
      id: "combinados",
      codigo: `${USUARIO}type Edicion = Partial<Omit<Usuario, "id">>;\nconst e: Edicion = { id: 9 };\ne;`,
      respuesta: "type error",
      pista: "Leelo de adentro para afuera.",
      explicacion: "Primero Omit saca id y después Partial vuelve todo opcional. id ya no existe, así que el literal tiene una propiedad de más.",
    },
    {
      tipo: "completar",
      id: "completar-pick",
      enunciado: "Completá el tipo para que `Contacto` tenga solo `nombre` y `email` de Usuario.",
      codigo: `${USUARIO}type Contacto = ___;`,
      pruebas: "const c: Contacto = { nombre: \"Eli\", email: \"eli@mail.com\" };\ntype _t = Esperar<Igual<keyof Contacto, \"nombre\" | \"email\">>;",
      solucion: "Pick<Usuario, \"nombre\" | \"email\">",
      explicacion: "Pick con la unión de las dos claves que queremos conservar. Omit<Usuario, \"id\" | \"edad\"> también sirve.",
    },
    {
      tipo: "completar",
      id: "completar-record",
      enunciado: "Completá el tipo de `horarios` para que tenga una clave por día, cada una con un string.",
      codigo: "type Dia = \"lun\" | \"mie\" | \"vie\";\nconst horarios: ___ = { lun: \"9 a 13\", mie: \"14 a 18\", vie: \"9 a 13\" };",
      pruebas: "const h: string = horarios.mie;\ntype _t = Esperar<Igual<keyof typeof horarios, Dia>>;",
      solucion: "Record<Dia, string>",
      explicacion: "Record<Dia, string> tiene exactamente las tres claves de Dia con valores string.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-partial",
      enunciado: "`actualizar` debería aceptar solo los campos que cambian. Arreglá el tipo del parámetro `cambios`.",
      codigo: `${USUARIO}function actualizar(u: Usuario, cambios: Usuario): Usuario {\n  return { ...u, ...cambios };\n}`,
      pruebas: "const viejo: Usuario = { id: 1, nombre: \"Ana\", email: \"ana@mail.com\" };\nconst nuevo: Usuario = actualizar(viejo, { email: \"ana@nuevo.com\" });",
      solucion: `${USUARIO}function actualizar(u: Usuario, cambios: Partial<Usuario>): Usuario {\n  return { ...u, ...cambios };\n}`,
      explicacion: "Partial<Usuario> deja pasar un objeto con solo algunos campos.",
    },
    {
      tipo: "elegir",
      id: "elegir-omit",
      enunciado: "¿Cuál de estos tipos es equivalente a `Omit<{ a: 1; b: 2; c: 3 }, \"a\">`?",
      opciones: [
        "Pick<{ a: 1; b: 2; c: 3 }, \"b\" | \"c\">",
        "Pick<{ a: 1; b: 2; c: 3 }, \"a\">",
        "Partial<{ a: 1; b: 2; c: 3 }>",
        "{ a: 1 }",
      ],
      correcta: 0,
      explicacion: "Sacar a es lo mismo que quedarse con b y c.",
    },
  ],
};

export default leccion;
