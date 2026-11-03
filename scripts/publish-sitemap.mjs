import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
// @astrojs/sitemap discovers canonical prerendered pages at every build.
// Publish its generated URL list at the conventional entry point as well.
export async function publishSitemap(directory = 'dist/client') {
  const source = await readFile(path.join(directory, 'sitemap-0.xml'), 'utf8');
  const index = await readFile(path.join(directory, 'sitemap-index.xml'), 'utf8');
  if ((index.match(/<sitemap>/g) || []).length !== 1 || !source.includes('<urlset')) {
    throw new Error('Direct sitemap requires one generated URL set; review sitemap size before publishing.');
  }
  await writeFile(path.join(directory, 'sitemap.xml'), source);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await publishSitemap();
