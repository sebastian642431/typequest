import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "unions-literals",
  title: "Esto o aquello",
  summary: "Uniones de tipos y tipos que son un valor exacto.",
  idea: "Con `|` un valor puede ser de un tipo o de otro.",
  theory: [
    {
      title: "Unión",
      text: "`A | B` quiere decir: es A o es B.",
      code: "let id: string | number = 42;\nid = \"abc-42\";",
    },
    {
      title: "Solo lo que sirve para todos",
      text: "`id.toUpperCase()` no compila: si `id` fuera un `number`, no existiría.",
    },
    {
      title: "Tipo literal",
      text: "Un valor exacto usado como tipo. Unidos, listan las únicas opciones válidas.",
      code: "type Pedido = \"ORDER\" | \"REPO\";\nlet p: Pedido = \"ORDER\";\np = \"ISSUE\";",
    },
    {
      title: "Fuera de la lista, error",
      text: "`\"ISSUE\"` no está en `Pedido`, así que esa línea no compila.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "union-ok",
      code: "let codigo: string | number = 7;\ncodigo = \"siete\";\ncodigo;",
      answer: "\"siete\"",
      explanation: "`codigo` acepta `string` y `number`. Puede pasar de uno a otro.",
    },
    {
      type: "predict",
      id: "outside-union",
      code: "let codigo: string | number = 7;\ncodigo = false;\ncodigo;",
      answer: "type error",
      explanation: "`boolean` no está en la unión.",
    },
    {
      type: "predict",
      id: "outside-literal",
      code: "type Pedido = \"ORDER\" | \"REPO\";\nconst p: Pedido = \"order\";\np;",
      answer: "type error",
      explanation: "Los literales son exactos. `\"order\"` en minúscula es otro valor.",
    },
    {
      type: "predict",
      id: "const-in-union",
      code: "let lado: \"izq\" | \"der\" = \"izq\";\nconst otro = \"der\";\nlado = otro;\nlado;",
      answer: "\"der\"",
      explanation: "`otro` es `const`, así que su tipo es `\"der\"`. Está en la unión.",
    },
    {
      type: "predict",
      id: "let-in-union",
      code: "let lado: \"izq\" | \"der\" = \"izq\";\nlet otro = \"der\";\nlado = otro;\nlado;",
      answer: "type error",
      explanation: "`otro` es `let`, así que es `string`. Un `string` cualquiera no garantiza ser `\"izq\"` o `\"der\"`.",
    },
    {
      type: "predict",
      id: "single-member-method",
      code: "function gritar(v: string | number) {\n  return v.toUpperCase();\n}\ngritar(\"hola\");",
      answer: "type error",
      explanation: "`toUpperCase` es de `string`, no de `number`. Sobre la unión no se puede usar.",
    },
    {
      type: "predict",
      id: "object-union",
      code: "type Forma = { tipo: \"circulo\"; radio: number } | { tipo: \"cuadrado\"; lado: number };\nconst f: Forma = { tipo: \"cuadrado\", lado: 4 };\nf.tipo;",
      answer: "\"cuadrado\"",
      explanation: "El objeto encaja con el segundo tipo de la unión.",
    },
    {
      type: "complete",
      id: "status-type",
      prompt: "Completá el tipo con las dos opciones: `\"abierto\"` y `\"cerrado\"`.",
      code: "type Estado = ___;\nlet puerta: Estado = \"abierto\";",
      tests: "puerta = \"cerrado\";\nconst largo: number = puerta.length;",
      solution: "\"abierto\" | \"cerrado\"",
      explanation: "Una unión de dos literales: solo esos dos valores entran.",
    },
    {
      type: "fix",
      id: "add-option",
      prompt: "Falta un talle en el tipo. Agregalo sin tocar la variable.",
      code: "type Talle = \"S\" | \"M\" | \"L\";\nconst mio: Talle = \"XL\";",
      tests: "const otro: Talle = \"S\";\nconst grande: Talle = mio;",
      solution: "type Talle = \"S\" | \"M\" | \"L\" | \"XL\";\nconst mio: Talle = \"XL\";",
      explanation: "Con `\"XL\"` en la unión, el valor pasa a ser válido.",
    },
  ],
};

export default lesson;
