import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "classes",
  title: "Clases",
  summary: "Propiedades con tipo, `private`, `readonly`, `#privado`, `implements` y `abstract`.",
  idea: "Una clase de TS es una clase de JS con tipos encima.",
  theory: [
    {
      title: "Propiedades con tipo",
      text: "Cada propiedad lleva su tipo. Con strict, tiene que arrancar con valor: al declararla o en el constructor.",
      code: "class Termo {\n  litros: number;\n  constructor(litros: number) {\n    this.litros = litros;\n  }\n}",
    },
    {
      title: "Quién puede tocar",
      text: "`private`: solo la clase. `protected`: la clase y sus hijas. `readonly`: se asigna una vez.",
    },
    {
      title: "private vs #",
      text: "`private` lo frena solo TypeScript; en runtime está. `#nombre` es privado de verdad, de JavaScript.",
    },
    {
      title: "Atajo en el constructor",
      text: "Un modificador en el parámetro declara y asigna la propiedad de una.",
      code: "class Mate {\n  constructor(private readonly yerba: string, public cebadas = 0) {}\n}",
    },
    {
      title: "implements y abstract",
      text: "`implements` chequea que cumplas una interfaz. `abstract` no se instancia y obliga a las hijas a escribir métodos.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "uninitialized",
      code: "class Contador {\n  cuenta: number;\n}\nnew Contador().cuenta;",
      answer: "type error",
      explanation: "Con strict, `cuenta` tiene que arrancar con valor. Si no, sería `undefined`.",
    },
    {
      type: "predict",
      id: "private-outside",
      code: "class Billetera {\n  private saldo = 100;\n}\nnew Billetera().saldo;",
      answer: "type error",
      explanation: "`saldo` es `private`: desde afuera no se lee con punto.",
    },
    {
      type: "predict",
      id: "private-brackets",
      code: "class Billetera {\n  private saldo = 100;\n}\nnew Billetera()[\"saldo\"];",
      answer: "100",
      explanation: "Con corchetes, TypeScript deja pasar el `private` a propósito. En runtime, `private` no protege nada.",
      hint: "No es lo mismo `.saldo` que `[\"saldo\"]`.",
    },
    {
      type: "predict",
      id: "hash-private",
      code: "class Billetera {\n  private saldo = 100;\n}\nclass Caja {\n  #clave = 1234;\n}\n[Object.keys(new Billetera()).length, Object.keys(new Caja()).length];",
      answer: "[1, 0]",
      explanation: "`saldo` es una propiedad común en runtime y aparece. `#clave` es privada de JS y no se ve.",
    },
    {
      type: "predict",
      id: "readonly",
      code: "class Pedido {\n  readonly id: number;\n  constructor(id: number) {\n    this.id = id;\n  }\n}\nconst p = new Pedido(5);\np.id = 6;\np.id;",
      answer: "type error",
      explanation: "`readonly` se asigna en el constructor y después no se toca más.",
    },
    {
      type: "predict",
      id: "parameter-properties",
      code: "class Mate {\n  constructor(public yerba: string, public cebadas = 0) {}\n  cebar() {\n    this.cebadas++;\n    return this;\n  }\n}\nnew Mate(\"suave\").cebar().cebar().cebadas;",
      answer: "2",
      explanation: "`public` en el parámetro crea `this.cebadas`. `cebar` devuelve `this`, así que se encadena: 2.",
    },
    {
      type: "complete",
      id: "complete-implements",
      prompt: "Completá para que `Lampara` declare que cumple `Encendible`.",
      code: "interface Encendible {\n  prendida: boolean;\n  prender(): void;\n}\nclass Lampara implements ___ {\n  prendida = false;\n  prender() {\n    this.prendida = true;\n  }\n}",
      tests: "const e: Encendible = new Lampara();",
      solution: "Encendible",
      explanation: "`implements` recibe la interfaz. Si faltara `prender`, el error saltaría en la clase.",
    },
    {
      type: "complete",
      id: "complete-abstract",
      prompt: "Completá el retorno de `area` en `Cuadrado`.",
      code: "abstract class Figura {\n  abstract area(): number;\n  describir() {\n    return \"área \" + this.area();\n  }\n}\nclass Cuadrado extends Figura {\n  constructor(private lado: number) {\n    super();\n  }\n  area(): ___ {\n    return this.lado ** 2;\n  }\n}",
      tests: "const d: string = new Cuadrado(3).describir();\nconst a: number = new Cuadrado(2).area();",
      solution: "number",
      explanation: "La hija respeta la firma del método abstracto: `area` devuelve number.",
    },
    {
      type: "fix",
      id: "fix-protected",
      prompt: "`CajaAhorro` no puede leer `saldo`. Cambiá un modificador: que las hijas sí, y afuera no.",
      code: "class Cuenta {\n  private saldo = 0;\n  depositar(monto: number) {\n    this.saldo += monto;\n  }\n}\nclass CajaAhorro extends Cuenta {\n  intereses() {\n    return this.saldo * 0.1;\n  }\n}",
      tests: "const i: number = new CajaAhorro().intereses();",
      solution: "class Cuenta {\n  protected saldo = 0;\n  depositar(monto: number) {\n    this.saldo += monto;\n  }\n}\nclass CajaAhorro extends Cuenta {\n  intereses() {\n    return this.saldo * 0.1;\n  }\n}",
      explanation: "`protected` es como `private`, pero abierto a las clases hijas.",
    },
    {
      type: "choose",
      id: "private-or-hash",
      prompt: "Tenés un token que no se tiene que leer desde afuera, ni en runtime. ¿Qué usás?",
      options: [
        "private token",
        "#token",
        "readonly token",
        "protected token",
      ],
      correct: 1,
      explanation: "`private` lo frena solo el compilador. `#token` es privado de JS: afuera no hay forma de leerlo.",
    },
  ],
};

export default lesson;
