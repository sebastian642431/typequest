import type { Leccion } from "../../tipos.ts";

const EMAIL = "type Email = string & { readonly __brand: \"Email\" };\n";
const IDS = "type UsuarioId = number & { readonly __brand: \"UsuarioId\" };\ntype PartidaId = number & { readonly __brand: \"PartidaId\" };\n";

const leccion: Leccion = {
  id: "branded",
  titulo: "Con marca registrada",
  resumen: "El sistema de tipos mira la forma, no el nombre. Las marcas sirven para que dos numbers dejen de ser intercambiables.",
  teoria: [
    { texto: "TypeScript es estructural: dos tipos con la misma forma son el mismo tipo, se llamen como se llamen. Un alias no crea nada nuevo, es un apodo." },
    { codigo: "type Pesos = number;\ntype Dolares = number;\nconst sueldo: Pesos = 500000;\nconst ahorro: Dolares = sueldo;" },
    { texto: "Para que no te mezclen pesos con dólares, le pegás una marca: una intersección con un objeto que tiene una propiedad que en la realidad no existe. Es puro cartel para el compilador." },
    { codigo: EMAIL },
    { texto: "Un string común ya no entra en Email. La única forma de conseguir uno es pasar por una función constructora que valida y recién ahí hace el `as`. Ese `as` es la promesa: si llegaste acá, el dato está chequeado." },
    { codigo: `${EMAIL}function crearEmail(s: string): Email {\n  if (!s.includes("@")) throw new Error("eso no es un email");\n  return s as Email;\n}` },
    { texto: "Al revés anda solo: un Email sigue siendo un string, así que podés usarlo donde pidan string sin pedir permiso." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "alias-iguales",
      codigo: "type Pesos = number;\ntype Dolares = number;\nconst precio: Pesos = 1000;\nconst cotizado: Dolares = precio;\ncotizado;",
      respuesta: "1000",
      explicacion: "Pesos y Dolares son number con otro nombre. Para el compilador son el mismo tipo.",
    },
    {
      tipo: "predecir",
      id: "clases-estructurales",
      codigo: "class Gato {\n  nombre = \"Michi\";\n}\nclass Perro {\n  nombre = \"Toby\";\n}\nconst g: Gato = new Perro();\ng.nombre;",
      respuesta: "\"Toby\"",
      explicacion: "Hasta las clases se comparan por forma. Las dos tienen nombre: string, así que un Perro pasa por Gato.",
    },
    {
      tipo: "predecir",
      id: "literal-sin-marca",
      codigo: `${EMAIL}const e: Email = "rys@typequest.dev";\ne;`,
      respuesta: "type error",
      explicacion: "Un string suelto no tiene la marca. Para tener un Email hay que pasar por la constructora.",
    },
    {
      tipo: "predecir",
      id: "ids-cruzados",
      codigo: `${IDS}function buscarUsuario(id: UsuarioId) {\n  return id * 10;\n}\nconst partida = 7 as PartidaId;\nbuscarUsuario(partida);`,
      respuesta: "type error",
      explicacion: "Los dos son number por dentro, pero las marcas \"UsuarioId\" y \"PartidaId\" no coinciden.",
    },
    {
      tipo: "elegir",
      id: "brand-en-runtime",
      enunciado: "Cuando el código ya corre, ¿qué queda de la propiedad __brand?",
      opciones: [
        "Nada: el valor es un string común y __brand solo existió para el compilador",
        "Una propiedad oculta pegada al string",
        "Un Symbol que TypeScript agrega al compilar",
        "Un objeto que envuelve al string",
      ],
      correcta: 0,
      explicacion: "Los tipos se borran al compilar. La marca es una mentira útil: nadie la crea nunca, solo el `as` la promete.",
    },
    {
      tipo: "completar",
      id: "marca-generica",
      enunciado: "Completá Dni usando Marca.",
      codigo: "type Marca<T, M extends string> = T & { readonly __brand: M };\ntype Dni = ___;",
      pruebas: "type _1 = Esperar<Igual<Dni, number & { readonly __brand: \"Dni\" }>>;",
      solucion: "Marca<number, \"Dni\">",
      explicacion: "Marca generaliza el truco: el tipo de base y el nombre de la marca.",
    },
    {
      tipo: "completar",
      id: "constructora",
      enunciado: "Completá el retorno de la constructora.",
      codigo: `${EMAIL}function crearEmail(s: string): ___ {\n  if (!s.includes("@")) throw new Error("falta la arroba");\n  return s as Email;\n}`,
      pruebas: "const contacto: Email = crearEmail(\"rys@typequest.dev\");",
      solucion: "Email",
      explicacion: "La constructora es la puerta de entrada: recibe un string cualquiera y devuelve un Email validado.",
    },
    {
      tipo: "completar",
      id: "guard",
      enunciado: "En vez de tirar error, esEmail es un type guard. Completá el tipo del predicado.",
      codigo: `${EMAIL}function esEmail(s: string): s is ___ {\n  return s.includes("@");\n}`,
      pruebas: "const texto: string = \"rys@typequest.dev\";\nif (esEmail(texto)) {\n  const e: Email = texto;\n}",
      solucion: "Email",
      pista: "Un type guard dice en qué se convierte el parámetro cuando devuelve true.",
      explicacion: "Si esEmail da true, texto se estrecha a Email adentro del if. Es la misma validación que la constructora, con otra forma.",
    },
    {
      tipo: "arreglar",
      id: "porcentaje",
      enunciado: "La constructora valida bien, pero no compila. Arreglala.",
      codigo: "type Porcentaje = number & { readonly __brand: \"Porcentaje\" };\nfunction porcentaje(n: number): Porcentaje {\n  if (n < 0 || n > 100) throw new RangeError(\"fuera de rango\");\n  return n;\n}",
      pruebas: "const descuento: Porcentaje = porcentaje(15);",
      solucion: "type Porcentaje = number & { readonly __brand: \"Porcentaje\" };\nfunction porcentaje(n: number): Porcentaje {\n  if (n < 0 || n > 100) throw new RangeError(\"fuera de rango\");\n  return n as Porcentaje;\n}",
      explicacion: "Un number no trae la marca. Después de validar, el as es justo donde corresponde.",
    },
    {
      tipo: "arreglar",
      id: "marcas-iguales",
      enunciado: "Las dos marcas tienen la misma forma, así que no separan nada. Arreglalas para que un id no pase por el otro.",
      codigo: "type UsuarioId = number & { readonly __brand: string };\ntype PartidaId = number & { readonly __brand: string };",
      pruebas: "type _1 = Esperar<Igual<PartidaId extends UsuarioId ? true : false, false>>;\ntype _2 = Esperar<Igual<UsuarioId extends PartidaId ? true : false, false>>;",
      solucion: IDS.trim(),
      pista: "Estructural significa que si la forma es igual, el tipo es igual. Hacé que la forma difiera.",
      explicacion: "Con __brand: string las dos marcas son idénticas. Con literales distintos, la forma cambia y dejan de ser intercambiables.",
    },
  ],
};

export default leccion;
