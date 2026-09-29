import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import matter from 'gray-matter';
import { startDistServer } from '../scripts/ux-agent/browser.mjs';

// Run after a build. Exercise the generated pages, not a duplicate quiz fixture.
test('Discovery lessons and browser-only grading', async () => {
  const lessons = [];
  for (const file of await readdir('content/training-videos')) {
    if (file.endsWith('.md')) {
      const { data } = matter(await readFile(`content/training-videos/${file}`, 'utf8'));
      if (data.discoverySeries) lessons.push(data);
    }
  }
  lessons.sort((a,b) => a.order-b.order);
  assert.equal(lessons.length, 15);
  assert.equal(lessons.reduce((sum,lesson)=>sum+lesson.quiz.length,0), 47);
  assert.deepEqual(lessons.map(l=>l.order), Array.from({length:15},(_,i)=>i+1));
  const browser = await chromium.launch();
  const server = await startDistServer();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Quiz runtime has no dependence on remote services; block them in this test.
    await context.route('**/*', route => new URL(route.request().url()).origin === server.origin ? route.continue() : route.abort());
    await page.addInitScript(() => { window.quizEvents=[]; window.gtag=(...args)=>window.quizEvents.push(args); });
    for (const lesson of lessons) {
      await page.goto(server.origin+lesson.canonicalUrl);
      assert.equal(await page.locator('video, iframe').count(),0);
      assert.equal(await page.locator('[data-quiz-block]').count(),lesson.quiz.length);
      for (let i=0;i<lesson.quiz.length;i++) {
        const block = page.locator('[data-quiz-block]').nth(i);
        assert.equal(await block.locator('legend').textContent(),`${i+1}. ${lesson.quiz[i].question}`);
        assert.equal(await block.locator('[data-quiz-explanation]').textContent(),lesson.quiz[i].explanation);
        const answer=block.locator('[data-quiz-option]').nth(lesson.quiz[i].answer);
        await answer.click();
        assert.equal(await page.locator('[data-dialog-result]').textContent(),'Correct');
        assert.equal(await page.locator('[data-dialog-explanation]').textContent(),lesson.quiz[i].explanation);
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('[data-dialog-close]').evaluate(el=>document.activeElement===el),true);
        await page.keyboard.press('Escape');
        assert.equal(await answer.evaluate(el=>document.activeElement===el),true);
      }
      assert.match(await page.locator('[data-quiz-score]').textContent(),new RegExp(`${lesson.quiz.length} of ${lesson.quiz.length} correct`));
      assert.equal(await page.evaluate(()=>window.quizEvents.some(event=>JSON.stringify(event).includes('video_quiz'))),false);
    }
    await page.goto(server.origin+lessons[0].canonicalUrl);
    await page.locator('[data-quiz-reset]').click();
    const first=page.locator('[data-quiz-block]').first();
    await first.locator('[data-quiz-option]').nth(0).press('Enter');
    assert.equal(await page.locator('[data-dialog-result]').textContent(),'Incorrect');
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('dialog').isVisible(),true);
    await page.locator('[data-dialog-close]').click();
    assert.match(await first.locator('[data-quiz-result]').textContent(),/Incorrect/);
    await first.locator('[data-quiz-option]').nth(1).click();
    // Clicking outside dismisses; clicking content does not.
    await page.locator('[data-dialog-explanation]').click();
    assert.equal(await page.locator('dialog').isVisible(),true);
    await page.mouse.click(2,2);
    assert.equal(await page.locator('dialog').isVisible(),false);
    assert.match(await page.locator('[data-quiz-score]').textContent(),/0 correct on the first try/);
    await page.reload();
    assert.equal(await first.locator('[data-quiz-option]').nth(1).getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('[data-quiz-score]').textContent(),/1 of 3 questions answered. 0 correct/);
    await page.goto(server.origin+'/training-resources/videos/index.html');
    assert.equal(await page.locator('[data-video-card]').count(),15);
    assert.match(await page.locator('[data-video-card="uc-san-diego-ai-vision"] [data-quiz-card-state]').textContent(),/1 of 3/);
    // Stale revisions and malformed storage must not restore invalid answers.
    for(const value of ['{broken',JSON.stringify({'uc-san-diego-ai-vision':{version:'old',answers:[{first:1,latest:1}]}})]) {
      await page.evaluate(value=>localStorage.setItem('tritonai.discoveryQuiz.v1',value),value);
      await page.goto(server.origin+lessons[0].canonicalUrl);
      assert.match(await page.locator('[data-quiz-score]').textContent(),/0 of 3/);
    }
    const blocked=await browser.newContext();
    await blocked.route('**/*', route => new URL(route.request().url()).origin === server.origin ? route.continue() : route.abort());
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked');}}));
    const privatePage=await blocked.newPage();
    await privatePage.goto(server.origin+lessons[0].canonicalUrl);
    assert.match(await privatePage.locator('[data-quiz-storage]').textContent(),/unavailable/);
    await privatePage.locator('[data-quiz-option]').nth(1).click();
    assert.equal(await privatePage.locator('[data-dialog-result]').textContent(),'Correct');
    await blocked.close();
    await context.close();
  } finally { await browser.close(); await server.close(); }
});
