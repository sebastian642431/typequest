import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "uniones-literales",
  titulo: "Esto o aquello",
  resumen: "Uniones de tipos y tipos que son un valor exacto.",
  teoria: [
    { texto: "Una unión dice que un valor puede ser de un tipo o de otro. Se escribe con `|`." },
    { codigo: "let id: string | number = 42;\nid = \"abc-42\";" },
    { texto: "Sobre una unión solo podés hacer lo que sirve para todos sus miembros. `id.toUpperCase()` no compila: si id fuera un number, no existiría." },
    { texto: "Un tipo literal es un valor exacto usado como tipo. Unidos, sirven para listar las únicas opciones válidas." },
    { codigo: "type Pedido = \"ORDER\" | \"REPO\";\nlet p: Pedido = \"ORDER\";\np = \"ISSUE\";" },
    { texto: "La última línea no compila: \"ISSUE\" no es una de las opciones. También se pueden unir tipos de objeto, y el objeto tiene que encajar en al menos uno." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "union-ok",
      codigo: "let codigo: string | number = 7;\ncodigo = \"siete\";\ncodigo;",
      respuesta: "\"siete\"",
      explicacion: "codigo acepta strings y numbers, así que se puede pasar de uno a otro.",
    },
    {
      tipo: "predecir",
      id: "union-fuera",
      codigo: "let codigo: string | number = 7;\ncodigo = false;\ncodigo;",
      respuesta: "type error",
      explicacion: "boolean no es parte de la unión.",
    },
    {
      tipo: "predecir",
      id: "literal-fuera",
      codigo: "type Pedido = \"ORDER\" | \"REPO\";\nconst p: Pedido = \"order\";\np;",
      respuesta: "type error",
      explicacion: "Los literales son exactos: \"order\" en minúscula es otro valor.",
    },
    {
      tipo: "predecir",
      id: "const-en-union",
      codigo: "let lado: \"izq\" | \"der\" = \"izq\";\nconst otro = \"der\";\nlado = otro;\nlado;",
      respuesta: "\"der\"",
      explicacion: "otro es const, así que su tipo es \"der\", que está en la unión.",
    },
    {
      tipo: "predecir",
      id: "let-en-union",
      codigo: "let lado: \"izq\" | \"der\" = \"izq\";\nlet otro = \"der\";\nlado = otro;\nlado;",
      respuesta: "type error",
      explicacion: "otro es let y se ensancha a string. Un string cualquiera no garantiza ser \"izq\" o \"der\".",
    },
    {
      tipo: "predecir",
      id: "metodo-de-uno",
      codigo: "function gritar(v: string | number) {\n  return v.toUpperCase();\n}\ngritar(\"hola\");",
      respuesta: "type error",
      explicacion: "toUpperCase existe en string pero no en number. Sobre la unión no se puede usar.",
    },
    {
      tipo: "predecir",
      id: "union-objetos",
      codigo: "type Forma = { tipo: \"circulo\"; radio: number } | { tipo: \"cuadrado\"; lado: number };\nconst f: Forma = { tipo: \"cuadrado\", lado: 4 };\nf.tipo;",
      respuesta: "\"cuadrado\"",
      explicacion: "El objeto encaja con el segundo miembro de la unión. f.tipo vale \"cuadrado\".",
    },
    {
      tipo: "completar",
      id: "tipo-estado",
      enunciado: "Completá el tipo con las dos opciones posibles: \"abierto\" y \"cerrado\".",
      codigo: "type Estado = ___;\nlet puerta: Estado = \"abierto\";",
      pruebas: "puerta = \"cerrado\";\nconst largo: number = puerta.length;",
      solucion: "\"abierto\" | \"cerrado\"",
      explicacion: "Una unión de dos literales: solo esos dos valores entran.",
    },
    {
      tipo: "arreglar",
      id: "agregar-opcion",
      enunciado: "Falta un talle en el tipo. Agregalo sin tocar la variable.",
      codigo: "type Talle = \"S\" | \"M\" | \"L\";\nconst mio: Talle = \"XL\";",
      pruebas: "const otro: Talle = \"S\";\nconst grande: Talle = mio;",
      solucion: "type Talle = \"S\" | \"M\" | \"L\" | \"XL\";\nconst mio: Talle = \"XL\";",
      explicacion: "Sumando \"XL\" a la unión, el valor pasa a ser válido.",
    },
  ],
};

export default leccion;
