import { armarContenido, type Leccion, type MundoMeta } from "./tipos.ts";

const metas = import.meta.glob<{ default: MundoMeta }>("./*/*/mundo.ts", { eager: true });
const lecciones = import.meta.glob<{ default: Leccion }>("./*/*/l[0-9]*.ts", { eager: true });

export const contenido = armarContenido(metas, lecciones);
