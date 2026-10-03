import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { startDistServer } from "./ux-agent/browser.mjs";
import AxeBuilder from "@axe-core/playwright";
const server = process.env.REVIEW_URL ? null : await startDistServer();
const base = process.env.REVIEW_URL || server.origin;
const coursePath = server ? '/training/harness/index.html' : '/training/harness/';
await mkdir('reports/harness-training', { recursive: true });
const browser=await chromium.launch({headless:true});
try{
for(const width of [1440,390,320]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const r=await page.goto(base+coursePath,{waitUntil:'networkidle'});
 if(r.status()!==200||await page.locator('main').count()!==1)throw Error('Course missing main');
 const fonts=await page.evaluate(()=>({body:getComputedStyle(document.body).fontFamily,title:getComputedStyle(document.querySelector('h1')).fontFamily}));
 if(!fonts.body.includes('Roboto')||!fonts.title.includes('Teko'))throw Error('Course typography missing');
 if(await page.locator('link[rel=canonical]').getAttribute('href')!=='https://tritonai.ucsd.edu/training/harness/')throw Error('Course canonical URL changed');
 await page.keyboard.press('Tab');if(await page.locator('.training-skip').evaluate(el=>el!==document.activeElement))throw Error('Skip not first');
 await page.keyboard.press('Enter');if(!await page.locator('main').evaluate(el=>el===document.activeElement))throw Error('Skip failed');
 await page.locator('#scriptBox summary').click();if(!(await page.locator('#scriptBody').innerText()).includes('Welcome to TritonAI Harness'))throw Error('Transcript unavailable');
 await page.locator('#scriptBox summary').click();
 await page.locator('#bigplay').click();await page.waitForTimeout(1500);await page.locator('#bPlay').click();
 if(!await page.locator('#capTxt').innerText())throw Error('Captions missing');
 const au=await ctx.request.get(base+'/training/harness/audio/01-01.mp3');const zip=await ctx.request.get(base+'/training/harness/practice-kit/harness-practice.zip');
 if(au.status()!==200||zip.status()!==200||(await zip.body()).readUInt32LE(0)!==0x04034b50)throw Error('Missing course assets');
 const audioDuration=await page.evaluate(()=>new Promise((resolve,reject)=>{const audio=new Audio('audio/01-01.mp3');audio.onloadedmetadata=()=>resolve(audio.duration);audio.onerror=()=>reject(Error('Narration cannot decode'));audio.load();}));
 if(!Number.isFinite(audioDuration)||audioDuration<=0)throw Error('Narration has no duration');
 const chapters=await page.locator('#chs li.ch button').count();if(chapters<10)throw Error('Chapters missing');
 await page.locator('#chs li.ch button').first().click();
 for(let i=0;i<20&&!await page.locator('#quiz').isVisible();i++)await page.locator('#bNext').click();
 if(!await page.locator('#quiz').isVisible())throw Error('Quiz unreachable');
 const options=page.locator('#qOpts button');for(let i=0;i<await options.count();i++){if(await options.nth(i).isEnabled())await options.nth(i).click();if(await page.locator('#qGo').isVisible())break;}
 if(!await page.locator('#qGo').isVisible()||!(await page.locator('#qFb').innerText()).includes('Correct'))throw Error('Quiz answer failed');
 await page.locator('#qGo').click();await page.locator('#bPlay').click();
 const axe=(await new AxeBuilder({page}).analyze()).violations;
 if(axe.length||errors.length||await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error(JSON.stringify({width,axe:axe.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),errors}));
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`reports/harness-training/${base.startsWith('https')?'live':'local'}-${width}.png`});
 console.log(JSON.stringify({width,chapters,axe:axe.length,assets:'200',quiz:'passed',skip:'passed'}));await ctx.close();
}
}finally{await browser.close();if(server) await server.close();}
