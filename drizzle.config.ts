import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  connectionString: process.env.DATABASE_URL,
} satisfies Config