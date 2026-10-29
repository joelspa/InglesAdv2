# LingoQuest

Juego web para aprender y repasar los temas de **Inglés Avanzado II (INU060)**, inspirado en las apps de idiomas con lecciones cortas: camino de niveles, vidas, XP, rachas y celebraciones. La interfaz está en español y los ejercicios en inglés.

## Cómo se juega

- **Camino de aprendizaje**: 3 unidades y 9 temas. Cada tema tiene 3 lecciones (Reconoce → Construye → Aplica) y un cofre con XP extra. Cada unidad termina con un examen de 10 preguntas con informe por tema.
- **Guía EGT**: los temas de la Unidad 1 (segundo condicional, so/such y voz pasiva) incluyen una lección con los ejercicios de la guía de estudio de la Escuela de Gastronomía y Turismo, en contexto de restaurante, hotel y cocina. Siempre está disponible.
- **5 vidas por lección**: cada error cuesta una vida, muestra la explicación y la pregunta vuelve al final. Sin vidas, puedes reintentar; los errores pasan a Práctica.
- **Recompensas**: XP por acierto, bonos por combos y lecciones perfectas, niveles, meta diaria de 50 XP, racha de días, estrellas (1–3) y 9 logros.
- **Práctica**: repaso de errores, desafío relámpago (60 s), Listening, Reading y desafío general de los 9 temas.
- **Guía de cada tema**: regla, patrón, ejemplos y truco para recordarlo, accesible desde el camino.

Atajos: **1–4** para elegir opción, **Enter** para comprobar o continuar y **Esc** para salir de la lección.

## Ejecutar en local

Requiere Node.js 24.

```bash
npm ci
```

```bash
npm run dev
```

Abre http://localhost:3000. Para probar la versión compilada: `npm run build` y `npm run preview` (http://127.0.0.1:4173).

## Publicar en Vercel

La app es estática: no necesita servidor, base de datos ni variables de entorno. El progreso se guarda en el navegador de cada estudiante.

Opción rápida, desde esta carpeta (te pedirá iniciar sesión en Vercel):

```bash
npx vercel --prod
```

O desde GitHub: sube la carpeta a un repositorio, en Vercel elige **Add New → Project**, impórtalo y pulsa **Deploy**. `vercel.json` ya define Vite, `npm ci`, `npm run build` y la carpeta `dist`.

## Pruebas

```bash
npm test
```

```bash
npm run build && npm run test:e2e
```

`npm test` cubre datos, camino, motor de lección (vidas, reencolado, combos, XP), recompensas, audios y render. Las pruebas de navegador recorren el juego en Chromium, Firefox y WebKit (iPhone): bienvenida, lección completa, errores, quedarse sin vidas, teclado, guía, examen, desafío relámpago, accesibilidad con axe, anchos de 320 a 1440 px y movimiento reducido. Si faltan los navegadores: `npx playwright install chromium firefox webkit`.

## Estructura

- `src/App.jsx`: pestañas, cabecera, sesiones, recompensas y pantallas de celebración.
- `src/Path.jsx` y `src/path.mjs`: camino de unidades, nodos y desbloqueo.
- `src/Lesson.jsx`, `src/ExerciseView.jsx` y `src/FeedbackSheet.jsx`: la lección, los 9 tipos de ejercicio y la hoja de feedback.
- `src/lessonEngine.mjs`: motor puro de la lección (cola, vidas, combos, XP).
- `src/rewards.mjs`: XP, niveles, racha, meta diaria, cofres y logros.
- `src/LessonComplete.jsx` y `src/Celebrations.jsx`: fin de lección, racha, nivel, cofre, avisos y bienvenida.
- `src/Practice.jsx`, `src/SpeedRound.jsx` y `src/Profile.jsx`: práctica, desafío relámpago y perfil.
- `src/Mascot.jsx`: Lingo, la mascota animada.
- `src/sound.mjs`: efectos de sonido sintetizados con Web Audio, que se pueden silenciar.
- `src/data.mjs`, `src/exercises.mjs` y `src/guide-unit1.mjs`: 227 ejercicios.
- `src/teaching.mjs` y `src/guideNotes.mjs`: reglas, pistas y resúmenes de la guía.
- `public/audio/`: 28 audios MP3 con voz generada con IA. Para regenerarlos: `npm install --prefix tmp/audio-tools kokoro-js @breezystack/lamejs` y `node scripts/generate-audio.mjs`.

Las animaciones respetan la preferencia de movimiento reducido del sistema.
