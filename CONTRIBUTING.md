# Cómo aportar

Gracias por sumarte. Lo que más ayuda: traducciones a otros idiomas y ejercicios nuevos.

Antes de arrancar:

- Usá **pnpm**, nunca npm (`pnpm install`, `pnpm dev`, `pnpm verify`).
- Todo PR tiene que pasar `pnpm verify` sin fallos.
- Lo que aportes queda bajo las licencias del proyecto: el código bajo [PolyForm Noncommercial 1.0.0](LICENSE) y el contenido bajo [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

## Un idioma nuevo

Cada idioma es **una sola carpeta** dentro de `src/locales/`, con todo adentro. No hay que tocar ningún archivo compartido ni registrarlo en ningún lado: la carpeta se descubre sola.

```
src/locales/<codigo>/
  meta.ts          nombre del idioma, idioma del compilador y de la voz
  messages.ts      textos de la interfaz
  content/<mundo>/ world.ts + una lección por archivo (l01-..., l02-...)
```

El código va en minúsculas: `en`, `pt-br`, `zh-cn`.

### 1. Copiá la carpeta de `es`

```sh
cp -r src/locales/es src/locales/en
```

Podés borrar de `content/` lo que todavía no tradujiste: todo lo que falte cae al español. Un idioma recién empezado puede tener solo `meta.ts` y `messages.ts`.

### 2. `meta.ts`

```ts
import type { LocaleMeta } from "../../i18n/types.ts";

export default { name: "English", tsLocale: "en", voiceLang: "en-US" } satisfies LocaleMeta;
```

- `name` es lo que aparece en el selector de idioma de Ajustes.
- `tsLocale` es el idioma de los mensajes de error del compilador. Tiene que ser uno de los que trae TypeScript: `cs`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt-br`, `ru`, `tr`, `zh-cn`, `zh-tw`. Si tu idioma no está, poné `"en"` (los errores salen en inglés).
- `voiceLang` es el idioma de la voz del botón Escuchar (un código BCP 47, como `en-US` o `pt-BR`).

`meta.ts` es lo único de cada idioma que entra en el bundle principal, así que tiene que quedar así de chico.

### 3. `messages.ts`

Traducí los valores y dejá las claves como están. En tu copia, cambiá el final para que quede tipado contra el español:

```ts
import type { LocaleMessages } from "../../i18n/types.ts";

export default {
  header: {
    goToMap: "Go to Learn",
  },
  nav: {
    learn: "Learn",
    review: "Review",
  },
} satisfies LocaleMessages;
```

- El español (`src/locales/es/messages.ts`) define la forma de los textos (`Messages`). Si escribís una clave que no existe o un valor con el tipo equivocado, el compilador te avisa.
- Una clave que no traduzcas sale en español, así que podés mandar la interfaz de a partes.
- Los textos y lecciones de un idioma solo se bajan cuando es el idioma activo (más los de `es` como respaldo), aunque el repo tenga cientos.

### 4. Lecciones

Las lecciones traducidas van en `src/locales/<codigo>/content/<mundo>/`, con la misma estructura que `src/locales/es/content/`:

```
src/locales/en/content/basics/world.ts
src/locales/en/content/basics/l01-primitives.ts
```

- Usá los **mismos ids** que en `es`: el `id` del mundo, de la lección y de cada ejercicio. Los nombres de carpeta y archivo también conviene copiarlos igual.
- Cada carpeta de mundo necesita su `world.ts`: sin él las lecciones de esa carpeta no se cargan.
- Lo que falte cae al español (`worldsFor` en `src/content/types.ts`): un mundo sin traducir usa los textos de `es`, y una lección sin traducir aparece en español. El orden y la cantidad de mundos y lecciones siempre salen de `es`.
- Una lección traducida va **completa**: con los mismos ejercicios que en `es`, ni uno más ni uno menos.
- Traducí textos (`title`, `summary`, `idea`, `theory`, `prompt`, `hint`, `explanation`, `options`). Los nombres dentro del código podés adaptarlos, pero el ejercicio tiene que seguir dando lo mismo.

`pnpm verify` revisa que cada mundo, lección y ejercicio traducido exista en `es` con el mismo id, que no falte ninguno, y que cada ejercicio compile igual con `tsc` 7 y con el corrector del navegador. Para verificar solo tu idioma: `pnpm verify <codigo>`.

### Cómo se elige el idioma

- Según el idioma del navegador (`navigator.languages`): primero el código completo (`pt-br`) y después el corto (`pt`). Si no hay, queda en español.
- El progreso y el repaso se guardan por `mundo/lección/ejercicio`, sin el idioma, así que cambiar de idioma no pierde nada.
- Para probarlo en `pnpm dev`, elegilo en Ajustes. La elección queda guardada en `localStorage` bajo `typequest-locale`.

## Ejercicios nuevos

El formato está en `src/content/types.ts`. Una lección es un archivo `lNN-nombre.ts` dentro de la carpeta del mundo, con `id`, `title`, `summary`, `idea` (la lección en una frase), `theory` (de 2 a 5 tarjetas `{ title, text, code? }`) y `exercises`. Los archivos se ordenan por nombre, así que el número del prefijo define el orden.

**Textos cortos.** `LIMITS` en `types.ts` fija el largo máximo de cada texto y `pnpm verify` falla si alguno se pasa. Una idea por tarjeta, frases cortas.

Hay cuatro tipos de ejercicio (`type`):

- **`predict`:** `code` y `answer`. La respuesta es el valor de la última línea escrito como literal de JavaScript (`15`, `"hola"`, `[1, 2]`), o `type error` si no compila. `pnpm verify` ejecuta el código y compara el valor.
- **`complete`:** `code` con un `___` donde va la respuesta, `tests` y `solution`. La solución tiene que pasar las pruebas y el hueco con `unknown` no.
- **`fix`:** `code` que no compila, `tests` y `solution` (el código entero corregido). El original tiene que fallar y la solución pasar.
- **`choose`:** `prompt`, `options` y `correct` (índice desde 0). Si tiene `code`, tiene que compilar.

Reglas:

- **Contenido propio.** Nada copiado de cursos, libros ni otros sitios.
- **Sin comentarios en el código** de los ejercicios ni de la teoría.
- **Las `tests` usan `Equal` y `Expect`**, que se agregan solas antes de las pruebas:

  ```ts
  type R = Expect<Equal<MiTipo<"a">, "A">>;
  ```

  También valen asignaciones que tienen que compilar, como `const largo: number = nombre.length;`.
- **Jefes:** un desafío jefe empieza el `prompt` con `Jefe:`. La interfaz le saca ese prefijo, le pone la etiqueta de jefe y da el logro al vencerlo.
- Cada `id` de ejercicio es único dentro de su lección y no se cambia una vez publicado: el progreso y el repaso se guardan por id.
- Corré `pnpm verify` (o `pnpm verify <id de lección>`) antes de mandar el PR.

## Un tipo de ejercicio nuevo

1. Sumá el tipo a la unión `Exercise` en `src/content/types.ts`.
2. Creá `src/exercises/<tipo>.tsx` con `define({ initial, ready, check, solution, Body })`. Mirá `choose.tsx`, que es el más simple.
3. Registralo en `src/exercises/registry.ts`. Si te lo olvidás, TypeScript no compila.
4. Sumá cómo verificarlo en `scripts/verify.mjs` y su etiqueta en `src/locales/es/messages.ts` (`exercise.<tipo>`).

Antes del PR corré `pnpm check`: tipos, tests, verificador y build, igual que el CI.

---

## English summary

- Use **pnpm**, never npm. Every PR must pass `pnpm verify`.
- **New language:** each locale is one self-contained folder, `src/locales/<code>/`, discovered automatically; there is no shared registry to edit. Copy `src/locales/es/` to `src/locales/<code>/` and translate:
  - `meta.ts`: `export default { name, tsLocale, voiceLang } satisfies LocaleMeta`. `tsLocale` must be one of TypeScript's locales (`cs`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pl`, `pt-br`, `ru`, `tr`, `zh-cn`, `zh-tw`) or `"en"`. Only `meta.ts` files are in the main bundle.
  - `messages.ts`: same keys as `es`, translated values, ending in `satisfies LocaleMessages`. Missing keys fall back to Spanish.
  - `content/<world>/`: `world.ts` plus lesson files, keeping the **same world, lesson and exercise ids** as `es`. Missing worlds or lessons fall back to Spanish; a translated lesson must include all of its exercises.
  - Messages and content load lazily, only for the active locale (plus `es` as fallback). `pnpm verify` checks that ids match and that every exercise compiles the same with real `tsc` 7.
- **New exercises:** follow `src/content/types.ts` (`predict`, `complete`, `fix`, `choose`). Original content only, no code comments, tests written with `Equal`/`Expect`, boss challenges start their `prompt` with `Jefe:`. Run `pnpm verify`.
- Contributions are licensed under the project's licenses: PolyForm Noncommercial 1.0.0 for code, CC BY-NC-SA 4.0 for content.
