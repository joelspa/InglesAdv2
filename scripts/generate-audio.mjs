// Offline authoring tool. The app deploys only the generated MP3 files.
// Setup: npm install --prefix tmp/audio-tools kokoro-js @breezystack/lamejs
// Run: node scripts/generate-audio.mjs [question-id]
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { questions } from '../src/data.mjs';
import { KokoroTTS } from '../tmp/audio-tools/node_modules/kokoro-js/dist/kokoro.js';
import { Mp3Encoder } from '../tmp/audio-tools/node_modules/@breezystack/lamejs/dist/lamejs.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'public/audio');
const manifestPath = path.join(root, 'src/audio-manifest.json');
await mkdir(output, { recursive: true });
let manifest = {};
try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch {}

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
  dtype: 'q8', device: 'cpu'
});

function split(text, voice) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let pending = '';
  for (const sentence of sentences) {
    if (pending && (pending + sentence).length > 280) { chunks.push({ text: pending.trim(), voice }); pending = ''; }
    pending += sentence;
  }
  if (pending.trim()) chunks.push({ text: pending.trim(), voice });
  return chunks;
}

for (const q of questions.filter(q => q.audio || q.story)) {
  if (process.argv[2] && process.argv[2] !== q.id) continue;
  const text = q.audio || q.story;
  const checksum = createHash('sha256').update(text).digest('hex');
  const file = path.join(output, `${q.id}.mp3`);
  if (manifest[q.id]?.checksum === checksum) {
    try { await access(file); console.log(`Cached ${q.id}`); continue; } catch {}
  }
  const turns = [...text.matchAll(/(?:^|\s)(Maria|Marcos|Ana|Tom):\s*([\s\S]*?)(?=\s(?:Maria|Marcos|Ana|Tom):|$)/g)];
  const chunks = turns.length ? turns.flatMap(([, speaker, line]) => split(line, ['Marcos', 'Tom'].includes(speaker) ? 'am_puck' : 'af_heart')) : split(text, 'af_heart');
  const parts = [];
  let sampleRate = 24000;
  for (const chunk of chunks) {
    console.log(`Generating ${q.id}: ${chunk.voice}, ${chunk.text.length} characters`);
    const result = await tts.generate(chunk.text, { voice: chunk.voice, speed: 1 });
    sampleRate = result.sampling_rate;
    parts.push(result.audio, new Float32Array(Math.round(sampleRate * (turns.length ? .28 : .18))));
  }
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const pcm = new Int16Array(length);
  let offset = 0;
  for (const part of parts) for (const value of part) pcm[offset++] = Math.round(Math.max(-1, Math.min(1, value)) * 32767);
  const encoder = new Mp3Encoder(1, sampleRate, 96);
  const buffers = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const buffer = encoder.encodeBuffer(pcm.subarray(i, i + 1152));
    if (buffer.length) buffers.push(Buffer.from(buffer));
  }
  buffers.push(Buffer.from(encoder.flush()));
  const mp3 = Buffer.concat(buffers);
  await writeFile(file, mp3);
  manifest[q.id] = { src: `/audio/${q.id}.mp3`, seconds: Math.round(length / sampleRate * 100) / 100, bytes: mp3.length, checksum, voices: [...new Set(chunks.map(chunk => chunk.voice))] };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Saved ${q.id}: ${manifest[q.id].seconds}s, ${Math.round(mp3.length / 1024)} KB`);
}
