import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { questions } from '../src/data.mjs';
import manifest from '../src/audio-manifest.json' with { type: 'json' };

test('Every listening and narrated reading has a current, non-empty local MP3', () => {
  const narrated = questions.filter(q => q.audio || q.story);
  assert.equal(narrated.length, 28);
  assert.equal(Object.keys(manifest).length, narrated.length);
  let bytes = 0;
  for (const q of narrated) {
    const clip = manifest[q.id];
    assert.ok(clip, q.id);
    assert.equal(clip.checksum, createHash('sha256').update(q.audio || q.story).digest('hex'), `Outdated narration: ${q.id}`);
    assert.match(clip.src, /^\/audio\/[a-z-]+-\d+\.mp3$/);
    assert.ok(clip.seconds > 2 && clip.seconds < 120, q.id);
    assert.ok(clip.voices.length > 0, q.id);
    const file = new URL(`../public${clip.src}`, import.meta.url);
    const buffer = readFileSync(file);
    assert.equal(statSync(file).size, clip.bytes);
    assert.ok(buffer.length > 10000, q.id);
    assert.ok(buffer[0] === 0xff || buffer.subarray(0, 3).toString() === 'ID3', `Invalid MP3 header: ${q.id}`);
    bytes += buffer.length;
  }
  assert.ok(bytes < 10 * 1024 * 1024, 'Audio stays within a reasonable static deployment size');
});

test('Conversation recordings use two distinct voices', () => {
  for (const id of ['agreement-10', 'agreement-22']) assert.equal(manifest[id].voices.length, 2, id);
});
