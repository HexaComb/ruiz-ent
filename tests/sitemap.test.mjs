import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {publishSitemap} from '../scripts/publish-sitemap.mjs';
test('direct sitemap mirrors generated pages including newly added routes',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'ruiz-map-'));
 try{await writeFile(path.join(dir,'sitemap-index.xml'),'<sitemapindex><sitemap><loc>sitemap-0.xml</loc></sitemap></sitemapindex>');
 for(const xml of ['<urlset><url><loc>https://ruizfamilyhardscapes.biz/</loc></url></urlset>','<urlset><url><loc>https://ruizfamilyhardscapes.biz/</loc></url><url><loc>https://ruizfamilyhardscapes.biz/new-page/</loc></url></urlset>']){
 await writeFile(path.join(dir,'sitemap-0.xml'),xml);await publishSitemap(dir);assert.equal(await readFile(path.join(dir,'sitemap.xml'),'utf8'),xml);
 }}finally{await rm(dir,{recursive:true});}
});
