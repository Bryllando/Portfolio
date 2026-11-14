import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { preview } from 'vite';
import { chromium } from 'playwright';
import { profile, projects } from '../src/content.js';

await mkdir('.artifacts', { recursive: true });
const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
let browser;
let page;
const errors = [];

try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.ok((await page.title()).includes(profile.name));
  assert.match(await page.locator('h1').innerText(), /IT student.*full-stack developer/s);
  assert.match(await page.locator('.current-project').innerText(), /Currently working on GarantiyAid\s+Capstone project/);
  assert.equal(await page.locator('.project-card').count(), 2);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.skip-link').getAttribute('href'), '#main');
  assert.equal(await page.locator('.project-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 2);
  assert.equal(await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.documentElement).backgroundColor : getComputedStyle(element).backgroundColor), 'rgb(13, 15, 13)');

  assert.equal(await page.locator('.portrait-figure').evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.portrait-figure').evaluate(element => getComputedStyle(element).transform), 'none');
  assert.equal(await page.locator('.portrait-image').evaluate(element => getComputedStyle(element).transform), 'none');
  assert.equal(await page.locator('.hero-visual').evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.portrait-scan').evaluate(element => getComputedStyle(element).animationName), 'portrait-scan');
  assert.equal(await page.locator('.scroll-progress > span').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a), 0);
  const firstCard = page.locator('.project-card').first();
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.project-card')).opacity === '1');
  const cardBounds = await firstCard.boundingBox();
  await page.mouse.move(cardBounds.x + cardBounds.width * .8, cardBounds.y + cardBounds.height * .2);
  await page.waitForFunction(() => {
    const card = document.querySelector('.project-card');
    return parseFloat(card.style.getPropertyValue('--tilt-x')) > 0 && parseFloat(card.style.getPropertyValue('--tilt-y')) > 0;
  });
  await page.mouse.move(10, 10);
  await page.waitForFunction(() => document.querySelector('.project-card').style.getPropertyValue('--tilt-x') === '');

  for (const project of projects) {
    const details = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: project.title, exact: true }) }).getByRole('button', { name: 'Details' });
    await details.click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#dialog-title').innerText(), `#${project.title}`);
    assert.equal(await page.locator('.feature-list li').count(), project.features.length);
    for (const source of [project.source, project.backendSource].filter(Boolean)) {
      assert.equal(await page.getByRole('dialog').locator(`a[href="${source}"]`).count(), 1);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement === document.body || document.querySelector('dialog').contains(document.activeElement)), true, 'Focus reached the page behind the modal');
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await details.evaluate(element => document.activeElement === element), true, 'Modal did not restore focus');
  }

  await page.getByRole('button', { name: 'Copy email address' }).click();
  await page.getByRole('status').filter({ hasText: 'Email copied' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), profile.email);
  const resume = await context.request.get(new URL(profile.resume, page.url()).href);
  assert.equal(resume.status(), 200);
  assert.equal((await resume.body()).subarray(0, 4).toString(), '%PDF');
  assert.equal(await page.locator('a[href="mailto:emmantaburnal51@gmail.com"]').count() > 0, true);
  for (const project of projects) {
    for (const source of [project.source, project.backendSource].filter(Boolean)) {
      assert.equal(await page.locator(`.project-card a[href="${source}"]`).count(), 1);
    }
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForFunction(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.scroll-progress > span')).transform).a > .999);

  for (const width of [1440, 1366, 1280, 1024, 900, 768, 760, 600, 430, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(layout.document <= layout.viewport, `Horizontal overflow at ${width}px: ${layout.document}px`);
    if (width === 390) assert.equal(await page.locator('.project-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const menuButton = page.locator('.menu-toggle');
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#main-navigation a').first().evaluate(element => document.activeElement === element), true);
  await page.locator('#main-navigation a').last().focus();
  await page.keyboard.press('Tab');
  assert.equal(await menuButton.evaluate(element => document.activeElement === element), true, 'Mobile focus trap failed');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
  assert.equal(await menuButton.evaluate(element => document.activeElement === element), true);
  await menuButton.click();
  await page.locator('#main-navigation').getByRole('link', { name: '#works', exact: true }).click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  await page.waitForFunction(() => document.querySelector('#main-navigation a[href="#works"]').getAttribute('aria-current') === 'location');

  // Capture every section after it has entered view, including scroll-revealed content.
  for (const [width, height, name] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
    await page.setViewportSize({ width, height });
    for (const selector of ['#home', '#works', '#skills', '#about-me', '#contacts', '.site-footer']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `.artifacts/${name}.png`, fullPage: true, animations: 'disabled' });
  }

  const images = await page.locator('img').evaluateAll(elements => elements.filter(element => !element.complete || !element.naturalWidth).map(element => element.src));
  assert.deepEqual(images, [], 'Missing local images');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-tilt]')).every(card => card.style.getPropertyValue('--tilt-x') === ''));
  await page.reload({ waitUntil: 'networkidle' });
  const motion = await page.locator('.hero-visual').evaluate(element => getComputedStyle(element).animationName);
  assert.equal(motion, 'none');
  assert.equal(await page.locator('.portrait-figure').evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.portrait-scan').evaluate(element => getComputedStyle(element).display), 'none');
  await firstCard.hover({ position: { x: 20, y: 20 } });
  assert.equal(await firstCard.evaluate(element => getComputedStyle(element).transform), 'none');
  assert.equal(await firstCard.evaluate(element => element.style.getPropertyValue('--tilt-x')), '');
  assert.equal(await page.locator('.project-card').first().evaluate(element => getComputedStyle(element).opacity), '1');
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: 12 responsive widths, stationary portrait with scan overlay, pointer tilt/reset, scroll progress, project dialogs, mobile navigation, clipboard, résumé, local assets, and reduced motion.');
  console.log('Screenshots: .artifacts/desktop.png and .artifacts/mobile.png');
} catch (error) {
  await page?.screenshot({ path: '.artifacts/failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
