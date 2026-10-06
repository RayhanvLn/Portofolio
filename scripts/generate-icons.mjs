/**
 * Generates the site icons + social preview image from public/assets/logo.svg.
 *   node scripts/generate-icons.mjs
 * Writes into src/app/ (Next.js picks these files up automatically):
 *   icon.svg             vector favicon (modern browsers)
 *   favicon.ico          16/32/48 px (older browsers, Google results)
 *   apple-icon.png       180×180 (iPhone/iPad home screen)
 *   opengraph-image.png  1200×630 (link previews: WhatsApp, LinkedIn, X, Facebook…)
 * Requires `sharp` (installed with Next.js). Edit the constants below, then re-run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const TITLE = 'RAYHAN FAKHRI RISQULLAH';
const SUBTITLE = 'Portfolio';
const ACCENT = '#FF8000';
const DARK = '#111112';
const PAPER = '#F1F0E9';

const logo = readFileSync('public/assets/logo.svg', 'utf8');
const [vx, vy, vw, vh] = logo.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const inner = logo.match(/<g id="Layer1">([\s\S]*?)<\/g>\s*<\/svg>/)[1];

/** Logo groups placed in a box, optionally recoloured. */
function placeLogo(x, y, width, color) {
  const s = width / vw;
  const body = color ? inner.replace(/stroke:black/g, `stroke:${color}`).replace(/<path /g, `<path fill="${color}" `) : inner;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(${-vx} ${-vy})">${body}</g>`;
}
const logoH = (w) => (w * vh) / vw;

// 1. icon.svg — accent tile, original black logo
const tile = (size, radius) => {
  const w = size * 0.68;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${radius}" fill="${ACCENT}"/>
${placeLogo((size - w) / 2, (size - logoH(w)) / 2, w)}
</svg>`;
};
writeFileSync('src/app/icon.svg', tile(64, 14));

// 2. apple-icon.png — full-bleed square (iOS rounds the corners itself)
await sharp(Buffer.from(tile(180, 0))).png().toFile('src/app/apple-icon.png');

// 3. favicon.ico — PNG-compressed ICO with 16, 32 and 48 px
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(Buffer.from(tile(64, 14))).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync('src/app/favicon.ico', Buffer.concat([header, ...pngs]));

// 4. opengraph-image.png — 1200×630 link preview
const contour = readFileSync('public/svg/contour-01.svg', 'utf8').match(/<path[^>]*\/>/g).join('');
const lw = 190;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${DARK}"/>
<g transform="translate(150 -320) scale(1.1)" fill="none" stroke="${PAPER}" stroke-opacity="0.07" stroke-width="1.4">${contour.replace(/stroke="[^"]*"/g, '')}</g>
${placeLogo((1200 - lw) / 2, 120, lw, ACCENT)}
<text x="600" y="${120 + logoH(lw) + 95}" text-anchor="middle" font-family="Archivo, 'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="54" letter-spacing="-1" fill="${PAPER}">${TITLE}</text>
<text x="600" y="${120 + logoH(lw) + 145}" text-anchor="middle" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif" font-weight="500" font-size="28" fill="#8d8d88">${SUBTITLE}</text>
<rect y="618" width="1200" height="12" fill="${ACCENT}"/>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('src/app/opengraph-image.png');
writeFileSync('src/app/opengraph-image.alt.txt', `${TITLE} — ${SUBTITLE}`);

console.log('icons written to src/app/: icon.svg, favicon.ico, apple-icon.png, opengraph-image.png');
