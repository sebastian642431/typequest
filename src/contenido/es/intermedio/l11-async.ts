import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "async",
  titulo: "Promesas y async",
  resumen: "Promise<T>, qué devuelve una función async, qué hace await con el tipo, Promise.all y Awaited.",
  teoria: [
    { texto: "Una `Promise<T>` es una caja que tarde o temprano va a traer un T. Una función `async` siempre devuelve una de esas cajas, aunque adentro hagas `return 5`." },
    { codigo: "async function cotizacion(): Promise<number> {\n  return 1450;\n}" },
    { texto: "`await` abre la caja: `await cotizacion()` es un `number`. Sin `await` tenés la promesa, y una promesa no se suma, no se multiplica ni se compara con nada útil." },
    { texto: "`Promise.all` con un array literal devuelve una tupla: cada posición conserva su tipo. Y `Awaited<T>` es el tipo que queda después de esperar, aunque haya promesas adentro de promesas." },
    { codigo: "async function tablero() {\n  const [usd, nombre] = await Promise.all([cotizacion(), Promise.resolve(\"Ana\")]);\n  return nombre + \": \" + usd.toFixed(2);\n}\ntype Adentro = Awaited<Promise<Promise<string>>>;" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "async-number",
      codigo: `async function uno(): number {
  return 1;
}
uno();`,
      respuesta: "type error",
      explicacion: "Una función async siempre devuelve una promesa. El tipo de retorno tiene que ser Promise<number>.",
    },
    {
      tipo: "predecir",
      id: "typeof-promesa",
      codigo: `async function saludo() {
  return "hola";
}
const p: Promise<string> = saludo();
typeof p;`,
      respuesta: "\"object\"",
      explicacion: "Sin await, lo que tenés es la promesa, que en runtime es un objeto.",
    },
    {
      tipo: "predecir",
      id: "sin-await-asigna",
      codigo: `async function edad() {
  return 30;
}
const n: number = edad();
n;`,
      respuesta: "type error",
      explicacion: "edad() es Promise<number>, no number. Faltaría un await.",
    },
    {
      tipo: "predecir",
      id: "sin-await-suma",
      codigo: `async function precio() {
  return 100;
}
async function conIva() {
  const p = precio();
  return p * 1.21;
}
conIva();`,
      respuesta: "type error",
      explicacion: "p es una Promise<number>. No se puede multiplicar una promesa.",
    },
    {
      tipo: "predecir",
      id: "awaited",
      codigo: `type Adentro = Awaited<Promise<Promise<string>>>;
const a: Adentro = "listo";
a.length;`,
      respuesta: "5",
      explicacion: "Awaited desenvuelve todas las capas: queda string.",
    },
    {
      tipo: "predecir",
      id: "then-cambia",
      codigo: `const p: Promise<number> = Promise.resolve(2).then((n) => n.toFixed(1));
typeof p;`,
      respuesta: "type error",
      explicacion: "then devuelve una promesa de lo que devuelve el callback, y toFixed da string. Como la variable pide Promise<number>, TypeScript arma Promise<string | number>, que tampoco entra.",
      pista: "¿Qué tipo devuelve toFixed?",
    },
    {
      tipo: "completar",
      id: "completar-retorno",
      enunciado: "Completá el tipo de retorno de cargar.",
      codigo: `async function cargar(): ___ {
  return ["yerba", "azúcar"];
}`,
      pruebas: `async function usar() {
  const xs = await cargar();
  const n: number = xs.length;
  const s: string = xs[0];
  return n + s;
}`,
      solucion: "Promise<string[]>",
      explicacion: "Lo que devuelve con return es string[], y la función async lo envuelve en una promesa.",
    },
    {
      tipo: "completar",
      id: "completar-tupla",
      enunciado: "Completá el tipo del primer elemento de la tupla que sale de Promise.all.",
      codigo: `async function usuario() {
  return { nombre: "Ana" };
}
async function saldo() {
  return 1500;
}
async function resumen() {
  const [u, s]: [___, number] = await Promise.all([usuario(), saldo()]);
  return u.nombre + ": " + s.toFixed(2);
}`,
      pruebas: "const r: Promise<string> = resumen();",
      solucion: "{ nombre: string }",
      explicacion: "Promise.all espera cada promesa y arma una tupla: la primera posición es lo que devuelve usuario, ya desenvuelto.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-all",
      enunciado: "total no compila. Arreglalo sin cambiar precio ni envio.",
      codigo: `async function precio() {
  return 100;
}
async function envio() {
  return 20;
}
async function total() {
  const [p, e] = Promise.all([precio(), envio()]);
  return p + e;
}`,
      pruebas: "const t: Promise<number> = total();",
      solucion: `async function precio() {
  return 100;
}
async function envio() {
  return 20;
}
async function total() {
  const [p, e] = await Promise.all([precio(), envio()]);
  return p + e;
}`,
      explicacion: "Promise.all devuelve una promesa de la tupla. Sin await no hay nada para desestructurar.",
    },
    {
      tipo: "elegir",
      id: "awaited-return",
      enunciado: "¿Qué tipo es Resultado?",
      codigo: `async function cargar() {
  return { ok: true, items: [1, 2, 3] };
}
type Resultado = Awaited<ReturnType<typeof cargar>>;`,
      opciones: [
        "Promise<{ ok: boolean; items: number[] }>",
        "{ ok: boolean; items: number[] }",
        "() => Promise<{ ok: boolean; items: number[] }>",
        "unknown",
      ],
      correcta: 1,
      explicacion: "ReturnType da la promesa y Awaited la abre. Es el combo de siempre para sacar lo que trae una función async.",
    },
  ],
};

export default leccion;
