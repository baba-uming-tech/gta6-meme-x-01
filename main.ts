import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function main(): void {
  const botDir: string = process.env.MAKEFUN_BOT_DIR ?? '/bot';
  const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const source: string = join(botDir, 'POST.json');
  const destination: string = join(outputDir, 'POST.json');

  mkdirSync(outputDir, { recursive: true });
  const data: Buffer = readFileSync(source);
  const parsed: unknown = JSON.parse(data.toString('utf8'));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid POST.json: expected a JSON object with a string "url" field');
  }
  const url: unknown = (parsed as Record<string, unknown>).url;
  if (typeof url !== 'string') {
    throw new Error('Invalid POST.json: "url" must be a string');
  }
  const postPattern = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+$/;
  if (!postPattern.test(url)) {
    throw new Error(`Invalid POST.json: "url" is not an X post address: ${url}`);
  }
  copyFileSync(source, destination);
  console.log(`Copied POST.json (${data.length} bytes) to ${destination} | url=${url}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
