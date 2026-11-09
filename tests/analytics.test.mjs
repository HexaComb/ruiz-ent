import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackEvent, registerClicks } from '../src/lib/analytics.ts';
import fs from 'node:fs';
test('click events emit only fixed labels, never hrefs, queries or text', () => {
 const events=[]; let click;
 globalThis.window={location:{origin:'https://ruizfamilyhardscapes.biz'},gtag:(...args)=>events.push(args)};
 globalThis.document={addEventListener:(name,fn)=>{click=fn}};
 class Element { closest(selector){ return selector==='a, button'?this:null; } }
 class Anchor extends Element { constructor(href){super();this.href=href;}getAttribute(){return this.href;} }
 globalThis.Element=Element;globalThis.HTMLAnchorElement=Anchor;
 registerClicks();
 for(const href of ['tel:secret-phone','mailto:private@example.com','#our-services','#quote-builder','https://example.com/?private=1'])click({target:new Anchor(href)});
 assert.deepEqual(events.map(e=>e[1]),['phone_click','email_click','navigation_click','cta_click']);
 assert(!JSON.stringify(events).includes('secret'));assert(!JSON.stringify(events).includes('private'));assert(!JSON.stringify(events).includes('example.com'));
 window.gtag=()=>{throw Error('blocked')};assert.doesNotThrow(()=>trackEvent('generate_lead','estimate_form','contact'));
});
test('service navigation emits one fixed label with its area and no URL or query data', () => {
 const events=[]; let click;
 globalThis.window={location:{origin:'https://ruizfamilyhardscapes.biz'},gtag:(...args)=>events.push(args)};
 globalThis.document={addEventListener:(name,fn)=>{click=fn}};
 class Element { closest(selector){ return selector==='a, button'?this:selector===this.area?{}:null; } }
 class Anchor extends Element { constructor(href,area){super();this.href=href;this.area=area;}getAttribute(){return this.href;} }
 globalThis.Element=Element;globalThis.HTMLAnchorElement=Anchor;
 registerClicks();
 for (const [href,target,area] of [
  ['/services/?email=private@example.com','services','header'],
  ['/services/concrete/','service_concrete','footer'],
  ['/services/masonry','service_masonry','content'],
  ['/services/general-engineering/#private-details','service_general_engineering','header']
 ]) {
  events.length=0; click({target:new Anchor(href,area)});
  assert.deepEqual(events,[['event','navigation_click',{target,area,page_referrer:'',page_title:'Ruiz Family Enterprises'}]]);
 }
 for (const href of ['/services/missing-private/', '/services/concrete/private/', 'https://example.com/services/concrete/']) {
  events.length=0; click({target:new Anchor(href,'header')}); assert.deepEqual(events,[]);
 }
 events.length=0; click({target:new Anchor('/services/masonry/?email=private@example.com#quote-builder','header')});
 assert.deepEqual(events,[['event','cta_click',{target:'quote-builder',area:'header',page_referrer:'',page_title:'Ruiz Family Enterprises'}]]);
});

test('lead only emitted inside confirmed server success; no auto form_submit duplication',()=>{
 const s=fs.readFileSync(new URL('../src/components/QuoteBuilder.astro',import.meta.url),'utf8');
 assert.match(s,/if \(response.ok\) \{\s*if \('sent' in result && result.sent === true\)/);
 assert.equal(s.match(/trackEvent\('generate_lead'/g).length,1);
 assert(!s.includes("trackEvent('form_submit'"));
});

test('actual form handler emits one lead only on confirmed success, never failures or honeypot', async()=>{
 const {stripTypeScriptTypes}=await import('node:module'); const vm=await import('node:vm');
 const source=fs.readFileSync(new URL('../src/components/QuoteBuilder.astro',import.meta.url),'utf8').split('<script>')[1].split('</script>')[0].replace(/import .*?;\n/,'');
 for(const scenario of [{ok:true,sent:true,count:1},{ok:true,sent:false,count:0},{ok:false,sent:false,count:0},{throws:true,count:0}]){
  let submit; const events=[]; const button={querySelector:()=>({}),disabled:false}; const status={};
  const form={querySelectorAll:()=>[],addEventListener:(name,fn)=>{if(name==='submit')submit=fn},reportValidity:()=>true,setAttribute(){},removeAttribute(){},reset(){},action:'https://example.test/api/contact'};
  const ctx={document:{querySelector:s=>s==='#quoteForm'?form:s==='#formStatus'?status:button},trackEvent:(...a)=>events.push(a),URLSearchParams,FormData:class{*[Symbol.iterator](){yield ['name','private example'];}},fetch:async()=>{if(scenario.throws)throw Error();return {ok:scenario.ok,json:async()=>({message:'Result',sent:scenario.sent})}}};
  vm.runInNewContext(stripTypeScriptTypes(source),ctx);
  await submit({preventDefault(){}});
  assert.equal(events.length,scenario.count);assert(!JSON.stringify(events).includes('private'));
 }
});
