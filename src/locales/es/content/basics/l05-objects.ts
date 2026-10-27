import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "objects",
  title: "Objetos con forma",
  summary: "Qué propiedades tiene un objeto y de qué tipo es cada una.",
  idea: "Un tipo de objeto lista sus propiedades y el tipo de cada una.",
  theory: [
    {
      title: "La forma del objeto",
      text: "Listás cada propiedad con su tipo. Se puede escribir directo en la anotación.",
      code: "const peli: { titulo: string; anio: number } = {\n  titulo: \"Nueve reinas\",\n  anio: 2000,\n};",
    },
    {
      title: "Ponerle nombre",
      text: "Para reusarlo, usás `type` o `interface`. Para objetos, dan casi lo mismo.",
      code: "type Punto = { x: number; y: number };\ninterface Usuario {\n  nombre: string;\n  apodo?: string;\n  readonly id: number;\n}",
    },
    {
      title: "? y readonly",
      text: "Con `?` la propiedad puede faltar, y entonces vale `undefined`. Con `readonly` no se reasigna.",
    },
    {
      title: "Ni de menos ni de más",
      text: "Falta una obligatoria: error. Sobra una en un objeto escrito ahí mismo: error. Leer una que no existe: error.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "inline-ok",
      code: "const perro: { nombre: string; edad: number } = { nombre: \"Toby\", edad: 4 };\nperro.edad + 1;",
      answer: "5",
      explanation: "Están las dos propiedades con sus tipos correctos.",
    },
    {
      type: "predict",
      id: "missing-property",
      code: "type Punto = { x: number; y: number };\nconst p: Punto = { x: 1 };\np.x;",
      answer: "type error",
      explanation: "`y` es obligatoria y no está.",
    },
    {
      type: "predict",
      id: "extra-property",
      code: "type Punto = { x: number; y: number };\nconst p: Punto = { x: 1, y: 2, z: 3 };\np.x;",
      answer: "type error",
      explanation: "`z` no está en `Punto`. En un objeto escrito ahí mismo, sobrar es error.",
    },
    {
      type: "predict",
      id: "extra-via-variable",
      code: "type Punto = { x: number; y: number };\nconst datos = { x: 1, y: 2, z: 3 };\nconst p: Punto = datos;\np.y;",
      answer: "2",
      explanation: "Lo que sobra solo se chequea en objetos escritos ahí mismo. `datos` tiene `x` e `y`: alcanza.",
    },
    {
      type: "predict",
      id: "missing-optional",
      code: "interface Usuario {\n  nombre: string;\n  apodo?: string;\n}\nconst u: Usuario = { nombre: \"Leo\" };\nu.apodo;",
      answer: "undefined",
      explanation: "`apodo` es opcional. Si falta, vale `undefined`.",
    },
    {
      type: "predict",
      id: "does-not-exist",
      code: "const auto = { marca: \"Fiat\", anio: 2020 };\nauto.modelo;",
      answer: "type error",
      explanation: "El tipo inferido solo tiene `marca` y `anio`. `modelo` no existe.",
    },
    {
      type: "predict",
      id: "readonly-assign",
      code: "interface Config {\n  readonly puerto: number;\n}\nconst c: Config = { puerto: 80 };\nc.puerto = 8080;\nc.puerto;",
      answer: "type error",
      explanation: "`puerto` es `readonly`: se fija al crear el objeto y ya no cambia.",
    },
    {
      type: "complete",
      id: "property-type",
      prompt: "Completá el tipo de `precio`.",
      code: "type Producto = { nombre: string; precio: ___ };",
      tests: "const p: Producto = { nombre: \"Yerba\", precio: 1500 };\nconst conIva: number = p.precio * 1.21;",
      solution: "number",
      explanation: "`precio` guarda un número y se usa en una cuenta.",
    },
    {
      type: "fix",
      id: "add-property",
      prompt: "El objeto trae una propiedad que la interfaz no conoce. Arreglá la interfaz, no el objeto.",
      code: "interface Mascota {\n  nombre: string;\n}\nconst m: Mascota = { nombre: \"Tom\", edad: 3 };",
      tests: "const e: number = m.edad;",
      solution: "interface Mascota {\n  nombre: string;\n  edad: number;\n}\nconst m: Mascota = { nombre: \"Tom\", edad: 3 };",
      explanation: "Con `edad: number` en la interfaz, el objeto encaja y `m.edad` se puede leer.",
    },
  ],
};

export default lesson;
