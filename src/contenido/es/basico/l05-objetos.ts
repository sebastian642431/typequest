import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "objetos",
  titulo: "Objetos con forma",
  resumen: "Describir qué propiedades tiene un objeto y de qué tipo es cada una.",
  teoria: [
    { texto: "Un tipo de objeto lista las propiedades y el tipo de cada una. Se puede escribir directo en la anotación." },
    { codigo: "const peli: { titulo: string; anio: number } = { titulo: \"Nueve reinas\", anio: 2000 };" },
    { texto: "Para reusarlo, le ponés nombre con `type` o con `interface`. Para objetos, las dos sirven casi igual." },
    { codigo: "type Punto = { x: number; y: number };\ninterface Usuario {\n  nombre: string;\n  apodo?: string;\n  readonly id: number;\n}" },
    { texto: "`?` marca una propiedad opcional: puede faltar y entonces vale `undefined`. `readonly` impide reasignarla después de crear el objeto." },
    { texto: "Si falta una propiedad obligatoria, es error. Si escribís un objeto literal con una propiedad que el tipo no tiene, también: TypeScript sospecha que te equivocaste. Y leer una propiedad que no existe en el tipo, lo mismo." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "inline-ok",
      codigo: "const perro: { nombre: string; edad: number } = { nombre: \"Toby\", edad: 4 };\nperro.edad + 1;",
      respuesta: "5",
      explicacion: "El objeto tiene las dos propiedades con los tipos correctos.",
    },
    {
      tipo: "predecir",
      id: "falta-propiedad",
      codigo: "type Punto = { x: number; y: number };\nconst p: Punto = { x: 1 };\np.x;",
      respuesta: "type error",
      explicacion: "y es obligatoria y no está.",
    },
    {
      tipo: "predecir",
      id: "propiedad-de-mas",
      codigo: "type Punto = { x: number; y: number };\nconst p: Punto = { x: 1, y: 2, z: 3 };\np.x;",
      respuesta: "type error",
      explicacion: "En un objeto literal escrito directo, una propiedad que el tipo no tiene es error.",
    },
    {
      tipo: "predecir",
      id: "de-mas-por-variable",
      codigo: "type Punto = { x: number; y: number };\nconst datos = { x: 1, y: 2, z: 3 };\nconst p: Punto = datos;\np.y;",
      respuesta: "2",
      explicacion: "El chequeo de propiedades de más solo se hace con literales escritos en el lugar. datos tiene x e y, así que sirve como Punto.",
    },
    {
      tipo: "predecir",
      id: "opcional-ausente",
      codigo: "interface Usuario {\n  nombre: string;\n  apodo?: string;\n}\nconst u: Usuario = { nombre: \"Leo\" };\nu.apodo;",
      respuesta: "undefined",
      explicacion: "apodo es opcional: puede faltar, y si falta vale undefined.",
    },
    {
      tipo: "predecir",
      id: "no-existe",
      codigo: "const auto = { marca: \"Fiat\", anio: 2020 };\nauto.modelo;",
      respuesta: "type error",
      explicacion: "El tipo inferido solo tiene marca y anio. Leer modelo no compila.",
    },
    {
      tipo: "predecir",
      id: "readonly-asignar",
      codigo: "interface Config {\n  readonly puerto: number;\n}\nconst c: Config = { puerto: 80 };\nc.puerto = 8080;\nc.puerto;",
      respuesta: "type error",
      explicacion: "puerto es readonly: se fija al crear el objeto y después no se reasigna.",
    },
    {
      tipo: "completar",
      id: "tipo-propiedad",
      enunciado: "Completá el tipo de `precio`.",
      codigo: "type Producto = { nombre: string; precio: ___ };",
      pruebas: "const p: Producto = { nombre: \"Yerba\", precio: 1500 };\nconst conIva: number = p.precio * 1.21;",
      solucion: "number",
      explicacion: "precio guarda un número y se usa en una cuenta.",
    },
    {
      tipo: "arreglar",
      id: "agregar-propiedad",
      enunciado: "El objeto trae una propiedad que la interfaz no conoce. Arreglá la interfaz, no el objeto.",
      codigo: "interface Mascota {\n  nombre: string;\n}\nconst m: Mascota = { nombre: \"Tom\", edad: 3 };",
      pruebas: "const e: number = m.edad;",
      solucion: "interface Mascota {\n  nombre: string;\n  edad: number;\n}\nconst m: Mascota = { nombre: \"Tom\", edad: 3 };",
      explicacion: "Agregando edad: number a la interfaz, el objeto encaja y m.edad se puede leer.",
    },
  ],
};

export default leccion;
