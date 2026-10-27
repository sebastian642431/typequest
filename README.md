# Typequest

Juego web para aprender TypeScript 7 jugando, en español. Lecciones cortas, ejercicios que corrige el compilador de verdad y un repaso que te vuelve a tirar lo que erraste hasta que te sale.

Hecho con React 19, Vite, Tailwind v4 y CodeMirror. El compilador corre en un Web Worker, así que todo pasa en tu navegador: no hay servidor ni cuenta, y el progreso se guarda en `localStorage`.

## Cómo funciona

Cada ejercicio se corrige compilando tu respuesta, no comparando texto.

- **En el navegador** corre TypeScript 6.0.3 (el paquete `ts-web` en `package.json`). TypeScript 7 está escrito en Go y es nativo, así que no corre en el navegador; por eso se usa la 6.0.3 configurada con los defaults de TS 7: `strict`, `target` ES2025, `module` ESNext, `moduleResolution` bundler y `types` vacío.
- **Los errores salen en tu idioma** con los mensajes traducidos que trae TypeScript.
- **`pnpm verify`** pasa cada ejercicio por `tsc` 7 real (el paquete `typescript`) y por el corrector del navegador, y exige que los dos coincidan: si uno da error y el otro no, falla. También chequea que la solución compile, que el código original de `fix` no compile, que el hueco vacío de `complete` no pase, y ejecuta el código de `predict` para comparar el valor con la respuesta.

Tipos de ejercicio:

- **Predecir** (`predict`): ¿qué valor da la última línea? Si no compila, la respuesta es `type error`.
- **Completar** (`complete`): escribís lo que va en el hueco y tiene que pasar las pruebas de tipos.
- **Arreglar** (`fix`): el código no compila; lo corregís hasta que pase las pruebas.
- **Elegir** (`choose`): opción múltiple.

## Mundos

1. **Básico:** tipos, inferencia, funciones, objetos, uniones y narrowing.
2. **Intermedio:** genéricos, keyof, utility types, type guards, clases y async.
3. **Avanzado:** tipos condicionales, infer, mapped types, template literals y recursión.
4. **Hacker de tipos:** programación a nivel de tipos: tuplas, aritmética, parsers y APIs tipadas al extremo.
5. **Mundo real:** APIs, validación de datos, errores tipados, reducers, formularios y migrar JS a TS.

Todas las lecciones están abiertas: la próxima se marca como recomendada, pero podés entrar a cualquiera. Algunos ejercicios son **jefes**: desafíos más largos marcados en el enunciado.

Cada lección arranca con **la idea** en una frase y la teoría en tarjetas cortas, con botón para escucharlas. Los ejemplos muestran los errores reales del compilador sobre el código.

## Mecánicas

- **XP:** 10 por acierto (2 si ya lo habías errado en la sesión), 5 en el repaso, +20 al terminar una lección y +15 extra si es perfecta. Meta diaria de 50 XP.
- **Niveles:** salen de la XP acumulada; cada nivel pide un poco más que el anterior.
- **Racha:** días seguidos terminando al menos una lección.
- **Vidas:** 5. Errar te saca una y se recupera una cada 20 minutos. Sin vidas se corta la sesión.
- **Combos:** desde 3 aciertos seguidos sumás XP extra (hasta +5 por ejercicio).
- **Logros:** por la primera lección, lecciones perfectas, combos, racha, aciertos, repaso, meta diaria, nivel, vencer un jefe y terminar cada mundo.
- **Repaso espaciado:** lo que errás entra al repaso. Cada vez que lo acertás ahí, vuelve más tarde (1, 3, 7, 14 y 30 días) hasta que sale. Acertar en el repaso te devuelve una vida.

## Cómo correrlo

Necesitás [pnpm](https://pnpm.io) y Node con soporte nativo de TypeScript (22.18 o más nuevo), porque `scripts/verify.mjs` importa archivos `.ts` directamente.

```sh
pnpm install
pnpm dev         # servidor de desarrollo de Vite
pnpm test        # tests de la lógica (Vitest)
pnpm verify      # pasa todos los ejercicios por tsc 7 y el corrector web
pnpm build       # chequeo de tipos + build de producción en dist/
pnpm check       # todo lo anterior junto, igual que el CI
```

`pnpm verify` acepta un filtro opcional: un id de mundo, de lección o un código de idioma (`pnpm verify hacker`, `pnpm verify en`).

## Estructura

```
src/
  App.tsx             qué pantalla se muestra según la URL
  main.tsx            arranque: espera a que cargue el idioma activo
  locales/            un idioma por carpeta, autocontenida
    es/
      meta.ts         nombre, idioma del compilador y de la voz (se carga siempre)
      messages.ts     textos de la interfaz (se carga solo si es el idioma activo)
      content/<mundo>/ world.ts + una lección por archivo (l01-..., l02-...)
  content/
    types.ts          formato, topes de largo y fallback de idioma
    index.ts          carga diferida del contenido de un idioma
    load-node.ts      lo mismo para Node (verify.mjs)
    useWorlds.ts      mundos del idioma activo
  i18n/
    index.ts          idioma elegido, detección y carga diferida de textos + contenido
    types.ts          LocaleMeta, Messages y LocaleMessages
  exercises/          un archivo por tipo de ejercicio + registry.ts
  screens/            Learn, Session, Theory, Review, Profile, Achievements, Settings
  layout/             Header, NavBar, AccountPanel, AchievementToast
  ui/                 piezas genéricas: Sheet, ConfirmDialog, CodeBlock, Editor, ListenButton, RichText, TextField
  state/              progress, settings y route (query params)
  engine/
    worker.ts         Web Worker con el compilador de TypeScript
    checker.ts        diagnósticos, transpilado y corrección de `predict`
    compiler.ts       cliente del worker y hook de errores
    effects.ts        sonidos, confeti y vibración
  config/             sitio y colores de cada mundo
scripts/
  verify.mjs          verificación del contenido contra tsc 7
.github/workflows/    CI: tipos, tests, verificador y build
```

Reglas de la arquitectura:

- **Las pantallas no se importan entre sí.** Lo compartido va a `ui/`, `state/`, `engine/` o `content/`.
- **La lógica pura no importa React**, para poder testearla (`*.test.ts` al lado del archivo).
- **El editor (CodeMirror) se carga solo cuando hace falta**, y el compilador vive en un worker aparte, así la primera carga es liviana.
- **Los idiomas no se registran en ningún lado.** Cada carpeta de `src/locales/` se descubre sola; del bundle principal solo forman parte los `meta.ts`. Los textos y lecciones del idioma activo (y los de `es` como respaldo) se bajan aparte, en un chunk por idioma.

## Contribuir

Traducciones y ejercicios nuevos son bienvenidos. Mirá [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

- **Código:** [PolyForm Noncommercial License 1.0.0](LICENSE). Podés usarlo, estudiarlo, modificarlo y compartirlo para cualquier fin no comercial.
- **Contenido educativo** (`src/locales/**`): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

Como prohíbe el uso comercial, Typequest **no es "open source"** según la definición de la OSI: es código *source-available* no comercial. El código es público, pero no se puede usar para ganar plata sin permiso.

---

## English

**Typequest** is a web game to learn TypeScript 7, currently in Spanish. Every answer is checked by the real compiler: the browser runs TypeScript 6.0.3 configured with TS 7 defaults (TS 7 is native Go and can't run in a browser), and `pnpm verify` runs every exercise through the real `tsc` 7 and requires both to agree. Five worlds (Basic, Intermediate, Advanced, Type Hacker, Real world), with XP, levels, streaks, lives, combos, achievements and spaced repetition.

Run it with `pnpm install` and `pnpm dev`. Translations are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

The code is under the PolyForm Noncommercial License 1.0.0 and the educational content under CC BY-NC-SA 4.0. Because commercial use is not allowed, this is source-available, not OSI open source.
