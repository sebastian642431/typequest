import type { Leccion } from "../../tipos.ts";

const BILLETERA = `class Billetera {
  private saldo = 100;
}
`;

const leccion: Leccion = {
  id: "clases",
  titulo: "Clases",
  resumen: "Propiedades tipadas, modificadores de acceso, readonly, #privado, implements y abstract.",
  teoria: [
    { texto: "Una clase de TS es una clase de JS con tipos encima. Cada propiedad se declara con su tipo y, con strict, tiene que quedar inicializada: en la declaración o en el constructor." },
    { codigo: "class Termo {\n  litros: number;\n  constructor(litros: number) {\n    this.litros = litros;\n  }\n}" },
    { texto: "Modificadores: `public` (el de siempre), `private` (solo adentro de la clase), `protected` (adentro y en las subclases) y `readonly` (se asigna una vez y listo). Ojo: `private` es un candado de TypeScript; en runtime la propiedad está ahí. Si querés privado de verdad, `#nombre` es privado de JavaScript." },
    { texto: "Las parameter properties te ahorran el trámite: un modificador en un parámetro del constructor declara la propiedad y la asigna, todo en uno." },
    { codigo: "class Mate {\n  constructor(private readonly yerba: string, public cebadas = 0) {}\n}" },
    { texto: "`implements` chequea que la clase cumpla una interfaz, sin agregarle nada. `abstract` marca una clase que no se puede instanciar y métodos que cada subclase está obligada a escribir." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "sin-inicializar",
      codigo: `class Contador {
  cuenta: number;
}
new Contador().cuenta;`,
      respuesta: "type error",
      explicacion: "Con strict, una propiedad declarada como number tiene que arrancar con un valor. Acá quedaría undefined.",
    },
    {
      tipo: "predecir",
      id: "private-afuera",
      codigo: `${BILLETERA}new Billetera().saldo;`,
      respuesta: "type error",
      explicacion: "saldo es private: desde afuera de la clase no se puede leer con punto.",
    },
    {
      tipo: "predecir",
      id: "private-corchetes",
      codigo: `${BILLETERA}new Billetera()["saldo"];`,
      respuesta: "100",
      explicacion: "Con corchetes y un string literal, TypeScript deja pasar el acceso a un miembro private. Es una puerta trasera a propósito: private no protege nada en runtime.",
      pista: "No es lo mismo .saldo que [\"saldo\"].",
    },
    {
      tipo: "predecir",
      id: "numeral",
      codigo: `${BILLETERA}class Caja {
  #clave = 1234;
}
[Object.keys(new Billetera()).length, Object.keys(new Caja()).length];`,
      respuesta: "[1, 0]",
      explicacion: "saldo es una propiedad común en runtime, así que aparece en Object.keys. #clave es privada de JS y no se ve desde afuera.",
    },
    {
      tipo: "predecir",
      id: "readonly",
      codigo: `class Pedido {
  readonly id: number;
  constructor(id: number) {
    this.id = id;
  }
}
const p = new Pedido(5);
p.id = 6;
p.id;`,
      respuesta: "type error",
      explicacion: "readonly se puede asignar en el constructor, pero después no se toca más.",
    },
    {
      tipo: "predecir",
      id: "parameter-properties",
      codigo: `class Mate {
  constructor(public yerba: string, public cebadas = 0) {}
  cebar() {
    this.cebadas++;
    return this;
  }
}
new Mate("suave").cebar().cebar().cebadas;`,
      respuesta: "2",
      explicacion: "public en el parámetro crea y asigna this.cebadas. cebar devuelve this, así que se puede encadenar.",
    },
    {
      tipo: "completar",
      id: "completar-implements",
      enunciado: "Completá para que Lampara declare que cumple con Encendible.",
      codigo: `interface Encendible {
  prendida: boolean;
  prender(): void;
}
class Lampara implements ___ {
  prendida = false;
  prender() {
    this.prendida = true;
  }
}`,
      pruebas: "const e: Encendible = new Lampara();",
      solucion: "Encendible",
      explicacion: "implements recibe la interfaz a cumplir. Si a Lampara le faltara prender, el error aparecería en la clase.",
    },
    {
      tipo: "completar",
      id: "completar-abstract",
      enunciado: "Completá el tipo de retorno de area en Cuadrado.",
      codigo: `abstract class Figura {
  abstract area(): number;
  describir() {
    return "área " + this.area();
  }
}
class Cuadrado extends Figura {
  constructor(private lado: number) {
    super();
  }
  area(): ___ {
    return this.lado ** 2;
  }
}`,
      pruebas: `const d: string = new Cuadrado(3).describir();
const a: number = new Cuadrado(2).area();`,
      solucion: "number",
      explicacion: "La subclase tiene que respetar la firma del método abstracto: area devuelve number.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-protected",
      enunciado: "CajaAhorro no puede leer saldo. Cambiá un modificador para que las subclases sí puedan, pero desde afuera siga oculto.",
      codigo: `class Cuenta {
  private saldo = 0;
  depositar(monto: number) {
    this.saldo += monto;
  }
}
class CajaAhorro extends Cuenta {
  intereses() {
    return this.saldo * 0.1;
  }
}`,
      pruebas: "const i: number = new CajaAhorro().intereses();",
      solucion: `class Cuenta {
  protected saldo = 0;
  depositar(monto: number) {
    this.saldo += monto;
  }
}
class CajaAhorro extends Cuenta {
  intereses() {
    return this.saldo * 0.1;
  }
}`,
      explicacion: "protected es como private pero abierto a las subclases.",
    },
    {
      tipo: "elegir",
      id: "private-o-numeral",
      enunciado: "Tenés un token que no debería poder leerse desde afuera ni siquiera en runtime. ¿Qué usás?",
      opciones: ["private token", "#token", "readonly token", "protected token"],
      correcta: 1,
      explicacion: "private solo lo frena el compilador. #token es privado de JavaScript: fuera de la clase no hay forma de leerlo.",
    },
  ],
};

export default leccion;
