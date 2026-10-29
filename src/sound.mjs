// Small synthesized sound effects. No audio files, nothing plays until the
// first user gesture, and every effect respects the mute setting.
let context;
let master;
let enabled = true;

export function setSoundEnabled(value) { enabled = Boolean(value); }

function audio() {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    context = new Context();
    master = context.createGain();
    master.gain.value = 0.5;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(ctx, { freq, at = 0, length = 0.15, type = 'sine', volume = 0.2, slide }) {
  const start = ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  oscillator.connect(gain).connect(master);
  oscillator.start(start);
  oscillator.stop(start + length + 0.03);
}

const notes = (ctx, list, type = 'triangle', volume = 0.18) => list.forEach(([freq, at, length = 0.16]) => tone(ctx, { freq, at, length, type, volume }));

const effects = {
  tap: ctx => tone(ctx, { freq: 880, length: 0.05, volume: 0.06 }),
  pick: ctx => tone(ctx, { freq: 660, length: 0.07, type: 'triangle', volume: 0.09, slide: 880 }),
  pair: ctx => notes(ctx, [[880, 0, 0.08], [1318.5, 0.06, 0.14]], 'sine', 0.12),
  correct: ctx => notes(ctx, [[659.25, 0, 0.12], [987.77, 0.09, 0.26]]),
  wrong: ctx => { tone(ctx, { freq: 233, length: 0.16, type: 'square', volume: 0.07 }); tone(ctx, { freq: 185, at: 0.13, length: 0.24, type: 'square', volume: 0.07 }); },
  heart: ctx => tone(ctx, { freq: 520, length: 0.35, type: 'sine', volume: 0.14, slide: 200 }),
  combo: ctx => notes(ctx, [[1046.5, 0, 0.09], [1318.5, 0.07, 0.09], [1568, 0.14, 0.09], [2093, 0.21, 0.22]], 'sine', 0.13),
  star: ctx => { tone(ctx, { freq: 1318.5, length: 0.25, volume: 0.13 }); tone(ctx, { freq: 1975.5, at: 0.05, length: 0.3, volume: 0.07 }); },
  complete: ctx => notes(ctx, [[523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.5], [783.99, 0.36, 0.5], [659.25, 0.36, 0.5]], 'triangle', 0.12),
  chest: ctx => { tone(ctx, { freq: 300, length: 0.4, type: 'sawtooth', volume: 0.05, slide: 900 }); notes(ctx, [[1568, 0.35, 0.12], [2093, 0.45, 0.3]], 'sine', 0.12); },
  level: ctx => notes(ctx, [[587.33, 0, 0.1], [739.99, 0.09, 0.1], [880, 0.18, 0.1], [1174.66, 0.27, 0.45]], 'square', 0.06),
  streak: ctx => { tone(ctx, { freq: 200, length: 0.5, type: 'sawtooth', volume: 0.04, slide: 700 }); notes(ctx, [[880, 0.4, 0.12], [1174.66, 0.5, 0.35]], 'triangle', 0.14); },
  tick: ctx => tone(ctx, { freq: 1500, length: 0.03, volume: 0.04 })
};

export function play(name) {
  if (!enabled) return;
  try {
    const ctx = audio();
    if (ctx) effects[name]?.(ctx);
  } catch {}
}

export function buzz(pattern = 60) {
  if (enabled && typeof navigator !== 'undefined') navigator.vibrate?.(pattern);
}
