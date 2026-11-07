// Compare two locally built revisions in the same CI runner. Never submit forms,
// dial links or send analytics. Lab results are not field Core Web Vitals.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(`${process.env.RUNNER_TEMP}/image-qa/package.json`);
const { chromium } = require('playwright');
const { default: lighthouse } = await import(require.resolve('lighthouse'));
const { launch } = await import(require.resolve('chrome-launcher'));
const urls = { before: 'http://127.0.0.1:4322', after: 'http://127.0.0.1:4321' };
const output = 'image-performance';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const geometry = {};
const assets = [];
try {
  for (const [width, height, dpr] of [[320,740,1],[390,844,1],[390,844,2],[390,844,3],[480,800,2],[640,900,2],[1440,1000,1],[1440,1000,2]]) {
    for (const [revision, url] of Object.entries(urls)) {
      const context = await browser.newContext({ viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'reduce' });
      const page = await context.newPage();
      await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
      const requests=[];
      page.on('request', r => requests.push(r.url()));
      await page.goto(url, {waitUntil:'networkidle'});
      const key=`${width}-${dpr}x`;
      const hero=await page.locator('.hero-mobile-image').evaluate(async image => {
        await image.decode();
        const pixels=new Image(); pixels.src=image.currentSrc; await pixels.decode();
        const box=image.getBoundingClientRect();
        return {width:box.width,height:box.height,sourceWidth:pixels.naturalWidth,sourceHeight:pixels.naturalHeight,url:image.currentSrc};
      });
      if(revision==='before') geometry[key]=hero;
      else {
        assert.equal(hero.width,geometry[key].width);
        assert.equal(hero.height,geometry[key].height);
        if(width<=480) {
          assert.ok(hero.height>=hero.width,'Square source preserves the original cover crop');
          assert.equal(hero.sourceWidth,hero.sourceHeight);
          const required=Math.min(1468,Math.max(hero.width,hero.height)*dpr);
          assert.ok(hero.sourceWidth>=required,`Insufficient hero resolution: ${JSON.stringify({hero,required})}`);
        }
        assert.equal(await page.locator('[data-video-poster]').count(),11);
        assert.equal(await page.locator('[data-video-poster][src]').count(),0,'All 11 offscreen posters remain inert');
        assert.equal(await page.locator('video[poster]').count(),0);
      }
      assets.push({revision,width,dpr,hero,initialImageRequests:requests.filter(x=>/\.(jpe?g|png|webp)(\?|$)/.test(x))});
      await page.screenshot({path:`${output}/${key}-${revision}-hero.png`});
      if(dpr===1 || width===390 && dpr===2) {
        for(const [name,selector] of [['services','#services-carousel'],['engineering','#engineering-films-track'],['showcase','.jobsite-hero-feature']]) {
          const target=page.locator(selector); await target.scrollIntoViewIfNeeded();
          if(revision==='after' && name!=='services') {
            const poster=target.locator('[data-video-poster]').first();
            await poster.waitFor({state:'attached'});
            await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await poster.elementHandle());
          }
          await target.screenshot({path:`${output}/${key}-${revision}-${name}.png`});
        }
      }
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(`${output}/assets.json`, JSON.stringify(assets,null,2));
const results=[];
for(const mode of ['mobile','desktop']) {
  for(let round=1;round<=3;round++) {
    // Alternate order to reduce systematic warm-run bias.
    const entries=Object.entries(urls); if(round%2===0) entries.reverse();
    for(const [revision,url] of entries) {
      const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox']});
      try {
        const flags={port:chrome.port,output:'json',onlyCategories:['performance'],logLevel:'error',blockedUrlPatterns:['*google-analytics.com/*','*googletagmanager.com/*']};
        if(mode==='desktop') flags.preset='desktop';
        const {lhr,artifacts}=await lighthouse(url,flags);
        assert.ok(!lhr.runtimeError,JSON.stringify(lhr.runtimeError));
        const metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','total-byte-weight'].map(id=>[id,lhr.audits[id]?.numericValue]));
        results.push({mode,round,revision,score:lhr.categories.performance.score,...metrics});
        await writeFile(`${output}/${mode}-${round}-${revision}.json`,JSON.stringify(lhr));
        if(mode==='mobile'&&round===1) await writeFile(`${output}/${mode}-${revision}.trace.json`,JSON.stringify(artifacts.Trace));
        console.log(JSON.stringify(results.at(-1)));
      } finally { await chrome.kill(); }
    }
  }
}
await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
