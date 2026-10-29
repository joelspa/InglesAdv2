import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { curriculum, questions } from '../../src/data.mjs';
import { buildPath } from '../../src/path.mjs';
import { emptyProgress } from '../../src/learning.mjs';

const progressKey = 'lingoquest.progress.v1';
const byId = new Map(questions.map(q => [q.id, q]));
const path = buildPath(curriculum);
const exact = text => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // WebKit reports the Android-only interactive-widget viewport key as a console error.
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('interactive-widget')) errors.push(message.text()); });
  page.testErrors = errors;
});
test.afterEach(async ({ page }) => expect(page.testErrors).toEqual([]));

// Seeds saved progress once per test, so reloads keep what the test played.
async function seed(page, progress = {}) {
  await page.addInitScript(({ key, value }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem('seeded', '1');
  }, { key: progressKey, value: { ...emptyProgress(), onboarded: true, ...progress } });
}

async function openNode(page, id) {
  await expect(page.locator('.node.current')).toBeInViewport();
  const node = page.locator(`[data-node="${id}"]`);
  await node.scrollIntoViewIfNeeded();
  await node.click({ force: true });
  await expect(page.locator('.node-pop')).toBeVisible();
}

async function current(page) {
  const section = page.locator('.exercise');
  await expect(section).toHaveCount(1);
  return byId.get(await section.getAttribute('data-question-id'));
}

async function answer(page, wrong = false) {
  const q = await current(page);
  if (q.type === 'match') {
    for (const [left, right] of Object.entries(q.pairs)) {
      await page.locator('.match-card').filter({ hasText: exact(left) }).click();
      await page.locator('.match-card').filter({ hasText: exact(right) }).click();
    }
  } else if (q.type === 'fill') {
    await page.locator('.answer-input').fill(wrong ? 'incorrect answer' : q.answer);
    await page.getByRole('button', { name: 'Comprobar' }).click();
  } else if (q.type === 'order') {
    const words = wrong ? [...q.words].reverse() : q.words;
    for (const word of words) await page.locator('.bank button.tile').filter({ hasText: exact(word) }).first().click();
    await page.getByRole('button', { name: 'Comprobar' }).click();
  } else {
    const value = wrong ? q.options.find(option => option !== q.answer) : q.answer;
    await page.locator('.option').filter({ has: page.getByText(value, { exact: true }) }).click();
    await page.getByRole('button', { name: 'Comprobar' }).click();
  }
  await expect(page.locator('.sheet')).toBeVisible();
  return { q, wrong: wrong && q.type !== 'match' };
}

const proceed = async page => { await page.locator('.sheet .btn').click(); await expect(page.locator('.sheet')).toHaveCount(0); };

async function finishLesson(page) {
  while (await page.locator('.lesson').count()) {
    await answer(page);
    await proceed(page);
    await page.waitForTimeout(260);
  }
}

async function axe(page) {
  await page.waitForTimeout(700);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('A new player is welcomed, finishes the first lesson and unlocks the next one', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '¡Hola! Soy Lingo' })).toBeVisible();
  await page.getByRole('button', { name: '¡Vamos!' }).click();
  await page.getByRole('button', { name: 'Empezar mi primera lección' }).click();
  await expect(page.locator('.lesson')).toBeVisible();
  await finishLesson(page);
  await expect(page.getByRole('heading', { name: /¡Lección (perfecta|completada)!/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  while (await page.locator('.celebration').count()) { await page.locator('.celebration .btn').click(); await page.waitForTimeout(250); }
  await expect(page.locator('[data-node="conditional:L1"]')).toHaveClass(/done/);
  await expect(page.locator('[data-node="conditional:L2"]')).toHaveClass(/current/);
  await expect(page.locator('.toast').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-node="conditional:L1"]')).toHaveClass(/done/);
  await expect(page.locator('.hud-item.xp b')).not.toHaveText('0');
});

test('A mistake costs a heart, explains the answer and comes back at the end', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  await openNode(page, 'passive:guide');
  await page.locator('.node-pop .btn-primary').click();
  let result = await answer(page, true);
  while (!result.wrong) { await proceed(page); result = await answer(page, true); }
  await expect(page.locator('.sheet.bad')).toContainText('Respuesta correcta:');
  await expect(page.locator('.sheet.bad')).toContainText(result.q.answer);
  await expect(page.locator('.sheet.bad')).toContainText('Volverá al final de la lección');
  await expect(page.locator('.hearts')).toHaveAttribute('aria-label', '4 vidas');
  await proceed(page);
  let retried = false;
  for (let i = 0; i < 20 && await page.locator('.lesson').count(); i++) {
    if ((await current(page)).id === result.q.id) { await expect(page.locator('.retry-chip')).toBeVisible(); retried = true; }
    await answer(page);
    await proceed(page);
    await page.waitForTimeout(260);
  }
  expect(retried).toBe(true);
  await expect(page.getByRole('heading', { name: '¡Lección completada!' })).toBeVisible();
});

test('Running out of hearts offers a retry and saves the mistakes for practice', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  await openNode(page, 'intensifiers:guide');
  await page.locator('.node-pop .btn-primary').click();
  for (let i = 0; i < 40 && !(await page.locator('.out-of-hearts').count()); i++) {
    await answer(page, true);
    await proceed(page);
    await page.waitForTimeout(260);
  }
  await expect(page.getByRole('heading', { name: '¡Te quedaste sin vidas!' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver al camino' }).click();
  await page.getByRole('link', { name: 'Práctica' }).first().click();
  await expect(page.getByRole('heading', { name: 'Repasa tus errores' })).toBeVisible();
  await page.getByRole('button', { name: 'Repasar', exact: true }).click();
  await expect(page.locator('.lesson')).toBeVisible();
  await expect(page.locator('.hearts')).toHaveCount(0);
});

test('Keyboard players choose with numbers and check or continue with Enter', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  await openNode(page, 'tags:L1');
  await expect(page.locator('.node-pop .btn-primary')).toBeFocused();
  await page.keyboard.press('Enter');
  let q = await current(page);
  while (!q.options || q.type === 'match') { await answer(page); await proceed(page); await page.waitForTimeout(260); q = await current(page); }
  const shown = await page.locator('.option span[lang="en"]').allTextContents();
  await page.keyboard.press(String(shown.indexOf(q.answer) + 1));
  await expect(page.locator('.option.picked')).toContainText(q.answer);
  await page.keyboard.press('Enter');
  await expect(page.locator('.sheet.good')).toBeVisible();
  await expect(page.locator('.sheet .btn')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.sheet')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toContainText('¿Seguro que quieres salir?');
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page.locator('.lesson')).toHaveCount(0);
  await expect(page.locator('[data-node="tags:L1"]')).not.toHaveClass(/done/);
});

test('Topic guides, the unit exam report and the speed round work', async ({ page }) => {
  const unit = path[0];
  await seed(page, { lessons: Object.fromEntries(unit.nodes.filter(n => n.kind === 'lesson' && n.index === 0).map(n => [n.id, { stars: 2, best: 80 }])) });
  await page.goto('/');
  await page.getByRole('button', { name: 'Guía' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Guía: Second conditional' })).toContainText('If the chef had fresh truffles');
  await page.keyboard.press('Escape');
  await openNode(page, 'unit-1:exam');
  await page.locator('.node-pop .btn-primary').click();
  for (let i = 0; i < 10; i++) { await answer(page, i % 3 === 0); await proceed(page); await page.waitForTimeout(260); }
  await page.getByRole('button', { name: 'Continuar' }).click();
  while (await page.locator('.celebration').count()) { await page.locator('.celebration .btn').click(); await page.waitForTimeout(250); }
  const report = page.getByRole('dialog', { name: 'Informe de la ronda' });
  await expect(report).toContainText('Tu próximo paso');
  await expect(report.locator('.report-topic')).toHaveCount(3);
  await report.getByRole('button', { name: 'Volver al camino' }).click();
  await page.getByRole('link', { name: 'Práctica' }).first().click();
  await page.getByRole('button', { name: /Desafío relámpago/ }).click();
  await page.getByRole('button', { name: '¡Empezar!' }).click();
  await expect(page.locator('.speed-time')).toContainText(/\d+ s/);
  await page.locator('.speed .option').first().click();
  await page.getByRole('button', { name: 'Cerrar el desafío' }).click();
  await expect(page.locator('.speed')).toHaveCount(0);
});

test('Accessibility checks pass on the path, a lesson, practice and profile', async ({ page }) => {
  await seed(page, { mistakes: ['conditional-1'], lessons: { 'conditional:L1': { stars: 3, best: 100 } } });
  await page.goto('/');
  await axe(page);
  await page.locator('.node.current').click({ force: true });
  await axe(page);
  await page.locator('.node-pop .btn-primary').click();
  await axe(page);
  await answer(page, true);
  await axe(page);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await page.goto('/#practica');
  await axe(page);
  await page.goto('/#perfil');
  await axe(page);
});

test('Layouts fit from 320 px to desktop without horizontal scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'webkit-mobile', 'Desktop sweep runs in the desktop projects');
  await seed(page);
  for (const [width, height] of [[320, 640], [375, 812], [768, 1024], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    for (const hash of ['#aprender', '#practica', '#perfil']) {
      await page.goto(`/${hash}`);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width} ${hash}`).toBeLessThanOrEqual(0);
    }
    await page.goto('/');
    await openNode(page, 'passive:guide');
    await page.locator('.node-pop .btn-primary').click();
    await expect(page.locator('.lesson')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width} lesson`).toBeLessThanOrEqual(0);
    await expect(page.getByRole('button', { name: 'Comprobar' })).toBeInViewport();
  }
});

test('Reduced motion shows results immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page);
  await page.goto('/');
  await openNode(page, 'agreement:L1');
  await page.locator('.node-pop .btn-primary').click();
  await finishLesson(page);
  await expect(page.locator('.big-star.on')).toHaveCount(3);
  await expect(page.locator('.stat-card.gold strong')).toContainText('+');
  await expect(page.locator('.stat-card.gold strong')).not.toContainText('+0');
});
