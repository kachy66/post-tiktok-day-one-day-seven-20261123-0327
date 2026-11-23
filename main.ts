// Entry program for the make.fun "Day one, day seven" video-on-TikTok
// bounty (Node 22, standard library only).
//
// The entry is the video itself: a 33.5-second vertical clip showing the
// same tiny agent-built game, Flip Runner, on the day it was made and
// after a week of daily updates. This program's only job is to hand the
// gate the address of the posted video: it reads VIDEO.json from the
// repository root, checks it names a real public TikTok video (not the
// placeholder the repo ships with), and copies it to /output/VIDEO.json.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const videoPath = join(BOT_DIR, 'VIDEO.json');
const raw = readFileSync(videoPath, 'utf8');
const data = JSON.parse(raw) as { url?: unknown };

if (typeof data.url !== 'string') {
  console.error('VIDEO.json has no url string.');
  process.exit(1);
}

// The repo ships with a placeholder address until the video is posted
// from the user's own TikTok account. Refuse to hand the gate a
// placeholder: a submission must name the real posted video.
if (data.url.includes('<') || data.url.includes('>')) {
  console.error('VIDEO.json still holds the placeholder address. Post the video on TikTok, put its full https://www.tiktok.com/@<handle>/video/<id> address in VIDEO.json, and run again.');
  process.exit(1);
}

// Normalize: a pasted TikTok address may carry tracking parameters
// (?t=..., ?is_from_webapp=1) or a fragment. The gate wants the bare
// video address, so strip those and keep origin + pathname only.
let url: string;
try {
  const parsed = new URL(data.url);
  url = `${parsed.origin}${parsed.pathname}`;
} catch {
  console.error(`VIDEO.json does not hold a usable address: ${data.url}`);
  process.exit(1);
}
if (!/^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+$/.test(url)) {
  console.error(`VIDEO.json does not hold a TikTok video address: ${data.url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
if (url === data.url) {
  copyFileSync(videoPath, join(OUTPUT_DIR, 'VIDEO.json'));
} else {
  writeFileSync(join(OUTPUT_DIR, 'VIDEO.json'), `{"url":"${url}"}\n`);
}
console.log(`VIDEO.json copied to ${OUTPUT_DIR} (${url})`);
