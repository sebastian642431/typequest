import { useEffect, useMemo, useState } from "react";
import { useMundos } from "./contenido/usar.ts";
import { pendientesRepaso, useProgreso } from "./estado/progreso.ts";
import { useT } from "./i18n/index.ts";
import { precalentar } from "./motor/compilador.ts";
import { Encabezado } from "./componentes/Encabezado.tsx";
import { AvisoLogros, PanelLogros } from "./componentes/Logros.tsx";
import { Mapa } from "./pantallas/Mapa.tsx";
import { Sesion, type Item } from "./pantallas/Sesion.tsx";

type Pantalla = { tipo: "mapa" } | { tipo: "leccion"; mundoId: string; leccionId: string } | { tipo: "repaso"; items: Item[] };

function mezclar<T>(lista: T[]) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const t = useT();
  const mundos = useMundos();
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: "mapa" });
  const [verLogros, setVerLogros] = useState(false);

  const indice = useMemo(() => {
    const mapa = new Map<string, Item>();
    for (const m of mundos) for (const l of m.lecciones) for (const e of l.ejercicios) {
      const clave = `${m.id}/${l.id}/${e.id}`;
      mapa.set(clave, { clave, ejercicio: e });
    }
    return mapa;
  }, [mundos]);

  useEffect(() => {
    const id = setTimeout(() => precalentar(t.tsLocale), 600);
    return () => clearTimeout(id);
  }, [t.tsLocale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pantalla]);

  const volver = () => setPantalla({ tipo: "mapa" });

  let vista;
  if (pantalla.tipo === "leccion") {
    const mundo = mundos.find((m) => m.id === pantalla.mundoId)!;
    const leccion = mundo.lecciones.find((l) => l.id === pantalla.leccionId)!;
    const items = leccion.ejercicios.map((e) => indice.get(`${mundo.id}/${leccion.id}/${e.id}`)!);
    vista = (
      <Sesion
        key={`${mundo.id}/${leccion.id}`}
        titulo={leccion.titulo}
        leccion={leccion}
        mundo={mundo}
        items={items}
        modo="leccion"
        salir={volver}
      />
    );
  } else if (pantalla.tipo === "repaso") {
    vista = <Sesion key="repaso" titulo="Repaso" items={pantalla.items} modo="repaso" salir={volver} />;
  } else {
    vista = (
      <>
        <Encabezado alInicio={volver} abrirLogros={() => setVerLogros(true)} />
        <Mapa
          abrirLeccion={(mundoId, leccionId) => setPantalla({ tipo: "leccion", mundoId, leccionId })}
          abrirRepaso={() => {
            const claves = pendientesRepaso(useProgreso.getState().repaso);
            const items = mezclar(claves.map((c) => indice.get(c)).filter((x): x is Item => !!x)).slice(0, 12);
            if (items.length) setPantalla({ tipo: "repaso", items });
          }}
        />
        {verLogros && <PanelLogros cerrar={() => setVerLogros(false)} />}
      </>
    );
  }

  return (
    <>
      {vista}
      <AvisoLogros />
    </>
  );
}
