import type { Leccion } from "../../tipos.ts";

const ESTADO = `const Estado = { Activo: "activo", Pausado: "pausado" } as const;
type Estado = (typeof Estado)[keyof typeof Estado];
`;

const leccion: Leccion = {
  id: "enums-y-const",
  titulo: "Enums y objetos as const",
  resumen: "Enums numéricos y de string, y por qué hoy se prefiere un objeto as const con una unión derivada.",
  teoria: [
    { texto: "`enum` es de las pocas cosas de TypeScript que generan código: se convierte en un objeto real. Los numéricos arrancan en 0, siguen de a uno y además tienen mapeo inverso, del número al nombre." },
    { codigo: "enum Talle {\n  S,\n  M,\n  L,\n}\nconst t = Talle.M;\nconst nombre = Talle[1];" },
    { texto: "Los enums de string no tienen mapeo inverso y son celosos: solo aceptan sus miembros. Un `\"rojo\"` escrito a mano no entra en `Color`, aunque `Color.Rojo` valga exactamente eso." },
    { texto: "En TS moderno se prefiere un objeto `as const`: es JavaScript común (anda con el type stripping de Node y con `erasableSyntaxOnly`), y de ahí sacás la unión de valores con un tipo del mismo nombre." },
    { codigo: ESTADO },
    { texto: "`keyof typeof Estado` son las claves, `\"Activo\" | \"Pausado\"`. Indexar con eso da los valores, `\"activo\" | \"pausado\"`. Y como es una unión de literales, un `\"pausado\"` escrito a mano entra sin drama." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "numerico",
      codigo: `enum Talle {
  S,
  M,
  L,
}
[Talle.L, Talle[1]];`,
      respuesta: "[2, \"M\"]",
      explicacion: "Los valores van 0, 1, 2. El mapeo inverso convierte el 1 en \"M\".",
    },
    {
      tipo: "predecir",
      id: "autoincremento",
      codigo: `enum Codigo {
  Ok = 200,
  Creado,
  Aceptado,
}
Codigo.Aceptado;`,
      respuesta: "202",
      explicacion: "Después de un valor numérico, los siguientes siguen contando de a uno: 200, 201, 202.",
    },
    {
      tipo: "predecir",
      id: "string-celoso",
      codigo: `enum Color {
  Rojo = "rojo",
  Verde = "verde",
}
const c: Color = "rojo";
c;`,
      respuesta: "type error",
      explicacion: "Un enum de string solo acepta sus miembros. Habría que escribir Color.Rojo.",
    },
    {
      tipo: "predecir",
      id: "as-const-union",
      codigo: `${ESTADO}const e: Estado = "pausado";
e;`,
      respuesta: "\"pausado\"",
      explicacion: "Estado es \"activo\" | \"pausado\". Un literal escrito a mano entra directo.",
    },
    {
      tipo: "predecir",
      id: "sin-as-const",
      codigo: `const Estado = { Activo: "activo", Pausado: "pausado" };
type Estado = (typeof Estado)[keyof typeof Estado];
const e: Estado = "cualquiera";
e;`,
      respuesta: "\"cualquiera\"",
      explicacion: "Sin as const, los valores se ensanchan a string. Estado termina siendo string y acepta cualquier cosa.",
      pista: "¿Qué tipo tiene Estado.Activo sin as const?",
    },
    {
      tipo: "predecir",
      id: "claves-no-valores",
      codigo: `${ESTADO}type Clave = keyof typeof Estado;
const k: Clave = "activo";
k;`,
      respuesta: "type error",
      explicacion: "keyof da las claves, \"Activo\" | \"Pausado\", con mayúscula. \"activo\" es un valor, no una clave.",
    },
    {
      tipo: "completar",
      id: "completar-union",
      enunciado: "Completá Moneda para que sea la unión de los valores del objeto.",
      codigo: `const Moneda = { Peso: "ARS", Dolar: "USD" } as const;
type Moneda = ___;`,
      pruebas: `type _t = Esperar<Igual<Moneda, "ARS" | "USD">>;
const m: Moneda = Moneda.Dolar;`,
      solucion: "(typeof Moneda)[keyof typeof Moneda]",
      explicacion: "typeof saca el tipo del objeto y [keyof ...] lo indexa con todas sus claves: quedan los valores.",
    },
    {
      tipo: "completar",
      id: "completar-as-const",
      enunciado: "Completá para que los valores no se ensanchen a number.",
      codigo: "const Dia = { Lunes: 1, Martes: 2 } as ___;",
      pruebas: `type D = (typeof Dia)[keyof typeof Dia];
type _t = Esperar<Igual<D, 1 | 2>>;`,
      solucion: "const",
      explicacion: "as const deja cada valor como su literal y el objeto como readonly.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-enum",
      enunciado: "Los que llaman a precio pasan strings sueltos. Reemplazá el enum por un objeto as const con una unión del mismo nombre.",
      codigo: `enum Plan {
  Free = "free",
  Pro = "pro",
}
function precio(p: Plan) {
  return p === Plan.Pro ? 10 : 0;
}`,
      pruebas: `const a: number = precio("pro");
const b: number = precio(Plan.Free);`,
      solucion: `const Plan = { Free: "free", Pro: "pro" } as const;
type Plan = (typeof Plan)[keyof typeof Plan];
function precio(p: Plan) {
  return p === Plan.Pro ? 10 : 0;
}`,
      explicacion: "Con la unión, \"pro\" y Plan.Pro valen lo mismo para el compilador. Y Plan.Free sigue andando porque el objeto existe.",
    },
    {
      tipo: "elegir",
      id: "por-que-as-const",
      enunciado: "¿Por qué hoy se suele preferir un objeto as const antes que un enum?",
      opciones: [
        "Porque los enums no existen en runtime",
        "Porque es JavaScript común, y la unión acepta literales escritos a mano",
        "Porque los enums no se pueden usar en un switch",
        "Porque as const hace el código más rápido",
      ],
      correcta: 1,
      explicacion: "El enum genera código propio de TypeScript y, si es de string, rechaza los literales. El objeto as const no tiene ninguna de esas dos vueltas.",
    },
  ],
};

export default leccion;
