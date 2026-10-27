import type { Leccion } from "../../tipos.ts";

const MASCOTAS = `type Gato = { nombre: string; maulla: true };
type Perro = { nombre: string; ladra: true };
`;

const leccion: Leccion = {
  id: "type-guards",
  titulo: "Type guards propios",
  resumen: "Funciones que devuelven `x is T` para que TypeScript no se olvide de lo que chequeaste.",
  teoria: [
    { texto: "Un `typeof` o un `in` adentro de un `if` estrechan el tipo. Pero si movés ese chequeo a una función que devuelve `boolean`, TypeScript pierde el hilo: para él es un sí o no, sin más información." },
    { texto: "La solución es decirle qué significa ese `true`. Con `m is Gato` como tipo de retorno, la función pasa a ser un type guard." },
    { codigo: `${MASCOTAS}function esGato(m: Gato | Perro): m is Gato {
  return "maulla" in m;
}
function saludar(m: Gato | Perro) {
  if (esGato(m)) return m.nombre + " maulla";
  return m.nombre + " ladra";
}` },
    { texto: "En la rama del `true` tenés un Gato; en la otra, lo que sobra de la unión. Ojo: TypeScript te cree a ciegas. Si el cuerpo de la función miente, el tipo miente con ella." },
    { texto: "Con `filter` el guard brilla: un array de `T | null` filtrado con un guard sale como `T[]`. Y desde TS 5.5, una función sin anotar que solo hace el chequeo ya se infiere como guard." },
    { codigo: "const precios = [100, null, 250].filter((p): p is number => p !== null);" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "boolean-pelado",
      codigo: `function esTexto(x: unknown): boolean {
  return typeof x === "string";
}
function gritar(x: unknown) {
  if (esTexto(x)) return x.toUpperCase();
  return "";
}
gritar("che");`,
      respuesta: "type error",
      explicacion: "esTexto dice que devuelve boolean y nada más. Adentro del if, x sigue siendo unknown.",
    },
    {
      tipo: "predecir",
      id: "inferido",
      codigo: `function esTexto(x: unknown) {
  return typeof x === "string";
}
function gritar(x: unknown) {
  if (esTexto(x)) return x.toUpperCase();
  return "";
}
gritar("che");`,
      respuesta: "\"CHE\"",
      explicacion: "Sin anotación, TypeScript infiere que esTexto es un guard `x is string`. Anotar `boolean` a mano es lo que lo rompía.",
    },
    {
      tipo: "predecir",
      id: "rama-else",
      codigo: `${MASCOTAS}function esGato(m: Gato | Perro): m is Gato {
  return "maulla" in m;
}
function sonido(m: Gato | Perro) {
  if (esGato(m)) return m.nombre + " dice miau";
  return m.ladra ? m.nombre + " dice guau" : "";
}
sonido({ nombre: "Firulais", ladra: true });`,
      respuesta: "\"Firulais dice guau\"",
      explicacion: "Si el guard da false, TypeScript saca a Gato de la unión: en la otra rama m es Perro y tiene ladra.",
    },
    {
      tipo: "predecir",
      id: "filter-guard",
      codigo: `const ventas = [120, null, 80, null, 300];
const total = ventas.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
total;`,
      respuesta: "500",
      explicacion: "El filter con guard devuelve number[], así que el reduce suma números sin quejas.",
    },
    {
      tipo: "predecir",
      id: "filter-boolean",
      codigo: `const ventas = [120, null, 80];
const total = ventas.filter(Boolean).reduce((a, b) => a + b, 0);
total;`,
      respuesta: "type error",
      explicacion: "Boolean no es un type guard. El array sigue siendo (number | null)[] y b puede ser null.",
      pista: "¿Qué tipo tiene el array que sale del filter?",
    },
    {
      tipo: "predecir",
      id: "guard-mentiroso",
      codigo: `function esNumero(x: unknown): x is number {
  return typeof x === "string";
}
function sumarUno(v: unknown) {
  return esNumero(v) ? v + 1 : 0;
}
sumarUno("7");`,
      respuesta: "\"71\"",
      explicacion: "El guard miente: deja pasar strings como si fueran number. Compila, y en runtime \"7\" + 1 concatena.",
      pista: "TypeScript no revisa que el cuerpo del guard diga la verdad.",
    },
    {
      tipo: "completar",
      id: "completar-predicado",
      enunciado: "Completá el tipo de retorno para que esPerro sea un type guard.",
      codigo: `${MASCOTAS}function esPerro(m: Gato | Perro): ___ {
  return "ladra" in m;
}`,
      pruebas: `function ladrido(m: Gato | Perro) {
  if (esPerro(m)) {
    const l: true = m.ladra;
    return l;
  }
  return false;
}`,
      solucion: "m is Perro",
      explicacion: "`m is Perro` le avisa a TypeScript que, si devuelve true, m es un Perro.",
    },
    {
      tipo: "completar",
      id: "completar-lista",
      enunciado: "Completá el tipo del guard para que adentro del if se pueda usar `.length`.",
      codigo: `function esLista(x: unknown): x is ___ {
  return Array.isArray(x);
}`,
      pruebas: `function largo(x: unknown) {
  return esLista(x) ? x.length : 0;
}
const n: number = largo([1, 2]);`,
      solucion: "unknown[]",
      explicacion: "Array.isArray garantiza que es un array, pero no de qué. `unknown[]` dice exactamente eso.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-filter",
      enunciado: "valores no compila: el filter no estrecha. Arreglá la función esOk.",
      codigo: `type Ok = { estado: "ok"; valor: number };
type Falla = { estado: "falla"; motivo: string };
type Resultado = Ok | Falla;
function esOk(r: Resultado): boolean {
  return r.estado === "ok";
}
function valores(rs: Resultado[]): number[] {
  return rs.filter(esOk).map((r) => r.valor);
}`,
      pruebas: `const v: number[] = valores([{ estado: "ok", valor: 3 }, { estado: "falla", motivo: "timeout" }]);`,
      solucion: `type Ok = { estado: "ok"; valor: number };
type Falla = { estado: "falla"; motivo: string };
type Resultado = Ok | Falla;
function esOk(r: Resultado): r is Ok {
  return r.estado === "ok";
}
function valores(rs: Resultado[]): number[] {
  return rs.filter(esOk).map((r) => r.valor);
}`,
      explicacion: "Con `r is Ok`, filter usa la sobrecarga que estrecha y el map recibe Ok.",
    },
    {
      tipo: "elegir",
      id: "runtime",
      enunciado: "¿Qué devuelve en runtime una función declarada como `(x: unknown): x is string`?",
      opciones: ["Un boolean común y corriente", "El mismo x, ya convertido a string", "Nada: la función se borra al compilar", "Un objeto con el tipo adentro"],
      correcta: 0,
      explicacion: "`x is string` solo existe para el compilador. En JS es una función que devuelve true o false.",
    },
  ],
};

export default leccion;
