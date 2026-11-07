// Recreate the mobile source without introducing another lossy encode.
// 54% matches the existing mobile object-position. Keep the full source height.
import sharp from 'sharp';
const source = new URL('../src/assets/hero/hero-custom-home-pour.jpg', import.meta.url);
const { width, height } = await sharp(source.pathname).metadata();
if (!width || !height || width < height) throw new Error('Expected a landscape hero source');
await sharp(source.pathname)
  .extract({ left: Math.round((width - height) * 0.54), top: 0, width: height, height })
  .webp({ lossless: true })
  .toFile(new URL('../src/assets/hero/hero-custom-home-pour-mobile.webp', import.meta.url).pathname);
