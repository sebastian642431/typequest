# Cómo aportar

Gracias por sumarte. Lo que más ayuda: traducciones a otros idiomas y ejercicios nuevos.

Antes de arrancar:

- Usá **pnpm**, nunca npm (`pnpm install`, `pnpm dev`, `pnpm verificar`).
- Todo PR tiene que pasar `pnpm verificar` sin fallos.
- Lo que aportes queda bajo las licencias del proyecto: el código bajo [PolyForm Noncommercial 1.0.0](LICENSE) y el contenido bajo [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

## Un idioma nuevo

Un idioma tiene dos partes: los textos de la interfaz y las lecciones. Podés mandar primero la interfaz y las lecciones de a poco.

### 1. Textos de la interfaz

Copiá `src/i18n/es.ts` a `src/i18n/<codigo>.ts` (por ejemplo `en.ts` o `pt-br.ts`, en minúsculas) y tipalo como `Textos`:

```ts
import type { Textos } from "./es.ts";

const en: Textos = {
  nombre: "English",
  tsLocale: "en",
  encabezado: {
    irAlMapa: "Go to map",
  },
};

export default en;
```

(El ejemplo está recortado: tu archivo lleva todos los campos de `es.ts`, traducidos. Al estar tipado como `Textos`, el compilador te avisa si falta alguno.)

- El progreso y el repaso se guardan por `mundo/lección/ejercicio`, sin el idioma, así que cambiar de idioma no pierde nada.

- No hace falta registrarlo en ningún lado: `src/i18n/index.ts` levanta solo todos los archivos de la carpeta con `import.meta.glob`.
- El idioma se elige según el idioma del navegador (`navigator.languages`), primero el código completo (`pt-br`) y después el corto (`pt`). Si no hay, queda en español.
- `tsLocale` es el idioma de los mensajes de error del compilador. Tiene que ser uno de los que trae TypeScript: `cs`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt-br`, `ru`, `tr`, `zh-cn`, `zh-tw`. Si tu idioma no está, poné `"en"` (los errores salen en inglés).
- Para probarlo en `pnpm dev` sin cambiar el idioma del navegador: la elección queda guardada en `localStorage` bajo `typequest-idioma`; cambiá ahí el valor de `idioma` y recargá.

### 2. Lecciones

Las lecciones traducidas van en `src/contenido/<codigo>/<mundo>/`, con la misma estructura que `src/contenido/es/`:

```
src/contenido/en/basico/mundo.ts
src/contenido/en/basico/l01-primitivos.ts
```

- Usá los **mismos ids** que en `es`: el `id` del mundo, de la lección y de cada ejercicio. Los nombres de carpeta y archivo también conviene copiarlos igual.
- Cada carpeta de mundo necesita su `mundo.ts`: sin él las lecciones de esa carpeta no se cargan.
- Lo que falte cae al español (`mundosPara` en `src/contenido/tipos.ts`): un mundo sin traducir usa los textos de `es`, y una lección sin traducir aparece en español. El orden y la cantidad de mundos y lecciones siempre salen de `es`.
- Una lección traducida va **completa**: con los mismos ejercicios que en `es`, ni uno más ni uno menos.
- Traducí textos (`titulo`, `resumen`, `teoria`, `enunciado`, `pista`, `explicacion`, `opciones`). Los nombres dentro del código podés adaptarlos, pero el ejercicio tiene que seguir dando lo mismo.

`pnpm verificar` revisa que cada lección y ejercicio traducido exista en `es` con el mismo id, que no falte ninguno, y que cada ejercicio compile igual con `tsc` 7 y con el corrector del navegador. Para verificar solo tu idioma: `pnpm verificar <codigo>`.

## Ejercicios nuevos

El formato está en `src/contenido/tipos.ts`. Una lección es un archivo `lNN-nombre.ts` dentro de la carpeta del mundo, con `id`, `titulo`, `resumen`, `teoria` (bloques `{ texto }` o `{ codigo }`) y `ejercicios`. Los archivos se ordenan por nombre, así que el número del prefijo define el orden.

Hay cuatro tipos de ejercicio:

- **`predecir`:** `codigo` y `respuesta`. La respuesta es el valor de la última línea escrito como literal de JavaScript (`15`, `"hola"`, `[1, 2]`), o `type error` si no compila. `pnpm verificar` ejecuta el código y compara el valor.
- **`completar`:** `codigo` con un `___` donde va la respuesta, `pruebas` y `solucion`. La solución tiene que pasar las pruebas y el hueco con `unknown` no.
- **`arreglar`:** `codigo` que no compila, `pruebas` y `solucion` (el código entero corregido). El original tiene que fallar y la solución pasar.
- **`elegir`:** `enunciado`, `opciones` y `correcta` (índice desde 0). Si tiene `codigo`, tiene que compilar.

Reglas:

- **Contenido propio.** Nada copiado de cursos, libros ni otros sitios.
- **Sin comentarios en el código** de los ejercicios ni de la teoría.
- **Las `pruebas` usan `Igual` y `Esperar`**, que se agregan solas antes de las pruebas:

  ```ts
  type R = Esperar<Igual<MiTipo<"a">, "A">>;
  ```

  También valen asignaciones que tienen que compilar, como `const largo: number = nombre.length;`.
- **Jefes:** un desafío jefe empieza el `enunciado` con `Jefe:`. La interfaz le saca ese prefijo, le pone la etiqueta de jefe y da el logro al vencerlo.
- Cada `id` de ejercicio es único dentro de su lección y no se cambia una vez publicado: el progreso y el repaso se guardan por id.
- Corré `pnpm verificar` (o `pnpm verificar <id de lección>`) antes de mandar el PR.

---

## English summary

- Use **pnpm**, never npm. Every PR must pass `pnpm verificar`.
- **New language:** copy `src/i18n/es.ts` to `src/i18n/<code>.ts`, typed as `Textos` (it is picked up automatically via `import.meta.glob`). Set `tsLocale` to one of TypeScript's locales (`cs`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt-br`, `ru`, `tr`, `zh-cn`, `zh-tw`) or `"en"`. Translate lessons in `src/contenido/<code>/<world>/`, including each world's `mundo.ts`, keeping the **same world, lesson and exercise ids** as `es`. Missing worlds or lessons fall back to Spanish; a translated lesson must include all of its exercises. `pnpm verificar` checks that ids match and that every exercise compiles the same with real `tsc` 7.
- **New exercises:** follow `src/contenido/tipos.ts` (`predecir`, `completar`, `arreglar`, `elegir`). Original content only, no code comments, tests written with `Igual`/`Esperar`, boss challenges start with `Jefe:`. Run `pnpm verificar`.
- Contributions are licensed under the project's licenses: PolyForm Noncommercial 1.0.0 for code, CC BY-NC-SA 4.0 for content.
