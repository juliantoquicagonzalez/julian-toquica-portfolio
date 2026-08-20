# Auditoría del proyecto — reporte

> Auditoría adaptada al stack real del proyecto (HTML/CSS/JS estático, sin build, sin framework, sin Vercel) a partir del proceso de `AUDITORIA-PROYECTO-SKILLS.md`, que estaba escrito para un proyecto React/Next.js y no aplicaba directamente aquí.

## Resumen ejecutivo

- **8 hallazgos** encontrados en la pasada de auditoría.
- **8 aplicados** (todos los quick wins, aprobados por el usuario).
- **0 pendientes de aprobación visual** de esta pasada (hay 2 ítems de una conversación previa que siguen pendientes de decisión — ver "Próximos pasos").
- **2 descartados** (bajo impacto, no vale la pena tocar ahora).
- Regla seguida en todo momento: **cero cambios visuales** — todo lo aplicado es invisible al ojo o mejora accesibilidad técnica sin tocar apariencia.

## Tabla de hallazgos

| # | Categoría | Archivo | Hallazgo | Impacto | Esfuerzo | Riesgo visual | Estado |
|---|---|---|---|---|---|---|---|
| 1 | Rendimiento | `main.js`, 6 páginas de proyecto | Videos `autoplay` descargaban el archivo completo apenas cargaba la página, sin importar si estaban fuera de vista (hasta ~9.6MB simultáneos en Can Anybody Hear Me) | Alto | Medio | No | **Aplicado** — lazy-load vía `IntersectionObserver` (`initLazyVideos`), `rootMargin: 600px`. El video se ve reproduciendo igual, solo cambia cuándo empieza a descargar |
| 2 | Código muerto | `styles.css` | `.specs`, `.specs-item`, `.specs-role` — componente viejo de créditos, reemplazado por `.sidebar-block` | Bajo | Bajo | No | **Aplicado** — eliminado |
| 3 | Código muerto | `styles.css` | `.context-item` — nunca se usó como clase real | Bajo | Bajo | No | **Aplicado** — eliminado |
| 4 | Código muerto | `styles.css` | `.no-js .reveal` — vestigial, nada aplica esa clase (el fallback real es el `<noscript>`) | Bajo | Bajo | No | **Aplicado** — eliminado |
| 5 | Código muerto | `styles.css` | `.grid-teaser` (+variantes responsive) — rejilla vieja del teaser de Home | Bajo | Bajo | No | **Aplicado** — eliminado |
| 6 | Código muerto | `styles.css`, `main.js` | `.hero-char-row` / `.hero-char-row--3` — quedó muerta en esta misma sesión al migrar Agnes a `.detail-feature` | Bajo | Bajo | No | **Aplicado** — eliminado (CSS + referencia en `initAutoReveal`) |
| 7 | Código muerto | `styles.css` | `.ph--3x2` — utilidad de aspect-ratio nunca usada | Bajo | Bajo | No | **Aplicado** — eliminado |
| 8 | Accesibilidad | `main.js`, `index.html`, `work.html` | Botones de filtro no anunciaban su estado seleccionado a lectores de pantalla | Medio | Bajo | No | **Aplicado** — `aria-pressed` sincronizado con `.is-active` |

**Hallazgo adicional encontrado durante la implementación:** `.detail-row--3` en `styles.css` estaba definido pero nunca usado en ningún HTML (se me había pasado en el primer escaneo porque estaba dentro de una media query de una sola línea). Aplicado — eliminado junto con su referencia en `main.js`.

## Descartado (bajo impacto, no se tocó)

- `.sr-only` — utilidad de accesibilidad definida pero sin aplicar todavía. No es basura, es una oportunidad futura.
- Duplicación de `<header>`/`<footer>` en cada HTML — inherente a no tener build/templating; sería un proyecto grande (introducir includes), no un quick win.

## Próximos pasos sugeridos (requieren tu decisión — cambian algo visible)

1. **`.logo-chip--ai`** está definida pero nunca aplicada — ni siquiera a Weave, que sí se marca como herramienta de IA en otros lados del sitio (`tag--ai`). Aplicarla le cambiaría el color/borde al ícono de Weave en el strip de software. Pendiente de que decidas si quieres esa consistencia visual.
2. **Peso de los videos** — ya lo hablamos: varios rondan 4.8–4.9MB y el comercial de Goblin pesa 14.6MB. Comprimirlos ayudaría mucho más allá del lazy-load, pero bajar el bitrate sí podría notarse, así que no lo toco sin que tú los reexportes o me confirmes que compriman en origen.
3. **OneDrive** — si sigues notando demoras locales después de este cambio, revisa que la carpeta del proyecto esté marcada "Conservar siempre en este dispositivo" (no solo en la nube).

## Verificación

- Sin errores en consola tras los cambios.
- `aria-pressed` confirmado alternando correctamente al hacer clic en los filtros.
- Lazy-load de video confirmado: al cargar la página, los videos mantienen `data-src` sin resolver (no se descargan); al activarse, el intercambio a `src` carga el archivo completo y correcto (`readyState: 4`).
- El lightbox también se actualizó para que los videos clonados sigan reproduciéndose al abrir la vista ampliada (antes dependían del atributo `autoplay`, que ya no está en el HTML fuente).
- Cache-buster subido a `v=20260898` en las 18 páginas.
