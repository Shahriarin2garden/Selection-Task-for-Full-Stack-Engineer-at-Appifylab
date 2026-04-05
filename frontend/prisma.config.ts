import { defineConfig } from 'prisma/config';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readDatabaseUrlFromEnvLocal(): string | undefined {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envLocalPath)) return undefined;

  const envText = readFileSync(envLocalPath, 'utf8');
  const line = envText
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith('DATABASE_URL='));

  if (!line) return undefined;

  const raw = line.slice('DATABASE_URL='.length).trim();
  const withoutLeadingQuote = raw.startsWith('"') ? raw.slice(1) : raw;
  return withoutLeadingQuote.endsWith('"')
    ? withoutLeadingQuote.slice(0, -1)
    : withoutLeadingQuote;
}

const databaseUrl = process.env.DATABASE_URL || readDatabaseUrlFromEnvLocal();

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
