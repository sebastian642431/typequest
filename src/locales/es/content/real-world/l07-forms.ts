import type { Lesson } from "../../../../content/types.ts";

const FORM = `type Form<T> = {
  valores: T;
  errores: Partial<Record<keyof T, string>>;
  tocados: Partial<Record<keyof T, boolean>>;
};
`;

const SIGNUP = `type Alta = { email: string; edad: number; acepta: boolean };
`;

const SET = `function setCampo<T, K extends keyof T>(f: Form<T>, campo: K, valor: T[K]): Form<T> {
  return {
    ...f,
    valores: { ...f.valores, [campo]: valor },
    tocados: { ...f.tocados, [campo]: true },
  };
}
`;

const lesson: Lesson = {
  id: "forms",
  title: "Formularios tipados",
  summary: "Estado de formulario genérico, errores por campo y un `setCampo` que no se deja engañar.",
  idea: "Un formulario genérico: con `T[K]`, cada campo solo acepta su propio tipo.",
  theory: [
    { title: "Todo formulario es igual", text: "Valores, errores y campos tocados. Si lo hacés genérico sobre `T`, sirve para cualquier formulario.", code: "type Form<T> = {\n  valores: T;\n  errores: Partial<Record<keyof T, string>>;\n  tocados: Partial<Record<keyof T, boolean>>;\n};\ntype Alta = { email: string; edad: number; acepta: boolean };" },
    { title: "Errores por campo", text: "`Partial<Record<keyof T, string>>`: a lo sumo un error por campo. Un error en un campo que no existe no compila." },
    { title: "El valor sale del campo", text: "Con `K extends keyof T`, el valor es `T[K]`. Elegís `\"edad\"` y el valor tiene que ser número.", code: "function setCampo<T, K extends keyof T>(f: Form<T>, campo: K, valor: T[K]): Form<T> {\n  return {\n    ...f,\n    valores: { ...f.valores, [campo]: valor },\n    tocados: { ...f.tocados, [campo]: true },\n  };\n}" },
    { title: "Tocado no es sucio", text: "Tocado: la persona pasó por el campo. Sucio: el valor cambió. Podés entrar y salir sin cambiar nada." },
  ],
  exercises: [
    {
      type: "predict",
      id: "set-ok",
      code: `${FORM}${SIGNUP}${SET}const f0: Form<Alta> = { valores: { email: "", edad: 0, acepta: false }, errores: {}, tocados: {} };
const f1 = setCampo(f0, "edad", 31);
f1.valores.edad + (f1.tocados.edad ? 1 : 0);`,
      answer: "32",
      explanation: "`setCampo` guarda el 31 y marca el campo como tocado. Después se le suma 1.",
    },
    {
      type: "predict",
      id: "set-wrong",
      code: `${FORM}${SIGNUP}${SET}const f0: Form<Alta> = { valores: { email: "", edad: 0, acepta: false }, errores: {}, tocados: {} };
setCampo(f0, "edad", "31").valores.edad;`,
      answer: "type error",
      explanation: "`K` es \"edad\", así que el valor tiene que ser `number`. Un string de un input no pasa sin convertirlo.",
    },
    {
      type: "predict",
      id: "missing-field-error",
      code: `${FORM}${SIGNUP}const errores: Form<Alta>["errores"] = { email: "Falta el arroba", telefono: "Muy corto" };
errores.email;`,
      answer: "type error",
      explanation: "Las claves de los errores salen de `keyof Alta`. `telefono` no es un campo del formulario.",
    },
    {
      type: "predict",
      id: "count-errors",
      code: `${FORM}${SIGNUP}const errores: Form<Alta>["errores"] = { email: "Falta el arroba" };
const campos: (keyof Alta)[] = ["email", "edad", "acepta"];
campos.filter((c) => errores[c] !== undefined).length;`,
      answer: "1",
      explanation: "`Partial` deja afuera a `edad` y `acepta`. Solo `email` tiene error.",
    },
    {
      type: "complete",
      id: "complete-errors",
      prompt: "Completá el tipo de los errores: a lo sumo un mensaje por campo de `T`, y puede estar vacío.",
      code: `type Errores<T> = ___;
type Alta = { email: string; edad: number };`,
      tests: `const sinNada: Errores<Alta> = {};
const unError: Errores<Alta> = { edad: "Tenés que ser mayor" };
type _1 = Expect<Equal<Errores<Alta>["email"], string | undefined>>;`,
      solution: "Partial<Record<keyof T, string>>",
      explanation: "`Record` da una clave string por campo y `Partial` las vuelve opcionales. Leer una da `string | undefined`.",
    },
    {
      type: "complete",
      id: "complete-value",
      prompt: "Completá el tipo del valor para que dependa del campo elegido.",
      code: `type Perfil = { alias: string; nivel: number; publico: boolean };
function cambiar<K extends keyof Perfil>(p: Perfil, campo: K, valor: ___): Perfil {
  return { ...p, [campo]: valor };
}`,
      tests: `const p: Perfil = { alias: "rys", nivel: 3, publico: true };
cambiar(p, "nivel", 4);
cambiar(p, "publico", false);
type _1 = Expect<Equal<Parameters<typeof cambiar<"alias">>[2], string>>;`,
      solution: "Perfil[K]",
      explanation: "`Perfil[K]` es un acceso indexado: con \"nivel\" da `number`, con \"alias\" da `string`.",
    },
    {
      type: "fix",
      id: "fix-value-union",
      prompt: "Este `setCampo` deja poner `true` en `email`. Hacé que el valor dependa del campo.",
      code: `type Alta = { email: string; edad: number; acepta: boolean };
function setCampo(v: Alta, campo: keyof Alta, valor: Alta[keyof Alta]): Alta {
  return { ...v, [campo]: valor };
}
const v: Alta = { email: "", edad: 0, acepta: false };`,
      tests: `setCampo(v, "email", "rys@mail.com");
type _1 = Expect<Equal<Parameters<typeof setCampo<"email">>[2], string>>;`,
      solution: `type Alta = { email: string; edad: number; acepta: boolean };
function setCampo<K extends keyof Alta>(v: Alta, campo: K, valor: Alta[K]): Alta {
  return { ...v, [campo]: valor };
}
const v: Alta = { email: "", edad: 0, acepta: false };`,
      hint: "`keyof Alta` es la unión de todas las claves. Necesitás un genérico que recuerde cuál pasaste.",
      explanation: "Con `keyof Alta` suelto, el valor siempre es `string | number | boolean`. Un `K` genérico ata campo y valor.",
    },
    {
      type: "fix",
      id: "fix-dirty",
      prompt: "`camposSucios` devuelve los campos cambiados, pero `Object.keys` da `string[]` y no compila. Arreglalo.",
      code: `type Alta = { email: string; edad: number; acepta: boolean };
function camposSucios(inicial: Alta, actual: Alta): (keyof Alta)[] {
  return Object.keys(actual).filter((c) => inicial[c] !== actual[c]);
}`,
      tests: `const sucios: (keyof Alta)[] = camposSucios({ email: "", edad: 0, acepta: false }, { email: "a@b.c", edad: 0, acepta: true });`,
      solution: `type Alta = { email: string; edad: number; acepta: boolean };
function camposSucios(inicial: Alta, actual: Alta): (keyof Alta)[] {
  const campos: (keyof Alta)[] = ["email", "edad", "acepta"];
  return campos.filter((c) => inicial[c] !== actual[c]);
}`,
      hint: "`Object.keys` da `string[]` a propósito: puede haber claves de más. Recorré una lista tipada.",
      explanation: "Una lista tipada de `keyof Alta` da el tipo justo para indexar. Castear `Object.keys` compila, pero puede mentir.",
    },
    {
      type: "choose",
      id: "choose-touched-dirty",
      prompt: "La persona entra a `edad`, no escribe nada y sale. ¿Cómo queda `edad`?",
      options: [
        "Tocado y no sucio",
        "Sucio y no tocado",
        "Tocado y sucio",
        "Ni tocado ni sucio",
      ],
      correct: 0,
      explanation: "Tocado: pasó por el campo. Sucio: el valor cambió, y no cambió. Queda tocado y no sucio.",
    },
    {
      type: "complete",
      id: "boss-validators",
      prompt: "Jefe: armá `Validadores<T>`: por campo, una función opcional que recibe el valor de ESE campo y da mensaje o null.",
      code: `type Validadores<T> = ___;
type Alta = { email: string; edad: number; acepta: boolean };
function validar<T>(valores: T, reglas: Validadores<T>): Partial<Record<keyof T, string>> {
  const errores: Partial<Record<keyof T, string>> = {};
  for (const campo in reglas) {
    const regla = reglas[campo];
    const msj = regla ? regla(valores[campo]) : null;
    if (msj !== null) errores[campo] = msj;
  }
  return errores;
}`,
      tests: `const errores = validar<Alta>(
  { email: "rys", edad: 15, acepta: true },
  {
    email: (e) => (e.includes("@") ? null : "Falta el arroba"),
    edad: (n) => (n >= 18 ? null : "Tenés que ser mayor"),
  },
);
type _1 = Expect<Equal<Parameters<NonNullable<Validadores<Alta>["edad"]>>[0], number>>;`,
      solution: "{ [K in keyof T]?: (valor: T[K]) => string | null }",
      hint: "Un mapped type sobre `keyof T`, con `?` para que sea opcional y `T[K]` en el parámetro.",
      explanation: "El mapped type da a cada campo su firma: `email` recibe string y `edad` number. Por eso todo tipa sin anotar.",
    },
  ],
};

export default lesson;
