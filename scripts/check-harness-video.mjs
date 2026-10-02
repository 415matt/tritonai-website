import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { startDistServer } from './ux-agent/browser.mjs';

const server = process.env.REVIEW_URL ? null : await startDistServer();
const origin = process.env.REVIEW_URL || server.origin;
const engines = process.env.CHECK_WEBKIT ? [['chromium', chromium], ['webkit', webkit]] : [['chromium', chromium]];
try {
  for (const [name, engine] of engines) {
    const browser = await engine.launch();
    try {
      for (const width of [390, 1440]) {
        // Chromium also verifies that native sources and the fallback link
        // remain available when site JavaScript is disabled.
        for (const javaScriptEnabled of name === 'webkit' ? [true] : [true, false]) {
          const page = await browser.newPage({ viewport: { width, height: 1000 }, isMobile: width < 768, hasTouch: width < 768, javaScriptEnabled });
          if (server) {
            // The shared fixture server does not implement media byte ranges.
            // Supply local bytes with the same MIME/range support as production.
            await page.route('**/*.mp4', async route => {
              const data = await readFile(path.join('dist', new URL(route.request().url()).pathname.replace(/^\/tritonai-website/, '')));
              const range = route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
              const start = range ? Number(range[1]) : 0;
              const end = range?.[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
              const body = data.subarray(start, end + 1);
              await route.fulfill({ status: range ? 206 : 200, body, headers: {
                'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-length': String(body.length),
                ...(range ? { 'content-range': `bytes ${start}-${end}/${data.length}` } : {}),
              } });
            });
          }
          await page.goto(`${origin}/developer-apis/harness.html`, { waitUntil: 'networkidle' });
          const video = page.locator('#harness-in-action video');
          assert.equal(await video.count(), 1);
          const state = await video.evaluate(v => ({
            manual: v.dataset.playback, source: v.querySelector('source').getAttribute('src'),
            poster: v.getAttribute('poster'), deferred: v.dataset.autoplayWhenVisible,
            paused: v.paused, autoplay: v.autoplay, inline: v.playsInline, controls: v.controls,
          }));
          assert.equal(state.manual, 'manual');
          assert.ok(state.source && state.poster && state.controls && state.inline);
          assert.ok(state.paused && !state.autoplay && !state.deferred);
          const directLink = page.locator('#harness-in-action a').filter({ hasText: 'open the video directly' });
          assert.equal(await directLink.getAttribute('href'), state.source);
          if (!javaScriptEnabled) {
            console.log(JSON.stringify({ engine: name, width, javaScriptEnabled, nativeSource: 'passed', directLink: 'passed' }));
            await page.close();
            continue;
          }
          await page.waitForTimeout(800);
          await video.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          if (name === 'chromium') { await video.focus(); await page.keyboard.press('Space'); }
          else await video.click();
          await page.waitForFunction(() => document.querySelector('#harness-in-action video').currentTime > 1);
          assert.ok(await video.evaluate(v => !v.paused && !v.error && v.textTracks[0].cues.length > 0));
          await video.evaluate(v => { v.pause(); v.currentTime = 60; });
          await page.waitForFunction(() => {
            const v = document.querySelector('#harness-in-action video');
            return !v.seeking && v.currentTime >= 60 && v.readyState >= 2;
          });
          assert.ok(await video.evaluate(v => v.getBoundingClientRect().right <= innerWidth + 1));
          console.log(JSON.stringify({ engine: name, width, javaScriptEnabled, playback: 'passed', captions: 'passed', seeking: 'passed' }));
          await page.close();
        }
      }
    } finally { await browser.close(); }
  }
} finally { if (server) await server.close(); }
